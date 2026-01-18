# Style Types Reference

VarSwap supports all Figma style types: paint styles, text styles, effect styles, and grid styles. This document details how each style type is processed.

---

## Style Types Overview

| Style Type | Description | Node Properties | Applicable Nodes |
|------------|-------------|-----------------|------------------|
| `paint` | Fill and stroke colors | `fillStyleId`, `strokeStyleId` | Most visual nodes |
| `text` | Typography settings | `textStyleId` | Text nodes only |
| `effect` | Shadows and blurs | `effectStyleId` | Most visual nodes |
| `grid` | Layout grids | `gridStyleId` | Frames only |

---

## Paint Styles

Paint styles define color fills and strokes. VarSwap can replace both fill and stroke paint styles.

### Fill Styles

Applied to node fills (backgrounds).

```json
{
  "styles": [
    { "old": "Brand/Primary", "new": "Theme/Primary", "type": "paint" },
    { "old": "Brand/Secondary", "new": "Theme/Secondary", "type": "paint" },
    { "old": "Neutral/Background", "new": "Surface/Default", "type": "paint" }
  ]
}
```

**Applicable to:**
- Rectangles, Ellipses, Polygons, Stars
- Frames, Components, Instances
- Text (text background)
- Vectors

### Stroke Styles

Applied to node strokes (borders).

```json
{
  "styles": [
    { "old": "Border/Default", "new": "Stroke/Primary", "type": "paint" },
    { "old": "Border/Subtle", "new": "Stroke/Secondary", "type": "paint" }
  ]
}
```

**Note:** The same `"type": "paint"` is used for both fills and strokes. VarSwap checks both properties on each node.

### Paint Style Properties

When a paint style is applied, it controls:
- Color value
- Opacity
- Blend mode
- For gradients: gradient stops, positions, and angles

---

## Text Styles

Text styles define typography settings for text nodes.

```json
{
  "styles": [
    { "old": "Heading/H1", "new": "Typography/Display Large", "type": "text" },
    { "old": "Heading/H2", "new": "Typography/Display Medium", "type": "text" },
    { "old": "Heading/H3", "new": "Typography/Display Small", "type": "text" },
    { "old": "Body/Regular", "new": "Typography/Body Default", "type": "text" },
    { "old": "Body/Small", "new": "Typography/Body Small", "type": "text" },
    { "old": "Label/Default", "new": "Typography/Label", "type": "text" }
  ]
}
```

**Applicable to:**
- Text nodes only

### Text Style Properties

When a text style is applied, it controls:
- Font family
- Font weight
- Font size
- Line height
- Letter spacing
- Paragraph spacing
- Text case
- Text decoration

### Mixed Text Styles

If a text node has mixed styles (different styles on different characters), VarSwap only processes nodes where a single style is applied to the entire text.

---

## Effect Styles

Effect styles define shadows, blurs, and other effects.

```json
{
  "styles": [
    { "old": "Shadow/Small", "new": "Elevation/100", "type": "effect" },
    { "old": "Shadow/Medium", "new": "Elevation/200", "type": "effect" },
    { "old": "Shadow/Large", "new": "Elevation/300", "type": "effect" },
    { "old": "Blur/Background", "new": "Effects/Blur", "type": "effect" }
  ]
}
```

**Applicable to:**
- Rectangles, Ellipses, Polygons, Stars
- Frames, Components, Instances
- Text
- Groups
- Vectors

### Effect Style Properties

When an effect style is applied, it can include:
- Drop shadows (multiple)
- Inner shadows (multiple)
- Layer blur
- Background blur

---

## Grid Styles

Grid styles define layout grids for frames.

```json
{
  "styles": [
    { "old": "Layout/Desktop 12-Column", "new": "Grid/Desktop", "type": "grid" },
    { "old": "Layout/Tablet 8-Column", "new": "Grid/Tablet", "type": "grid" },
    { "old": "Layout/Mobile 4-Column", "new": "Grid/Mobile", "type": "grid" }
  ]
}
```

**Applicable to:**
- Frames only
- Components (frame-based)

### Grid Style Properties

When a grid style is applied, it can include:
- Column grids
- Row grids
- Grid (uniform)
- Multiple grids combined

---

## Style Resolution

### Local Styles

VarSwap first searches for styles defined in the current document.

```typescript
// Internal lookup order
1. figma.getLocalPaintStylesAsync()
2. figma.getLocalTextStylesAsync()
3. figma.getLocalEffectStylesAsync()
4. figma.getLocalGridStylesAsync()
```

### Library Styles

Currently, VarSwap only supports **local styles** for replacement targets. The style you're replacing **to** must exist in the current document.

**Workaround for library styles:**
1. Use the style from the library in your document first (apply it to any node)
2. This makes the style available locally
3. Then run VarSwap

---

## Style Name Matching

### Exact Match Required

Style names must match exactly, including:
- Group hierarchy
- Style name
- Case sensitivity

**Example structure:**
```
Brand/
├── Primary
├── Secondary
└── Accent/
    ├── Light
    └── Dark
```

**Mapping:**
```json
{
  "styles": [
    { "old": "Brand/Primary", "new": "Theme/Primary", "type": "paint" },
    { "old": "Brand/Accent/Light", "new": "Theme/Accent/Light", "type": "paint" }
  ]
}
```

### Case Sensitivity

Style names are **case-sensitive**:
- `Brand/Primary` ≠ `brand/primary` ≠ `BRAND/PRIMARY`

---

## Style Processing Order

