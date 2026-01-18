# Domain Pitfalls: Figma Plugin with Color Parsing

**Domain:** Figma plugin development with color parsing and JSON validation
**Researched:** 2026-01-17
**Confidence:** HIGH (verified against official Figma Plugin API documentation)

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or major user-facing issues.

---

### Pitfall 1: RGB Value Range Mismatch (0-1 vs 0-255)

**What goes wrong:** Figma stores RGB values normalized to 0-1 range (e.g., `{r: 0.5, g: 0.5, b: 0.5}`), but user input and common hex/CSS formats use 0-255 range. Developers often forget to convert between formats, resulting in colors that are either nearly black (when 0-255 values are passed directly) or washed out (when 0-1 values are treated as 0-255).

**Why it happens:**
- Web developers are trained to think in 0-255 RGB
- The Figma API documentation is easy to miss on first read
- Testing with black/white colors (0 or 1 in both systems) masks the bug

**Consequences:**
- Colors appear completely wrong
- User-entered hex colors like `#FF5733` become nearly black
- Hard to diagnose because both systems accept numbers

**Prevention:**
```typescript
// ALWAYS convert when parsing user input
function hexToFigmaRGB(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

// ALWAYS convert when displaying to user
function figmaRGBToHex(color: RGB): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}
```

**Detection (warning signs):**
- Colors look very dark or nearly black when they shouldn't
- Colors look washed out or nearly white
- Test with non-extreme values like `#808080` (should be medium gray)

**Phase relevance:** Address in **Color Parsing** phase - build conversion utilities first and use them consistently.

