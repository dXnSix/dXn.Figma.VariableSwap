# Examples

This page contains complete, real-world examples of VarSwap configurations for common use cases.

---

## Example 1: Simple Color Variable Migration

Migrate from a flat color structure to a semantic naming convention.

### Before
```
Variables:
├── red
├── green
├── blue
├── gray-100
├── gray-500
└── gray-900
```

### After
```
Variables:
├── semantic/
│   ├── error
│   ├── success
│   └── info
└── neutral/
    ├── background
    ├── border
    └── text
```

### Mapping Configuration

```json
{
  "variables": [
    { "old": "red", "new": "semantic/error" },
    { "old": "green", "new": "semantic/success" },
    { "old": "blue", "new": "semantic/info" },
    { "old": "gray-100", "new": "neutral/background" },
    { "old": "gray-500", "new": "neutral/border" },
    { "old": "gray-900", "new": "neutral/text" }
  ]
}
```

---

## Example 2: Design System Migration

Complete migration from "DesignSystem v1" to "DesignSystem v2".

### Mapping Configuration

```json
{
  "variables": [
    {
      "old": ["DSv1/colors/primary", "#0066FF"],
      "new": "DSv2/brand/primary"
    },
    {
      "old": ["DSv1/colors/primary-dark", "#0052CC"],
      "new": "DSv2/brand/primary-hover"
    },
    {
      "old": "DSv1/colors/secondary",
      "new": "DSv2/brand/secondary"
    },
    {
      "old": "DSv1/colors/background",
      "new": "DSv2/surface/default"
    },
    {
      "old": "DSv1/colors/surface",
      "new": "DSv2/surface/elevated"
    },
    {
      "old": "DSv1/colors/border",
      "new": "DSv2/border/default"
    },
    {
      "old": "DSv1/colors/text-primary",
      "new": "DSv2/content/primary"
    },
    {
      "old": "DSv1/colors/text-secondary",
      "new": "DSv2/content/secondary"
    },
    {
      "old": "DSv1/colors/text-disabled",
      "new": "DSv2/content/disabled"
    },
    {
      "old": "DSv1/spacing/xs",
      "new": "DSv2/space/50"
    },
    {
      "old": "DSv1/spacing/sm",
      "new": "DSv2/space/100"
    },
    {
      "old": "DSv1/spacing/md",
      "new": "DSv2/space/200"
    },
    {
      "old": "DSv1/spacing/lg",
      "new": "DSv2/space/300"
    },
    {
      "old": "DSv1/spacing/xl",
      "new": "DSv2/space/400"
    },
    {
      "old": "DSv1/spacing/2xl",
      "new": "DSv2/space/500"
    },
    {
      "old": "DSv1/radius/sm",
      "new": "DSv2/radii/small"
    },
    {
      "old": "DSv1/radius/md",
      "new": "DSv2/radii/medium"
    },
    {
      "old": "DSv1/radius/lg",
      "new": "DSv2/radii/large"
    },
    {
      "old": "DSv1/radius/full",
      "new": "DSv2/radii/full"
    }
  ],
  "styles": [
    {
      "old": "DSv1/Heading/Display",
      "new": "DSv2/Typography/Display",
      "type": "text"
    },
    {
      "old": "DSv1/Heading/H1",
      "new": "DSv2/Typography/Heading/Large",
      "type": "text"
    },
    {
      "old": "DSv1/Heading/H2",
      "new": "DSv2/Typography/Heading/Medium",
      "type": "text"
    },
    {
      "old": "DSv1/Heading/H3",
      "new": "DSv2/Typography/Heading/Small",
      "type": "text"
    },
    {
      "old": "DSv1/Body/Large",
      "new": "DSv2/Typography/Body/Large",
      "type": "text"
    },
    {
      "old": "DSv1/Body/Default",
      "new": "DSv2/Typography/Body/Default",
      "type": "text"
    },
    {
      "old": "DSv1/Body/Small",
      "new": "DSv2/Typography/Body/Small",
      "type": "text"
    },
    {
      "old": "DSv1/Shadow/Small",
      "new": "DSv2/Elevation/100",
      "type": "effect"
    },
    {
      "old": "DSv1/Shadow/Medium",
      "new": "DSv2/Elevation/200",
      "type": "effect"
    },
    {
      "old": "DSv1/Shadow/Large",
      "new": "DSv2/Elevation/300",
      "type": "effect"
    }
  ]
}
```

