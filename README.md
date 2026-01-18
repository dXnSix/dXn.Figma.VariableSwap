# VarSwap

A Figma plugin for swapping variables and styles across your designs using custom mapping rules. Built for design system migrations, theme switching, and bulk updates of design tokens.

## Features

- **Variable Replacement** - Swap bound variables by name or match hardcoded colors to variables
- **Style Replacement** - Replace paint, text, effect, and grid styles
- **Flexible Scope** - Process selection, current page, or entire document
- **Batch Mapping** - Map multiple old values to a single new value
- **Color Matching** - Match hardcoded hex/RGB colors to variable bindings
- **Persistent Settings** - Auto-saves drafts and remembers your preferences
- **Library Support** - Works with both local and team library variables

## Requirements

- Node.js 18+
- pnpm (see below)

### Why pnpm?

This project **requires pnpm** instead of npm or yarn.

The plugin uses `esbuild`, which includes platform-specific native binaries. This project is developed across multiple environments (Windows x64, Windows ARM64, and WSL2/Linux), and pnpm's `supportedArchitectures` feature ensures the correct binaries are installed for all platforms simultaneously.

Using npm would install binaries for only one platform, causing build failures when switching between Windows and WSL.

```bash
npm install -g pnpm
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd variable-swap
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. If prompted about build scripts, approve esbuild:
   ```bash
   pnpm approve-builds
   pnpm install
   ```

4. Build the plugin:
   ```bash
   pnpm run build
   ```

5. In Figma, go to **Plugins > Development > Import plugin from manifest...**

6. Select `dist/manifest.json`

## Usage

### 1. Select Nodes

Select the nodes you want to process in Figma. VarSwap will process all selected nodes and their children recursively.

### 2. Open the Plugin

Run VarSwap from **Plugins > Development > VarSwap** or assign a keyboard shortcut.

### 3. Choose Scope

Select the processing scope:
- **Selection** - Only selected nodes (default)
- **Page** - All nodes on the current page
- **Document** - All nodes across all pages

### 4. Enter Mapping

Paste your JSON mapping configuration:

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/main" },
    { "old": ["colors/accent", "colors/highlight"], "new": "brand/accent" }
  ],
  "styles": [
    { "old": "Brand/Primary", "new": "Theme/Primary", "type": "paint" },
    { "old": "Heading/Large", "new": "Typography/H1", "type": "text" }
  ]
}
```

### 5. Run

Click **Run** to apply the changes. The plugin displays the number of changes made.

## Mapping Format

### Variables

Replace variables by name:

```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" }
  ]
}
```

Map multiple sources to one target:

```json
{
  "variables": [
    { "old": ["colors/blue-500", "colors/accent"], "new": "brand/primary" }
  ]
}
```

Match hardcoded colors to variables:

```json
{
  "variables": [
    { "old": "#FF5500", "new": "brand/orange" },
    { "old": "rgb(255, 85, 0)", "new": "brand/orange" }
  ]
}
```

### Styles

Replace styles by name and type:

```json
{
  "styles": [
    { "old": "Fill/Primary", "new": "Brand/Primary", "type": "paint" },
    { "old": "Body/Regular", "new": "Text/Body", "type": "text" },
    { "old": "Shadow/Medium", "new": "Elevation/2", "type": "effect" },
    { "old": "Grid/12-col", "new": "Layout/Desktop", "type": "grid" }
  ]
}
```

### Legacy Format

For backwards compatibility, a simple array format is also supported (variables only):

```json
[
  { "old": "colors/primary", "new": "brand/primary" }
]
```

## Supported Properties

### Color Variables

Applied to fills and strokes on shapes, frames, and text.

### Scalar Variables

