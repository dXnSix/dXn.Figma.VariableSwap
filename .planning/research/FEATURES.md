# Feature Landscape: Design System Migration / Variable Swap Plugins

**Domain:** Figma plugins for variable swapping and design system migration
**Researched:** 2026-01-17
**Overall Confidence:** MEDIUM-HIGH (multiple plugins surveyed, patterns consistent)

## Table Stakes

Features users expect from any variable swap / migration tool. Missing these makes the plugin feel incomplete or broken.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Swap variables by name** | Core use case - map old variable names to new ones | Low | None | VarSwap already has this |
| **Process selection recursively** | Users select parent frames expecting children to be processed | Low | None | VarSwap already has this |
| **Handle fills and strokes** | Both are common color applications | Low | None | VarSwap already has this |
| **Team library variable lookup** | Many design systems use published libraries | Medium | None | VarSwap already has this |
| **User feedback on completion** | Users need to know how many changes were made | Low | None | VarSwap has basic notify |
| **Clear error messages** | Users shouldn't guess why a swap failed | Medium | None | Missing from VarSwap |
| **JSON/config input** | Mappings change per project, hardcoding is inflexible | Medium | None | Planned for VarSwap |
| **Persist mappings between sessions** | Re-entering mappings every time is tedious | Medium | clientStorage API | Planned for VarSwap |
| **Color format normalization** | #FFF, #FFFFFF, rgb(255,255,255) should be treated as equal | Medium | None | Planned for VarSwap |
| **Match by hardcoded color value** | Many designs have un-variabled colors that need migration | Medium | Color normalization | Planned for VarSwap |
| **Input validation before run** | Fail fast with clear messages vs silent failures | Medium | JSON input | Planned for VarSwap |

**Table Stakes Summary:** VarSwap has the core swapping functionality. The planned features (JSON config, persistence, hardcoded color matching, validation) round out what users expect from a usable tool.

## Differentiators