---

## Example 3: Theme Switching (Light to Dark)

Switch a design from light theme to dark theme.

### Mapping Configuration

```json
{
  "variables": [
    {
      "old": "theme/light/background",
      "new": "theme/dark/background"
    },
    {
      "old": "theme/light/surface",
      "new": "theme/dark/surface"
    },
    {
      "old": "theme/light/surface-elevated",
      "new": "theme/dark/surface-elevated"
    },
    {
      "old": "theme/light/border",
      "new": "theme/dark/border"
    },
    {
      "old": "theme/light/border-subtle",
      "new": "theme/dark/border-subtle"
    },
    {
      "old": "theme/light/text-primary",
      "new": "theme/dark/text-primary"
    },
    {
      "old": "theme/light/text-secondary",
      "new": "theme/dark/text-secondary"
    },
    {
      "old": "theme/light/text-tertiary",
      "new": "theme/dark/text-tertiary"
    },
    {
      "old": "theme/light/text-on-color",
      "new": "theme/dark/text-on-color"
    },
    {
      "old": "theme/light/icon-primary",
      "new": "theme/dark/icon-primary"
    },
    {
      "old": "theme/light/icon-secondary",
      "new": "theme/dark/icon-secondary"
    }
  ],
  "styles": [
    {
      "old": "Theme/Light/Surface",
      "new": "Theme/Dark/Surface",
      "type": "paint"
    },
    {
      "old": "Theme/Light/Card",
      "new": "Theme/Dark/Card",
      "type": "paint"
    },
    {
      "old": "Theme/Light/Shadow",
      "new": "Theme/Dark/Shadow",
      "type": "effect"
    }
  ]
}
```

---

## Example 4: Brand Refresh

Update brand colors while keeping the structure.

### Mapping Configuration

```json
{
  "variables": [
    {
      "old": ["brand-2023/primary", "#FF6B00"],
      "new": "brand-2024/primary"
    },
    {
      "old": ["brand-2023/primary-light", "#FF8533"],
      "new": "brand-2024/primary-light"
    },
    {
      "old": ["brand-2023/primary-dark", "#CC5500"],
      "new": "brand-2024/primary-dark"
    },
    {
      "old": ["brand-2023/secondary", "#1A1A2E"],
      "new": "brand-2024/secondary"
    },
    {
      "old": ["brand-2023/accent", "#00D9FF"],
      "new": "brand-2024/accent"
    }
  ],
  "styles": [
    {
      "old": "Brand 2023/Primary",
      "new": "Brand 2024/Primary",
      "type": "paint"
    },
    {
      "old": "Brand 2023/Secondary",
      "new": "Brand 2024/Secondary",
      "type": "paint"
    },
    {
      "old": "Brand 2023/Gradient",
      "new": "Brand 2024/Gradient",
      "type": "paint"
    }
  ]
}
```

---

## Example 5: Spacing Scale Migration

Migrate from pixel-based spacing to a token scale.

### Before
```
spacing/4px
spacing/8px
spacing/12px
spacing/16px
spacing/24px
spacing/32px
spacing/48px
spacing/64px
```

### After
```
space/50   (4px)
space/100  (8px)
space/150  (12px)
space/200  (16px)
space/300  (24px)
space/400  (32px)
space/600  (48px)
space/800  (64px)
```

### Mapping Configuration

```json
{
  "variables": [
    { "old": "spacing/4px", "new": "space/50" },
    { "old": "spacing/8px", "new": "space/100" },
    { "old": "spacing/12px", "new": "space/150" },
    { "old": "spacing/16px", "new": "space/200" },
    { "old": "spacing/24px", "new": "space/300" },
    { "old": "spacing/32px", "new": "space/400" },
    { "old": "spacing/48px", "new": "space/600" },
    { "old": "spacing/64px", "new": "space/800" }
  ]
}
```

---

## Example 6: Typography System Overhaul

Replace an entire typography system.

### Mapping Configuration

