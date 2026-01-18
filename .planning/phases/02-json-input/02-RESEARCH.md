# Phase 2: JSON Input and Validation - Research

**Researched:** 2026-01-17
**Domain:** JSON Parsing, Schema Validation, Real-Time UI Validation in Vanilla JavaScript
**Confidence:** HIGH

## Summary

Phase 2 transforms the simple Run button into a JSON input interface with real-time validation. The core challenge is providing meaningful feedback for two distinct error types: JSON syntax errors (malformed JSON) and schema errors (valid JSON with wrong structure).

The browser's native `JSON.parse()` provides detailed error messages including line and column numbers (e.g., "at line 1 column 14"). Schema validation requires custom code since we're avoiding external libraries - a straightforward set of type checks using `Array.isArray()` and `typeof` to validate the mapping structure. Real-time validation uses a debounce pattern (300-500ms) to avoid validating on every keystroke while still feeling responsive.

**Primary recommendation:** Use native `JSON.parse()` with try-catch for syntax validation, implement custom schema validation with specific error messages, debounce input events at 300ms, and use Figma CSS variables for consistent theming.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native JSON.parse | Built-in | JSON syntax validation | Zero dependencies, detailed error messages with line/column |
| Native Array.isArray | Built-in | Type checking for schema validation | Most reliable array detection, handles cross-realm cases |
| Figma CSS Variables | Built-in | Theme-aware styling | Automatically handles light/dark mode |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | - | - | No external libraries needed for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom schema validation | Ajv, Zod, Yup | Adds dependency, overkill for simple schema |
| Manual debounce | lodash.debounce | Adds dependency for ~10 lines of code |
| Custom error parsing | clarinet.js | Adds dependency; native errors are sufficient |

**Installation:**
No additional packages needed - all functionality available in browser APIs.

## Architecture Patterns

### Recommended UI Structure
```
+------------------------------------------+
|  .container                              |
|  +--------------------------------------+|
|  | textarea.json-input                  ||
|  | (monospace, resizable)               ||
|  +--------------------------------------+|
|  | .error-display                       ||
|  | (hidden when valid)                  ||
|  +--------------------------------------+|
|  | button.run-button                    ||
|  | (disabled when invalid)              ||
|  +--------------------------------------+|
+------------------------------------------+
```

### Pattern 1: Two-Stage Validation
**What:** Separate syntax validation (JSON.parse) from schema validation (custom checks)
**When to use:** Always - provides clearer error messages at each stage
**Example:**
```javascript
// Source: MDN JSON.parse + custom validation
function validateInput(jsonString) {
  // Stage 1: Syntax validation
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    // e.message includes "at line X column Y"
    return { valid: false, error: e.message };
  }

  // Stage 2: Schema validation
  const schemaError = validateSchema(parsed);
  if (schemaError) {
    return { valid: false, error: schemaError };
  }

  return { valid: true, data: parsed };
}
```

### Pattern 2: Debounced Input Validation
**What:** Delay validation until user stops typing
**When to use:** Real-time validation to avoid excessive processing
**Example:**
```javascript
// Source: joshwcomeau.com/snippets/javascript/debounce/
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

// Usage: validate 300ms after user stops typing
const debouncedValidate = debounce((value) => {
  const result = validateInput(value);
  updateUI(result);
}, 300);

textarea.addEventListener('input', (e) => {
  debouncedValidate(e.target.value);
});
```

### Pattern 3: Button State Management
**What:** Disable button based on validation state, with accessible styling
**When to use:** Preventing invalid submissions
**Example:**
```javascript
// Update button state based on validation
function updateUI(validationResult) {
  const runButton = document.getElementById('runButton');
  const errorDisplay = document.getElementById('errorDisplay');

  if (validationResult.valid) {
    runButton.disabled = false;
    errorDisplay.textContent = '';
    errorDisplay.style.display = 'none';
  } else {
    runButton.disabled = true;
    errorDisplay.textContent = validationResult.error;
    errorDisplay.style.display = 'block';
  }
}
```

