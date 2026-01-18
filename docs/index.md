# VarSwap Plugin Documentation

VarSwap is a Figma plugin that allows you to swap variables and styles across selected nodes according to custom mapping rules. It's designed for design system migrations, theme switching, and bulk updates of design tokens.

## Table of Contents

1. [Installation](installation.md)
2. [JSON Schema & Format](json-schema.md)
3. [Variable Types](variables.md)
4. [Style Types](styles.md)
5. [Examples](examples.md)

---

## Overview

### What VarSwap Does

VarSwap processes selected Figma nodes and their children, replacing:

- **Variables** - Color variables, spacing variables, dimension variables, corner radius variables, and more
- **Styles** - Paint styles (fill/stroke), text styles, effect styles, and grid styles

The plugin uses a JSON-based mapping configuration that defines what should be replaced with what.

### Key Features

- **Variable Replacement** - Replace any bound variable with another variable by name
- **Color Matching** - Match hardcoded colors by hex or RGB values and replace with variables
- **Style Replacement** - Replace applied styles with different styles
- **Recursive Processing** - Automatically processes all child nodes
- **Library Support** - Works with both local and team library variables
- **Backwards Compatible** - Supports both legacy and new mapping formats

### Use Cases

1. **Design System Migration** - Migrate from one token system to another
2. **Theme Switching** - Switch between light/dark themes or brand themes
3. **Token Refactoring** - Rename or reorganize variable structures
4. **Bulk Updates** - Update multiple instances of variables/styles at once

---

## Quick Start

1. Select the nodes you want to process in Figma
2. Run the VarSwap plugin
3. Paste your JSON mapping configuration
4. Click "Run" to apply the changes

### Minimal Example

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" }
  ]
}
```

This replaces all instances of the variable `colors/primary` with `brand/primary` in the selected nodes.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VarSwap Plugin                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   main.ts    │───▶│ swapEngine   │───▶│nodeProcessor │  │
│  │  (UI Bridge) │    │  (Parsing)   │    │ (Traversal)  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                 │            │
│                      ┌──────────────────────────┼──────┐    │
│                      │                          │      │    │
│                      ▼                          ▼      ▼    │
│              ┌──────────────┐          ┌─────────────────┐  │
│              │matchingEngine│          │variableProcessor│  │
│              │   (Colors)   │          │   (Scalars)     │  │
│              └──────────────┘          └─────────────────┘  │
│                      │                          │           │
│                      ▼                          ▼           │
│              ┌──────────────┐          ┌─────────────────┐  │
│              │variableLookup│          │ styleProcessor  │  │
│              │(Find by Name)│          │   (Styles)      │  │
│              └──────────────┘          └─────────────────┘  │
│                                                 │           │
│                                                 ▼           │
│                                        ┌─────────────────┐  │
│                                        │  styleLookup    │  │
│                                        │(Find by Name)   │  │
│                                        └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Supported Node Types

VarSwap processes any node that supports the relevant properties:

| Node Type | Fills | Strokes | Effects | Text Style | Grid | Scalar Variables |
|-----------|-------|---------|---------|------------|------|------------------|
| Frame     | Yes   | Yes     | Yes     | -          | Yes  | Yes              |
| Rectangle | Yes   | Yes     | Yes     | -          | -    | Yes              |
| Ellipse   | Yes   | Yes     | Yes     | -          | -    | Yes              |
| Polygon   | Yes   | Yes     | Yes     | -          | -    | Yes              |
| Star      | Yes   | Yes     | Yes     | -          | -    | Yes              |
| Vector    | Yes   | Yes     | Yes     | -          | -    | Yes              |
| Text      | Yes   | Yes     | Yes     | Yes        | -    | Yes              |
| Component | Yes   | Yes     | Yes     | -          | Yes  | Yes              |
| Instance  | Yes   | Yes     | Yes     | -          | Yes  | Yes              |
| Group     | -     | -       | Yes     | -          | -    | -                |

---

## Processing Order

When processing a node, VarSwap applies changes in this order:

1. **Fill Colors** - Process fill variable bindings and hardcoded colors
2. **Stroke Colors** - Process stroke variable bindings and hardcoded colors
3. **Scalar Variables** - Process spacing, dimensions, corner radius, etc.
4. **Styles** - Process fill styles, stroke styles, text styles, effect styles, grid styles
5. **Children** - Recursively process all child nodes

---

## Next Steps

- [Installation Guide](installation.md) - How to install and set up the plugin
- [JSON Schema](json-schema.md) - Complete mapping format specification
- [Variable Types](variables.md) - All supported variable types
- [Style Types](styles.md) - All supported style types
- [Examples](examples.md) - Real-world usage examples
