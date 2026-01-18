# Phase 3: Color Parsing and Matching - Research

**Researched:** 2026-01-17
**Domain:** Figma Plugin Color Handling and Variable Matching
**Confidence:** HIGH

## Summary

Phase 3 extends the existing variable-name matching to also match by hardcoded color values (hex and rgba). The plugin must identify whether a fill/stroke is bound to a variable or contains a hardcoded color, parse various color formats to Figma's internal 0-1 RGB representation, and compare colors with tolerance for floating-point precision issues.

The Figma Plugin API provides `figma.util.rgb()` and `figma.util.rgba()` for parsing CSS color strings directly to Figma's RGB/RGBA format. These handle hex (#FFF, #FFFFFF, #FFFFFFFF), rgb(), rgba(), hsl(), and lab() formats. For hardcoded colors, comparison requires tolerance-based checking since Figma stores colors as 32-bit floats (7 decimal places precision) while JavaScript uses 64-bit floats.

**Primary recommendation:** Use `figma.util.rgba()` for all color parsing (it handles both rgb and rgba input), check `boundVariables` to distinguish variable-bound vs hardcoded colors, implement tolerance comparison at 0.001 threshold, and maintain priority order: match by variable name first, then by color value.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| figma.util.rgba() | Built-in | Parse CSS color strings to Figma RGBA | Official API, handles all formats automatically |
| figma.util.rgb() | Built-in | Parse CSS colors ignoring alpha | Official API, use when alpha not needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | figma.util handles all parsing needs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| figma.util.rgba() | Manual hex parsing | Unnecessary - API handles all cases including short hex |
| figma.util.rgba() | figma-plugin-helpers | External dependency for what's built-in |
| Manual regex | figma.util.rgba() | API is more robust, handles edge cases |

**Installation:**
No additional packages needed - figma.util is part of the Figma Plugin API.

## Architecture Patterns

### Recommended Module Structure
```
code.ts additions:
  - Color parsing functions
  - Color comparison with tolerance
  - Source matching (variable name OR color value)
  - Updated processNode to check both match types
```

### Pattern 1: Check boundVariables First
**What:** Determine if a fill/stroke has a bound variable before checking color values
**When to use:** Every fill/stroke inspection - critical for distinguishing variable-bound vs hardcoded
**Example:**
```typescript
// Source: https://developers.figma.com/docs/plugins/working-with-variables/

function getFillSource(fill: SolidPaint, fillIndex: number, node: SceneNode): { type: 'variable' | 'hardcoded'; value: string | RGB } {
  // Check if this fill is bound to a variable
  if ('boundVariables' in node && node.boundVariables?.fills?.[fillIndex]) {
    const variableAlias = node.boundVariables.fills[fillIndex];
    // Variable is bound - get its name asynchronously
    return { type: 'variable', value: variableAlias.id };
  }

  // No bound variable - it's a hardcoded color
  return { type: 'hardcoded', value: fill.color };
}
```

### Pattern 2: Tolerance-Based Color Comparison
**What:** Compare RGB values with epsilon threshold to handle floating-point precision
**When to use:** Whenever comparing two RGB color values
**Example:**
```typescript
// Source: Figma Forum discussions on 32-bit float precision

const COLOR_TOLERANCE = 0.001;

function colorsMatch(color1: RGB, color2: RGB, tolerance: number = COLOR_TOLERANCE): boolean {
  return (
    Math.abs(color1.r - color2.r) < tolerance &&
    Math.abs(color1.g - color2.g) < tolerance &&
    Math.abs(color1.b - color2.b) < tolerance
  );
}
```

