# Phase 4: Persistence - Research

**Researched:** 2026-01-18
**Domain:** Figma Plugin Storage (clientStorage API)
**Confidence:** HIGH

## Summary

This phase implements data persistence for user mappings using Figma's `clientStorage` API. The clientStorage API is Figma's official mechanism for storing plugin data locally on the user's machine - it is the **only** option for persistent storage in Figma plugins since standard browser APIs (localStorage, IndexedDB, cookies) are not available in the plugin sandbox.

The implementation requires understanding Figma's two-context architecture: `clientStorage` can only be accessed from the plugin sandbox (code.ts), not from the UI iframe (ui.html). Therefore, all storage operations must be coordinated via postMessage communication between the UI and plugin contexts.

**Primary recommendation:** Implement storage operations in code.ts with dedicated message types (`load-mapping`, `save-mapping`, `save-draft`), trigger them from ui.html via postMessage, and use debounced draft saving (300ms to match existing validation debounce).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Component | Purpose | Why Standard |
|-----------|---------|--------------|
| `figma.clientStorage` | Persistent key-value storage | Only official storage API for Figma plugins |
| `postMessage` | UI-plugin communication | Required by Figma's security model |

### Supporting
| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| Debounce utility | Rate-limit storage writes | Auto-save draft on typing |
| JSON.stringify/parse | Serialize mapping data | Already native, no library needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| clientStorage | setPluginData | setPluginData stores per-document (100KB limit), clientStorage stores per-user (5MB limit) - clientStorage is correct for user preferences |
| Manual debounce | lodash.debounce | Adds dependency; manual debounce already exists in ui.html |

**No additional packages required** - all functionality available via Figma Plugin API.

## Architecture Patterns

### Storage Key Strategy

```typescript
// Recommended storage keys
const STORAGE_KEYS = {
  SAVED_MAPPING: 'varswap-saved-mapping',    // User-confirmed mapping (on Save/Run)
  DRAFT_MAPPING: 'varswap-draft-mapping'     // Auto-saved as user types
};
```

**Rationale:** Two separate keys allow:
- Draft can be recovered if user closes without saving
- Saved mapping is "clean" version user explicitly saved
- On load: prefer saved, fall back to draft if exists

### Message Types for Storage

```typescript
// UI -> Plugin messages (add to existing UIMessage type)
type UIMessage =
  | { type: 'run'; mapping: MappingEntry[] }
  | { type: 'load-mapping' }                         // Request stored mapping
  | { type: 'save-mapping'; json: string }           // Save on Run success
  | { type: 'save-draft'; json: string };            // Auto-save draft

// Plugin -> UI messages (new type needed)
type PluginMessage =
  | { type: 'mapping-loaded'; json: string | null }  // Send stored mapping to UI
  | { type: 'save-complete'; success: boolean }      // Confirm save
  | { type: 'storage-error'; error: string };        // Report errors
```

### Initialization Flow

```
Plugin Opens
    |
    v
code.ts: figma.showUI()
    |
    v
ui.html: sends { type: 'load-mapping' }
    |
    v
code.ts: clientStorage.getAsync('varswap-saved-mapping')
         clientStorage.getAsync('varswap-draft-mapping')
    |
    v
code.ts: figma.ui.postMessage({ type: 'mapping-loaded', json: savedOrDraft })
    |
    v
ui.html: receives via onmessage, populates textarea
```

### Save/Draft Flow

```
User types in textarea
    |
    v
ui.html: debounce(300ms) -> sends { type: 'save-draft', json: rawText }
    |
    v
code.ts: clientStorage.setAsync('varswap-draft-mapping', json)


User clicks Run (and swap succeeds)
    |
    v
ui.html: sends { type: 'save-mapping', json: rawText }
    |
    v
code.ts: clientStorage.setAsync('varswap-saved-mapping', json)
         clientStorage.deleteAsync('varswap-draft-mapping')  // Clear draft
```

### Anti-Patterns to Avoid

