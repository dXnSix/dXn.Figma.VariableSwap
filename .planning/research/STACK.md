# Technology Stack

**Project:** VarSwap Figma Plugin - Milestone 2 (JSON Mapping Input)
**Researched:** 2026-01-17

## Executive Summary

For adding JSON validation, color parsing, and persistence to the existing VarSwap plugin, the **recommended approach is to stay with vanilla TypeScript and leverage Figma's built-in APIs**. The current single-file architecture is viable for this scope. No external bundler or libraries are required.

**Key recommendation:** Use `figma.util.rgba()` for all color parsing (it handles hex, rgb, rgba, hsl natively), native `JSON.parse()` with try-catch for validation, and `figma.clientStorage` for persistence.

---

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TypeScript | ^5.3.x (current) | Type safety | Already in use, excellent Figma API typing support | HIGH |
| Figma Plugin API | @figma/plugin-typings ^1.122.0 | Plugin functionality | Required, provides full type definitions | HIGH |

### Color Parsing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `figma.util.rgba()` | Built-in | Parse hex/rgb/rgba/hsl strings | Native Figma API, handles all CSS color formats, returns Figma-compatible RGBA objects | HIGH |
| `figma.util.rgb()` | Built-in | Parse colors without alpha | For SolidPaint scenarios where alpha is in opacity property | HIGH |

### JSON Validation
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Native `JSON.parse()` | Built-in | Parse JSON strings | Zero dependency, sufficient for structure validation | HIGH |
| Custom schema validation | Inline | Validate mapping structure | Small utility functions, no library needed for simple key-value validation | HIGH |

### Persistence
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `figma.clientStorage` | Built-in | Store user mappings locally | Official Figma API, 5MB limit sufficient, async key-value store | HIGH |

### Build System
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TypeScript Compiler (tsc) | ^5.3.2 (current) | Compile TS to JS | Already configured, sufficient for current scope | HIGH |

---

## Detailed Recommendations

### Color Parsing: Use `figma.util.rgba()`

**Recommendation: HIGH CONFIDENCE**

Figma provides built-in color parsing utilities that handle all the formats you need:

```typescript
// These all work with figma.util.rgba():
figma.util.rgba('#FFF')           // 3-digit hex
figma.util.rgba('#FFFFFF')        // 6-digit hex
figma.util.rgba('#FFFFFF80')      // 8-digit hex with alpha
figma.util.rgba('rgb(255,255,255)')
figma.util.rgba('rgba(255,255,255,0.5)')
figma.util.rgba('rgba(0, 0, 0, 1)')
figma.util.rgba('hsl(180 50% 50%)')
```

**Why not custom regex parsing?**
- `figma.util.rgba()` already handles all CSS color formats
- Throws errors on invalid input (built-in validation)
- Returns Figma-native `RGBA` object (values 0-1, not 0-255)
- No need to maintain color parsing code

**Usage pattern for validation:**
```typescript
function isValidColor(colorString: string): boolean {
  try {
    figma.util.rgba(colorString);
    return true;
  } catch {
    return false;
  }
}

function parseColor(colorString: string): RGBA | null {
  try {
    return figma.util.rgba(colorString);
  } catch {
    return null;
  }
}
```

**Source:** [Figma Developer Docs - figma.util](https://developers.figma.com/docs/plugins/api/figma-util/)

---

### JSON Validation: Native JSON.parse + Custom Schema Check

**Recommendation: HIGH CONFIDENCE**

For validating JSON mapping input, use native `JSON.parse()` with a custom structure validator:

```typescript
interface ColorMapping {
  [oldVariableName: string]: string;  // Maps to new variable name
}

interface ValidationResult {
  valid: boolean;
  data?: ColorMapping;
  error?: string;
}

function validateMappingJson(jsonString: string): ValidationResult {
  // Step 1: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      valid: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`
    };
  }

  // Step 2: Validate structure (object with string values)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      error: 'JSON must be an object with key-value pairs'
    };
  }

  // Step 3: Validate all values are strings
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== 'string') {
      return {
        valid: false,
        error: `Value for "${key}" must be a string, got ${typeof value}`
      };
    }
  }

  return { valid: true, data: parsed as ColorMapping };
}
```

**Why not a JSON Schema library?**
- Adds bundle size and complexity for simple key-value validation
- Native validation is sufficient for `{ "old": "new" }` structure
- No network access in Figma sandbox anyway (can't fetch schemas)
- Custom validation gives better error messages for users

**Why not Zod/Yup/etc?**
- Overkill for simple object validation
- Would require bundler to include
- Plugin should stay lightweight

---

### Persistence: `figma.clientStorage`

**Recommendation: HIGH CONFIDENCE**

Use Figma's built-in client storage for saving user mappings:

```typescript
const STORAGE_KEY = 'varswap_mapping';

// Save mapping
async function saveMapping(mapping: ColorMapping): Promise<void> {
  await figma.clientStorage.setAsync(STORAGE_KEY, mapping);
}

// Load mapping
async function loadMapping(): Promise<ColorMapping | null> {
  const stored = await figma.clientStorage.getAsync(STORAGE_KEY);
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    return stored as ColorMapping;
  }
  return null;
}

