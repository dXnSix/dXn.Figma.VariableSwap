# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Runner:**
- Not configured - No testing framework detected in project

**Assertion Library:**
- Not applicable - No testing setup present

**Run Commands:**
```bash
npm run build              # Compile TypeScript to JavaScript
npm run lint              # Run ESLint for code quality
npm run lint:fix          # Auto-fix ESLint violations
npm run watch             # Watch mode compilation
```

## Test File Organization

**Location:**
- No test files detected in codebase
- No test directory structure present

**Naming:**
- Not applicable - No test files exist

**Structure:**
- No testing infrastructure in place

## Test Structure

**Suite Organization:**
- Not applicable - No tests implemented

**Patterns:**
- Not applicable - No tests implemented

## Mocking

**Framework:** Not applicable

**Patterns:**
- Not applicable - No mocking framework configured

**What to Mock:**
- Not applicable - No testing infrastructure

**What NOT to Mock:**
- Not applicable - No testing infrastructure

## Fixtures and Factories

**Test Data:**
- Not applicable - No testing framework

**Location:**
- Not applicable - No testing infrastructure

## Coverage

**Requirements:** Not enforced

**View Coverage:**
- No coverage tooling configured

## Test Types

**Unit Tests:**
- Not implemented
- Candidates for future testing:
  - `getNodeVariables()` in `code.ts` (lines 33-64): Variable extraction logic
  - `findVariableByName()` in `code.ts` (lines 66-91): Variable lookup logic
  - `processNode()` in `code.ts` (lines 110-195): Core processing logic with fills/strokes handling

**Integration Tests:**
- Not implemented
- Would require Figma plugin environment setup
- Key integration points:
  - `figma.variables.getLocalVariablesAsync()` API call
  - `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()` API call
  - `figma.currentPage.selection` property access

**E2E Tests:**
- Not applicable - Plugin runs within Figma application, not standalone

## Common Patterns

**Async Testing:**
- Current codebase uses async/await throughout
- All variable fetching operations are async: `getNodeVariables()`, `findVariableByName()`, `processNode()`
- No testing framework in place to test async behavior

**Error Testing:**
- Current error handling is manual with console.log()
- Error cases exist but are not tested:
  - Missing variables: line 150, 181 - logs error but doesn't raise exception
  - Missing node properties: line 147, 178 - gracefully handles missing fills/strokes
  - No test coverage for null returns from `findVariableByName()`

## Recommendations for Testing Setup

**Suggested Framework:**
- Vitest or Jest for unit testing TypeScript
- Would require mocking Figma plugin API (`@figma/plugin-typings`)

**Test Coverage Gaps:**
- `getNodeVariables()` (lines 33-64): Complex logic for extracting bound variables with type checking - needs unit tests
- `findVariableByName()` (lines 66-91): Variable lookup with fallback to library - needs mocking of Figma APIs
- `processNode()` (lines 110-195): Core business logic for fills/strokes mapping - critical functionality with no tests
- `main()` (lines 93-107): Entry point and error handling - needs integration tests with mocked selection

**Priority Gaps:**
1. High: Variable mapping logic in `processNode()` - core feature with complex state mutation
2. High: Variable lookup in `findVariableByName()` - handles both local and library variables
3. Medium: Node property detection in `getNodeVariables()` - relies on type guards

---

*Testing analysis: 2026-01-17*