- **Calling clientStorage from UI iframe:** Will fail - clientStorage only accessible from plugin sandbox
- **Not awaiting storage operations:** All clientStorage methods are async, must be awaited
- **Saving on every keystroke:** Will hit rate limits; always debounce
- **Storing parsed objects without JSON.stringify:** Works but makes quota tracking harder; store as JSON string for consistency

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Key-value storage | Custom file/network storage | `figma.clientStorage` | Only officially supported option |
| Debounce | Custom timer management | Existing debounce function in ui.html | Already implemented and tested |
| UI-plugin communication | Direct function calls | `postMessage` pattern | Required by Figma security model |

**Key insight:** The entire storage solution uses built-in Figma APIs. No external libraries or custom implementations needed.

## Common Pitfalls

### Pitfall 1: "Cannot access client storage without a plugin ID"

**What goes wrong:** Calling `figma.clientStorage` fails with error about missing plugin ID
**Why it happens:** Plugin not properly registered with Figma; manifest.json missing or has invalid `id` field
**How to avoid:** Ensure manifest.json has valid plugin ID from Figma registration
**Warning signs:** Error appears immediately on any clientStorage call

### Pitfall 2: Quota Exceeded Even With Small Data

**What goes wrong:** `setAsync` fails with "clientStorage quota exceeded" even with data under 1MB
**Why it happens:** Total storage across all keys exceeds 5MB limit; previous data not cleaned up
**How to avoid:**
- Use `keysAsync()` to audit storage usage
- Clear draft when saving confirmed mapping
- Keep mapping data compact (JSON without extra whitespace)
**Warning signs:** Random save failures, especially after extended use

### Pitfall 3: UI Waits Forever for Storage Response

**What goes wrong:** UI sends `load-mapping` but never receives response
**Why it happens:** Plugin didn't set up `onmessage` listener before `showUI()`, or forgot to send response
**How to avoid:**
- Set up `figma.ui.onmessage` handler before `figma.showUI()` (or immediately after)
- Always send response message for every request
- Add timeout handling in UI
**Warning signs:** Textarea stays empty on plugin open

### Pitfall 4: postMessage Property Confusion

**What goes wrong:** Messages arrive as `undefined` in UI
**Why it happens:** Different syntax for UI vs plugin:
- Plugin receives: `msg` directly
- UI receives: `event.data.pluginMessage`
**How to avoid:**
- In plugin: `figma.ui.onmessage = (msg) => { /* msg is the data */ }`
- In UI: `onmessage = (event) => { const msg = event.data.pluginMessage; }`
**Warning signs:** `undefined` values in console logs

### Pitfall 5: Draft Saved But Never Cleared

**What goes wrong:** Old draft overrides newer saved mapping on next load
**Why it happens:** Draft auto-saved but never cleared when user explicitly saves
**How to avoid:** Delete draft key after successful save operation
**Warning signs:** User sees stale data after reopening plugin

## Code Examples

Verified patterns from official sources:

### Storage Wrapper (code.ts)

```typescript
// Source: https://developers.figma.com/docs/plugins/api/figma-clientStorage/

const STORAGE_KEYS = {
  SAVED_MAPPING: 'varswap-saved-mapping',
  DRAFT_MAPPING: 'varswap-draft-mapping'
};

async function loadMapping(): Promise<string | null> {
  try {
    // Prefer saved mapping over draft
    const saved = await figma.clientStorage.getAsync(STORAGE_KEYS.SAVED_MAPPING);
    if (saved) return saved;

    const draft = await figma.clientStorage.getAsync(STORAGE_KEYS.DRAFT_MAPPING);
    return draft || null;
  } catch (error) {
    console.error('Failed to load mapping:', error);
    return null;
  }
}

async function saveMapping(json: string): Promise<boolean> {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEYS.SAVED_MAPPING, json);
    // Clear draft after successful save
    await figma.clientStorage.deleteAsync(STORAGE_KEYS.DRAFT_MAPPING);
    return true;
  } catch (error) {
    console.error('Failed to save mapping:', error);
    return false;
  }
}

async function saveDraft(json: string): Promise<boolean> {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEYS.DRAFT_MAPPING, json);
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
}
```

### Plugin Message Handler (code.ts)