When processing a node, styles are checked in this order:

1. **Fill Style** - If the node has a fill style applied
2. **Stroke Style** - If the node has a stroke style applied
3. **Text Style** - If the node is text with a text style applied
4. **Effect Style** - If the node has an effect style applied
5. **Grid Style** - If the node is a frame with a grid style applied

Each style type is processed independently, so a node can have multiple styles replaced in a single run.

---

## Style vs Variable Priority

Nodes can have both styles AND variables applied. VarSwap processes them independently:

1. **Variables are processed first** - Color variables, spacing variables, etc.
2. **Styles are processed second** - Paint styles, text styles, etc.

If a node has both a paint style AND a color variable:
- Both can be replaced if both are in the mapping
- They don't interfere with each other
- The style "wins" visually since it overrides the fill

---

## Node Type Compatibility

### Paint Styles (Fill & Stroke)

| Node Type | Fill Style | Stroke Style |
|-----------|------------|--------------|
| Rectangle | Yes | Yes |
| Ellipse | Yes | Yes |
| Polygon | Yes | Yes |
| Star | Yes | Yes |
| Line | - | Yes |
| Vector | Yes | Yes |
| Text | Yes | Yes |
| Frame | Yes | Yes |
| Component | Yes | Yes |
| Instance | Yes | Yes |
| Group | - | - |

### Text Styles

| Node Type | Text Style |
|-----------|------------|
| Text | Yes |
| All others | - |

### Effect Styles

| Node Type | Effect Style |
|-----------|--------------|
| Rectangle | Yes |
| Ellipse | Yes |
| Polygon | Yes |
| Star | Yes |
| Line | Yes |
| Vector | Yes |
| Text | Yes |
| Frame | Yes |
| Component | Yes |
| Instance | Yes |
| Group | Yes |

### Grid Styles

| Node Type | Grid Style |
|-----------|------------|
| Frame | Yes |
| Component | Yes |
| All others | - |

---

## Mixed Styles

### Multiple Paint Fills

If a node has multiple fills, VarSwap processes the **fill style** which applies to all fills. Individual fills with different styles are not supported.

### Multiple Effects

Effect styles can contain multiple effects. The entire effect style is replaced as a unit.

---

## Common Use Cases

### Design System Migration

Migrate from one design system's styles to another:

```json
{
  "styles": [
    { "old": "OldDS/Colors/Primary", "new": "NewDS/Brand/Primary", "type": "paint" },
    { "old": "OldDS/Colors/Secondary", "new": "NewDS/Brand/Secondary", "type": "paint" },
    { "old": "OldDS/Typography/H1", "new": "NewDS/Text/Display", "type": "text" },
    { "old": "OldDS/Typography/Body", "new": "NewDS/Text/Body", "type": "text" },
    { "old": "OldDS/Effects/Shadow", "new": "NewDS/Elevation/Medium", "type": "effect" }
  ]
}
```

### Theme Switching

Switch between light and dark themes:

```json
{
  "styles": [
    { "old": "Light/Background", "new": "Dark/Background", "type": "paint" },
    { "old": "Light/Surface", "new": "Dark/Surface", "type": "paint" },
    { "old": "Light/Text/Primary", "new": "Dark/Text/Primary", "type": "paint" },
    { "old": "Light/Text/Secondary", "new": "Dark/Text/Secondary", "type": "paint" }
  ]
}
```

### Brand Refresh

Update brand styles while maintaining structure:

```json
{
  "styles": [
    { "old": "Brand2023/Primary", "new": "Brand2024/Primary", "type": "paint" },
    { "old": "Brand2023/Secondary", "new": "Brand2024/Secondary", "type": "paint" },
    { "old": "Brand2023/Accent", "new": "Brand2024/Accent", "type": "paint" }
  ]
}
```

---

## Error Handling

### Style Not Found

If a target style doesn't exist:
```
Paint style "Theme/Primary" not found
```

**Solutions:**
1. Verify the style name is correct (exact match, case-sensitive)
2. Ensure the style exists in the document
3. For library styles, apply the style to any node first to make it available

### Style Type Mismatch

The `type` field must match the actual style type. Using the wrong type will result in the style not being found.

```json
// Wrong - using "text" for a paint style
{ "old": "Brand/Primary", "new": "Theme/Primary", "type": "text" }

// Correct
{ "old": "Brand/Primary", "new": "Theme/Primary", "type": "paint" }
```

---

## Best Practices

### 1. Verify Style Names

Before running, verify style names in Figma:
1. Open the Styles panel
2. Check the exact path and name
3. Use the same casing in your mapping

### 2. Test with a Single Style

Start with one style mapping to verify it works:

```json
{
  "styles": [
    { "old": "Test/Style", "new": "New/Style", "type": "paint" }
  ]
}
```

### 3. Organize by Type

Group mappings by style type for readability:

```json
{
  "styles": [
    { "old": "Paint/A", "new": "New/A", "type": "paint" },
    { "old": "Paint/B", "new": "New/B", "type": "paint" },

    { "old": "Text/A", "new": "New/Text/A", "type": "text" },
    { "old": "Text/B", "new": "New/Text/B", "type": "text" },

    { "old": "Effect/A", "new": "New/Effect/A", "type": "effect" }
  ]
}
```

### 4. Document Your Mappings

Keep a record of your mappings for future reference and team sharing.

---

## Next Steps

- [Examples](examples.md) - Complete real-world examples
- [Variables](variables.md) - Variable type reference
- [JSON Schema](json-schema.md) - Full schema specification
