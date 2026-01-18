# Architecture Patterns: Figma Plugin with Complex UI State

**Domain:** Figma plugin with textarea input, validation, and persistence
**Researched:** 2026-01-17
**Confidence:** HIGH (verified with official Figma documentation)

## Executive Summary

Figma plugins operate in a two-context architecture: a **sandbox** (main thread with Figma API access) and an **iframe** (UI with browser APIs). These contexts cannot directly share state or call each other's APIs. All communication must flow through `postMessage`. This architecture fundamentally shapes how validation, storage, and state management must be designed.

For VarSwap's expansion to include JSON textarea input, validation, and persistence, the recommended architecture is:

1. **UI-side validation** for format and syntax (immediate feedback)
2. **Plugin-side validation** for business rules requiring Figma context
3. **Message protocol** with typed message contracts
4. **Storage through plugin code** using `figma.clientStorage` with UI requesting save/load via messages

---

## Current vs Target Architecture

### Current State

```
+----------------+          postMessage          +------------------+
|    ui.html     | --------------------------->  |     code.ts      |
|  (Run button)  |    { type: 'run' }            | (variable swap)  |
+----------------+                               +------------------+
```

Single message type, no state, no persistence, no validation.

### Target State

```
+-------------------+                              +--------------------+
|      UI Layer     |                              |    Plugin Layer    |
|-------------------|                              |--------------------|
| - Textarea        |   ---- Messages ---->        | - Figma API access |
| - JSON validation |   { type, payload }          | - clientStorage    |
| - Error display   |   <---- Messages ----        | - Variable lookup  |
| - State (input)   |   { type, data, error }      | - Swap execution   |
+-------------------+                              +--------------------+
```

---

## Component Boundaries

| Component | Responsibility | Location | Communicates With |
|-----------|---------------|----------|-------------------|
| **UI Controller** | User input, display, immediate validation | ui.html/ui.ts | Plugin via postMessage |
| **Validation Layer** | JSON syntax (UI) + mapping validity (plugin) | Split | Both directions |
| **Storage Manager** | Persist/retrieve mappings | code.ts | UI via messages |
| **Swap Engine** | Execute variable replacement | code.ts | Figma API directly |
| **Message Handler** | Route incoming messages | Both | Internal routing |

---

## Message Protocol Design

### Recommended Pattern: Typed Message Contracts

Define a clear message type system for type safety and maintainability.

```typescript
// shared-types.ts (or inline in both files)

// UI -> Plugin messages
type UIMessage =
  | { type: 'run-swap'; payload: MappingConfig }
  | { type: 'save-mapping'; payload: { name: string; config: MappingConfig } }
  | { type: 'load-mapping'; payload: { name: string } }
  | { type: 'list-mappings' }
  | { type: 'validate-mapping'; payload: MappingConfig };

// Plugin -> UI messages
type PluginMessage =
  | { type: 'swap-complete'; data: { changesMade: number } }
  | { type: 'swap-error'; error: string }
  | { type: 'mapping-saved'; data: { name: string } }
  | { type: 'mapping-loaded'; data: MappingConfig | null }
  | { type: 'mappings-list'; data: string[] }
  | { type: 'validation-result'; data: ValidationResult };

interface MappingConfig {
  mappings: Record<string, string>;  // old variable -> new variable
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### Message Flow Examples

**Save Mapping:**
```
UI: { type: 'save-mapping', payload: { name: 'colors-v2', config: {...} } }
     |
     v
Plugin: figma.clientStorage.setAsync('mapping:colors-v2', config)
     |
     v
UI: { type: 'mapping-saved', data: { name: 'colors-v2' } }
```

**Run Swap:**
```
UI: Validate JSON locally (syntax check)
     |
     v (if valid)
UI: { type: 'run-swap', payload: config }
     |
     v
Plugin: Validate mapping keys exist in Figma
     |
     v (if valid)