Features that set a plugin apart. Not expected, but valued by users. Consider these for post-MVP or v2.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Dry run / preview mode** | See what would change before committing | High | Separate scan vs apply logic | [Variables Toolkit](https://www.figma.com/community/plugin/1440309603281677828/variables-toolkit-find-swap-and-bind-variables), [Check Designs](https://www.figma.com/blog/schema-2025-design-systems-recap/) native feature does this |
| **Undo grouping** | Single undo reverts entire operation | Medium | Figma API limitations | Not natively supported well; would require custom implementation |
| **Progress indicator** | Visual feedback during large file processing | Medium | Async processing architecture | Important for files with 1000+ nodes |
| **Change report / log export** | Document what was changed for review | Medium | Tracking data structure | Useful for auditing migrations |
| **Clickable error navigation** | Click error to zoom to problem layer | Medium | Error tracking + viewport API | [Swap Variables by qurle](https://github.com/qurle/swap-variables) has this |
| **Batch mode (multiple selections)** | Run across multiple pages or frames at once | High | Multi-page architecture | Reduces repetitive runs |
| **Import/export mappings as file** | Share configs between team members | Medium | File I/O | Beyond clientStorage; enables team collaboration |
| **Variable collection filtering** | Show only relevant collections in UI | Low-Medium | Variable API queries | Reduces noise when many collections exist |
| **Bidirectional swap** | Swap A->B or B->A with same config | Low | Mapping data structure | Useful for testing or reverting |
| **Smart matching suggestions** | Suggest mappings based on name similarity | High | Fuzzy matching algorithm | AI-adjacent feature; Figma's native "Check Designs" does this |
| **Gradient support** | Swap variables in gradient stops | Medium | Gradient-specific API handling | [Swap Variables](https://www.figma.com/community/plugin/1349108836145173291/swap-variables) supports this |
| **Missing variable detection** | Find and report broken/missing variable references | Medium | Variable resolution checks | [Varifind](https://www.figma.com/community/plugin/1585977858108291780/varifind-find-and-fix-missing-variables-in-figma), [Broken Variables Finder](https://www.figma.com/community/plugin/1496052062236056981/broken-variables-finder) plugins exist for this |

**Differentiator Priority for VarSwap:**
1. **Progress indicator** - Low effort, high impact for large files
2. **Change report** - Helps users verify migrations went correctly
3. **Dry run mode** - Higher effort but addresses real user anxiety about bulk changes

## Anti-Features

Features to explicitly NOT build. Either too complex for the value, not suited for this use case, or actively harmful to UX.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full design token management** | Scope creep into Tokens Studio territory | Stay focused on swap/migration; don't recreate token management |
| **OAuth / external API integration** | Breaks Figma sandbox security model, adds complexity | Keep plugin self-contained; use copy-paste for configs |
| **Real-time sync with external systems** | Requires backend, complicates architecture | Export mappings as JSON files manually |
| **AI-powered auto-mapping** | High complexity, unpredictable results | Let users define explicit mappings; maybe add fuzzy matching later |
| **Form builder UI for mappings** | Complex to build, less flexible than JSON | JSON textarea is faster to implement and more powerful |
| **Multi-user collaboration** | Outside Figma's single-user plugin model | Let teams share mapping JSON files externally |
| **Custom variable creation** | Outside scope of swap/migration | Use native Figma or Tokens Studio for variable creation |
| **Style-to-variable conversion** | Different problem space, plugins already exist | Focus on variable-to-variable and hardcoded-to-variable |
| **Cross-file swapping** | Complex, limited API support, unreliable | Process one file at a time; user copies mappings |
| **Deep effects swapping** | Shadows, blurs rarely need migration | Focus on fills/strokes; add effects only if users request |

## Feature Dependencies

```
Core Flow:
  JSON Input ──> Validation ──> Mapping Parse ──> Node Scan ──> Variable Swap ──> Report

Dependency Chain:
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Color Normalization                                                  │
  │   └── Required for: Hardcoded color matching                        │
  ├─────────────────────────────────────────────────────────────────────┤
  │ JSON Input                                                           │
  │   └── Required for: Validation, Persistence                         │
  ├─────────────────────────────────────────────────────────────────────┤
  │ Validation                                                           │
  │   └── Required for: Clean error messages                            │
  ├─────────────────────────────────────────────────────────────────────┤
  │ Persistence (clientStorage)                                          │
  │   └── Optional but enhances: JSON Input (loads last config)         │
  ├─────────────────────────────────────────────────────────────────────┤
  │ Node Scanning                                                        │
  │   └── Required for: Progress indicator (need count first)           │
  │   └── Required for: Dry run mode (scan without apply)               │
  │   └── Required for: Change report (track what changed)              │
  └─────────────────────────────────────────────────────────────────────┘

Independent Features (no dependencies):
  - Gradient support (extends existing fill handling)
  - Clickable error navigation (extends error reporting)
  - Variable collection filtering (UI enhancement)
```

## MVP Recommendation

Based on PROJECT.md's Active requirements, VarSwap's MVP should include all table stakes:

**Must Have (MVP):**
1. JSON textarea for mappings (replaces hardcoded config)
2. Validation with clear error messages before running
3. Match by variable name (existing, now configurable)
4. Match by hardcoded color value (hex, rgba)
5. Color normalization (#FFF = #FFFFFF)
6. Array of old sources mapping to single new variable
7. Persistence via clientStorage (save/load mappings)

**Defer to Post-MVP:**
- Dry run / preview mode - Higher complexity, nice-to-have
- Progress indicator - Good for large files, but not blocking
- Change report / log export - Useful for auditing, not essential
- Gradient support - Edge case, most colors are solid fills
- Clickable error navigation - Polish feature

## Competitive Landscape

| Plugin | Strengths | Gaps VarSwap Can Fill |
|--------|-----------|----------------------|
| [Swap Variables (qurle)](https://www.figma.com/community/plugin/1349108836145173291/swap-variables) | Clickable errors, gradient support, multipage | No hardcoded color matching, no user config |
| [Variables Pro](https://www.figma.com/community/plugin/1264578192495051449/variables-pro-swap-import-export-variables) | Import/export JSON, full format support | Complex paid product; VarSwap is simpler, focused |
| [Variables Toolkit](https://www.figma.com/community/plugin/1440309603281677828/variables-toolkit-find-swap-and-bind-variables) | Find + swap + bind in one | No hardcoded color matching |
| [Bind Colors to Variables](https://www.figma.com/community/plugin/1273085764158763752/bind-colors-to-variables) | Auto-binds hex to matching variables | No mapping control; auto-match only |
| [Find and Replace Colors](https://www.figma.com/community/plugin/806266638862897503/find-and-replace-colors) | Hex-to-hex replacement | Colors only, no variables |

**VarSwap's Niche:** Flexible, configurable mapping from multiple sources (old variables AND hardcoded colors) to new variables. JSON-based for power users who want explicit control.

## Native Figma Features to Consider

Figma has added native features that overlap with some plugin functionality:

| Native Feature | Impact on VarSwap |
|----------------|------------------|
| [Check Designs](https://www.figma.com/blog/schema-2025-design-systems-recap/) (Oct 2025) | Flags hardcoded values, suggests variables. Complementary - finds problems, VarSwap fixes them in bulk |
| [Native Token Import/Export](https://www.figma.com/blog/schema-2025-design-systems-recap/) (W3C DTCG 1.0) | For moving tokens between tools. Different use case than swapping within a file |
| Extended Collections | Multi-brand token support. VarSwap helps migrate INTO these new structures |

**Positioning:** VarSwap is a migration/cleanup tool. Native Figma features help you build the destination; VarSwap helps you get there from a messy starting point.

## Sources

**Figma Official / Schema 2025:**
- [Schema 2025: Design Systems For A New Era | Figma Blog](https://www.figma.com/blog/schema-2025-design-systems-recap/)
- [figma.clientStorage API Documentation](https://developers.figma.com/docs/plugins/api/figma-clientStorage/)

**Plugin Research:**
- [Swap Variables (qurle) | Figma Community](https://www.figma.com/community/plugin/1349108836145173291/swap-variables)
- [GitHub - qurle/swap-variables](https://github.com/qurle/swap-variables)
- [Variables Pro | Figma Community](https://www.figma.com/community/plugin/1264578192495051449/variables-pro-swap-import-export-variables)
- [Variables Toolkit | Figma Community](https://www.figma.com/community/plugin/1440309603281677828/variables-toolkit-find-swap-and-bind-variables)
- [Variable Utilities | Figma Community](https://www.figma.com/community/plugin/1271383289541400562/variable-utilities)
- [Bind Colors to Variables | Figma Community](https://www.figma.com/community/plugin/1273085764158763752/bind-colors-to-variables)
- [Find and Replace Colors | Figma Community](https://www.figma.com/community/plugin/806266638862897503/find-and-replace-colors)
- [Varifind | Figma Community](https://www.figma.com/community/plugin/1585977858108291780/varifind-find-and-fix-missing-variables-in-figma)
- [Broken Variables Finder | Figma Community](https://www.figma.com/community/plugin/1496052062236056981/broken-variables-finder)

**Design Systems Context:**
- [Design System Mastery with Figma Variables 2025/2026 | Design Systems Collective](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66)
- [What do Figma's updates mean for Design Systems? | UX Collective](https://uxdesign.cc/what-do-figmas-updates-mean-for-design-systems-323fb0cc8495)
- [Six Figma Plugins to Improve Your Design System Workflows | Supernova](https://www.supernova.io/blog/six-figma-plugins-to-improve-your-design-system-workflows)
- [Making Figma Plugins More Powerful with clientStorage | realvjy](https://story.vjy.me/making-figma-plugins-more-powerful-with-clientstorage-40)

**Community Discussions:**
- [Find a color and replace with a variable? | Figma Forum](https://forum.figma.com/ask-the-community-7/find-a-color-and-replace-with-a-variable-105)
- [Find and Replace Variables | Figma Forum](https://forum.figma.com/suggest-a-feature-11/find-and-replace-variables-29531)
- [Make it easier to fix broken variable references | Figma Forum](https://forum.figma.com/suggest-a-feature-11/make-it-easier-to-fix-broken-variable-references-33999)
