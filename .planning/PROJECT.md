# VarSwap

## What This Is

A Figma plugin that swaps color variables across selected design elements. Users paste JSON mappings to define which old variables (or hardcoded colors) should be replaced with new variables. Built for design system migrations where multiple sources (old variables, hex values, rgba values) need to consolidate into a unified variable system.

## Core Value

Flexible variable swapping without code changes — designers paste their own mappings and run.

## Requirements

### Validated

- Variable swapping from old variable names to new variables — existing
- Recursive processing of selected nodes and children — existing
- Support for both fills and strokes — existing
- Team library variable lookup — existing

### Active

- [ ] Textarea UI for pasting JSON variable mappings
- [ ] JSON validation with clear error messages before running
- [ ] Match fills/strokes by old variable name (existing behavior, now configurable)
- [ ] Match fills/strokes by hardcoded color value (hex like #FFF, rgba like rgba(0,0,0,1))
- [ ] Normalize color formats for comparison (#FFF = #FFFFFF)
- [ ] Support multiple old sources mapping to single new variable (old is array)
- [ ] Save mappings to Figma client storage
- [ ] Load previously saved mappings on plugin open

### Out of Scope

- OAuth or external API integration — plugin runs entirely in Figma sandbox
- Real-time collaboration features — single-user operation per run
- Undo grouping — deferred (noted in CONCERNS.md as improvement)
- Progress indicator for large selections — deferred

## Context

**Existing codebase state:**
- Single TypeScript file (`code.ts`) with ~200 lines
- Hardcoded `colorMapping` object with 29 variable name mappings
- HTML UI (`ui.html`) with basic "Run" button
- Uses Figma Plugin API for variable operations and team library access
- No test coverage, no CI/CD

**Known issues from codebase analysis:**
- `main()` called twice at end of file (critical bug)
- No UI message handler connecting Run button to execution
- Error messages only go to console, not visible to users
- Inefficient library variable search (no caching)

**JSON mapping structure:**
```json
{
  "mapping": [
    {
      "old": ["oldVariableName1", "oldVariableName2", "#FFF", "rgba(0, 0, 0, 1)"],
      "new": "newVariableName1"
    }
  ]
}
```

## Constraints

- **Platform**: Figma Plugin API only — no external network calls allowed (manifest restricts to "none")
- **Storage**: Figma `clientStorage` for persistence — limited to plugin-specific key-value store
- **UI**: HTML/CSS/JS in `ui.html` — no external frameworks available without bundling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JSON textarea over UI form builder | Flexibility for complex mappings, easy copy-paste from spreadsheets | — Pending |
| Normalize colors before comparison | #FFF and #FFFFFF are visually identical, should match | — Pending |
| Save to clientStorage | Users shouldn't re-paste every time; mappings are reusable | — Pending |
| Validate before run (strict) | Fail fast with clear errors vs silent partial failures | — Pending |

---
*Last updated: 2026-01-17 after initialization*