Plugin: Execute swap on selection
     |
     v
UI: { type: 'swap-complete', data: { changesMade: 42 } }
     or
UI: { type: 'swap-error', error: 'Variable "Neutral/600" not found' }
```

---

## Validation Architecture

### Two-Layer Validation Strategy

**Layer 1: UI-Side Validation (Immediate)**
- JSON syntax validity
- Required field presence
- Format constraints (non-empty strings, valid characters)

**Layer 2: Plugin-Side Validation (Contextual)**
- Variable names exist in Figma document or library
- Mapping references resolve to valid variables
- Selection contains swappable nodes

### Rationale

| Validation Type | Location | Why |
|-----------------|----------|-----|
| JSON parse | UI | Immediate feedback, no round-trip needed |
| Required fields | UI | No Figma context needed |
| Variable exists | Plugin | Requires `figma.variables.getLocalVariablesAsync()` |
| Selection valid | Plugin | Requires `figma.currentPage.selection` |

### Implementation Pattern

```typescript
// UI-side validation (ui.ts)
function validateJsonSyntax(input: string): { valid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'Root must be an object' };
    }
    // Check structure
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string') {
        return { valid: false, error: `Value for "${key}" must be a string` };
      }
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Invalid JSON: ${e.message}` };
  }
}

// Plugin-side validation (code.ts)
async function validateMappingExists(
  mappings: Record<string, string>
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const localVars = await figma.variables.getLocalVariablesAsync();
  const varNames = new Set(localVars.map(v => v.name));

  for (const [oldVar, newVar] of Object.entries(mappings)) {
    if (!varNames.has(newVar)) {
      // Check team library as fallback
      const found = await findVariableByName(newVar);
      if (!found) {
        errors.push({
          type: 'variable-not-found',
          variable: newVar,
          message: `Target variable "${newVar}" not found in local or library variables`
        });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings: [] };
}
```

---

## Storage Interaction Patterns

### clientStorage Overview

| Aspect | Detail |
|--------|--------|
| **Location** | User's local machine only |
| **Limit** | 5MB per plugin |
| **Persistence** | Survives sessions, may be cleared with browser cache |
| **Access** | Only from plugin code (main thread), not UI iframe |
| **Data types** | objects, arrays, strings, numbers, booleans, null, undefined, Uint8Array |

### Recommended Storage Schema

```typescript
// Storage key patterns
const STORAGE_KEYS = {
  SAVED_MAPPINGS: 'mappings',           // Array of saved mapping names
  MAPPING_PREFIX: 'mapping:',           // Individual mapping: 'mapping:colors-v2'
  LAST_USED: 'lastUsed',                // Name of last used mapping
  UI_STATE: 'uiState',                  // Last textarea content (draft)
};

// Storage structure
interface StoredMappings {
  names: string[];                       // List of mapping names
}

interface StoredMapping {
  name: string;
  config: MappingConfig;
  createdAt: string;
  updatedAt: string;
}

interface StoredUIState {
  draftInput: string;                    // Textarea content not yet saved
}
```

### Storage Access Pattern

Since `clientStorage` is only accessible from plugin code, use message passing.

```typescript
// code.ts - Storage operations
figma.ui.onmessage = async (msg: UIMessage) => {
  switch (msg.type) {
    case 'save-mapping': {
      const { name, config } = msg.payload;
      const stored: StoredMapping = {
        name,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await figma.clientStorage.setAsync(`mapping:${name}`, stored);

      // Update mapping list
      const list = await figma.clientStorage.getAsync('mappings') || { names: [] };
      if (!list.names.includes(name)) {
        list.names.push(name);
        await figma.clientStorage.setAsync('mappings', list);
      }

      figma.ui.postMessage({ type: 'mapping-saved', data: { name } });
      break;
    }

    case 'load-mapping': {
      const stored = await figma.clientStorage.getAsync(`mapping:${msg.payload.name}`);
      figma.ui.postMessage({
        type: 'mapping-loaded',
        data: stored?.config || null
      });
      break;
    }

    case 'list-mappings': {
      const list = await figma.clientStorage.getAsync('mappings') || { names: [] };
      figma.ui.postMessage({ type: 'mappings-list', data: list.names });
      break;
    }
  }
};
```

