# JSON Schema & Format

VarSwap uses a JSON-based configuration to define mapping rules. This document describes the complete schema specification.

---

## Format Options

VarSwap supports two JSON formats:

1. **Full Format** (Recommended) - Supports both variables and styles
2. **Legacy Format** - Variables-only, backwards compatible

---

## Full Format Schema

The full format uses an object with `variables` and `styles` arrays:

```json
{
  "variables": [
    { "old": "string | string[]", "new": "string" }
  ],
  "styles": [
    { "old": "string", "new": "string", "type": "paint | text | effect | grid" }
  ]
}
```

### Complete JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "VarSwap Mapping Configuration",
  "description": "Configuration for variable and style replacement in Figma",
  "type": "object",
  "properties": {
    "variables": {
      "type": "array",
      "description": "Array of variable mappings",
      "items": {
        "type": "object",
        "properties": {
          "old": {
            "oneOf": [
              { "type": "string" },
              { "type": "array", "items": { "type": "string" } }
            ],
            "description": "Source variable name(s) or color value(s) to match"
          },
          "new": {
            "type": "string",
            "description": "Target variable name to replace with"
          }
        },
        "required": ["old", "new"]
      }
    },
    "styles": {
      "type": "array",
      "description": "Array of style mappings",
      "items": {
        "type": "object",
        "properties": {
          "old": {
            "type": "string",
            "description": "Source style name to match"
          },
          "new": {
            "type": "string",
            "description": "Target style name to replace with"
          },
          "type": {
            "type": "string",
            "enum": ["paint", "text", "effect", "grid"],
            "description": "Type of style"
          }
        },
        "required": ["old", "new", "type"]
      }
    }
  }
}
```

---

## Variable Mapping

### Basic Variable Mapping

Map one variable name to another:

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" }
  ]
}
```

### Multiple Sources to One Target

Map multiple old values to the same new variable using an array:

```json
{
  "variables": [
    {
      "old": ["colors/red", "colors/error", "semantic/danger"],
      "new": "feedback/error"
    }
  ]
}
```

### Matching Hardcoded Colors

Match colors by hex or RGB value:

```json
{
  "variables": [
    { "old": "#FF0000", "new": "colors/red" },
    { "old": "rgb(0, 128, 255)", "new": "colors/blue" },
    { "old": "rgba(0, 0, 0, 0.5)", "new": "colors/overlay" }
  ]
}
```

### Combined Variable and Color Matching

Match both variable names and color values:

```json
{
  "variables": [
    {
      "old": ["colors/legacy-red", "#FF0000", "rgb(255, 0, 0)"],
      "new": "semantic/error"
    }
  ]
}
```

---

## Style Mapping

### Style Types

| Type | Description | Applies To |
|------|-------------|------------|
| `paint` | Paint styles | Fills and strokes |
| `text` | Text styles | Text nodes |
| `effect` | Effect styles | Shadows, blurs |
| `grid` | Grid styles | Layout grids |

### Paint Style Mapping

```json
{
  "styles": [
    { "old": "Brand/Primary", "new": "Theme/Primary", "type": "paint" },
    { "old": "Brand/Secondary", "new": "Theme/Secondary", "type": "paint" }
  ]
}
```

### Text Style Mapping

```json
{
  "styles": [
    { "old": "Heading/H1", "new": "Typography/Display Large", "type": "text" },
    { "old": "Body/Regular", "new": "Typography/Body", "type": "text" }
  ]
}
```

### Effect Style Mapping

```json
{
  "styles": [
    { "old": "Shadow/Small", "new": "Elevation/100", "type": "effect" },
    { "old": "Shadow/Medium", "new": "Elevation/200", "type": "effect" }
  ]
}
```

### Grid Style Mapping

```json
{
  "styles": [
    { "old": "Layout/12 Column", "new": "Grid/Desktop", "type": "grid" }
  ]
}
```

---

## Legacy Format

The legacy format is a simple array of variable mappings (no styles support):

```json
[
  { "old": "colors/primary", "new": "brand/primary" },
  { "old": "colors/secondary", "new": "brand/secondary" }
]
```