### Pattern 3: Parse Old Source to Figma RGB
**What:** Attempt to parse a mapping "old" value as a color, returning null if not a valid color
**When to use:** When determining if an old source is a color value vs variable name
**Example:**
```typescript
// Source: https://developers.figma.com/docs/plugins/api/figma-util/

function parseColorSource(source: string): RGB | null {
  // Variable names don't start with # or rgba/rgb
  if (!source.startsWith('#') && !source.startsWith('rgb')) {
    return null;
  }

  try {
    const rgba = figma.util.rgba(source);
    // Return RGB without alpha for comparison with SolidPaint.color
    return { r: rgba.r, g: rgba.g, b: rgba.b };
  } catch {
    // Not a valid color format
    return null;
  }
}
```

### Pattern 4: Priority-Based Source Matching
**What:** Check variable name first, then color value as fallback
**When to use:** When determining if a fill/stroke matches a mapping entry
**Example:**
```typescript
function findMatchingEntry(
  variableName: string | null,
  fillColor: RGB,
  colorMapping: { [key: string]: string }
): string | null {
  // Priority 1: Match by variable name (existing behavior)
  if (variableName && colorMapping[variableName]) {
    return colorMapping[variableName];
  }

  // Priority 2: Match by color value
  for (const [oldSource, newVariable] of Object.entries(colorMapping)) {
    const sourceColor = parseColorSource(oldSource);
    if (sourceColor && colorsMatch(fillColor, sourceColor)) {
      return newVariable;
    }
  }

  return null;
}
```

### Anti-Patterns to Avoid
- **Direct color equality:** Never use `===` for RGB comparison; use tolerance-based comparison
- **Parsing before checking format:** Check if string starts with `#` or `rgb` before calling figma.util
- **Ignoring boundVariables:** Always check boundVariables first to avoid treating variable-bound colors as hardcoded
- **Manual hex parsing:** Don't hand-roll hex-to-RGB conversion; figma.util handles all formats including short hex

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hex color parsing | Manual parseInt/substring | figma.util.rgba() | Handles #FFF, #FFFFFF, #FFFFFFFF automatically |
| rgba() string parsing | Regex extraction | figma.util.rgba() | Handles all CSS color syntaxes |
| Short hex expansion | #FFF -> #FFFFFF | figma.util.rgba() | Built-in behavior |
| CSS color normalization | Format detection | figma.util.rgba() | Accepts all formats, returns consistent RGBA |
| 0-255 to 0-1 conversion | Manual division | figma.util.rgba() | Automatic in all parsing |

**Key insight:** `figma.util.rgba()` is the universal color parser - it accepts hex (3, 6, 8 digit), rgb(), rgba(), hsl(), hsla(), and lab() formats. The only manual work needed is tolerance-based comparison.

## Common Pitfalls

### Pitfall 1: Using Strict Equality for Color Comparison
**What goes wrong:** Colors that look identical don't match due to floating-point representation
**Why it happens:** Figma stores RGB as 32-bit floats; JS uses 64-bit; conversion introduces tiny differences
**How to avoid:** Always use tolerance-based comparison with 0.001 epsilon
**Warning signs:** "#FF0000" doesn't match a fill that visually appears red

### Pitfall 2: Checking Node boundVariables Instead of Fill boundVariables
**What goes wrong:** Incorrect detection of whether a specific fill is variable-bound
**Why it happens:** Both node.boundVariables.fills[] and fill.boundVariables?.color exist with different structures
**How to avoid:** Check node.boundVariables.fills[index] for the specific fill index you're examining
**Warning signs:** Variables not detected, or wrong variable associated with fill

### Pitfall 3: Forgetting Alpha in 8-Digit Hex
**What goes wrong:** 8-digit hex colors like #FFFFFFFF not parsed correctly
**Why it happens:** Manual parsing often assumes 6-digit hex only
**How to avoid:** Use figma.util.rgba() which handles 8-digit hex automatically
**Warning signs:** Colors with alpha channel specified via 8-digit hex fail to match

### Pitfall 4: Case Sensitivity in Hex Colors
**What goes wrong:** #fff doesn't match #FFF
**Why it happens:** String comparison without normalization
**How to avoid:** figma.util.rgba() handles case-insensitively; for display, use toLowerCase() consistently
**Warning signs:** Same visual color in different cases fails to match

