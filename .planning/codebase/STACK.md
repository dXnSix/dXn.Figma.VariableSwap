# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.3.2 - All plugin logic and type definitions

**Secondary:**
- HTML - UI interface (`ui.html`)
- CSS - Styling for plugin UI (inline in `ui.html`)
- JavaScript - Compiled output from TypeScript (`code.js`)

## Runtime

**Environment:**
- Node.js (any version supporting ES6/CommonJS, tested with Node LTS versions)

**Package Manager:**
- npm (v3 lockfile format)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Figma Plugin API v1.0.0 - Main plugin framework for Figma editor integration
  - Type definitions: `@figma/plugin-typings` v1.122.0
  - Used for: Access to Figma document, variables, selections, fills, strokes

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript - TypeScript compiler (v5.3.2) for compilation
- ESLint - Code quality and linting (v8.57.0)
  - Parser: `@typescript-eslint/parser` v6.21.0
  - Plugin: `@typescript-eslint/eslint-plugin` v6.21.0
  - Figma-specific rules: `@figma/eslint-plugin-figma-plugins` v0.15.0

## Key Dependencies

**Critical:**
- `@figma/plugin-typings` v1.122.0 - Provides TypeScript type definitions for Figma Plugin API, essential for type safety when accessing Figma document object model

**Linting/Quality:**
- `eslint` v8.57.0 - JavaScript/TypeScript linter
- `@typescript-eslint/eslint-plugin` v6.21.0 - ESLint rules for TypeScript
- `@typescript-eslint/parser` v6.21.0 - Parser for TypeScript code
- `@figma/eslint-plugin-figma-plugins` v0.15.0 - Figma-specific ESLint rules

## Configuration

**Environment:**
- No environment variables required
- Plugin runs in Figma editor context only
- No external API keys or secrets needed

**Build:**
- `tsconfig.json` - TypeScript compiler configuration
  - Target: ES6
  - Module: CommonJS
  - Strict mode enabled
  - Library: es2017, dom
  - Source: All `**/*.ts` files

**ESLint:**
- Configured inline in `package.json` (eslintConfig field)
- Extends: eslint:recommended, plugin:@typescript-eslint/recommended, plugin:@figma/figma-plugins/recommended
- Custom rule: unused variables must start with `_` to be allowed

## Platform Requirements

**Development:**
- Node.js (any modern version)
- npm package manager
- Figma API access (plugin runs within Figma desktop/web app)

**Production:**
- Figma plugin deployment via Figma Plugin Manager
- No server-side deployment required
- Runs entirely within Figma editor environment

## Build Scripts

```bash
npm run build              # Compile TypeScript to JavaScript
npm run lint              # Run ESLint checks
npm run lint:fix          # Run ESLint with --fix flag
npm run watch             # Watch mode for TypeScript compilation
```

## Plugin Configuration (manifest.json)

- Plugin name: VarSwap
- ID: 1398477396827179586
- API version: 1.0.0
- Main entry: `code.js` (compiled from `code.ts`)
- UI entry: `ui.html`
- Capabilities: None
- Document access: dynamic-page (can access all pages dynamically)
- Editor type: Figma only
- Permissions: teamlibrary (access to team library variables)
- Network access: Restricted to "none" (no external network calls allowed)

---

*Stack analysis: 2026-01-17*
