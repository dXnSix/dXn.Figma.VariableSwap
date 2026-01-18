---
phase: 03-color-matching
plan: 01
subsystem: plugin
tags: [typescript, figma-plugin, color-parsing, variable-matching]

# Dependency graph
requires:
  - phase: 02-json-input
    provides: MappingEntry type, colorMapping lookup, user JSON input
provides:
  - Color parsing utilities (tryParseColor, colorsMatch)
  - Extended processNode matching both variable names and hardcoded colors
  - findMatchingNewVariable and findMatchingNewVariableForStroke helpers
affects: [03-02-gradient-support, 04-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns: [tolerance-comparison, figma-util-rgba, priority-matching]

key-files:
  created: []
  modified: [code.ts]

key-decisions:
  - "Use figma.util.rgba for all color parsing - handles hex, rgba, hsl automatically"
  - "Tolerance 0.001 for color comparison - handles 32-bit float precision"
  - "Priority: match bound variable name first, then hardcoded color value"
  - "Separate helper functions for fills vs strokes (findMatchingNewVariable, findMatchingNewVariableForStroke)"

patterns-established:
  - "tryParseColor returns RGB | null - returns null for variable names"
  - "colorsMatch uses Math.abs difference < tolerance for each channel"
  - "processNode loops over all fills/strokes, not just bound variables"

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 3 Plan 1: Color Parsing and Matching Summary

**Extended plugin to match fills/strokes by hardcoded color values (hex/rgba) using figma.util.rgba parsing and tolerance-based comparison, in addition to existing variable name matching**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-17T22:55:58Z
- **Completed:** 2026-01-17T22:57:44Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added COLOR_TOLERANCE constant (0.001) for floating-point precision handling
- Added colorsMatch function for tolerance-based RGB comparison
- Added tryParseColor function using figma.util.rgba for hex/rgba parsing
- Added findMatchingNewVariable helper for fill matching (variable name priority, then color)
- Added findMatchingNewVariableForStroke helper for stroke matching (same pattern)
- Refactored processNode to loop over all fills/strokes directly (not just bound variables)
- All five COLR requirements addressed in code

## Task Commits

Each task was committed atomically:

1. **Task 1: Add color parsing and comparison utilities** - `0a66129` (feat)
   - COLOR_TOLERANCE, colorsMatch, tryParseColor functions

2. **Task 2: Extend processNode to match hardcoded colors** - `a86a0fb` (feat)
   - findMatchingNewVariable, findMatchingNewVariableForStroke, refactored processNode

## Files Created/Modified

- `code.ts` - Added color utilities and refactored processNode (99 lines added, 58 removed - net +41 lines)

## Decisions Made

1. **Use figma.util.rgba for all color parsing** - Official API handles all formats (hex 3/6/8 digit, rgb, rgba, hsl, lab) automatically with proper 0-1 normalization
2. **Tolerance 0.001 for color comparison** - Figma stores colors as 32-bit floats, JavaScript uses 64-bit; this threshold handles precision differences
3. **Priority: variable name first, then color** - Bound variable takes precedence over hardcoded color to avoid false matches
4. **Separate helper functions for fills vs strokes** - Clean separation of concerns, handles different boundVariables paths (fills[] vs strokes[])

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| COLR-01 | DONE | findMatchingNewVariable checks boundVariables first |
| COLR-02 | DONE | tryParseColor handles hex (#FFF, #FFFFFF, #FFFFFFFF) |
| COLR-03 | DONE | tryParseColor handles rgba(r,g,b,a) via figma.util.rgba |
| COLR-04 | DONE | figma.util.rgba normalizes all formats to 0-1 RGB |
| COLR-05 | DONE | colorsMatch uses 0.001 tolerance comparison |

## Next Phase Readiness

- Plan 03-01 complete: color parsing and matching implemented
- Ready for Plan 03-02 if gradient support is needed (ADVN-01)
- Current implementation handles solid fills/strokes only (as specified)
- The findMatchingNewVariable pattern is extensible for additional match types

---
*Phase: 03-color-matching*
*Completed: 2026-01-17*