### Pattern 4: Schema Validation for Mapping Structure
**What:** Validate the expected JSON structure with clear error messages
**When to use:** After JSON.parse succeeds
**Example:**
```javascript
// Source: Array.isArray MDN + custom validation
function validateSchema(data) {
  // Check root structure
  if (typeof data !== 'object' || data === null) {
    return 'JSON must be an object';
  }

  // Check mapping array exists
  if (!('mapping' in data)) {
    return 'Missing required field: "mapping"';
  }

  if (!Array.isArray(data.mapping)) {
    return '"mapping" must be an array';
  }

  if (data.mapping.length === 0) {
    return '"mapping" array cannot be empty';
  }

  // Validate each mapping entry
  for (let i = 0; i < data.mapping.length; i++) {
    const entry = data.mapping[i];
    const prefix = `mapping[${i}]`;

    if (typeof entry !== 'object' || entry === null) {
      return `${prefix}: must be an object`;
    }

    // Validate "old" field - can be string or array of strings
    if (!('old' in entry)) {
      return `${prefix}: missing required field "old"`;
    }

    if (typeof entry.old === 'string') {
      // Simple format: single old value
      if (entry.old.trim() === '') {
        return `${prefix}: "old" cannot be empty`;
      }
    } else if (Array.isArray(entry.old)) {
      // Array format: multiple old values
      if (entry.old.length === 0) {
        return `${prefix}: "old" array cannot be empty`;
      }
      for (let j = 0; j < entry.old.length; j++) {
        if (typeof entry.old[j] !== 'string' || entry.old[j].trim() === '') {
          return `${prefix}: old[${j}] must be a non-empty string`;
        }
      }
    } else {
      return `${prefix}: "old" must be a string or array of strings`;
    }

    // Validate "new" field - must be string
    if (!('new' in entry)) {
      return `${prefix}: missing required field "new"`;
    }

    if (typeof entry.new !== 'string' || entry.new.trim() === '') {
      return `${prefix}: "new" must be a non-empty string`;
    }
  }

  return null; // No errors
}
```

### Anti-Patterns to Avoid
- **Validating on every keystroke:** Use debounce; validating on every character is laggy
- **Generic error messages:** "Invalid JSON" is unhelpful; show line/column or field name
- **Blocking the Run button without explanation:** Always show why it's disabled
- **Mixing syntax and schema errors:** Handle separately for clearer messages
- **Using typeof for arrays:** `typeof []` returns "object"; use `Array.isArray()`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON syntax parsing | Custom parser | Native JSON.parse | Comprehensive, battle-tested, includes line/column |
| Array detection | typeof checks | Array.isArray() | typeof returns "object" for arrays |
| Theme styling | Custom color values | Figma CSS variables | Automatically handles light/dark mode |
| Debounce logic | setTimeout without cleanup | Proper debounce function | Must clear previous timeout to work correctly |
| Error message extraction | String manipulation | Parse error.message directly | Browser already formats nicely |

**Key insight:** Native browser APIs (JSON.parse, Array.isArray) are sufficient for this phase. Adding libraries like Ajv or Zod would be overkill for a schema with only 3 fields.

## Common Pitfalls

### Pitfall 1: Trailing Commas in JSON
**What goes wrong:** Users paste JSON with trailing commas; JSON.parse rejects it
**Why it happens:** JavaScript allows trailing commas; strict JSON does not
**How to avoid:** Show clear error message; consider adding example JSON in UI
**Warning signs:** Error message "unexpected character at line X column Y" at end of array/object

### Pitfall 2: Single Quotes in JSON
**What goes wrong:** Users use single quotes for strings; JSON.parse fails
**Why it happens:** JavaScript allows single quotes; JSON requires double quotes
**How to avoid:** Error message will indicate the issue; consider preprocessing (risky)
**Warning signs:** Error "expected property name or '}'" at column with single quote

### Pitfall 3: typeof Returns "object" for Arrays
**What goes wrong:** Schema validation incorrectly accepts/rejects arrays
**Why it happens:** Historical JavaScript behavior: `typeof [] === "object"`
**How to avoid:** Always use `Array.isArray()` for array detection
**Warning signs:** Arrays treated as objects in validation logic

### Pitfall 4: Forgetting to Handle Empty Input
**What goes wrong:** Empty textarea causes unclear error or crash
**Why it happens:** JSON.parse("") throws "Unexpected end of JSON input"
**How to avoid:** Check for empty/whitespace-only input before parsing
**Warning signs:** Generic "Unexpected end" error on first load

### Pitfall 5: Not Debouncing Validation
**What goes wrong:** UI feels laggy; validation runs hundreds of times while typing
**Why it happens:** `input` event fires on every character
**How to avoid:** Debounce with 300-500ms delay
**Warning signs:** Noticeable lag while typing in textarea