This format is automatically detected and converted internally to:

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" },
    { "old": "colors/secondary", "new": "brand/secondary" }
  ],
  "styles": []
}
```

---

## Field Reference

### Variable Mapping Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `old` | `string \| string[]` | Yes | Source to match. Can be: variable name, hex color (`#RRGGBB`), or RGB color (`rgb(r,g,b)`) |
| `new` | `string` | Yes | Target variable name to apply |

### Style Mapping Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `old` | `string` | Yes | Source style name to match |
| `new` | `string` | Yes | Target style name to apply |
| `type` | `string` | Yes | Style type: `paint`, `text`, `effect`, or `grid` |

---

## Matching Rules

### Variable Name Matching

- Exact match required (case-sensitive)
- Must match the full variable path including collection groups
- Example: `Collection/Group/VariableName`

### Color Value Matching

Supported color formats:

| Format | Example | Notes |
|--------|---------|-------|
| Hex (6-digit) | `#FF5500` | Case-insensitive |
| Hex (3-digit) | `#F50` | Expanded to 6-digit |
| RGB | `rgb(255, 85, 0)` | Spaces optional |
| RGBA | `rgba(255, 85, 0, 1)` | Alpha is ignored for matching |

Color matching uses a tolerance of 0.001 to handle floating-point precision.

### Style Name Matching

- Exact match required (case-sensitive)
- Must match the full style path including groups
- Example: `Group/Subgroup/StyleName`

---

## Complete Example

A comprehensive mapping configuration:

```json
{
  "variables": [
    {
      "old": ["OldDesignSystem/colors/primary", "#0066FF"],
      "new": "NewDesignSystem/brand/primary"
    },
    {
      "old": "OldDesignSystem/colors/secondary",
      "new": "NewDesignSystem/brand/secondary"
    },
    {
      "old": "OldDesignSystem/spacing/sm",
      "new": "NewDesignSystem/space/100"
    },
    {
      "old": "OldDesignSystem/spacing/md",
      "new": "NewDesignSystem/space/200"
    },
    {
      "old": "OldDesignSystem/spacing/lg",
      "new": "NewDesignSystem/space/300"
    },
    {
      "old": "OldDesignSystem/radius/sm",
      "new": "NewDesignSystem/radii/small"
    },
    {
      "old": "OldDesignSystem/radius/md",
      "new": "NewDesignSystem/radii/medium"
    }
  ],
  "styles": [
    {
      "old": "OldStyles/Brand/Primary",
      "new": "NewStyles/Theme/Primary",
      "type": "paint"
    },
    {
      "old": "OldStyles/Heading/H1",
      "new": "NewStyles/Typography/Display",
      "type": "text"
    },
    {
      "old": "OldStyles/Heading/H2",
      "new": "NewStyles/Typography/Headline",
      "type": "text"
    },
    {
      "old": "OldStyles/Shadow/Card",
      "new": "NewStyles/Elevation/200",
      "type": "effect"
    }
  ]
}
```

---

## Validation Tips

### Common Errors

1. **Missing quotes around keys/values**
   ```json
   // Wrong
   { old: "value", new: "value" }

   // Correct
   { "old": "value", "new": "value" }
   ```

2. **Trailing commas**
   ```json
   // Wrong
   { "variables": [ { "old": "a", "new": "b" }, ] }

   // Correct
   { "variables": [ { "old": "a", "new": "b" } ] }
   ```

3. **Missing type in style mapping**
   ```json
   // Wrong
   { "old": "Style/Name", "new": "New/Style" }

   // Correct
   { "old": "Style/Name", "new": "New/Style", "type": "paint" }
   ```

### Validation Tools

- [JSONLint](https://jsonlint.com/) - Online JSON validator
- VS Code with JSON extension - Real-time validation
- `JSON.parse()` in browser console - Quick syntax check

---

## Next Steps

- [Variable Types](variables.md) - Detailed variable type reference
- [Style Types](styles.md) - Detailed style type reference
- [Examples](examples.md) - Real-world examples
