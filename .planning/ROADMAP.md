# Roadmap: VarSwap Figma Plugin

**Created:** 2026-01-17
**Core Value:** Flexible variable swapping without code changes - designers paste their own mappings and run.

---

## Overview

VarSwap transforms from a hardcoded variable swapper into a user-configurable tool. The roadmap progresses from fixing current bugs and establishing communication patterns (Phase 1), through user input and validation (Phase 2), to the core color matching capability (Phase 3), then persistence (Phase 4), and finally integration polish (Phase 5).

Each phase delivers a complete, verifiable capability. The dependency chain is linear: Foundation enables UI communication, which enables JSON input, which enables color matching, which becomes useful with persistence, all integrated in Phase 5.

---

## Phase 1: Foundation

**Goal:** Plugin initializes correctly with reliable UI-plugin communication and user-visible error handling.

**Dependencies:** None (starting point)

**Plans:** 1 plan

Plans:
- [x] 01-01-PLAN.md - Fix initialization, message handler, and error visibility

**Requirements:**
- FNDN-01: Plugin initializes correctly without errors (fix duplicate main() call)
- FNDN-02: UI and plugin communicate via typed message contracts
- FNDN-03: Errors display to users via figma.notify (not just console)

**Key Deliverables:**
- Remove duplicate `main()` call at end of code.ts
- Establish `figma.ui.onmessage` handler in plugin
- Define TypeScript interfaces for UI-to-plugin messages
- Add `figma.notify()` calls for user-facing errors
- Connect Run button to plugin execution via postMessage

**Success Criteria:**
1. Plugin opens without console errors or duplicate execution
2. Clicking Run button triggers plugin code execution (observable via console log or notify)
3. When an error occurs during execution, user sees notification in Figma (not just console)
4. Message types are defined in code, preventing stringly-typed communication

**Pitfalls to Avoid:**
- P5: main() called multiple times - fix immediately
- P3: No UI message handler - establish pattern first
- P11: Errors only in console - add figma.notify

---

## Phase 2: JSON Input and Validation

**Goal:** Users can paste JSON mappings and receive immediate feedback on validity before running.

**Dependencies:** Phase 1 (message passing infrastructure)

**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md - UI layer: textarea, validation, error display, Figma theming
- [x] 02-02-PLAN.md - Plugin layer: update types and handler to use mapping

**Requirements:**
- JSON-01: User can paste JSON mappings into textarea
- JSON-02: JSON validated for syntax errors with clear messages
- JSON-03: JSON schema validated (required "mapping" array with "old" and "new" fields)
- JSON-04: Run button disabled when JSON is invalid
- JSON-05: Multiple old sources can map to single new variable (old is array)

**Key Deliverables:**
- Replace simple Run button UI with textarea + Run button
- Implement real-time JSON syntax validation in UI
- Implement schema validation (mapping array, old/new fields)
- Display validation errors below textarea
- Enable/disable Run button based on validation state
- Send validated mapping to plugin via typed message

**Success Criteria:**
1. User can paste JSON into textarea and see it preserved
2. Invalid JSON syntax shows specific error message (e.g., "Unexpected token at line 3")
3. Valid JSON with wrong schema shows schema error (e.g., "Missing required field: mapping")
4. Run button is visually disabled when JSON is invalid
5. Valid JSON with array of old sources (e.g., `"old": ["var1", "#FFF"]`) passes validation

**Pitfalls to Avoid:**
- P8: JSON schema too strict/loose - support both simple and array formats
- Split validation: UI handles syntax/schema, plugin handles variable existence

---

## Phase 3: Color Parsing and Matching

**Goal:** Plugin matches fills/strokes by variable name, hex color, or rgba color with tolerance-based comparison.

**Dependencies:** Phase 2 (validated JSON input)

**Plans:** 1 plan

Plans:
- [x] 03-01-PLAN.md - Add color utilities and extend processNode for hardcoded color matching

