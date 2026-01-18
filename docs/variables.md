# Variable Types Reference

VarSwap supports all Figma variable types across multiple node properties. This document details every supported variable type and property.

---

## Variable Types Overview

| Figma Type | Description | Supported Properties |
|------------|-------------|---------------------|
| `COLOR` | Color values | Fills, strokes |
| `FLOAT` | Numeric values | Spacing, dimensions, corner radius, stroke weight, opacity |
| `STRING` | Text values | Text content (characters) |
| `BOOLEAN` | True/false values | Visibility |

---

## COLOR Variables

Color variables can be bound to fill and stroke paint properties.

### Fills

Applies to nodes with solid fills (rectangles, frames, text, etc.)

```json
{
  "variables": [
    { "old": "colors/background", "new": "surface/primary" },
    { "old": "colors/foreground", "new": "content/primary" }
  ]
}
```

**Matching Priority:**
1. First, checks if a variable is bound to the fill
2. If no variable, checks if the fill color matches a hardcoded color value

### Strokes

Applies to nodes with solid strokes.

```json
{
  "variables": [
    { "old": "colors/border", "new": "border/default" },
    { "old": "colors/divider", "new": "border/subtle" }
  ]
}
```

### Hardcoded Color Matching

Match nodes without variable bindings by their color value:

```json
{
  "variables": [
    { "old": "#FF0000", "new": "semantic/error" },
    { "old": "#00FF00", "new": "semantic/success" },
    { "old": "#0000FF", "new": "semantic/info" },
    { "old": "rgb(255, 165, 0)", "new": "semantic/warning" }
  ]
}
```

**Supported Color Formats:**

| Format | Example | Description |
|--------|---------|-------------|
| Hex 6-digit | `#FF5500` | Standard hex color |
| Hex 3-digit | `#F50` | Shorthand hex (expanded internally) |
| Hex with alpha | `#FF550080` | 8-digit hex (alpha ignored for matching) |
| RGB | `rgb(255, 85, 0)` | RGB notation |
| RGBA | `rgba(255, 85, 0, 0.5)` | RGBA notation (alpha ignored for matching) |

---

## FLOAT Variables

Float variables represent numeric values and can be bound to various node properties.

### Spacing Properties

Used for padding and gap in auto-layout frames.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `paddingLeft` | Left padding | Frames with auto-layout |
| `paddingRight` | Right padding | Frames with auto-layout |
| `paddingTop` | Top padding | Frames with auto-layout |
| `paddingBottom` | Bottom padding | Frames with auto-layout |
| `itemSpacing` | Gap between items | Frames with auto-layout |
| `counterAxisSpacing` | Gap in wrap mode | Frames with auto-layout (wrap) |

```json
{
  "variables": [
    { "old": "spacing/xs", "new": "space/50" },
    { "old": "spacing/sm", "new": "space/100" },
    { "old": "spacing/md", "new": "space/200" },
    { "old": "spacing/lg", "new": "space/300" },
    { "old": "spacing/xl", "new": "space/400" }
  ]
}
```

### Dimension Properties

Used for width and height constraints.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `width` | Fixed width | Most node types |
| `height` | Fixed height | Most node types |
| `minWidth` | Minimum width | Frames |
| `maxWidth` | Maximum width | Frames |
| `minHeight` | Minimum height | Frames |
| `maxHeight` | Maximum height | Frames |

```json
{
  "variables": [
    { "old": "sizing/icon-sm", "new": "size/icon/small" },
    { "old": "sizing/icon-md", "new": "size/icon/medium" },
    { "old": "sizing/icon-lg", "new": "size/icon/large" },
    { "old": "sizing/button-height", "new": "size/control/default" }
  ]
}
```

### Corner Radius Properties

Used for rounded corners.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `cornerRadius` | Uniform corner radius | Rectangles, frames, components |
| `topLeftRadius` | Top-left corner | Rectangles, frames, components |
| `topRightRadius` | Top-right corner | Rectangles, frames, components |
| `bottomLeftRadius` | Bottom-left corner | Rectangles, frames, components |
| `bottomRightRadius` | Bottom-right corner | Rectangles, frames, components |

```json
{
  "variables": [
    { "old": "radius/none", "new": "radii/0" },
    { "old": "radius/sm", "new": "radii/small" },
    { "old": "radius/md", "new": "radii/medium" },
    { "old": "radius/lg", "new": "radii/large" },
    { "old": "radius/full", "new": "radii/full" }
  ]
}
```

### Stroke Weight Properties

Used for border/stroke thickness.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `strokeWeight` | Uniform stroke weight | All nodes with strokes |
| `strokeTopWeight` | Top stroke weight | Frames (individual strokes) |
| `strokeRightWeight` | Right stroke weight | Frames (individual strokes) |
| `strokeBottomWeight` | Bottom stroke weight | Frames (individual strokes) |
| `strokeLeftWeight` | Left stroke weight | Frames (individual strokes) |