### Pitfall 6: Disabled Button Without Explanation
**What goes wrong:** User doesn't know why they can't click Run
**Why it happens:** Button disabled but no visible error message
**How to avoid:** Always show error message when button is disabled
**Warning signs:** User confusion, repeated clicking on disabled button

## Code Examples

Verified patterns from official sources:

### Complete Validation Module
```javascript
// Source: MDN JSON.parse, Array.isArray, combined patterns

// Debounce utility
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

// Syntax validation with native JSON.parse
function parseSyntax(jsonString) {
  if (!jsonString || jsonString.trim() === '') {
    return { valid: false, error: 'Please enter JSON mapping' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { valid: true, data: parsed };
  } catch (e) {
    // Error message format: "... at line X column Y of the JSON data"
    return { valid: false, error: e.message };
  }
}

// Schema validation
function validateSchema(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return 'JSON must be an object with a "mapping" array';
  }

  if (!data.mapping) {
    return 'Missing required field: "mapping"';
  }

  if (!Array.isArray(data.mapping)) {
    return '"mapping" must be an array';
  }

  if (data.mapping.length === 0) {
    return '"mapping" array cannot be empty';
  }

  for (let i = 0; i < data.mapping.length; i++) {
    const entry = data.mapping[i];
    const prefix = `mapping[${i}]`;

    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return `${prefix}: must be an object`;
    }

    // Check "old" - string or array of strings
    if (!('old' in entry)) {
      return `${prefix}: missing required field "old"`;
    }

    const old = entry.old;
    if (typeof old === 'string') {
      if (old.trim() === '') {
        return `${prefix}: "old" cannot be empty`;
      }
    } else if (Array.isArray(old)) {
      if (old.length === 0) {
        return `${prefix}: "old" array cannot be empty`;
      }
      for (let j = 0; j < old.length; j++) {
        if (typeof old[j] !== 'string' || old[j].trim() === '') {
          return `${prefix}: old[${j}] must be a non-empty string`;
        }
      }
    } else {
      return `${prefix}: "old" must be a string or array of strings`;
    }

    // Check "new" - must be string
    if (!('new' in entry)) {
      return `${prefix}: missing required field "new"`;
    }

    if (typeof entry.new !== 'string' || entry.new.trim() === '') {
      return `${prefix}: "new" must be a non-empty string`;
    }
  }

  return null;
}

// Combined validation
function validateInput(jsonString) {
  const syntaxResult = parseSyntax(jsonString);
  if (!syntaxResult.valid) {
    return syntaxResult;
  }

  const schemaError = validateSchema(syntaxResult.data);
  if (schemaError) {
    return { valid: false, error: schemaError };
  }

  return { valid: true, data: syntaxResult.data };
}
```

### UI HTML Structure
```html
<!-- Source: Figma CSS Variables docs -->
<style>
  body {
    font-family: Inter, system-ui, sans-serif;
    font-size: 12px;
    padding: 12px;
    background-color: var(--figma-color-bg);
    color: var(--figma-color-text);
  }

  .json-input {
    width: 100%;
    min-height: 150px;
    padding: 8px;
    font-family: monospace;
    font-size: 11px;
    border: 1px solid var(--figma-color-border);
    border-radius: 4px;
    background-color: var(--figma-color-bg);
    color: var(--figma-color-text);
    resize: vertical;
    box-sizing: border-box;
  }

  .json-input:focus {
    outline: none;
    border-color: var(--figma-color-border-selected);
  }

  .json-input.error {
    border-color: var(--figma-color-border-danger-strong);
  }

  .error-display {
    margin-top: 8px;
    padding: 8px;
    font-size: 11px;
    color: var(--figma-color-text-danger);
    background-color: var(--figma-color-bg-danger);
    border-radius: 4px;
    display: none;
  }

  .error-display.visible {
    display: block;
  }

  .run-button {
    margin-top: 12px;
    width: 100%;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    background-color: var(--figma-color-bg-brand);
    color: var(--figma-color-text-onbrand);
    cursor: pointer;
  }

  .run-button:hover:not(:disabled) {
    background-color: var(--figma-color-bg-brand-hover);
  }

  .run-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

<div class="container">
  <textarea
    id="jsonInput"
    class="json-input"
    placeholder='{"mapping": [{"old": ["var1", "#FFF"], "new": "newVar"}]}'
  ></textarea>
  <div id="errorDisplay" class="error-display"></div>
  <button id="runButton" class="run-button" disabled>Run</button>
</div>
```