**Requirements:**
- COLR-01: Match fills/strokes by old variable name (existing behavior, configurable)
- COLR-02: Match fills/strokes by hardcoded hex color (#FFF, #FFFFFF, #FFFFFFFF)
- COLR-03: Match fills/strokes by hardcoded rgba color (rgba(0, 0, 0, 1))
- COLR-04: Normalize color formats for comparison (#FFF = #FFFFFF)
- COLR-05: Tolerance-based color comparison for floating-point precision

**Key Deliverables:**
- Use `figma.util.rgba()` to parse color strings to Figma RGB format
- Normalize short hex (#FFF) to full hex (#FFFFFF)
- Handle 8-digit hex with alpha (#FFFFFFFF)
- Implement tolerance-based color comparison (0.001 threshold)
- Check `boundVariables` first to distinguish variable-bound vs hardcoded colors
- Match old sources in priority order: variable name first, then color value

**Success Criteria:**
1. Element with old variable "colors/primary" swaps to new variable when mapping contains variable name
2. Element with hardcoded #FFFFFF swaps to new variable when mapping contains "#FFFFFF" or "#FFF"
3. Element with hardcoded rgba(255, 255, 255, 1) swaps to new variable when mapping contains "rgba(255, 255, 255, 1)"
4. Element with color rgb(0.999, 1.0, 1.0) matches #FFFFFF due to tolerance (floating-point precision)
5. Multiple old sources in array all resolve to same new variable

**Pitfalls to Avoid:**
- P1: RGB 0-1 vs 0-255 mismatch - use figma.util.rgba() which returns 0-1 values
- P2: Floating-point precision - use tolerance-based comparison
- P6: Hex edge cases - handle #FFF, #FFFFFF, #FFFFFFFF
- P7: RGBA parsing complexity - handle CSS variations
- P10: Hardcoded vs bound confusion - check boundVariables first

---

## Phase 4: Persistence

**Goal:** User mappings persist between plugin sessions without re-pasting.

**Dependencies:** Phase 2 (JSON input to save/load)

**Plans:** 1 plan

Plans:
- [x] 04-01-PLAN.md - Add clientStorage persistence with auto-save drafts

**Requirements:**
- PRST-01: Save current mapping to Figma clientStorage
- PRST-02: Load previously saved mapping on plugin open
- PRST-03: Auto-save draft mapping as user types

**Key Deliverables:**
- Save mapping to clientStorage when user clicks Save (or on successful run)
- Load last-used mapping on plugin initialization
- Populate textarea with loaded mapping
- Auto-save draft to clientStorage on textarea change (debounced)
- Handle storage errors gracefully with user notification

**Success Criteria:**
1. User pastes mapping, runs swap, closes plugin, reopens plugin - mapping is still in textarea
2. User types in textarea, closes plugin without running, reopens - draft is preserved
3. If clientStorage fails (quota exceeded), user sees error notification instead of silent failure
4. Saved mapping survives Figma restart

**Pitfalls to Avoid:**
- P4: clientStorage quota errors - wrap in try-catch, notify user
- P4: Async storage errors - always await clientStorage operations

---

## Phase 5: Integration and Polish

**Goal:** Complete end-to-end flow works reliably with clear success/failure reporting.

**Dependencies:** Phases 1-4 (all prior capabilities)

**Plans:** 1 plan

Plans:
- [ ] 05-01-PLAN.md - TBD (created by /gsd:plan-phase)

**Requirements:**
- INTG-01: Full end-to-end flow works: load -> validate -> run -> report
- INTG-02: Success/failure count reported after swap operation

**Key Deliverables:**
- Connect all phases into seamless flow
- Count successful swaps vs failed/skipped elements
- Report results via figma.notify (e.g., "Swapped 15 colors, 3 skipped")
- Loading state during swap operation
- Performance optimization: skipInvisibleInstanceChildren, scope to selection

**Success Criteria:**
1. User opens plugin, sees last mapping loaded, validates automatically, can click Run immediately
2. After swap completes, user sees count: "Swapped X colors successfully, Y elements skipped"
3. If no elements match, user sees "No matching elements found" (not silent completion)
4. Large selections (100+ nodes) complete without timeout or UI freeze

**Pitfalls to Avoid:**
- P9: Performance degradation - enable skipInvisibleInstanceChildren, scope to selection
- P12: Case sensitivity in variable names - normalize consistently

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| 1 - Foundation | Complete | FNDN-01, FNDN-02, FNDN-03 | 100% |
| 2 - JSON Input | Complete | JSON-01, JSON-02, JSON-03, JSON-04, JSON-05 | 100% |
| 3 - Color Matching | Complete | COLR-01, COLR-02, COLR-03, COLR-04, COLR-05 | 100% |
| 4 - Persistence | Complete | PRST-01, PRST-02, PRST-03 | 100% |
| 5 - Integration | Not Started | INTG-01, INTG-02 | 0% |

**Overall:** 16/18 requirements complete (89%)

---

## Coverage Validation

| Requirement | Phase | Mapped |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Yes |
| FNDN-02 | Phase 1 | Yes |
| FNDN-03 | Phase 1 | Yes |
| JSON-01 | Phase 2 | Yes |
| JSON-02 | Phase 2 | Yes |
| JSON-03 | Phase 2 | Yes |
| JSON-04 | Phase 2 | Yes |
| JSON-05 | Phase 2 | Yes |
| COLR-01 | Phase 3 | Yes |
| COLR-02 | Phase 3 | Yes |
| COLR-03 | Phase 3 | Yes |
| COLR-04 | Phase 3 | Yes |
| COLR-05 | Phase 3 | Yes |
| PRST-01 | Phase 4 | Yes |
| PRST-02 | Phase 4 | Yes |
| PRST-03 | Phase 4 | Yes |
| INTG-01 | Phase 5 | Yes |
| INTG-02 | Phase 5 | Yes |

**Coverage:** 18/18 v1 requirements mapped (100%)
**Orphaned:** 0 requirements

---

*Roadmap created: 2026-01-17*
*Last updated: 2026-01-18 after Phase 4 execution*
