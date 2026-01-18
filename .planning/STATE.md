# STATE: VarSwap Figma Plugin

**Project:** VarSwap - Flexible variable swapping without code changes
**Current Milestone:** Persistence

---

## Project Reference

**Core Value:** Designers paste their own JSON mappings and run variable swaps - no code changes needed.

**Current Focus:** Transform hardcoded variable swapper into user-configurable tool with JSON input, color matching, and persistence.

**Key Constraints:**
- Figma Plugin API only - no external network calls
- clientStorage for persistence (5MB limit)
- Two-context architecture: UI (iframe) + Plugin (sandbox)

---

## Current Position

**Phase:** 4 of 5 - Persistence
**Plan:** 1 of 1 complete
**Status:** Phase complete
**Last activity:** 2026-01-18 - Completed 04-01-PLAN.md

**Progress:**
```
Phase 1: Foundation        [###] 3/3 requirements COMPLETE
Phase 2: JSON Input        [###] 5/5 requirements COMPLETE
Phase 3: Color Matching    [###] 5/5 requirements COMPLETE
Phase 4: Persistence       [###] 3/3 requirements COMPLETE
Phase 5: Integration       [   ] 0/2 requirements
-------------------------------------------------
Overall:                   [#########.] 89%
```

---

## Phase 4 Context (COMPLETE)

**Goal:** Persist user mappings using Figma clientStorage API.

**Requirements:** ALL SATISFIED
- PRST-01: Save mapping on run - DONE (04-01, saveMapping called before run)
- PRST-02: Load mapping on init - DONE (04-01, loadMapping on plugin open)
- PRST-03: Auto-save draft - DONE (04-01, debouncedSaveDraft on input)

**Success Criteria:** ALL MET
1. User opens plugin and sees previously saved mapping in textarea
2. User types in textarea, closes without running, reopens - draft preserved
3. User runs successful swap - mapping saved for next session
4. Saved mapping takes precedence over draft when both exist
5. Storage errors display notification instead of silent failure
6. All TypeScript compiles without errors

---

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Phases completed | 4/5 | Phase 1-4 complete |
| Requirements done | 16/18 | FNDN-01-03, JSON-01-05, COLR-01-05, PRST-01-03 |
| Plans executed | 6 | 01-01, 02-01, 02-02, docs, 03-01, 04-01 |
| Session count | 5 | Plan execution session |

---

## Accumulated Context

### Key Decisions

| Decision | Rationale | Phase |
|----------|-----------|-------|
| Vanilla TypeScript, no bundler | Sufficient for scope, reduces complexity | Research |
| figma.util.rgba() for color parsing | Official API, handles all formats | Research |
| Tolerance-based color comparison | Floating-point precision issues | Research |
| Split validation (UI + plugin) | Immediate feedback + Figma context | Research |
| UIMessage discriminated union | Type-safe message passing, exhaustive checking | 01-01 |
| Native JSON.parse for syntax validation | No external libraries, detailed error messages | 02-01 |
| 300ms debounce delay | Balance responsiveness vs excessive validation | 02-01 |
| MappingEntry[] to lookup conversion | Minimizes changes to processNode logic | 02-02 |
| Priority: variable name before color | Bound variable takes precedence over hardcoded | 03-01 |
| Separate fill/stroke helper functions | Clean separation, different boundVariables paths | 03-01 |
| Two storage keys (saved vs draft) | Saved is confirmed, draft is WIP; prefer saved on load | 04-01 |
| Delete draft on confirmed save | Prevents stale draft overriding newer saved | 04-01 |
| No UI notification for draft failures | Too noisy for 300ms debounce | 04-01 |

### Technical Notes

- **RGB values:** Figma uses 0-1 range, CSS uses 0-255. Always use figma.util.rgba() to convert.
- **Color comparison:** Use 0.001 tolerance for floating-point precision.
- **Message passing:** Define TypeScript interfaces for all UI-plugin messages. Use discriminated unions.
- **clientStorage:** Always await, wrap in try-catch, 5MB limit.
- **Error handling:** Use try-catch in figma.ui.onmessage, notify users with figma.notify({ error: true }).
- **JSON validation:** Two-stage (syntax then schema), debounced at 300ms.
- **Mapping conversion:** Array format handled at runSwap - each old value maps to same new.
- **Color matching:** tryParseColor returns null for variable names (quick prefix check).
- **Storage priority:** Saved mapping takes precedence over draft on load.
- **onmessage in UI:** Access via event.data.pluginMessage (not msg directly).

### Patterns Established

- **Message pattern:** `parent.postMessage({ pluginMessage: { type: 'run', mapping: [...] } }, '*')`
- **Error pattern:** `figma.notify(message, { error: true })` for user-visible errors
- **Type pattern:** Discriminated unions for message types, MappingEntry for flexible mapping
- **Validation pattern:** debounce -> parseSyntax -> validateSchema -> updateUI
- **Mapping pattern:** MappingEntry[] -> loop -> colorMapping lookup object
- **Color matching pattern:** findMatchingNewVariable checks boundVariables first, then iterates colorMapping for color match
- **Storage pattern:** loadMapping prefers saved over draft, saveMapping deletes draft
- **Auto-save pattern:** debouncedSaveDraft (300ms) matches validation debounce

### Blockers

None currently.

---

## Session Continuity

**Last Session:** 2026-01-18
**Completed:** 04-01-PLAN.md (Persistence)
**Next Action:** Plan Phase 5 (Integration)

**Files Modified This Session:**
- Modified: code.ts (STORAGE_KEYS, loadMapping, saveMapping, saveDraft, extended UIMessage/PluginMessage)
- Modified: ui.html (onmessage handler, load-mapping request, debouncedSaveDraft)
- Created: .planning/phases/04-persistence/04-01-SUMMARY.md

---

*State initialized: 2026-01-17*
*Last updated: 2026-01-18*