```json
{
  "variables": [
    { "old": "border/thin", "new": "stroke/1" },
    { "old": "border/medium", "new": "stroke/2" },
    { "old": "border/thick", "new": "stroke/4" }
  ]
}
```

### Opacity

Used for transparency.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `opacity` | Node opacity (0-1) | All nodes |

```json
{
  "variables": [
    { "old": "opacity/disabled", "new": "alpha/disabled" },
    { "old": "opacity/hover", "new": "alpha/hover" }
  ]
}
```

---

## STRING Variables

String variables contain text content.

### Characters (Text Content)

Applies only to text nodes.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `characters` | Text content | Text nodes only |

```json
{
  "variables": [
    { "old": "content/button-label", "new": "strings/cta-primary" },
    { "old": "content/heading", "new": "strings/page-title" }
  ]
}
```

**Note:** String variable replacement only works when the entire text node's content is bound to a variable. Mixed content (variable + static text) is not supported.

---

## BOOLEAN Variables

Boolean variables contain true/false values.

### Visibility

Controls whether a node is visible.

| Property | Description | Applicable Nodes |
|----------|-------------|-----------------|
| `visible` | Show/hide node | All nodes |

```json
{
  "variables": [
    { "old": "state/show-badge", "new": "visibility/badge" },
    { "old": "state/show-icon", "new": "visibility/icon" }
  ]
}
```

---

## Property Support by Node Type

### Frame / Component / Component Set

| Property Category | Supported Properties |
|-------------------|---------------------|
| Color | fills, strokes |
| Spacing | paddingLeft, paddingRight, paddingTop, paddingBottom, itemSpacing, counterAxisSpacing |
| Dimensions | width, height, minWidth, maxWidth, minHeight, maxHeight |
| Corner Radius | cornerRadius, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius |
| Stroke | strokeWeight, strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight |
| Other | opacity, visible |

### Rectangle / Ellipse / Polygon / Star / Line

| Property Category | Supported Properties |
|-------------------|---------------------|
| Color | fills, strokes |
| Dimensions | width, height |
| Corner Radius | cornerRadius (Rectangle only), individual corners (Rectangle only) |
| Stroke | strokeWeight |
| Other | opacity, visible |

### Text

| Property Category | Supported Properties |
|-------------------|---------------------|
| Color | fills, strokes |
| Dimensions | width, height |
| String | characters |
| Other | opacity, visible |

### Vector

| Property Category | Supported Properties |
|-------------------|---------------------|
| Color | fills, strokes |
| Stroke | strokeWeight |
| Other | opacity, visible |

### Instance

| Property Category | Supported Properties |
|-------------------|---------------------|
| Color | fills, strokes (if exposed) |
| Spacing | All spacing properties (if exposed) |
| Dimensions | width, height |
| Corner Radius | All corner properties (if exposed) |
| Other | opacity, visible |

---

## Variable Resolution

### Local Variables

Variables defined in the current document are checked first.

### Library Variables

If a variable is not found locally, VarSwap searches linked team libraries:

1. Gets all available library variable collections
2. Searches each collection for the variable by name
3. Imports the variable if found

**Important:** The library must be linked to the document for library variables to work.

---

## Naming Conventions

### Variable Names

Variable names should match exactly as they appear in Figma, including:
- Collection name (if using full path)
- Group hierarchy
- Variable name

**Example:** If your variable is in collection "Tokens", group "colors", named "primary":
- Full path: `Tokens/colors/primary`
- Or just: `colors/primary` (if unique)

### Case Sensitivity

Variable names are **case-sensitive**:
- `colors/Primary` ≠ `colors/primary`

---

## Best Practices

### 1. Use Consistent Naming

Match your mapping to your actual variable structure:

```json
{
  "variables": [
    { "old": "OldSystem/colors/primary", "new": "NewSystem/brand/primary" }
  ]
}
```

### 2. Group Related Mappings

Keep related variables together for maintainability:

```json
{
  "variables": [
    { "old": "spacing/4", "new": "space/100" },
    { "old": "spacing/8", "new": "space/200" },
    { "old": "spacing/12", "new": "space/300" },
    { "old": "spacing/16", "new": "space/400" }
  ]
}
```

### 3. Use Arrays for Consolidation

When multiple old values should map to one new value:

```json
{
  "variables": [
    {
      "old": ["legacy/red", "old/error", "#FF0000"],
      "new": "semantic/error"
    }
  ]
}
```

### 4. Test Incrementally

Start with a small mapping and expand:

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" }
  ]
}
```

Then add more mappings as you verify each works correctly.

---

## Next Steps

- [Style Types](styles.md) - Learn about style replacement
- [Examples](examples.md) - See complete examples
- [JSON Schema](json-schema.md) - Full schema reference
