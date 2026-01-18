# Codebase Concerns

**Analysis Date:** 2026-01-17

## Critical Issues

**Duplicate Function Call:**
- Issue: `main()` is called twice at the end of `code.ts` (lines 197-199), causing the plugin to execute twice on load
- Files: `code.ts` (lines 197-199)
- Impact: All variable substitutions are processed twice, potentially creating duplicate updates or inconsistent state
- Fix approach: Remove the duplicate `main()` call on line 199

**Missing Compiled Output:**
- Issue: `manifest.json` references `code.js` as main entry point (line 5), but no compiled JavaScript file exists in repository
- Files: `manifest.json` (line 5), `code.ts` exists but `code.js` missing
- Impact: Plugin will not run in Figma without building/compiling first; CI/CD unclear
- Fix approach: Either add `code.js` to repository (committed compiled output) or update build pipeline to generate it before plugin deployment

## Error Handling Gaps

**Unhandled Variable Import Errors:**
- Issue: `findVariableByName()` silently returns `null` if variable is not found in either local variables or library collections, with no user-facing error recovery
- Files: `code.ts` (lines 66-91)
- Impact: When a mapped variable doesn't exist, operation fails silently with only console logs; users don't see errors in UI
- Fix approach: Add proper error handling and user notifications through `figma.notify()` instead of relying on console logs

**Missing Error Context in processNode():**
- Issue: Error messages logged to console (lines 147, 150, 178, 181) but not communicated to user; console logs invisible in plugin UI
- Files: `code.ts` (lines 147, 150, 178, 181)
- Impact: Users won't know when operations fail (node doesn't support fills/strokes, or variables not found)
- Fix approach: Use `figma.notify()` for user-facing error messages alongside console logging

**No Recovery from Partial Failures:**
- Issue: If variable import fails mid-process (e.g., library temporarily unavailable), entire operation continues without indication of incomplete changes
- Files: `code.ts` (lines 128-151, 159-183)
- Impact: Users see "X changes made" but may have only processed subset of intended replacements
- Fix approach: Track and report failed operations separately; add transaction-like semantics or rollback capability

## Type Safety Issues

**Incomplete Type Guards:**
- Issue: `getNodeVariables()` has nested type checks but doesn't validate binding structure completely before accessing `binding.id`
- Files: `code.ts` (lines 38-62)
- Impact: Could cause runtime errors if binding structure changes in Figma API; not resilient to API evolution
- Fix approach: Use more complete type validation or defensive programming; consider using utility types

**Missing null checks in forEach:**
- Issue: `forEach` callbacks in lines 133-143 and 164-174 assume `fill` and `stroke` objects exist but have no validation
- Files: `code.ts` (lines 133-143, 164-174)
- Impact: If array contains null/undefined elements, could throw runtime errors
- Fix approach: Add explicit null checks before processing each array element

## Logic Concerns

**Overly Broad Mapping:**
- Issue: `colorMapping` object (lines 4-31) is a hardcoded global mapping with 29 specific variable remappings, no UI to customize
- Files: `code.ts` (lines 4-31)
- Impact: Plugin is inflexible; changing mappings requires code modification and recompilation; not reusable across different design systems
- Fix approach: Move mappings to external configuration; implement custom mapping UI (noted in `todo.txt` as v2 feature)

**No Validation of Mapping Completeness:**
- Issue: If a variable exists but isn't in `colorMapping`, it's silently ignored (line 124, 155 use conditional check)
- Files: `code.ts` (lines 120-152, 155-183)
- Impact: Variables in use but missing from mapping silently fail to update; users won't know all variables were handled
- Fix approach: Log and report which variables weren't processed; provide option to show unmapped variables

**Inefficient Library Search:**
- Issue: `findVariableByName()` loops through all library collections and fetches all variables in each collection (lines 73-87)
- Files: `code.ts` (lines 66-91)
- Impact: Slow performance with large design libraries; no caching; repeated searches duplicate work
- Fix approach: Cache library variables in memory; implement early exit once variable found

## Performance Issues

**Synchronous-like Processing with Async Overhead:**
- Issue: Heavy use of `await` for variable lookups (lines 43-44, 53-54, 77, 82) with no batching or parallel processing
- Files: `code.ts` (lines 33-64, 110-195)
- Impact: Each node variable lookup waits sequentially; with many nodes/variables, slow UI responsiveness
- Fix approach: Batch variable lookups or use Promise.all() for parallel imports

**No Progress Feedback:**
- Issue: Plugin processes selection but doesn't provide user feedback during execution; for large selections, appears frozen
- Files: `code.ts` (lines 93-107)
- Impact: Users can't tell if plugin is working or hung; no progress indication
- Fix approach: Add UI updates or progress callbacks; consider breaking work into chunks with yields

## Missing Features

**No UI Message Handler:**
- Issue: `ui.html` sends plugin message (line 43) but `code.ts` has no handler to receive it
- Files: `ui.html` (line 43), `code.ts` missing listener
- Impact: UI button "Run" doesn't connect to plugin logic; main() runs on page load instead
- Fix approach: Implement `figma.ui.onmessage` handler to bridge UI and plugin execution

**No Selection Validation:**
- Issue: Plugin runs on entire selection without validating node types support fills/strokes
- Files: `code.ts` (lines 94-107)
- Impact: Processes text nodes, groups, etc. that may not have fill/stroke properties; wastes processing
- Fix approach: Filter selection to only node types that support fills/strokes