### Wiring UI to Validation
```javascript
// Source: Combined patterns

const jsonInput = document.getElementById('jsonInput');
const errorDisplay = document.getElementById('errorDisplay');
const runButton = document.getElementById('runButton');

let currentValidData = null;

function updateUI(result) {
  if (result.valid) {
    currentValidData = result.data;
    jsonInput.classList.remove('error');
    errorDisplay.textContent = '';
    errorDisplay.classList.remove('visible');
    runButton.disabled = false;
  } else {
    currentValidData = null;
    jsonInput.classList.add('error');
    errorDisplay.textContent = result.error;
    errorDisplay.classList.add('visible');
    runButton.disabled = true;
  }
}

const debouncedValidate = debounce((value) => {
  const result = validateInput(value);
  updateUI(result);
}, 300);

jsonInput.addEventListener('input', (e) => {
  debouncedValidate(e.target.value);
});

runButton.addEventListener('click', () => {
  if (currentValidData) {
    parent.postMessage({
      pluginMessage: {
        type: 'run',
        mapping: currentValidData.mapping
      }
    }, '*');
  }
});

// Initial state: empty is invalid but don't show error yet
runButton.disabled = true;
```

### Updated Message Type (code.ts)
```typescript
// Source: Phase 1 patterns + new mapping data

type MappingEntry = {
  old: string | string[];
  new: string;
};

type UIMessage =
  | { type: 'run'; mapping: MappingEntry[] };

// Handler receives validated mapping from UI
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'run') {
    try {
      await runSwap(msg.mapping);
    } catch (error) {
      figma.notify(
        error instanceof Error ? error.message : 'An error occurred',
        { error: true }
      );
    }
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External JSON schema libraries | Native JSON.parse + custom validation | Always viable for simple schemas | No dependencies needed |
| setTimeout without cleanup | Proper debounce with clearTimeout | Best practice | Prevents stale callbacks |
| Custom color values | Figma CSS variables | 2023+ | Automatic theme support |
| typeof for array detection | Array.isArray() | ES5 (2009) | Reliable across realms |
| Validate on blur | Validate on input (debounced) | UX best practice | Faster feedback |

**Deprecated/outdated:**
- `instanceof Array`: Fails across iframes/realms; use `Array.isArray()`
- Manual theme detection: Figma CSS variables handle this automatically

## Open Questions

Things that couldn't be fully resolved:

1. **Browser Differences in Error Messages**
   - What we know: Firefox includes "at line X column Y"; Chrome/V8 uses "position N"
   - What's unclear: Exact format in Figma's embedded browser context
   - Recommendation: Test in Figma; the error message is always usable, just format varies

2. **Optimal Debounce Delay**
   - What we know: 200-500ms is recommended range
   - What's unclear: Best value for JSON validation specifically
   - Recommendation: Start with 300ms; adjust based on user testing

3. **Initial Empty State UX**
   - What we know: Empty textarea is invalid, but shouldn't show error on load
   - What's unclear: When to start showing validation (first input? first blur?)
   - Recommendation: Show validation after first input event; disable button initially without error message

## Sources

### Primary (HIGH confidence)
- [MDN: JSON.parse errors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse) - Error message formats, line/column info
- [MDN: Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) - Reliable array detection
- [MDN: textarea element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea) - Styling and behavior
- [MDN: :disabled pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:disabled) - Button state styling
- [Figma: CSS Variables](https://developers.figma.com/docs/plugins/css-variables/) - Theme-aware plugin styling
- [Figma: Creating UI](https://developers.figma.com/docs/plugins/creating-ui/) - Plugin UI patterns

### Secondary (MEDIUM confidence)
- [Josh W Comeau: Debounce snippet](https://www.joshwcomeau.com/snippets/javascript/debounce/) - Clean ES6 debounce implementation
- [CSS-Tricks: Disabled buttons accessibility](https://css-tricks.com/making-disabled-buttons-more-inclusive/) - Accessible disabled state patterns
- [MDN: aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled) - Accessibility considerations

### Tertiary (LOW confidence)
- None - all findings verified with authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All native browser APIs, well-documented
- Architecture: HIGH - Common validation patterns with clear examples
- Pitfalls: HIGH - Well-documented JSON parsing quirks, verified with MDN
- UI styling: HIGH - Official Figma CSS variables documentation

**Research date:** 2026-01-17
**Valid until:** 90 days (stable browser APIs, unlikely to change)