**Source:** [Figma Plugin API - RGB/RGBA](https://developers.figma.com/docs/plugins/api/RGB/)

---

### Pitfall 2: Floating Point Precision in Color Comparison

**What goes wrong:** When matching hardcoded colors to variables, direct equality comparison fails because Figma stores colors with floating-point imprecision. A color entered as `#E5F1FB` might be stored as `{r: 0.8999999761581421, g: 0.9450980424880981, b: 0.9843137264251709}` which doesn't exactly match `{r: 0.9, g: 0.945, b: 0.984}`.

**Why it happens:**
- Floating-point representation inherently has precision limits
- Figma's internal storage doesn't round-trip perfectly
- Repeated conversions accumulate error

**Consequences:**
- Color matching fails silently
- "Identical" colors don't match
- Users report "it doesn't find my colors"

**Prevention:**
```typescript
// Use tolerance-based comparison
function colorsMatch(a: RGB, b: RGB, tolerance = 0.001): boolean {
  return Math.abs(a.r - b.r) < tolerance &&
         Math.abs(a.g - b.g) < tolerance &&
         Math.abs(a.b - b.b) < tolerance;
}

// OR compare at 8-bit precision (after conversion to 0-255)
function colorsMatchHex(a: RGB, b: RGB): boolean {
  const toInt = (v: number) => Math.round(v * 255);
  return toInt(a.r) === toInt(b.r) &&
         toInt(a.g) === toInt(b.g) &&
         toInt(a.b) === toInt(b.b);
}
```

**Detection:**
- Color matching works for some colors but not others
- Manually checking shows visually identical colors not matching
- Unit tests pass but real Figma files fail

**Phase relevance:** Address in **Color Matching** phase - build tolerance-based comparison from the start.

**Source:** [Figma Forum - RGB rounding error](https://forum.figma.com/report-a-problem-6/figma-s-rgb-color-values-seem-to-have-a-rounding-error-34819)

---

### Pitfall 3: No UI Message Handler (Plugin/UI Communication Gap)

**What goes wrong:** The plugin sandbox (code.ts) and UI (iframe) run in separate contexts. Without proper message handlers, UI actions have no effect, buttons appear dead, and state doesn't sync.

**Why it happens:**
- Developers forget Figma's architecture has two isolated contexts
- Works in development when console.log masks the issue
- The sandboxed environment doesn't throw obvious errors

**Consequences:**
- UI buttons do nothing when clicked
- User input never reaches the plugin logic
- Plugin appears broken with no error messages
- **Current VarSwap issue:** No `figma.ui.onmessage` handler exists

**Prevention:**
```typescript
// In code.ts - ALWAYS set up message handler if you have UI
figma.showUI(__html__, { width: 400, height: 300 });

figma.ui.onmessage = (msg: { type: string; [key: string]: any }) => {
  switch (msg.type) {
    case 'parse-color':
      // Handle color parsing
      break;
    case 'validate-json':
      // Handle JSON validation
      break;
    case 'save-settings':
      // Handle settings persistence
      break;
    default:
      console.error(`Unknown message type: ${msg.type}`);
  }
};

// In UI code - use correct postMessage syntax
parent.postMessage({ pluginMessage: { type: 'parse-color', value: '#FF5733' } }, '*');
```

**Detection:**
- UI elements don't trigger any action
- No console output when UI is interacted with
- Plugin works in "run once" mode but not with UI

**Phase relevance:** Address in **Foundation** phase before any UI work - establish message passing pattern early.

**Source:** [Figma Plugin Docs - Creating UI](https://www.figma.com/plugin-docs/creating-ui/)

---

### Pitfall 4: clientStorage Quota and Async Errors

**What goes wrong:** `figma.clientStorage` has a 5MB total limit across ALL keys, not per-key. Developers assume each key gets 5MB, then hit quota errors unexpectedly. Also, forgetting `await` on async storage calls causes silent failures.

**Why it happens:**
- Misreading "5MB storage" as per-key instead of total
- Async operations are easy to forget to await
- Errors only appear in console, not to user

**Consequences:**
- Data silently fails to save
- Settings lost between sessions
- "Quota exceeded" errors crash the plugin
- Inconsistent state (partial saves)

**Prevention:**
```typescript
// ALWAYS wrap storage in try-catch with user feedback
async function saveToStorage(key: string, value: any): Promise<boolean> {
  try {
    await figma.clientStorage.setAsync(key, value);
    return true;
  } catch (error) {
    if (error.message?.includes('quota')) {
      figma.notify('Storage full - cannot save settings', { error: true });
    } else {
      figma.notify('Failed to save settings', { error: true });
    }
    console.error('Storage error:', error);
    return false;
  }
}

// ALWAYS await storage operations
async function loadSettings(): Promise<Settings> {
  const settings = await figma.clientStorage.getAsync('settings');
  return settings ?? DEFAULT_SETTINGS;
}
```

**Detection:**
- Settings don't persist between plugin runs
- "Quota exceeded" errors in console
- Plugin works on small files but fails on large projects

**Phase relevance:** Address in **Persistence** phase - build robust storage wrapper with error handling.

**Source:** [Figma Plugin Docs - clientStorage](https://developers.figma.com/docs/plugins/api/figma-clientStorage/)

---

### Pitfall 5: main() Called Multiple Times

**What goes wrong:** Plugin entry point gets executed multiple times, causing duplicate operations, state corruption, and unexpected behavior.

**Why it happens:**
- Copy-paste errors (literally `main(); main();` as in current VarSwap code)
- Event handlers not properly cleaned up
- Widget/plugin code re-execution patterns
- Hot module replacement in development

**Consequences:**
- Operations run twice
- "X changes made" shows double the actual changes
- Unexpected state mutations
- Performance issues

**Prevention:**
```typescript
// Option 1: Guard against multiple execution
let hasRun = false;

async function main() {
  if (hasRun) return;
  hasRun = true;
  // ... plugin logic
}

main();

// Option 2: Use IIFE to prevent duplicate calls
(async function main() {
  // ... plugin logic
})();

// Option 3: For plugins with UI, entry is in message handler
figma.showUI(__html__);
// main() only called from UI message, not at top level
```

**Detection:**
- Console logs appear twice
- Operations show double the expected count
- Search for duplicate `main()` calls

**Phase relevance:** Fix in **Foundation** phase immediately - this is a current bug in VarSwap.

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 6: Hex Color Parsing Edge Cases

**What goes wrong:** Hex parsing code doesn't handle all valid formats (#FFF, #FFFFFF, #FFFFFFFF with alpha, lowercase, missing #), causing parsing failures on valid input.

**Why it happens:**
- Only testing with one hex format
- Forgetting shorthand notation exists
- Not considering alpha channel in 8-char hex

**Prevention:**
```typescript
function parseHex(input: string): RGB | RGBA | null {
  let hex = input.trim();

  // Handle missing #
  if (!hex.startsWith('#')) hex = '#' + hex;

  // Lowercase for consistency
  hex = hex.toLowerCase();

  // Validate format
  const match = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (!match) return null;

  const value = match[1];

  // Expand shorthand (#FFF -> #FFFFFF)
  const expanded = value.length === 3
    ? value.split('').map(c => c + c).join('')
    : value;

  const r = parseInt(expanded.slice(0, 2), 16) / 255;
  const g = parseInt(expanded.slice(2, 4), 16) / 255;
  const b = parseInt(expanded.slice(4, 6), 16) / 255;

  if (expanded.length === 8) {
    const a = parseInt(expanded.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  return { r, g, b };
}
```

**Detection:**
- Users report "invalid color" for valid hex codes
- Test with: `#fff`, `#FFF`, `#ffffff`, `#FFFFFF`, `fff`, `#FF5733AA`

**Phase relevance:** Address in **Color Parsing** phase - comprehensive validation from the start.

---

### Pitfall 7: RGBA Parsing Complexity

**What goes wrong:** RGBA parsing is more complex than hex - variations like `rgba(255, 128, 0, 0.5)`, `rgba(255 128 0 / 50%)`, and percentage values all need handling.

**Why it happens:**
- CSS has multiple valid rgba syntaxes
- Copy-paste from different sources uses different formats
- Alpha can be decimal (0.5) or percentage (50%)

**Prevention:**
```typescript
function parseRGBA(input: string): RGBA | null {
  // Match: rgba(r, g, b, a) or rgba(r g b / a)
  const match = input.match(
    /rgba?\s*\(\s*(\d+%?)\s*[,\s]\s*(\d+%?)\s*[,\s]\s*(\d+%?)\s*(?:[,\/]\s*(\d*\.?\d+%?))?\s*\)/i
  );

  if (!match) return null;

  const parseComponent = (val: string, isAlpha = false): number => {
    if (val.endsWith('%')) {
      const percent = parseFloat(val) / 100;
      return isAlpha ? percent : percent * 255 / 255;
    }
    const num = parseFloat(val);
    return isAlpha ? num : num / 255;
  };

  return {
    r: parseComponent(match[1]),
    g: parseComponent(match[2]),
    b: parseComponent(match[3]),
    a: match[4] ? parseComponent(match[4], true) : 1
  };
}
```

**Detection:**
- Pasted rgba values don't parse
- Test various formats from CSS-in-JS, design tools, color pickers

**Phase relevance:** Address in **Color Parsing** phase alongside hex parsing.

---

### Pitfall 8: JSON Schema Validation Missing or Too Strict

**What goes wrong:** Either no validation (garbage in, crash later) or overly strict validation (rejects valid edge cases). Design token JSON has multiple valid formats (W3C DTCG vs legacy).

**Why it happens:**
- Assuming all JSON with color keys is the same format
- Not accounting for format variations (W3C DTCG uses `$value`, legacy uses `value`)
- Validating structure but not semantic correctness

**Prevention:**
```typescript
interface TokenValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  format: 'dtcg' | 'legacy' | 'unknown';
}

function validateColorToken(token: unknown): TokenValidationResult {
  const result: TokenValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    format: 'unknown'
  };

  if (typeof token !== 'object' || token === null) {
    result.errors.push('Token must be an object');
    return result;
  }

  // Detect format
  if ('$value' in token) {
    result.format = 'dtcg';
    // W3C DTCG format validation
  } else if ('value' in token) {
    result.format = 'legacy';
    // Legacy format validation
  } else {
    result.errors.push('Missing value property ($value or value)');
    return result;
  }

  result.valid = result.errors.length === 0;
  return result;
}
```

**Detection:**
- Valid token files rejected
- Invalid data causes runtime errors later
- Test with real-world token files from different sources

**Phase relevance:** Address in **JSON Validation** phase - build flexible validator.

**Source:** [Tokens Studio - JSON Schema](https://docs.tokens.studio/tokens/json-schema)

---

### Pitfall 9: Performance Degradation on Large Documents

**What goes wrong:** Traversing all nodes with `findAll()` freezes UI on large documents (tens of thousands of nodes). Users think plugin is broken.

**Why it happens:**
- Works fine on test files with 50 nodes
- `findAll()` is convenient but expensive
- Forgetting to skip invisible instance children
- Loading all pages when only current page needed

**Prevention:**
```typescript
// Enable performance optimization
figma.skipInvisibleInstanceChildren = true;

// Scope to selection instead of whole document
async function processColors() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('Select elements to process');
    return;
  }

  // Process only selected nodes and their children
  for (const node of selection) {
    await processNodeTree(node);
  }
}

// Add progress feedback for long operations
async function processNodeTree(node: SceneNode, processed = { count: 0 }) {
  processed.count++;

  // Update UI periodically
  if (processed.count % 100 === 0) {
    figma.ui.postMessage({
      type: 'progress',
      count: processed.count
    });
    // Yield to prevent UI freeze
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // ... process node

  if ('children' in node) {
    for (const child of node.children) {
      await processNodeTree(child, processed);
    }
  }
}
```

**Detection:**
- Plugin hangs on large files
- Figma becomes unresponsive
- Test on real production files, not toy examples

**Phase relevance:** Address in **Color Matching** phase - optimize traversal patterns.

**Source:** [Figma Plugin Docs - skipInvisibleInstanceChildren](https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/)

---

### Pitfall 10: Hardcoded Colors vs Bound Variables Confusion

**What goes wrong:** Checking only `node.fills[i].color` misses that the color might already be bound to a variable. Need to distinguish between hardcoded colors (to be matched) and variable-bound colors (already managed).

**Why it happens:**
- Not understanding `boundVariables` property
- Treating all fills as hardcoded
- Missing the variable binding in fill structure

**Prevention:**
```typescript
interface FillAnalysis {
  isHardcoded: boolean;
  color?: RGB;
  variableId?: string;
  variableName?: string;
}

async function analyzeFill(fill: Paint, node: SceneNode): Promise<FillAnalysis> {
  if (fill.type !== 'SOLID') {
    return { isHardcoded: false }; // Gradients, images not handled
  }

  // Check if fill has bound variable
  if ('boundVariables' in node && node.boundVariables?.fills) {
    const binding = node.boundVariables.fills[0];
    if (binding?.id) {
      const variable = await figma.variables.getVariableByIdAsync(binding.id);
      return {
        isHardcoded: false,
        variableId: binding.id,
        variableName: variable?.name
      };
    }
  }

  // Hardcoded color
  return {
    isHardcoded: true,
    color: fill.color
  };
}
```

**Detection:**
- Plugin tries to match colors that are already variables
- Double-applying variables
- Logs show variable names where raw colors expected

**Phase relevance:** Address in **Color Matching** phase - distinguish bound vs hardcoded.

**Source:** [Figma Forum - Get applied color variable](https://forum.figma.com/ask-the-community-7/how-to-get-the-applied-color-variable-in-a-figma-plugin-37783)

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

---

### Pitfall 11: Errors Only in Console (No User Feedback)

**What goes wrong:** Errors logged to console but user sees nothing. Plugin appears to succeed when it actually failed.

**Prevention:**
```typescript
// Wrap operations with user-visible feedback
try {
  const result = await processColors();
  figma.notify(`Updated ${result.count} colors`);
} catch (error) {
  figma.notify('Error processing colors. Check console for details.', {
    error: true
  });
  console.error('Color processing failed:', error);
}
```

**Phase relevance:** Fix in **Foundation** phase - establish error handling pattern.

---

### Pitfall 12: Case Sensitivity in Color/Variable Names

**What goes wrong:** Comparing `"Primary/500"` to `"primary/500"` fails even though they're semantically the same. Inconsistent casing in mapping objects.

**Prevention:**
```typescript
// Normalize names for comparison
function normalizeColorName(name: string): string {
  return name.toLowerCase().trim();
}

// Use normalized keys in mapping
const colorMapping = new Map<string, string>();
colorMapping.set(normalizeColorName('Primary/500'), 'Brand/Primary');
```

**Phase relevance:** Address in **Color Matching** phase.

---

### Pitfall 13: Document Color Profile Ignored

**What goes wrong:** Colors appear different because document uses P3 or other wide-gamut color profile, but code assumes sRGB.

**Prevention:**
```typescript
// Check color profile for accurate color handling
const profile = figma.root.documentColorProfile;
if (profile !== 'SRGB') {
  figma.notify(`Document uses ${profile} color profile - colors may vary`);
}
```

**Phase relevance:** Nice-to-have awareness, log in **Foundation** phase.

**Source:** [Figma Plugin Docs - RGB](https://developers.figma.com/docs/plugins/api/RGB/)

---

### Pitfall 14: Missing Font Loading for Text Nodes

**What goes wrong:** When processing text nodes that also have color, operations fail if the text font isn't loaded.

**Prevention:**
```typescript
async function processTextNode(node: TextNode) {
  // Load font before any text operations
  if (node.fontName !== figma.mixed) {
    await figma.loadFontAsync(node.fontName);
  }
  // Now safe to modify fills
}
```

**Phase relevance:** Address if text nodes are in scope for color matching.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation/Setup | main() called twice | Remove duplicate call, use IIFE pattern |
| Foundation/Setup | No UI message handler | Establish message passing pattern immediately |
| Color Parsing | RGB 0-1 vs 0-255 range | Build conversion utilities first, use everywhere |
| Color Parsing | Hex edge cases | Support all valid formats: #FFF, #FFFFFF, #FFFFFFFF |
| Color Parsing | RGBA variations | Handle multiple CSS syntaxes |
| JSON Validation | Schema too strict/loose | Support W3C DTCG and legacy formats |
| Color Matching | Floating point comparison | Use tolerance-based or 8-bit comparison |
| Color Matching | Performance on large docs | Enable skipInvisibleInstanceChildren, scope to selection |
| Color Matching | Hardcoded vs bound confusion | Check boundVariables before matching |
| Persistence | clientStorage quota | Wrap in try-catch, provide user feedback |
| Persistence | Async errors | Always await storage operations |
| All Phases | Errors only in console | Use figma.notify for user feedback |

---

## Sources

### Official Documentation (HIGH confidence)
- [Figma Plugin API - RGB/RGBA](https://developers.figma.com/docs/plugins/api/RGB/)
- [Figma Plugin API - clientStorage](https://developers.figma.com/docs/plugins/api/figma-clientStorage/)
- [Figma Plugin API - figma.util](https://developers.figma.com/docs/plugins/api/figma-util/)
- [Figma Plugin Docs - Creating UI](https://www.figma.com/plugin-docs/creating-ui/)
- [Figma Plugin Docs - postMessage](https://www.figma.com/plugin-docs/api/properties/figma-ui-postmessage/)
- [Figma Plugin Docs - skipInvisibleInstanceChildren](https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/)
- [Figma Plugin Docs - findAll](https://www.figma.com/plugin-docs/api/properties/DocumentNode-findall/)

### Community Sources (MEDIUM confidence)
- [Figma Forum - RGB values](https://forum.figma.com/t/trying-to-make-sense-of-the-rgb-values-returned-by-node-fills/10852)
- [Figma Forum - RGB rounding error](https://forum.figma.com/report-a-problem-6/figma-s-rgb-color-values-seem-to-have-a-rounding-error-34819)
- [Figma Forum - Get applied color variable](https://forum.figma.com/ask-the-community-7/how-to-get-the-applied-color-variable-in-a-figma-plugin-37783)
- [Tokens Studio - JSON Schema](https://docs.tokens.studio/tokens/json-schema)
- [Evil Martians - Figma Plugin Storage](https://evilmartians.com/chronicles/how-to-make-next-level-figma-plugins-auth-routing-storage-and-more)

### Algorithm References (MEDIUM confidence)
- [DEV.to - RGB Distance](https://dev.to/bytebodger/determining-the-rgb-distance-between-two-colors-4n91)
- [Color.js - Color Difference](https://colorjs.io/docs/color-difference.html)
- [figma-plugin-helpers - convertColor](https://github.com/figma-plugin-helper-functions/figma-plugin-helpers/blob/master/src/helpers/convertColor.ts)