```json
{
  "styles": [
    {
      "old": "Type/Display/XL",
      "new": "Typography/Display/Extra Large",
      "type": "text"
    },
    {
      "old": "Type/Display/L",
      "new": "Typography/Display/Large",
      "type": "text"
    },
    {
      "old": "Type/Display/M",
      "new": "Typography/Display/Medium",
      "type": "text"
    },
    {
      "old": "Type/Display/S",
      "new": "Typography/Display/Small",
      "type": "text"
    },
    {
      "old": "Type/Heading/L",
      "new": "Typography/Heading/Large",
      "type": "text"
    },
    {
      "old": "Type/Heading/M",
      "new": "Typography/Heading/Medium",
      "type": "text"
    },
    {
      "old": "Type/Heading/S",
      "new": "Typography/Heading/Small",
      "type": "text"
    },
    {
      "old": "Type/Body/L",
      "new": "Typography/Body/Large",
      "type": "text"
    },
    {
      "old": "Type/Body/M",
      "new": "Typography/Body/Medium",
      "type": "text"
    },
    {
      "old": "Type/Body/S",
      "new": "Typography/Body/Small",
      "type": "text"
    },
    {
      "old": "Type/Label/L",
      "new": "Typography/Label/Large",
      "type": "text"
    },
    {
      "old": "Type/Label/M",
      "new": "Typography/Label/Medium",
      "type": "text"
    },
    {
      "old": "Type/Label/S",
      "new": "Typography/Label/Small",
      "type": "text"
    },
    {
      "old": "Type/Code/Block",
      "new": "Typography/Code/Block",
      "type": "text"
    },
    {
      "old": "Type/Code/Inline",
      "new": "Typography/Code/Inline",
      "type": "text"
    }
  ]
}
```

---

## Example 7: Hardcoded Color Cleanup

Convert hardcoded colors to variables.

### Mapping Configuration

```json
{
  "variables": [
    {
      "old": "#FFFFFF",
      "new": "colors/white"
    },
    {
      "old": "#000000",
      "new": "colors/black"
    },
    {
      "old": ["#F5F5F5", "#F4F4F4", "#F6F6F6"],
      "new": "colors/gray-100"
    },
    {
      "old": ["#E0E0E0", "#DFDFDF", "#E1E1E1"],
      "new": "colors/gray-300"
    },
    {
      "old": ["#9E9E9E", "#9D9D9D", "#9F9F9F"],
      "new": "colors/gray-500"
    },
    {
      "old": ["#616161", "#606060", "#626262"],
      "new": "colors/gray-700"
    },
    {
      "old": ["#212121", "#202020", "#222222"],
      "new": "colors/gray-900"
    },
    {
      "old": ["#2196F3", "#2196f3", "rgb(33, 150, 243)"],
      "new": "colors/blue-500"
    },
    {
      "old": ["#F44336", "#f44336", "rgb(244, 67, 54)"],
      "new": "colors/red-500"
    },
    {
      "old": ["#4CAF50", "#4caf50", "rgb(76, 175, 80)"],
      "new": "colors/green-500"
    }
  ]
}
```

---

## Example 8: Component-Specific Migration

Migrate tokens for a specific component (e.g., Button).

### Mapping Configuration

```json
{
  "variables": [
    {
      "old": "button/primary/background",
      "new": "components/button/primary/bg"
    },
    {
      "old": "button/primary/background-hover",
      "new": "components/button/primary/bg-hover"
    },
    {
      "old": "button/primary/background-active",
      "new": "components/button/primary/bg-active"
    },
    {
      "old": "button/primary/text",
      "new": "components/button/primary/text"
    },
    {
      "old": "button/primary/border",
      "new": "components/button/primary/border"
    },
    {
      "old": "button/secondary/background",
      "new": "components/button/secondary/bg"
    },
    {
      "old": "button/secondary/background-hover",
      "new": "components/button/secondary/bg-hover"
    },
    {
      "old": "button/secondary/text",
      "new": "components/button/secondary/text"
    },
    {
      "old": "button/secondary/border",
      "new": "components/button/secondary/border"
    },
    {
      "old": "button/ghost/text",
      "new": "components/button/ghost/text"
    },
    {
      "old": "button/ghost/text-hover",
      "new": "components/button/ghost/text-hover"
    },
    {
      "old": "button/padding-x",
      "new": "components/button/padding-horizontal"
    },
    {
      "old": "button/padding-y",
      "new": "components/button/padding-vertical"
    },
    {
      "old": "button/radius",
      "new": "components/button/border-radius"
    },
    {
      "old": "button/gap",
      "new": "components/button/icon-gap"
    }
  ]
}
```

---

## Example 9: Elevation System Migration

Replace a shadow system with an elevation system.

### Mapping Configuration

