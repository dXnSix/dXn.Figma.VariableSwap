# Research Summary: VarSwap Figma Plugin - Milestone 2

**Project:** VarSwap Figma Plugin - JSON Mapping Input
**Synthesized:** 2026-01-17
**Overall Confidence:** HIGH

---

## Executive Summary

VarSwap is a Figma plugin for swapping design system variables, expanding to support JSON-configurable mappings, hardcoded color matching, and persistence. The research confirms this is a well-understood problem domain with established patterns from Figma's official APIs and existing community plugins.

**The recommended approach is minimal:** Stay with vanilla TypeScript, use Figma's built-in utilities (`figma.util.rgba()` for color parsing, `figma.clientStorage` for persistence, native `JSON.parse()` for validation), and maintain the single-file architecture. No bundler or external libraries are needed for this scope.

**Key risks are technical, not architectural:** The main pitfalls involve RGB value range mismatches (0-1 vs 0-255), floating-point color comparison precision, and the two-context plugin/UI message passing architecture. All have documented solutions. One immediate bug exists: `main()` is called twice in the current codebase and must be fixed first.

---

## Key Findings

### From STACK.md: Technology Decisions

| Technology | Purpose | Confidence |
|------------|---------|------------|
| `figma.util.rgba()` | Parse hex/rgb/rgba/hsl color strings | HIGH |
| Native `JSON.parse()` | Parse and validate mapping JSON | HIGH |
| `figma.clientStorage` | Persist user mappings locally (5MB limit) | HIGH |
| TypeScript Compiler | Build (no bundler needed) | HIGH |
| Vanilla JavaScript | UI logic (no React/Vue needed) | HIGH |

**Key insight:** Figma's built-in APIs handle all color formats and persistence needs. Adding external libraries would increase complexity without benefit.

### From FEATURES.md: Feature Prioritization

