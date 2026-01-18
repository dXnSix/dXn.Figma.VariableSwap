# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- Lowercase with extension: `code.ts` - main plugin logic
- HTML files: `ui.html` - plugin interface
- Config files: `tsconfig.json`, `package.json`, `manifest.json`

**Functions:**
- camelCase for function names: `getNodeVariables()`, `findVariableByName()`, `processNode()`, `main()`
- Async functions clearly marked with `async` keyword
- Descriptive verb-noun patterns: "get", "find", "process"

**Variables:**
- camelCase for all variable declarations: `colorMapping`, `changesMade`, `newVariableName`, `mutableFills`
- Descriptive names that indicate purpose: `localVariables`, `libraryVariable`, `currentPage`
- Index variables use standard convention: `index` (not `i`)
- Unused variables prefixed with underscore: follows ESLint rule `argsIgnorePattern: "^_"`

**Types:**
- PascalCase for type names as per TypeScript convention
- Built-in types used directly: `SceneNode`, `Variable`, `Promise`
- Inline type definitions for simple cases: `{ [key: string]: string }` for `colorMapping`

## Code Style

**Formatting:**
- No Prettier config file detected; uses default ESLint formatting
- Indentation appears to be 2 spaces (based on code.ts)
- Line length: varies, no strict enforcer visible

**Linting:**
- ESLint enabled with TypeScript support via `@typescript-eslint/eslint-plugin`
- Configuration: ESLint recommended + TypeScript recommended + Figma plugins recommended
- Parser: `@typescript-eslint/parser`

**ESLint Rules:**
- Unused variables: Error with exception for variables starting with underscore
- Base rules: ESLint recommended rules enabled
- TypeScript rules: `@typescript-eslint/recommended` configuration applied

## Import Organization

**Order:**
1. Triple-slash directives for type references: `/// <reference types="@figma/plugin-typings" />`
2. Comments (if any)
3. Code logic

**Path Aliases:**
- Not detected in tsconfig.json - no path mapping configured
- Imports use standard module resolution

## Error Handling

**Patterns:**
- Conditional checks for existence before accessing properties: `if ("boundVariables" in node && node.boundVariables)`
- Type guards: `typeof bindings === "object" && bindings !== null`
- Null coalescing: `variable || null` for fallback returns
- Console logging for errors and diagnostics: `console.log("Error: ...")` approach
- Figma plugin notifications: `figma.notify()` for user feedback
- Plugin closeout with messages: `figma.closePlugin()` for final feedback

## Logging

**Framework:** console (standard browser console)

**Patterns:**
- Debug/info logging: `console.log()` with descriptive messages
- Template literals for dynamic content: `` console.log(`Node: ${node.name}`) ``
- Contextual logging: logs node names, variables applied, changes made
- Error messages prefixed with "Error: " for clarity
- Success messages: e.g., `Fills updated to: ${newVariableName}`

## Comments

**When to Comment:**
- Inline comments for non-obvious logic: `// Create a mutable copy`, `// Track the number of changes made`
- Explanatory comments for complex operations: `// Handle fills`, `// Recursive function to process nodes and their children`
- Mapping documentation: Comments indicate color mapping purpose

**JSDoc/TSDoc:**
- Not detected in current codebase - minimal JSDoc usage
- Type information inferred from TypeScript types and parameter names

## Function Design

**Size:** Functions range from small (10-15 lines) to medium (30-50 lines)
- `findVariableByName()`: ~25 lines
- `processNode()`: ~85 lines (largest function with nested logic)
- `getNodeVariables()`: ~30 lines

**Parameters:**
- Explicit typing: `node: SceneNode`, `name: string`, `changesMade: number`
- Minimal parameters - functions take what they need
- Return types explicitly declared: `Promise<Variable | null>`, `Promise<number>`

**Return Values:**
- Functions return meaningful data or null for not-found cases
- Async functions return Promises with typed content
- Success path returns data; failure path returns null

## Module Design

**Exports:**
- Not using explicit exports - single-file plugin structure
- All functions are file-scoped
- `main()` function is entry point (called at module end)

**Barrel Files:**
- Not applicable - single file codebase (`code.ts`)

---

*Convention analysis: 2026-01-17*