### Pitfall 5: SolidPaint.color is RGB not RGBA
**What goes wrong:** Comparing RGBA to RGB fails or includes unnecessary alpha comparison
**Why it happens:** Assuming all colors have alpha
**How to avoid:** SolidPaint stores color as RGB (no alpha) and opacity separately; compare RGB only
**Warning signs:** Colors match in r/g/b but fail due to alpha mismatch

### Pitfall 6: Variable Name vs Color Value Ambiguity
**What goes wrong:** A mapping with old="#000" could be interpreted as variable named "#000" or black color
**Why it happens:** No clear distinction in JSON format
**How to avoid:** Use format detection (starts with # or rgb) to determine type; document in UI
**Warning signs:** Variables literally named "#something" not matched

## Code Examples

Verified patterns from official sources:

### Color Parsing with figma.util.rgba()
```typescript
// Source: https://developers.figma.com/docs/plugins/api/figma-util/

// All of these work:
const color1 = figma.util.rgba('#FF00FF');       // 6-digit hex
const color2 = figma.util.rgba('#F0F');          // 3-digit hex (expanded to #FF00FF)
const color3 = figma.util.rgba('#FF00FF80');     // 8-digit hex with alpha
const color4 = figma.util.rgba('rgb(255, 0, 255)');
const color5 = figma.util.rgba('rgba(255, 0, 255, 0.5)');
const color6 = figma.util.rgba('hsl(300, 100%, 50%)');

// Returns: { r: number, g: number, b: number, a: number } in 0-1 range
// Example: { r: 1, g: 0, b: 1, a: 1 }
```

### Detecting Variable-Bound vs Hardcoded Fills
```typescript
// Source: https://developers.figma.com/docs/plugins/working-with-variables/

async function inspectFills(node: SceneNode): Promise<void> {
  if (!('fills' in node) || !Array.isArray(node.fills)) return;

  for (let i = 0; i < node.fills.length; i++) {
    const fill = node.fills[i];
    if (fill.type !== 'SOLID') continue;

    // Check if this fill has a bound variable
    const boundVariable = node.boundVariables?.fills?.[i];

    if (boundVariable) {
      // Fill is bound to a variable
      const variable = await figma.variables.getVariableByIdAsync(boundVariable.id);
      console.log(`Fill ${i}: bound to variable "${variable?.name}"`);
    } else {
      // Fill is hardcoded
      console.log(`Fill ${i}: hardcoded color`, fill.color);
    }
  }
}
```

### Complete Color Matching Implementation
```typescript
// Source: Combined from Figma docs and forum best practices

const COLOR_TOLERANCE = 0.001;

// Check if two RGB colors match within tolerance
function colorsMatch(color1: RGB, color2: RGB): boolean {
  return (
    Math.abs(color1.r - color2.r) < COLOR_TOLERANCE &&
    Math.abs(color1.g - color2.g) < COLOR_TOLERANCE &&
    Math.abs(color1.b - color2.b) < COLOR_TOLERANCE
  );
}

// Try to parse a source string as a color
function tryParseColor(source: string): RGB | null {
  // Quick check: if it doesn't look like a color, don't try to parse
  const trimmed = source.trim().toLowerCase();
  if (!trimmed.startsWith('#') && !trimmed.startsWith('rgb')) {
    return null;
  }

  try {
    const rgba = figma.util.rgba(source);
    return { r: rgba.r, g: rgba.g, b: rgba.b };
  } catch {
    return null;
  }
}

// Find matching new variable for a fill
async function findMatch(
  fill: SolidPaint,
  fillIndex: number,
  node: SceneNode,
  colorMapping: { [key: string]: string }
): Promise<string | null> {
  // Priority 1: Check for bound variable match
  const boundVariable = node.boundVariables?.fills?.[fillIndex];
  if (boundVariable) {
    const variable = await figma.variables.getVariableByIdAsync(boundVariable.id);
    if (variable && colorMapping[variable.name]) {
      return colorMapping[variable.name];
    }
  }

  // Priority 2: Check for hardcoded color match
  for (const [oldSource, newVariable] of Object.entries(colorMapping)) {
    const sourceColor = tryParseColor(oldSource);
    if (sourceColor && colorsMatch(fill.color, sourceColor)) {
      return newVariable;
    }
  }

  return null;
}
```

### Normalizing Color Input in JSON
```typescript
// For display/comparison consistency, normalize hex to uppercase 6-digit format

function normalizeHex(hex: string): string {
  // Remove # prefix
  let color = hex.replace('#', '');

  // Expand 3-digit to 6-digit
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }

  // Handle 8-digit (with alpha) - keep as-is but uppercase
  return '#' + color.toUpperCase();
}

// Note: This is for display only. figma.util.rgba() handles all formats for parsing.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual hex parsing | figma.util.rgba() | Added in recent API | No external dependencies needed |
| figma-plugin-helpers library | figma.util built-ins | API additions | Simpler, no npm dependency |
| Direct color comparison | Tolerance-based comparison | Best practice | Handles 32-bit float precision |
| Check paint.boundVariables.color | Check node.boundVariables.fills[i] | API structure | Correct variable detection |

**Deprecated/outdated:**
- Manual parseInt-based hex parsing - use figma.util.rgba() instead
- External color parsing libraries - built-in API handles all cases

## Open Questions

Things that couldn't be fully resolved:

1. **Variable Name Starting with #**
   - What we know: Format detection uses # prefix to identify hex colors
   - What's unclear: What if a variable is literally named "#Primary"?
   - Recommendation: Document that old sources starting with # are treated as colors; variable names should not start with #

2. **Gradient Support**
   - What we know: GradientPaint has gradientStops with boundVariables.color
   - What's unclear: Whether phase 3 should support gradient color matching
   - Recommendation: Defer to v2 (ADVN-01 in requirements); focus on SOLID fills only

3. **Alpha Channel Matching**
   - What we know: 8-digit hex includes alpha; SolidPaint has separate opacity property
   - What's unclear: Should alpha/opacity affect matching?
   - Recommendation: Match on RGB only; alpha is a separate concern (fill.opacity vs color)

## Sources

### Primary (HIGH confidence)
- [Figma Plugin Typings: plugin-api.d.ts](file://node_modules/@figma/plugin-typings/plugin-api.d.ts) - UtilAPI interface, RGB/RGBA types, SolidPaint interface
- [Figma Docs: figma.util](https://developers.figma.com/docs/plugins/api/figma-util/) - rgb(), rgba(), solidPaint() functions
- [Figma Docs: Working with Variables](https://developers.figma.com/docs/plugins/working-with-variables/) - boundVariables, setBoundVariableForPaint

### Secondary (MEDIUM confidence)
- [Figma Forum: RGB Values in Plugin API](https://forum.figma.com/t/trying-to-make-sense-of-the-rgb-values-returned-by-node-fills/10852) - 0-1 range explanation
- [Figma Forum: RGB Rounding Error](https://forum.figma.com/report-a-problem-6/figma-s-rgb-color-values-seem-to-have-a-rounding-error-34819) - 32-bit float precision discussion
- [figma-plugin-helpers: convertColor.ts](https://github.com/figma-plugin-helper-functions/figma-plugin-helpers/blob/master/src/helpers/convertColor.ts) - Reference implementation (not needed with figma.util)

### Tertiary (LOW confidence)
- None - all critical findings verified with official documentation and typings

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - figma.util.rgba() is official API, verified in typings
- Architecture: HIGH - boundVariables structure verified in typings and docs
- Pitfalls: HIGH - 32-bit float precision confirmed in multiple forum discussions
- Color parsing: HIGH - All formats verified in figma plugin typings documentation

**Research date:** 2026-01-17
**Valid until:** 60 days (stable API, figma.util unlikely to change)
