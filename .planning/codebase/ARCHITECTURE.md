# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Plugin-Based Architecture with Single-Entry-Point Processing

**Key Characteristics:**
- Figma plugin architecture with plugin code and UI layer separation
- Single-threaded, event-driven processing initiated from UI
- Declarative mapping-driven variable substitution
- Recursive traversal of design document tree
- Async/await pattern for Figma API interactions

## Layers

**Plugin Core (`code.ts`):**
- Purpose: Main execution logic that processes Figma design nodes and swaps variables
- Location: `code.ts`
- Contains: Variable mapping, node traversal, variable binding operations
- Depends on: Figma Plugin API (`@figma/plugin-typings`), TypeScript runtime
- Used by: Figma plugin runtime, triggered from UI layer

**UI Layer (`ui.html`):**
- Purpose: User interface for triggering the plugin execution
- Location: `ui.html`
- Contains: Button interface and postMessage communication
- Depends on: HTML/CSS/JavaScript, parent window postMessage API
- Used by: Figma UI, initiates plugin execution

**Configuration & Metadata:**
- Purpose: Plugin registration and build configuration
- Location: `manifest.json`, `tsconfig.json`, `package.json`
- Contains: Plugin capabilities, compiler options, build scripts
- Depends on: TypeScript compiler, Node.js build tooling
- Used by: Figma runtime, build system

## Data Flow

**Plugin Execution Flow:**

1. **Initialization** → `main()` function executes on plugin startup (line 197-199 in `code.ts`)
2. **Selection Check** → Gets current page selection from Figma editor
3. **Node Processing** → For each selected node, calls `processNode()` recursively
4. **Variable Extraction** → `getNodeVariables()` retrieves all bound variables for a node
5. **Mapping Lookup** → Checks if old variable names exist in `colorMapping` object
6. **Variable Resolution** → `findVariableByName()` locates new variable in local or library collections
7. **Paint Update** → Updates fills or strokes with new bound variable using `setBoundVariableForPaint()`
8. **Tree Traversal** → Recursively processes child nodes
9. **Result Notification** → Plugin closes and displays count of changes made

**State Management:**
- `changesMade` counter passed through recursive calls to track total replacements
- `colorMapping` object static at module level, constant throughout execution
- No persistent state between plugin invocations

## Key Abstractions

**Color Mapping:**
- Purpose: Declarative mapping from old color variable names to new names
- Examples: `"OLD NEUTRALS/default/T__primary-default"` → `"Neutral/600"`
- Pattern: Simple key-value object (lines 4-31 in `code.ts`)
- Impact: All variable swaps controlled through this single object

**Node Variable Binding:**
- Purpose: Represents a single variable bound to a node property
- Examples: `{ property: "fills", name: "Neutral/600" }`
- Pattern: Tuple structure with property and name (line 35 in `code.ts`)
- Impact: Enables property-specific binding resolution and updates

**Variable Resolution Strategy:**
- Purpose: Multi-source variable lookup (local-first, then library)
- Examples: `findVariableByName()` checks local variables first, then team library collections
- Pattern: Hierarchical search with fallback (lines 66-91 in `code.ts`)
- Impact: Supports both local and library-managed design tokens

## Entry Points

**UI Trigger:**
- Location: `ui.html` line 41-43
- Triggers: User clicks "Run" button
- Responsibilities: Sends postMessage to plugin code with run instruction

**Plugin Code Entry:**
- Location: `code.ts` lines 197-199 (called twice intentionally)
- Triggers: Figma plugin lifecycle, or triggered by UI postMessage
- Responsibilities: Initiates main() execution which orchestrates all processing

**Main Orchestrator:**
- Location: `main()` function (lines 93-107 in `code.ts`)
- Triggers: Plugin startup or UI interaction
- Responsibilities: Checks selection validity, iterates selected nodes, aggregates changes

**Recursive Node Processor:**
- Location: `processNode()` function (lines 110-195 in `code.ts`)
- Triggers: Called for each selected node, then recursively for children
- Responsibilities: Extract variables, lookup mappings, update bindings, traverse tree

## Error Handling

**Strategy:** Graceful degradation with console logging and user notifications

**Patterns:**
- **Empty Selection:** Notifies user via `figma.notify()` if no nodes selected (line 98)
- **Variable Not Found:** Logs error to console, continues processing (lines 150, 182)
- **Property Mismatch:** Checks node property existence before accessing (lines 131, 162, 178)
- **No Mapping Match:** Silently skips nodes without mapping entries (line 124 condition)
- **Paint Type Check:** Only processes SOLID fills/strokes, ignores gradients/images (lines 134, 165)

## Cross-Cutting Concerns

**Logging:**
- Console output for debugging (lines 117-126, 145-150, etc.)
- No centralized logger; direct console calls throughout

**Validation:**
- Runtime type checks for binding objects (lines 40-60)
- Property existence checks before mutations (lines 131, 162)
- Array type verification before array operations

**Variable Binding:**
- Figma API `setBoundVariableForPaint()` handles binding consistency
- Variable IDs verified before async resolution (lines 43-44, 52-53)

---

*Architecture analysis: 2026-01-17*