### Draft Auto-Save Pattern

Preserve user input between plugin opens:

```typescript
// On plugin load (code.ts)
async function initializeUI() {
  figma.showUI(__html__, { width: 400, height: 500 });

  // Load last draft state
  const uiState = await figma.clientStorage.getAsync('uiState');
  if (uiState?.draftInput) {
    figma.ui.postMessage({ type: 'restore-draft', data: uiState.draftInput });
  }

  // Load saved mappings list
  const list = await figma.clientStorage.getAsync('mappings') || { names: [] };
  figma.ui.postMessage({ type: 'mappings-list', data: list.names });
}

// UI sends draft updates (debounced)
// code.ts handles:
case 'save-draft': {
  await figma.clientStorage.setAsync('uiState', { draftInput: msg.payload });
  break;
}
```

---

## Data Flow Diagram

```
User Input Flow:
================

[User types in textarea]
        |
        v
[UI: Debounced JSON validation]
        |
    +---+---+
    |       |
  Valid   Invalid
    |       |
    v       v
[Enable   [Show error,
 Run]     disable Run]

        |
        v (on Run click)

[UI: Send 'run-swap' message]
        |
        v
[Plugin: Validate variables exist]
        |
    +---+---+
    |       |
  Valid   Invalid
    |       |
    v       v
[Execute [Send error
 swap]    message]
    |       |
    v       v
[Send    [UI shows
 result]  error]
    |
    v
[UI: Show success notification]


Storage Flow:
=============

[User clicks Save]
        |
        v
[UI: Prompt for name]
        |
        v
[UI: Send 'save-mapping' message]
        |
        v
[Plugin: clientStorage.setAsync()]
        |
        v
[Plugin: Send confirmation]
        |
        v
[UI: Update saved list, show success]
```

---

## Patterns to Follow

### Pattern 1: Debounced Validation

Validate on input change, but debounce to avoid excessive processing.

```typescript
// ui.ts
let validationTimeout: number;

textarea.addEventListener('input', (e) => {
  clearTimeout(validationTimeout);
  validationTimeout = setTimeout(() => {
    const result = validateJsonSyntax(textarea.value);
    updateValidationUI(result);
  }, 300); // 300ms debounce
});
```

### Pattern 2: Loading States

Show loading state during async plugin operations.

```typescript
// ui.ts
function setLoading(loading: boolean) {
  runButton.disabled = loading;
  runButton.textContent = loading ? 'Running...' : 'Run';
  loadingSpinner.style.display = loading ? 'block' : 'none';
}

runButton.onclick = () => {
  setLoading(true);
  parent.postMessage({ pluginMessage: { type: 'run-swap', payload: config } }, '*');
};

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg.type === 'swap-complete' || msg.type === 'swap-error') {
    setLoading(false);
  }
};
```

### Pattern 3: Error Boundary in Messages

Always handle unknown message types gracefully.

