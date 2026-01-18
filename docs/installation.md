# Installation & Usage

## Installation

### For Development

1. Clone or download the plugin repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. In Figma, go to **Plugins > Development > Import plugin from manifest...**
5. Select the `dist/manifest.json` file

### For Production

1. Build the plugin:
   ```bash
   npm run build
   ```
2. The `dist/` folder contains all files needed for distribution:
   - `code.js` - Compiled plugin code
   - `ui.html` - Plugin UI
   - `manifest.json` - Plugin manifest

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the plugin for production |
| `npm run watch` | Build and watch for changes |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run clean` | Remove the dist folder |

---

## Usage

### Step 1: Select Nodes

Select one or more nodes in your Figma document. VarSwap will process:
- All selected nodes
- All children of selected nodes (recursively)

### Step 2: Open the Plugin

Run VarSwap from the Plugins menu or use the keyboard shortcut if configured.

### Step 3: Enter Mapping Configuration

Paste your JSON mapping configuration into the text area. The configuration defines which variables and styles should be replaced.

**Example:**
```json
{
  "variables": [
    { "old": "colors/primary", "new": "brand/primary" }
  ],
  "styles": [
    { "old": "Brand/Primary", "new": "Theme/Primary", "type": "paint" }
  ]
}
```

### Step 4: Run the Plugin

Click the "Run" button to apply the changes. The plugin will:
1. Process all selected nodes
2. Show a notification with the number of changes made
3. Keep the plugin open for additional runs

---

## UI Features

### Save Mapping

Click "Save" to persist your mapping configuration. It will be loaded automatically next time you open the plugin.

### Auto-Save Draft

As you type, the plugin automatically saves a draft of your configuration. If you close the plugin without saving, your draft will be restored.

### Multiple Runs

The plugin stays open after running, allowing you to:
- Make adjustments to your mapping
- Select different nodes
- Run the swap multiple times

---

## Error Handling

### Variable Not Found

If a target variable doesn't exist:
```
Variable "brand/primary" not found
```
**Solution:** Ensure the variable exists in the document or is available in a linked library.

### Style Not Found

If a target style doesn't exist:
```
Paint style "Theme/Primary" not found
```
**Solution:** Ensure the style exists in the document. Currently, only local styles are supported for lookup.

### No Nodes Selected

If no nodes are selected:
```
No nodes selected
```
**Solution:** Select at least one node before running the plugin.

### Invalid JSON

If your mapping JSON is malformed, the plugin will show a JSON parse error.
**Solution:** Validate your JSON using a JSON validator.

---

## Best Practices

### 1. Test on a Copy First

Before running on important designs, create a copy and test the swap there.

### 2. Use Specific Selections

Select only the nodes you want to modify. This is faster and reduces the risk of unintended changes.

### 3. Check Console for Details

Open the Figma developer console (Plugins > Development > Show/Hide Console) to see detailed logs of what was changed.

### 4. Verify Library Variables

Ensure that target variables from team libraries are accessible in the current document.

### 5. Use Version Control

If your design files support version history, create a version before running bulk changes.

---

## Keyboard Shortcuts

You can assign a keyboard shortcut to run VarSwap:

1. Go to **Figma > Preferences > Keyboard Shortcuts** (or **Help > Keyboard Shortcuts**)
2. Search for "VarSwap"
3. Assign your preferred shortcut

---

## Troubleshooting

### Changes Not Applied

1. Check that nodes are selected
2. Verify the variable/style names match exactly (case-sensitive)
3. Check the console for error messages
4. Ensure target variables/styles exist

### Slow Performance

For large selections with many nodes:
1. Try selecting smaller portions at a time
2. Use more specific selections instead of selecting entire pages

### Library Variables Not Working

1. Ensure the library is properly linked to the document
2. Check that variable names match the full path including collection name
3. Verify you have access to the library

---

## Next Steps

- [JSON Schema](json-schema.md) - Learn the mapping format in detail
- [Variable Types](variables.md) - See all supported variable types
- [Examples](examples.md) - Real-world usage examples