// Clear mapping
async function clearMapping(): Promise<void> {
  await figma.clientStorage.deleteAsync(STORAGE_KEY);
}
```

**Key characteristics:**
- **5MB limit** per plugin (more than enough for mappings)
- **Async API** - always use await
- **Persists locally** on user's machine, not in Figma file
- **Plugin-specific** - other plugins cannot access
- **May be cleared** if user clears browser cache

**Source:** [Figma Developer Docs - figma.clientStorage](https://developers.figma.com/docs/plugins/api/figma-clientStorage/)

---

### Build System: Stay with TypeScript Compiler

**Recommendation: HIGH CONFIDENCE**

The current setup (`tsc -p tsconfig.json`) is sufficient. Do NOT add a bundler for this milestone.

**When to add a bundler (esbuild/Vite):**
- Multiple source files with imports between them
- External npm dependencies needed in plugin code
- React/Vue UI framework usage
- > 500 lines of code in single file becoming unwieldy

**Current project status:**
- Single `code.ts` file (~200 lines)
- Single `ui.html` file with inline JavaScript
- No external runtime dependencies
- TypeScript compiles directly to single `code.js`

**If bundling becomes needed later:**
- **Recommend esbuild** over Webpack (created by Figma CTO, 10-100x faster)
- Keep it simple: `esbuild code.ts --bundle --outfile=code.js`

**Source:** [Figma Developer Docs - Libraries and Bundling](https://developers.figma.com/docs/plugins/libraries-and-bundling/)

---

### UI State Management: Vanilla JavaScript in HTML

**Recommendation: HIGH CONFIDENCE**

Keep UI logic in `ui.html` with inline JavaScript. For the textarea + validation flow:

```html
<!-- In ui.html -->
<textarea id="mappingInput" placeholder='{"OldVar/Name": "NewVar/Name"}'></textarea>
<div id="errorMessage" class="error"></div>
<button id="validateBtn">Validate</button>
<button id="saveBtn" disabled>Save & Run</button>

<script>
  const textarea = document.getElementById('mappingInput');
  const errorDiv = document.getElementById('errorMessage');
  const saveBtn = document.getElementById('saveBtn');

  // Send to plugin for validation
  function validateInput() {
    parent.postMessage({
      pluginMessage: {
        type: 'validate',
        json: textarea.value
      }
    }, '*');
  }

  // Receive validation result from plugin
  onmessage = (event) => {
    const msg = event.data.pluginMessage;
    if (msg.type === 'validation-result') {
      if (msg.valid) {
        errorDiv.textContent = '';
        saveBtn.disabled = false;
      } else {
        errorDiv.textContent = msg.error;
        saveBtn.disabled = true;
      }
    }
  };
</script>
```

**Why not React/Vue?**
- Adds bundler requirement
- Increases complexity for simple form
- Current UI is a single button - adding textarea + validation message is trivial
- Plugin should stay lightweight

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Color parsing | `figma.util.rgba()` | Custom regex | Built-in handles all formats, throws on invalid |
| Color parsing | `figma.util.rgba()` | `hex-color-regex` npm | Adds dependency, only handles hex, not rgba |
| JSON validation | Native `JSON.parse` | Zod/Yup | Overkill for key-value objects |
| JSON validation | Native `JSON.parse` | AJV (JSON Schema) | Heavyweight, needs bundler |
| Persistence | `figma.clientStorage` | `setPluginData` on document | clientStorage is user-local, setPluginData is file-bound |
| Build | tsc | esbuild | Not needed for current scope |
| Build | tsc | Webpack | Heavyweight, slower, not needed |
| UI framework | Vanilla JS | React | Overkill for single form |

---

## Implementation Notes

### Message Passing Pattern

The plugin architecture requires message passing between UI (iframe) and main code:

```
[ui.html]                    [code.ts]
    |                            |
    |-- postMessage(json) ------>|
    |                            | validate JSON
    |                            | parse colors
    |<-- postMessage(result) ----|
    |                            |
    |-- postMessage(save) ------>|
    |                            | clientStorage.setAsync()
    |                            | run variable swap
    |<-- postMessage(done) ------|
```

### File Structure (Recommended)

Keep current structure, expand `code.ts`:

```
variable-swap/
  manifest.json        # No changes needed
  code.ts              # Add validation + persistence functions
  ui.html              # Add textarea + error display
  tsconfig.json        # No changes needed
  package.json         # No changes needed
```

### tsconfig.json Note

Current config targets ES6 with `lib: ["es2017", "dom"]`. This supports:
- `async/await` (ES2017)
- All DOM types for UI
- `Object.entries()` (ES2017)

No changes needed.

---

## Installation

No new dependencies required. Existing setup is sufficient:

```bash
# Already installed:
# @figma/plugin-typings - Figma API types
# typescript - TypeScript compiler

# Build command (existing):
npm run build  # tsc -p tsconfig.json
```

---

## Confidence Summary

| Area | Confidence | Rationale |
|------|------------|-----------|
| Color parsing via `figma.util.rgba()` | HIGH | Verified in official Figma docs and plugin typings |
| JSON validation approach | HIGH | Standard JavaScript pattern, no external deps |
| `figma.clientStorage` usage | HIGH | Verified in official Figma docs, well-documented API |
| No bundler needed | HIGH | Current scope fits single-file architecture |
| Vanilla JS for UI | HIGH | Complexity doesn't warrant framework |

---

## Sources

**Official Documentation (HIGH confidence):**
- [figma.clientStorage API](https://developers.figma.com/docs/plugins/api/figma-clientStorage/)
- [figma.util API](https://developers.figma.com/docs/plugins/api/figma-util/)
- [RGB/RGBA interfaces](https://developers.figma.com/docs/plugins/api/RGB/)
- [Libraries and Bundling](https://developers.figma.com/docs/plugins/libraries-and-bundling/)

**Verified via plugin-typings (HIGH confidence):**
- `@figma/plugin-typings/plugin-api.d.ts` lines 2634-2738 (UtilAPI interface)

**Community resources (MEDIUM confidence):**
- [Bundling Figma Plugin with esbuild](https://medium.com/geekculture/bundling-figma-plugin-with-esbuild-e6d41e28f872)
- [hex-color-regex patterns](https://github.com/regexhq/hex-color-regex)