**Must Have (MVP):**
1. JSON textarea for mappings (replaces hardcoded config)
2. Validation with clear error messages before running
3. Match by variable name (existing, now configurable)
4. Match by hardcoded color value (hex, rgba)
5. Color normalization (#FFF = #FFFFFF)
6. Array of old sources mapping to single new variable
7. Persistence via clientStorage (save/load mappings)

**Defer to Post-MVP:**
- Dry run / preview mode
- Progress indicator for large files
- Change report / log export
- Gradient support
- Clickable error navigation

**Key insight:** VarSwap's niche is flexible, JSON-based mapping from multiple sources (old variables AND hardcoded colors) to new variables. This fills a gap in the competitive landscape.

### From ARCHITECTURE.md: System Design

**Two-Context Architecture:**
- **UI (iframe):** Textarea input, local JSON validation, display errors
- **Plugin (sandbox):** Figma API access, variable lookup, clientStorage, swap execution
- **Communication:** Typed message contracts via `postMessage`

**Validation Strategy:**
- **UI-side:** JSON syntax, required fields (immediate feedback)
- **Plugin-side:** Variable existence, selection validity (requires Figma context)

**Recommended Build Order:**
1. Message infrastructure (foundation for all features)
2. UI with local validation (immediate value)
3. Plugin-side validation (connects to core logic)
4. Storage layer (save/load mappings)
5. Polish (draft auto-save, UX improvements)

**Key insight:** Establish message passing pattern early. All subsequent features depend on reliable UI-plugin communication.

### From PITFALLS.md: Critical Risks

| Pitfall | Severity | Prevention |
|---------|----------|------------|
| RGB 0-1 vs 0-255 range mismatch | CRITICAL | Use `figma.util.rgba()` which returns Figma-native 0-1 values |
| Floating-point color comparison fails | CRITICAL | Use tolerance-based comparison (0.001) or 8-bit precision |
| No UI message handler | CRITICAL | Set up `figma.ui.onmessage` before any UI work |
| `main()` called twice (CURRENT BUG) | CRITICAL | Remove duplicate call immediately |
| clientStorage quota/async errors | CRITICAL | Wrap in try-catch, always await, provide user feedback |

**Key insight:** Most pitfalls are well-documented with clear solutions. The `main()` duplicate call is a current bug that must be fixed in the first phase.

---

## Implications for Roadmap

### Suggested Phase Structure

Based on dependencies and risk mitigation, I recommend **5 phases**:

#### Phase 1: Foundation

**Rationale:** Fix existing bugs and establish patterns before adding features. Message passing is the foundation for all UI features.

**Delivers:**
- Fixed duplicate `main()` call
- Message passing infrastructure between UI and plugin
- Typed message contracts
- Error handling pattern with user feedback

**Features from FEATURES.md:** None (infrastructure only)

**Pitfalls to avoid:**
- main() called multiple times (P5 - fix immediately)
- No UI message handler (P3 - establish pattern)
- Errors only in console (P11 - add figma.notify)

**Research flag:** Standard patterns - no additional research needed.

#### Phase 2: JSON Input and Validation

**Rationale:** User input capability is prerequisite for all configuration features. Validation prevents garbage-in problems.

**Delivers:**
- Textarea UI for JSON mapping input
- UI-side JSON syntax validation
- Plugin-side variable existence validation
- Clear error messages before running
- Run button enabled/disabled based on validity

**Features from FEATURES.md:**
- JSON/config input (table stakes)
- Input validation before run (table stakes)
- Clear error messages (table stakes)

**Pitfalls to avoid:**
- JSON schema too strict/loose (P8 - support simple key-value format)
- Validation only in plugin (anti-pattern - split between UI and plugin)

**Research flag:** Standard patterns - no additional research needed.

#### Phase 3: Color Parsing and Matching

**Rationale:** Color matching is the core value proposition. Depends on validation layer from Phase 2.

**Delivers:**
- Parse hex colors (all formats: #FFF, #FFFFFF, #FFFFFFFF)
- Parse rgba colors (multiple CSS syntaxes)
- Tolerance-based color comparison
- Match hardcoded colors to new variables
- Distinguish bound variables from hardcoded colors

**Features from FEATURES.md:**
- Match by hardcoded color value (table stakes)
- Color format normalization (table stakes)
- Array of old sources mapping to single new variable (table stakes)

**Pitfalls to avoid:**
- RGB 0-1 vs 0-255 mismatch (P1 - use figma.util.rgba())
- Floating-point precision (P2 - tolerance-based comparison)
- Hex edge cases (P6 - handle all formats)
- RGBA parsing complexity (P7 - handle CSS variations)
- Hardcoded vs bound confusion (P10 - check boundVariables first)

**Research flag:** May need deeper research on edge cases. Consider `/gsd:research-phase` for color matching algorithms if issues arise.

#### Phase 4: Persistence

**Rationale:** Save/load mappings is high user value, but depends on working input/validation from Phase 2.

**Delivers:**
- Save mapping to clientStorage with name
- Load mapping from clientStorage
- List saved mappings
- Delete mapping
- Draft auto-save (preserve textarea between opens)
- Last-used mapping auto-load

**Features from FEATURES.md:**
- Persist mappings between sessions (table stakes)

**Pitfalls to avoid:**
- clientStorage quota errors (P4 - wrap in try-catch)
- Async storage errors (P4 - always await)

**Research flag:** Standard patterns - no additional research needed.

#### Phase 5: Integration and Polish

**Rationale:** Connect all features, optimize performance, improve UX.

**Delivers:**
- Full end-to-end flow: load mapping -> validate -> run swap -> report results
- Performance optimization for large documents
- Enhanced error reporting with specific failure details
- Loading states during async operations

**Features from FEATURES.md:**
- Completes all table stakes integration

**Pitfalls to avoid:**
- Performance degradation (P9 - enable skipInvisibleInstanceChildren, scope to selection)
- Case sensitivity (P12 - normalize names)

**Research flag:** Standard patterns - no additional research needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations backed by official Figma docs |
| Features | MEDIUM-HIGH | Based on competitive analysis, may need user validation |
| Architecture | HIGH | Standard Figma plugin patterns, well-documented |
| Pitfalls | HIGH | All verified against official documentation and community reports |

### Gaps to Address During Planning

1. **Mapping JSON schema**: Research shows simple `{ "oldVar": "newVar" }` is sufficient, but may need to support array-of-sources format per PROJECT.md requirements. Define exact schema in Phase 2 spec.

2. **Performance thresholds**: Research mentions large documents but doesn't quantify. Consider testing with real production files (1000+ nodes) during Phase 5 implementation.

3. **Multi-mode matching**: Current research covers variable-name and hardcoded-color matching separately. Need to define priority/order when both could match.

---

## Sources (Aggregated)

### Official Figma Documentation (HIGH confidence)
- [Figma Plugin API - RGB/RGBA](https://developers.figma.com/docs/plugins/api/RGB/)
- [Figma Plugin API - figma.util](https://developers.figma.com/docs/plugins/api/figma-util/)
- [Figma Plugin API - clientStorage](https://developers.figma.com/docs/plugins/api/figma-clientStorage/)
- [Figma Plugin Docs - Creating UI](https://www.figma.com/plugin-docs/creating-ui/)
- [Figma Plugin Docs - postMessage](https://www.figma.com/plugin-docs/api/properties/figma-ui-postmessage/)
- [Figma Plugin Docs - skipInvisibleInstanceChildren](https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/)
- [Figma Plugin API - Libraries and Bundling](https://developers.figma.com/docs/plugins/libraries-and-bundling/)

### Figma Community Plugins (MEDIUM-HIGH confidence)
- [Swap Variables (qurle)](https://www.figma.com/community/plugin/1349108836145173291/swap-variables)
- [Variables Pro](https://www.figma.com/community/plugin/1264578192495051449/variables-pro-swap-import-export-variables)
- [Variables Toolkit](https://www.figma.com/community/plugin/1440309603281677828/variables-toolkit-find-swap-and-bind-variables)

### Community Sources (MEDIUM confidence)
- [Figma Forum - RGB rounding error](https://forum.figma.com/report-a-problem-6/figma-s-rgb-color-values-seem-to-have-a-rounding-error-34819)
- [Figma Forum - Get applied color variable](https://forum.figma.com/ask-the-community-7/how-to-get-the-applied-color-variable-in-a-figma-plugin-37783)
- [Evil Martians - Figma Plugin Best Practices](https://evilmartians.com/chronicles/how-to-make-next-level-figma-plugins-auth-routing-storage-and-more)
