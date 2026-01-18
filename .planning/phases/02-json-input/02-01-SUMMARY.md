---
phase: 02-json-input
plan: 01
subsystem: ui
tags: [json, validation, debounce, figma-css-variables, textarea]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: UI-plugin message passing infrastructure
provides:
  - JSON input textarea with real-time validation
  - Schema validation for mapping structure
  - Debounced validation pattern
  - Figma-themed UI components
affects: [02-02, 04-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns: [debounce, two-stage-validation, figma-css-variables]

key-files:
  created: []
  modified: [ui.html]

key-decisions:
  - "Use native JSON.parse for syntax validation - no external libraries needed"
  - "300ms debounce delay for real-time validation"
  - "Support both string and array formats for 'old' field"
  - "Don't show error on initial load (empty textarea is expected)"

patterns-established:
  - "Debounce pattern: 300ms delay with clearTimeout for cleanup"
  - "Two-stage validation: syntax (JSON.parse) then schema (custom checks)"
  - "UI state management: classList.add/remove for error states"
  - "Figma CSS variables: var(--figma-color-*) for theme-aware styling"

# Metrics
duration: 1min
completed: 2026-01-17
---

# Phase 2 Plan 1: JSON Input UI Summary

**Textarea-based JSON input with real-time debounced validation, two-stage error reporting (syntax + schema), and Figma-themed styling**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-17T22:37:27Z
- **Completed:** 2026-01-17T22:38:40Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced simple Run button UI with textarea for JSON mapping input
- Implemented real-time validation with 300ms debounce to avoid lag
- Two-stage validation: JSON syntax errors show native error messages with position, schema errors show field-level detail
- Run button disabled when JSON invalid, enabled when valid
- Support for both string and array formats in "old" field
- Figma CSS variables for automatic light/dark theme support

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement JSON input UI with validation** - `afb6165` (feat)

**Plan metadata:** (pending - will be committed with SUMMARY)

## Files Created/Modified

- `ui.html` - Complete JSON input interface with textarea, validation logic, error display, and Figma-themed styling (225 lines)

## Decisions Made

1. **Native JSON.parse for syntax validation** - No external libraries needed; browser provides detailed error messages including line/column
2. **300ms debounce delay** - Balance between responsiveness and avoiding excessive validation runs while typing
3. **Support both string and array "old" field formats** - Matches JSON schema from PROJECT.md; allows single value or multiple sources per mapping entry
4. **Don't show error on initial load** - Empty textarea is expected state; button disabled without error message until first input

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- UI validation complete; ready for 02-02-PLAN.md to update plugin code.ts
- Plugin will need to:
  - Update UIMessage type to include mapping field
  - Update message handler to receive and use mapping data
  - Consider increasing UI height to accommodate textarea (currently 200px, may need 350px+)

---
*Phase: 02-json-input*
*Completed: 2026-01-17*