**No Undo Group:**
- Issue: Each variable update is a separate action; no undo grouping
- Files: `code.ts` (lines 135-144, 166-175)
- Impact: User must undo many times to revert a single plugin run
- Fix approach: Wrap all changes in `figma.undo.startGroup()` / `figma.undo.endGroup()`

## Testing Gaps

**No Test Coverage:**
- Issue: No test files present; pure Figma plugin code without unit tests
- Files: No `*.test.ts` or `*.spec.ts` files in repository
- Impact: Refactoring risky; edge cases in variable mapping untested; regressions undetected
- Fix approach: Add test suite using Jest/Vitest; mock Figma API for unit tests

**Untested Error Paths:**
- Issue: Error handling code (lines 147, 150, 178, 181) never validated; different branches untested
- Files: `code.ts` (lines 147, 150, 178, 181)
- Impact: Error paths may not work as expected when triggered; silent failures possible
- Fix approach: Add tests for missing variables, nodes without fills/strokes, empty selections

**Manual Integration Testing Only:**
- Issue: Plugin can only be tested in Figma manually; no CI/CD apparent
- Files: No test runner config; build output missing
- Impact: Changes untested before deployment; regressions unpredictable
- Fix approach: Set up GitHub Actions or CI to build and validate TypeScript compilation

## Fragile Areas

**Variable Binding Logic:**
- Files: `code.ts` (lines 33-64)
- Why fragile: Complex nested type checks; assumes specific binding structure from Figma API; will break if API changes shape
- Safe modification: Add comprehensive type guards; consider interface definitions for binding structure
- Test coverage: Untested; no mock tests for different binding structures

**Color Mapping Table:**
- Files: `code.ts` (lines 4-31)
- Why fragile: Hardcoded strings with no validation; typos in keys/values silently fail; inconsistent naming (some lowercase, some mixed case)
- Safe modification: Move to separate config file; validate at load time; case-insensitive lookup
- Test coverage: No tests for mapping accuracy; no validation of mapped values exist

**Fill/Stroke Update Process:**
- Files: `code.ts` (lines 131-144, 162-175)
- Why fragile: Copies arrays, iterates, mutates local copy, assigns back; if assignment fails mid-operation, inconsistent state
- Safe modification: Consider atomic operations; add transaction semantics
- Test coverage: Untested; no mocked Figma API tests

## Scaling Limits

**Linear Processing:**
- Current capacity: Handles small-to-medium selections (< 100 nodes) with acceptable performance
- Limit: Large selections (1000+ nodes) will be noticeably slow due to sequential async operations
- Scaling path: Implement chunked processing with Promise.all(); batch variable lookups

**Library Variable Cache:**
- Current capacity: Reloads entire library on each variable lookup
- Limit: Large libraries (10,000+ variables) will cause performance degradation
- Scaling path: Cache library variables once per plugin run; implement indexed search

## Dependencies at Risk

**No Package Pinning:**
- Risk: DevDependencies use wildcard/caret versions (e.g., `"@figma/eslint-plugin-figma-plugins": "*"`)
- Impact: Build reproducibility uncertain; breaking changes in major versions can cause silent failures
- Migration plan: Pin to exact versions (e.g., `^1.122.0`); use lock file only (already present)

**TypeScript Version:**
- Risk: Using `^5.3.2`; could jump to TypeScript 6 with breaking changes
- Impact: Compilation may fail on next CI run if dependency auto-updates
- Migration plan: Pin to specific minor version or add CI test for new TS versions

## Build & Configuration Issues

**Incorrect Watch Script:**
- Issue: `tsconfig.json` compiles to no specified output directory (no `outDir` property)
- Files: `tsconfig.json` (missing `outDir`)
- Impact: Compiled `.js` files location unclear; plugin may not find compiled output
- Fix approach: Add `"outDir": "."` or appropriate directory; document where compiled files go

**Missing .gitignore for Compiled Output:**
- Issue: `code.js` not in repository but `.gitignore` may exclude it; unclear if generated or committed
- Files: `.gitignore`, missing `code.js`
- Impact: Repository state unclear; difficult for new contributors to set up
- Fix approach: Document build process; clarify whether `code.js` should be committed

**No Lock File Guarantee:**
- Issue: `package-lock.json` present but `npm ci` not used in build scripts
- Files: `package.json` (line 7)
- Impact: `npm install` may install different versions despite lock file
- Fix approach: Change build script to use `npm ci` or document this assumption

## Documentation Gaps

**Minimal API Documentation:**
- Issue: No JSDoc comments for functions; parameters and return types unclear from comments
- Files: `code.ts` (functions lack documentation)
- Impact: Difficult to understand function contracts; harder to refactor safely
- Fix approach: Add comprehensive JSDoc comments to all exported functions

**Mapping Rationale Undocumented:**
- Issue: Color mapping exists with inline comments but no explanation of design system migration
- Files: `code.ts` (lines 4-31)
- Impact: Future developers can't understand why mappings exist or modify them safely
- Fix approach: Add documentation explaining the variable migration context

**No Setup/Build Instructions:**
- Issue: README.md is generic template; no specific setup for this plugin
- Files: `README.md`
- Impact: Unclear how to build/test plugin locally; onboarding difficult
- Fix approach: Add sections for: Build instructions, Running plugin, Testing changes

---

*Concerns audit: 2026-01-17*