| Category | Properties |
|----------|------------|
| Spacing | `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `itemSpacing`, `counterAxisSpacing` |
| Dimensions | `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` |
| Corner Radius | `cornerRadius`, `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius` |
| Stroke | `strokeWeight`, `strokeTopWeight`, `strokeRightWeight`, `strokeBottomWeight`, `strokeLeftWeight` |
| Other | `opacity`, `visible`, `characters` |

### Styles

| Type | Description |
|------|-------------|
| `paint` | Fill and stroke styles |
| `text` | Text styles |
| `effect` | Shadow and blur styles |
| `grid` | Layout grid styles |

## Examples

### Design System Migration

```json
{
  "variables": [
    { "old": "old-system/colors/primary", "new": "new-system/brand/primary" },
    { "old": "old-system/colors/secondary", "new": "new-system/brand/secondary" },
    { "old": "old-system/spacing/sm", "new": "new-system/space/100" },
    { "old": "old-system/spacing/md", "new": "new-system/space/200" }
  ],
  "styles": [
    { "old": "Old/Heading 1", "new": "Typography/Display", "type": "text" },
    { "old": "Old/Body", "new": "Typography/Body", "type": "text" }
  ]
}
```

### Theme Switching

```json
{
  "variables": [
    { "old": "light/background", "new": "dark/background" },
    { "old": "light/text-primary", "new": "dark/text-primary" },
    { "old": "light/text-secondary", "new": "dark/text-secondary" },
    { "old": "light/border", "new": "dark/border" }
  ]
}
```

### Hardcoded Color Cleanup

```json
{
  "variables": [
    { "old": "#1A73E8", "new": "brand/primary" },
    { "old": "#EA4335", "new": "semantic/error" },
    { "old": "#34A853", "new": "semantic/success" },
    { "old": "rgb(251, 188, 4)", "new": "semantic/warning" }
  ]
}
```

### Multi-Brand Support

```json
{
  "variables": [
    { "old": "brand-a/primary", "new": "brand-b/primary" },
    { "old": "brand-a/secondary", "new": "brand-b/secondary" },
    { "old": "brand-a/accent", "new": "brand-b/accent" }
  ],
  "styles": [
    { "old": "Brand A/Logo", "new": "Brand B/Logo", "type": "paint" }
  ]
}
```

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm run build` | Build the plugin |
| `pnpm run watch` | Build and watch for changes |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with auto-fix |
| `pnpm run clean` | Remove the dist folder |

### Project Structure

```
variable-swap/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── swapEngine.ts           # Mapping parser & orchestration
│   ├── nodeProcessor.ts        # Node traversal
│   ├── helpers/
│   │   ├── types.ts            # TypeScript types
│   │   ├── constants.ts        # Configuration
│   │   ├── storage.ts          # Persistence
│   │   └── colorUtils.ts       # Color utilities
│   ├── variables/
│   │   ├── variableProcessor.ts
│   │   ├── variableLookup.ts
│   │   └── matchingEngine.ts
│   └── styles/
│       ├── styleProcessor.ts
│       └── styleLookup.ts
├── ui.html                     # Plugin UI
├── manifest.json               # Figma plugin manifest
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── docs/                       # Documentation
    ├── index.md
    ├── json-schema.md
    ├── variables.md
    ├── styles.md
    ├── examples.md
    └── installation.md
```

## Troubleshooting

### Variable Not Found

```
Variable "brand/primary" not found
```

Ensure the target variable exists in your document or is available from a linked library.

### Style Not Found

```
Paint style "Theme/Primary" not found
```

Ensure the style exists as a local style. Library styles must be published to the document first.

### No Changes Made

- Verify nodes are selected (if using Selection scope)
- Check that variable/style names match exactly (case-sensitive)
- Open the developer console for detailed logs

### Build Errors on Windows/WSL

If you see esbuild platform errors, delete `node_modules` and reinstall:

```bash
rm -rf node_modules
pnpm install
```

## Documentation

See the [docs](./docs/) folder for detailed documentation:

- [Installation & Usage](./docs/installation.md)
- [JSON Schema](./docs/json-schema.md)
- [Variable Types](./docs/variables.md)
- [Style Types](./docs/styles.md)
- [Examples](./docs/examples.md)

## License

See [LICENSE](./LICENSE) for details.
