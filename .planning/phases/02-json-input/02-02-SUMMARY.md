---
phase: 02-json-input
plan: 02
subsystem: plugin
tags: [typescript, figma-plugin, message-types, variable-mapping]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: UI-plugin message passing infrastructure
  - phase: 02-01
    provides: JSON input UI with validation sending mapping data
provides:
  - MappingEntry type for flexible old->new mapping
  - Plugin handler receives and processes user-provided mapping
  - Conversion from array format to lookup object
affects: [03-color-matching, 04-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns: [mapping-entry-type, array-to-lookup-conversion]

key-files:
  created: []
  modified: [code.ts]

key-decisions:
  - "Convert MappingEntry[] to lookup object in runSwap - minimizes changes to processNode"
  - "Increase UI height to 350px - accommodate textarea input"
  - "Handle both string and array formats for 'old' field at conversion time"

patterns-established:
  - "MappingEntry type: { old: string | string[], new: string }"
  - "Array-to-lookup conversion loop handles both formats in one pass"
  - "colorMapping passed as parameter instead of global constant"

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 2 Plan 2: Plugin Layer Mapping Support Summary

**Plugin code.ts updated to receive MappingEntry[] from UI, convert to lookup object, and pass through execution chain - removes hardcoded colorMapping constant**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-17T22:37:50Z
- **Completed:** 2026-01-17T22:40:12Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added MappingEntry type with `old: string | string[]` and `new: string` fields
- Updated UIMessage type to require `mapping: MappingEntry[]` field
- Converted runSwap to accept mapping entries and build lookup object
- Updated processNode to receive colorMapping as parameter (not global)
- Removed 29-entry hardcoded colorMapping constant
- Increased UI height from 200px to 350px for textarea

## Task Commits

Each task was committed atomically:

1. **Task 1: Update message types and handler to use mapping** - `dd55181` (feat)

**Plan metadata:** (pending - will be committed with SUMMARY)

## Files Created/Modified

- `code.ts` - Updated type definitions, message handler, runSwap, and processNode to use user-provided mapping (27 lines added, 36 removed - net reduction of 9 lines due to removing hardcoded mapping)

## Decisions Made

1. **Convert MappingEntry[] to lookup object in runSwap** - Keeps processNode logic unchanged; the lookup format `colorMapping[v.name]` works exactly as before
2. **Handle both string and array 'old' formats at conversion time** - Simple loop handles both cases, multiple old values map to same new value
3. **Increase UI height to 350px** - Textarea needs more vertical space than the original simple button UI

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 complete: UI validation (02-01) + plugin handling (02-02) done
- JSON-01 through JSON-05 requirements all satisfied
- Ready for Phase 3 (Color Matching) which will add hex/rgba color parsing
- The colorMapping lookup pattern in processNode is extensible for color matching

---
*Phase: 02-json-input*
*Completed: 2026-01-17*