```json
{
  "variables": [
    {
      "old": "shadow/color",
      "new": "elevation/shadow-color"
    }
  ],
  "styles": [
    {
      "old": "Shadows/None",
      "new": "Elevation/0",
      "type": "effect"
    },
    {
      "old": "Shadows/XS",
      "new": "Elevation/50",
      "type": "effect"
    },
    {
      "old": "Shadows/SM",
      "new": "Elevation/100",
      "type": "effect"
    },
    {
      "old": "Shadows/MD",
      "new": "Elevation/200",
      "type": "effect"
    },
    {
      "old": "Shadows/LG",
      "new": "Elevation/300",
      "type": "effect"
    },
    {
      "old": "Shadows/XL",
      "new": "Elevation/400",
      "type": "effect"
    },
    {
      "old": "Shadows/2XL",
      "new": "Elevation/500",
      "type": "effect"
    }
  ]
}
```

---

## Example 10: Multi-Brand Support

Switch from Brand A to Brand B.

### Mapping Configuration

```json
{
  "variables": [
    { "old": "brand-a/primary", "new": "brand-b/primary" },
    { "old": "brand-a/secondary", "new": "brand-b/secondary" },
    { "old": "brand-a/accent", "new": "brand-b/accent" },
    { "old": "brand-a/background", "new": "brand-b/background" },
    { "old": "brand-a/surface", "new": "brand-b/surface" },
    { "old": "brand-a/text-primary", "new": "brand-b/text-primary" },
    { "old": "brand-a/text-secondary", "new": "brand-b/text-secondary" }
  ],
  "styles": [
    {
      "old": "Brand A/Primary",
      "new": "Brand B/Primary",
      "type": "paint"
    },
    {
      "old": "Brand A/Secondary",
      "new": "Brand B/Secondary",
      "type": "paint"
    },
    {
      "old": "Brand A/Heading",
      "new": "Brand B/Heading",
      "type": "text"
    },
    {
      "old": "Brand A/Body",
      "new": "Brand B/Body",
      "type": "text"
    }
  ]
}
```

---

## Example 11: Legacy Format (Variables Only)

For simple variable-only mappings, you can use the legacy array format.

### Mapping Configuration

```json
[
  { "old": "colors/primary", "new": "brand/primary" },
  { "old": "colors/secondary", "new": "brand/secondary" },
  { "old": "colors/background", "new": "surface/default" },
  { "old": "spacing/sm", "new": "space/100" },
  { "old": "spacing/md", "new": "space/200" },
  { "old": "spacing/lg", "new": "space/300" }
]
```

This is equivalent to:

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" },
    { "old": "colors/secondary", "new": "brand/secondary" },
    { "old": "colors/background", "new": "surface/default" },
    { "old": "spacing/sm", "new": "space/100" },
    { "old": "spacing/md", "new": "space/200" },
    { "old": "spacing/lg", "new": "space/300" }
  ],
  "styles": []
}
```

---

## Tips for Creating Mappings

### 1. Export Your Current Variables/Styles

Before creating a mapping, document your current structure:
- List all variable names
- List all style names
- Note any hardcoded values that should be converted

### 2. Plan Your Target Structure

Design your new naming convention before migrating:
- Group related tokens
- Use consistent naming patterns
- Consider future scalability

### 3. Test Incrementally

Start with a small subset:
```json
{
  "variables": [
    { "old": "test/old", "new": "test/new" }
  ]
}
```

Verify it works, then expand your mapping.

### 4. Use Version Control

Keep your mapping files in version control:
- Track changes over time
- Collaborate with team members
- Roll back if needed

### 5. Document Your Mappings

Add comments in a separate file explaining:
- Why each mapping exists
- When it was created
- Who created it

---

## Troubleshooting Examples

### Nothing Changed

Check that:
1. Nodes are selected
2. Variable/style names match exactly
3. Console shows no errors

### Partial Changes

Some nodes changed, others didn't:
1. Check if unchanged nodes use different variable names
2. Verify hardcoded colors match exactly (use color picker)
3. Check for typos in variable names

### Wrong Variable Applied

Verify your mapping doesn't have duplicates:
```json
{
  "variables": [
    { "old": "colors/red", "new": "semantic/error" },
    { "old": "colors/red", "new": "semantic/danger" }
  ]
}
```
The last matching entry wins.

---

## Next Steps

- [Installation](installation.md) - Set up the plugin
- [JSON Schema](json-schema.md) - Full format reference
- [Variables](variables.md) - Variable type details
- [Styles](styles.md) - Style type details