```typescript
// Source: https://developers.figma.com/docs/plugins/creating-ui/

// Extended message type
type UIMessage =
  | { type: 'run'; mapping: MappingEntry[] }
  | { type: 'load-mapping' }
  | { type: 'save-mapping'; json: string }
  | { type: 'save-draft'; json: string };

figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'run') {
    try {
      await runSwap(msg.mapping);
      // Save mapping on successful run (implicit save)
    } catch (error) {
      figma.notify(error instanceof Error ? error.message : 'An error occurred', { error: true });
    }
  } else if (msg.type === 'load-mapping') {
    const json = await loadMapping();
    figma.ui.postMessage({ type: 'mapping-loaded', json });
  } else if (msg.type === 'save-mapping') {
    const success = await saveMapping(msg.json);
    figma.ui.postMessage({ type: 'save-complete', success });
  } else if (msg.type === 'save-draft') {
    await saveDraft(msg.json);
    // No response needed for draft - fire and forget
  }
};
```

### UI Message Handling (ui.html)

```typescript
// Source: https://developers.figma.com/docs/plugins/creating-ui/

// Request mapping on load
parent.postMessage({ pluginMessage: { type: 'load-mapping' } }, '*');

// Handle plugin responses
onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  if (msg.type === 'mapping-loaded' && msg.json) {
    jsonInput.value = msg.json;
    // Trigger validation
    debouncedValidate(msg.json);
  } else if (msg.type === 'storage-error') {
    // Show error notification
    errorDisplay.textContent = 'Storage error: ' + msg.error;
    errorDisplay.classList.add('visible');
  }
};

// Debounced draft save on input (reuse existing 300ms debounce)
const debouncedSaveDraft = debounce((value) => {
  parent.postMessage({ pluginMessage: { type: 'save-draft', json: value } }, '*');
}, 300);

jsonInput.addEventListener('input', (e) => {
  debouncedValidate(e.target.value);
  debouncedSaveDraft(e.target.value);  // Save draft alongside validation
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 1MB storage limit | 5MB storage limit | March 2025 | More room for complex mappings |
| Sync storage patterns | Async-only (Promise-based) | Always been async | Must use async/await |

**Deprecated/outdated:**
- `localStorage` / `IndexedDB`: Never available in Figma plugins, don't attempt
- Sync storage patterns: Figma uses async exclusively

## Open Questions

Things that couldn't be fully resolved:

1. **Quota exceeded edge cases**
   - What we know: 5MB total limit, quota errors possible even under 1MB per operation
   - What's unclear: Exact conditions that trigger quota exceeded with small data
   - Recommendation: Add graceful error handling, notify user if save fails

2. **Draft vs Saved priority on first load**
   - What we know: Can store both separately
   - What's unclear: Best UX if user has old saved + newer draft
   - Recommendation: Prefer saved mapping (cleaner state), could show "recover draft?" prompt in future

## Sources

### Primary (HIGH confidence)
- [Figma clientStorage API Documentation](https://developers.figma.com/docs/plugins/api/figma-clientStorage/) - Complete API reference
- [Figma Creating UI Documentation](https://developers.figma.com/docs/plugins/creating-ui/) - postMessage patterns
- [Figma How Plugins Run](https://developers.figma.com/docs/plugins/how-plugins-run/) - Two-context architecture

### Secondary (MEDIUM confidence)
- [Design Lint Plugin Source](https://github.com/destefanis/design-lint/blob/master/src/plugin/controller.ts) - Real-world clientStorage usage pattern
- [Figma Forum: Storage Best Practices](https://forum.figma.com/ask-the-community-7/what-is-the-most-efficient-way-to-save-user-s-data-in-plugins-28579) - Community patterns

### Tertiary (LOW confidence)
- [Figma Forum: Quota Exceeded](https://forum.figma.com/ask-the-community-7/figma-clientstorage-quota-exceeded-36002) - Edge case reports

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Figma documentation confirms clientStorage as sole option
- Architecture: HIGH - Two-context model and postMessage well-documented
- Pitfalls: MEDIUM - Some based on community reports, not all reproducible
- Code examples: HIGH - Based on official documentation patterns

**Research date:** 2026-01-18
**Valid until:** 60 days (Figma Plugin API is stable)
