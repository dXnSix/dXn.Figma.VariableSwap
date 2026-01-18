# Requirements: VarSwap

**Defined:** 2026-01-17
**Core Value:** Flexible variable swapping without code changes — designers paste their own mappings and run.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FNDN-01**: Plugin initializes correctly without errors (fix duplicate main() call)
- [x] **FNDN-02**: UI and plugin communicate via typed message contracts
- [x] **FNDN-03**: Errors display to users via figma.notify (not just console)

### JSON Input

- [x] **JSON-01**: User can paste JSON mappings into textarea
- [x] **JSON-02**: JSON validated for syntax errors with clear messages
- [x] **JSON-03**: JSON schema validated (required "mapping" array with "old" and "new" fields)
- [x] **JSON-04**: Run button disabled when JSON is invalid
- [x] **JSON-05**: Multiple old sources can map to single new variable (old is array)

### Color Matching

- [x] **COLR-01**: Match fills/strokes by old variable name (existing behavior, configurable)
- [x] **COLR-02**: Match fills/strokes by hardcoded hex color (#FFF, #FFFFFF, #FFFFFFFF)
- [x] **COLR-03**: Match fills/strokes by hardcoded rgba color (rgba(0, 0, 0, 1))
- [x] **COLR-04**: Normalize color formats for comparison (#FFF = #FFFFFF)
- [x] **COLR-05**: Tolerance-based color comparison for floating-point precision

### Persistence

- [ ] **PRST-01**: Save current mapping to Figma clientStorage
- [ ] **PRST-02**: Load previously saved mapping on plugin open
- [ ] **PRST-03**: Auto-save draft mapping as user types

### Integration

- [ ] **INTG-01**: Full end-to-end flow works: load → validate → run → report
- [ ] **INTG-02**: Success/failure count reported after swap operation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Features

- **ENHC-01**: Dry run / preview mode showing what would change
- **ENHC-02**: Progress indicator for large selections
- **ENHC-03**: Change report / log export
- **ENHC-04**: Clickable error navigation to affected nodes
- **ENHC-05**: Named saved mappings (multiple saved configurations)
- **ENHC-06**: Import/export mappings as JSON file

### Advanced Matching

- **ADVN-01**: Gradient color variable support
- **ADVN-02**: HSL color format matching
- **ADVN-03**: Fuzzy variable name matching
- **ADVN-04**: Regex pattern matching for variable names

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| OAuth or external API integration | Plugin runs entirely in Figma sandbox |
| Real-time collaboration | Single-user operation per run |
| Undo grouping | Deferred (noted in CONCERNS.md as improvement) |
| Mobile support | Desktop Figma only |
| Variable creation | Only swaps existing variables, doesn't create new ones |
| Batch file processing | One document at a time |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Complete |
| FNDN-02 | Phase 1 | Complete |
| FNDN-03 | Phase 1 | Complete |
| JSON-01 | Phase 2 | Complete |
| JSON-02 | Phase 2 | Complete |
| JSON-03 | Phase 2 | Complete |
| JSON-04 | Phase 2 | Complete |
| JSON-05 | Phase 2 | Complete |
| COLR-01 | Phase 3 | Complete |
| COLR-02 | Phase 3 | Complete |
| COLR-03 | Phase 3 | Complete |
| COLR-04 | Phase 3 | Complete |
| COLR-05 | Phase 3 | Complete |
| PRST-01 | Phase 4 | Pending |
| PRST-02 | Phase 4 | Pending |
| PRST-03 | Phase 4 | Pending |
| INTG-01 | Phase 5 | Pending |
| INTG-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-17*
*Last updated: 2026-01-17 after Phase 3 completion*