```typescript
// code.ts
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'run-swap': /* ... */ break;
      case 'save-mapping': /* ... */ break;
      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Validation Only in Plugin Code

**What:** Putting all validation in plugin code, requiring round-trip for every keystroke.
**Why bad:** Poor UX due to latency, unnecessary message traffic.
**Instead:** Validate JSON syntax in UI, only send to plugin when format is valid.

### Anti-Pattern 2: Direct Storage Access from UI

**What:** Trying to use localStorage or IndexedDB in the iframe.
**Why bad:** These APIs are blocked in Figma's iframe sandbox. Will fail silently or throw.
**Instead:** Always use `figma.clientStorage` via message passing.

### Anti-Pattern 3: Untyped Message Contracts

**What:** Using arbitrary string types and unstructured payloads.
**Why bad:** Runtime errors, hard to maintain, no IDE support.
**Instead:** Define TypeScript interfaces for all message types.

### Anti-Pattern 4: Blocking Plugin Without Feedback

**What:** Long operations without UI feedback.
**Why bad:** User thinks plugin is frozen, may force-close.
**Instead:** Send progress messages, show loading states.

### Anti-Pattern 5: Not Handling Plugin Closure

**What:** Assuming plugin stays open during async operations.
**Why bad:** User can close plugin anytime; operations may be interrupted.
**Instead:** Handle cleanup gracefully, persist draft state.

---

## Build Order Implications

Based on this architecture, the suggested implementation order:

### Phase 1: Message Infrastructure
1. Define message type contracts (TypeScript interfaces)
2. Set up message handlers in both UI and plugin code
3. Test bidirectional communication

**Rationale:** Foundation for all subsequent features. Simple to test in isolation.

### Phase 2: UI with Local Validation
1. Add textarea to UI
2. Implement JSON syntax validation (UI-side)
3. Show validation errors in UI
4. Enable/disable Run button based on validity

**Rationale:** Provides immediate value and feedback loop. No storage dependency.

### Phase 3: Plugin-Side Validation
1. Receive mapping config from UI
2. Validate variable names exist
3. Return validation errors to UI
4. Integrate with existing swap logic

**Rationale:** Connects UI to core functionality. Tests full message round-trip.

### Phase 4: Storage Layer
1. Implement save mapping to clientStorage
2. Implement load mapping from clientStorage
3. Add list saved mappings
4. Add delete mapping

**Rationale:** Builds on working message infrastructure. Can be developed independently.

### Phase 5: Polish
1. Draft auto-save (preserve textarea between opens)
2. Last-used mapping auto-load
3. Error recovery and edge cases
4. Loading states and UX improvements

**Rationale:** Quality-of-life improvements after core functionality works.

---

## File Structure Recommendation

```
variable-swap/
├── manifest.json
├── code.ts                 # Plugin main thread
│   ├── message-handler.ts  # Message routing (can be inline for small plugin)
│   ├── storage.ts          # clientStorage operations (can be inline)
│   └── swap-engine.ts      # Existing swap logic
├── ui.html                 # Entry point for UI
├── ui.ts                   # UI logic (compiled inline or separate)
│   ├── validation.ts       # JSON validation (can be inline)
│   └── state.ts            # UI state management (can be inline)
└── types.ts                # Shared type definitions
```

For a plugin of this size, keeping everything in `code.ts` and `ui.html` (with inline script) is acceptable. The modular structure above is for reference if complexity grows.

---

## Sources

- [Figma Developer Docs: Creating a User Interface](https://developers.figma.com/docs/plugins/creating-ui/) - HIGH confidence
- [Figma Developer Docs: How Plugins Run](https://developers.figma.com/docs/plugins/how-plugins-run/) - HIGH confidence
- [Figma Developer Docs: postMessage](https://developers.figma.com/docs/plugins/api/properties/figma-ui-postmessage/) - HIGH confidence
- [Figma Developer Docs: figma.clientStorage](https://developers.figma.com/docs/plugins/api/figma-clientStorage/) - HIGH confidence
- [Figma Plugin Samples (GitHub)](https://github.com/figma/plugin-samples) - HIGH confidence
- [Figma Forum: figwire bidirectional IPC](https://forum.figma.com/showcase-your-work-14/figwire-bidirectional-awaitable-ipc-communication-for-figma-plugin-development-38484) - MEDIUM confidence (community pattern)
- [Evil Martians: Next-level Figma plugins](https://evilmartians.com/chronicles/how-to-make-next-level-figma-plugins-auth-routing-storage-and-more) - MEDIUM confidence (community best practices)
