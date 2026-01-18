# Phase 1: Foundation - Research

**Researched:** 2026-01-17
**Domain:** Figma Plugin UI-Plugin Communication and Error Handling
**Confidence:** HIGH

## Summary

Phase 1 addresses three critical foundation issues in the VarSwap plugin: a duplicate `main()` call causing double execution, missing UI-to-plugin communication (the Run button does nothing), and errors only appearing in the console (invisible to users).

The Figma plugin architecture mandates a two-context model: plugin code (sandbox with Figma API access) and UI (iframe with browser APIs). These contexts communicate exclusively through `postMessage`. The current codebase lacks this bridge - `ui.html` sends messages but `code.ts` has no handler to receive them.

**Primary recommendation:** Establish typed message contracts using TypeScript discriminated unions, remove the duplicate `main()` call, replace direct `main()` invocation with UI-triggered execution via `figma.ui.onmessage`, and wrap all error paths with `figma.notify()`.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @figma/plugin-typings | latest | TypeScript types for Figma Plugin API | Official Figma package, required for type safety |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript | ^5.3.2 | Type-safe development | Already in project, enables discriminated unions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual message typing | figwire/figma-await-ipc | Adds dependency for small plugin; overkill for simple message passing |
| Inline types | Separate types.ts file | For 3+ message types, separate file is cleaner; inline OK for foundation |

**Installation:**
No additional packages needed - @figma/plugin-typings already in devDependencies.

## Architecture Patterns

### Recommended Message Flow Structure
```
+------------------+                              +--------------------+
|     UI Layer     |                              |   Plugin Layer     |
|------------------|                              |--------------------|
| ui.html          |   ---- postMessage ---->     | code.ts            |
| - Run button     |   { pluginMessage: {...} }   | - figma.ui.onmessage|
|                  |   <---- postMessage ----     | - figma.notify()   |
|                  |   { type, data }             | - Swap execution   |
+------------------+                              +--------------------+
```

### Pattern 1: Discriminated Union Message Types
**What:** Define message types as a TypeScript discriminated union with a `type` property
**When to use:** Always for UI-plugin communication; enables exhaustive type checking
**Example:**
```typescript
// Source: https://developers.figma.com/docs/plugins/creating-ui/
// Combined with TypeScript discriminated union best practices

// UI -> Plugin messages
type UIMessage =
  | { type: 'run' }
  | { type: 'cancel' };

// Plugin -> UI messages (future expansion)
type PluginMessage =
  | { type: 'complete'; data: { changesMade: number } }
  | { type: 'error'; error: string };

// Handler with exhaustive checking
figma.ui.onmessage = (msg: UIMessage) => {
  switch (msg.type) {
    case 'run':
      runSwap();
      break;
    case 'cancel':
      figma.closePlugin();
      break;
    default:
      // Exhaustive check - TypeScript error if case missed
      const _exhaustiveCheck: never = msg;
  }
};
```

### Pattern 2: Entry Point with UI Handler
**What:** Initialize UI first, then wait for messages instead of auto-executing
**When to use:** When plugin has a UI that triggers actions
**Example:**
```typescript
// Source: https://developers.figma.com/docs/plugins/how-plugins-run/

// Initialize UI immediately
figma.showUI(__html__, { width: 300, height: 200 });

// Wait for UI messages - do NOT call main() directly
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'run') {
    try {
      const result = await runSwap();
      figma.closePlugin(`${result.changesMade} changes made.`);
    } catch (error) {
      figma.notify(error instanceof Error ? error.message : 'Unknown error', { error: true });
    }
  }
};
```

### Pattern 3: User-Facing Error Notifications
**What:** Use `figma.notify()` for all errors instead of console.log
**When to use:** Any error the user should know about
**Example:**
```typescript
// Source: https://developers.figma.com/docs/plugins/api/properties/figma-notify/

// Basic error notification
figma.notify('Variable not found: "Neutral/600"', { error: true });

// With timeout for important messages
figma.notify('No nodes selected', { error: true, timeout: 5000 });

// Success notification (default styling)
figma.notify('12 changes made');
```

### Anti-Patterns to Avoid
- **Duplicate entry point calls:** Never call `main()` multiple times; use IIFE or guard pattern
- **Console-only errors:** Users cannot see console.log in production; always use figma.notify
- **Missing message handler:** If UI sends messages, plugin MUST have `figma.ui.onmessage`
- **Untyped messages:** Always define TypeScript interfaces for message contracts

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UI-plugin messaging | Custom event system | figma.ui.onmessage / postMessage | Standard Figma API, well-documented |
| User notifications | Custom notification UI | figma.notify() | Native Figma look, auto-queuing, consistent UX |
| Type safety for messages | Runtime validation | TypeScript discriminated unions | Compile-time safety, exhaustive checking |
| Entry point guards | Global flag variables | IIFE pattern or event-driven architecture | Cleaner, impossible to call twice |

**Key insight:** The Figma Plugin API already provides the communication primitives. The only work is establishing the message contracts and wiring them together.

## Common Pitfalls

### Pitfall 1: main() Called Multiple Times
**What goes wrong:** Plugin entry point executes twice, causing all operations to run twice
**Why it happens:** Copy-paste errors (current codebase has `main(); main();` on lines 197-199)
**How to avoid:**
- Use event-driven architecture (UI message triggers execution)
- Or use IIFE: `(async function main() { ... })();`
- Or add execution guard: `let hasRun = false;`
**Warning signs:** Console logs appear twice, "X changes made" shows double the expected count

### Pitfall 2: No UI Message Handler
**What goes wrong:** UI button clicks have no effect; plugin appears broken
**Why it happens:** Forgetting that UI (iframe) and plugin (sandbox) are isolated contexts
**How to avoid:** Always set up `figma.ui.onmessage` when using `figma.showUI()`
**Warning signs:** Run button does nothing, no console output when clicking UI elements

### Pitfall 3: Errors Only in Console
**What goes wrong:** Plugin fails silently; users don't know what went wrong
**Why it happens:** Developer habit of using console.log for debugging
**How to avoid:** Use `figma.notify()` with `{ error: true }` for user-facing errors
**Warning signs:** Plugin returns "0 changes made" with no explanation

### Pitfall 4: Missing '*' in postMessage
**What goes wrong:** Messages from UI never reach plugin
**Why it happens:** Forgetting the second argument in `parent.postMessage()`
**How to avoid:** Always use: `parent.postMessage({ pluginMessage: data }, '*')`
**Warning signs:** No messages received in plugin despite UI code executing

### Pitfall 5: Forgetting pluginMessage Wrapper
**What goes wrong:** Plugin receives undefined instead of message data
**Why it happens:** UI messages must be wrapped in `{ pluginMessage: data }`
**How to avoid:** Check that UI uses `{ pluginMessage: { type: 'run' } }` format
**Warning signs:** `msg` is undefined or empty in onmessage handler

## Code Examples

Verified patterns from official sources:

### UI to Plugin Communication
```typescript
// Source: https://developers.figma.com/docs/plugins/creating-ui/

// ===== ui.html =====
document.getElementById('runButton').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'run' } }, '*');
};

// ===== code.ts =====
figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'run') {
    // Execute plugin logic
  }
};
```

### Plugin to UI Communication
```typescript
// Source: https://developers.figma.com/docs/plugins/api/properties/figma-ui-postmessage/

// ===== code.ts =====
figma.ui.postMessage({ type: 'complete', changesMade: 42 });

// ===== ui.html =====
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg.type === 'complete') {
    console.log(`${msg.changesMade} changes made`);
  }
};
```

### Error Notification Pattern
```typescript
// Source: https://developers.figma.com/docs/plugins/api/properties/figma-notify/

// Wrap operations in try-catch with user feedback
async function runSwap(): Promise<{ changesMade: number }> {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('No nodes selected', { error: true });
    return { changesMade: 0 };
  }

  try {
    const changesMade = await processSelection(selection);
    return { changesMade };
  } catch (error) {
    figma.notify(
      error instanceof Error ? error.message : 'Unknown error occurred',
      { error: true }
    );
    throw error; // Re-throw for caller handling
  }
}
```

### Complete Entry Point Pattern
```typescript
// Source: Combined from official docs

// Define message types
type UIMessage = { type: 'run' };

// Initialize UI
figma.showUI(__html__, { width: 300, height: 200 });

// Message handler - entry point for all UI-triggered actions
figma.ui.onmessage = async (msg: UIMessage) => {
  switch (msg.type) {
    case 'run':
      try {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          figma.notify('No nodes selected', { error: true });
          return;
        }

        let changesMade = 0;
        for (const node of selection) {
          changesMade += await processNode(node);
        }

        figma.closePlugin(`${changesMade} changes made.`);
      } catch (error) {
        figma.notify(
          error instanceof Error ? error.message : 'Error processing selection',
          { error: true }
        );
        console.error('Swap error:', error);
      }
      break;

    default:
      console.warn('Unknown message type:', msg.type);
  }
};

// DO NOT call main() here - wait for UI message
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auto-execute main() on load | Event-driven via onmessage | Standard practice | Plugin waits for user action |
| console.log for errors | figma.notify() with error flag | Standard practice | Users see errors in Figma UI |
| Untyped message passing | TypeScript discriminated unions | TypeScript adoption | Compile-time safety |
| Direct function calls | postMessage between contexts | Figma architecture | Required for UI plugins |

**Deprecated/outdated:**
- `figma.ui.on()` is an alternative to `figma.ui.onmessage` but less common in examples
- Synchronous patterns - all Figma variable operations are now async

## Open Questions

Things that couldn't be fully resolved:

1. **Message Type Location**
   - What we know: TypeScript interfaces can be inline or in separate file
   - What's unclear: Best location for small plugin (inline vs types.ts)
   - Recommendation: Keep inline in code.ts for Phase 1; extract to types.ts in later phases when complexity grows

2. **Error Recovery Strategy**
   - What we know: figma.notify shows errors, try-catch prevents crashes
   - What's unclear: Should plugin close on error or continue running?
   - Recommendation: For Phase 1, show error via notify but don't close plugin; let user retry

## Sources

### Primary (HIGH confidence)
- [Figma Developer Docs: Creating UI](https://developers.figma.com/docs/plugins/creating-ui/) - UI-plugin communication
- [Figma Developer Docs: onmessage](https://developers.figma.com/docs/plugins/api/properties/figma-ui-onmessage/) - Message handler API
- [Figma Developer Docs: postMessage](https://developers.figma.com/docs/plugins/api/properties/figma-ui-postmessage/) - Sending messages to UI
- [Figma Developer Docs: notify](https://developers.figma.com/docs/plugins/api/properties/figma-notify/) - User notifications
- [Figma Developer Docs: How Plugins Run](https://developers.figma.com/docs/plugins/how-plugins-run/) - Plugin lifecycle

### Secondary (MEDIUM confidence)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/play/typescript/meta-types/discriminate-types.ts.html) - Message typing pattern
- [Figma Forum: postMessage usage](https://forum.figma.com/ask-the-community-7/am-i-using-on-postmessage-correctly-7256) - Community patterns

### Tertiary (LOW confidence)
- None - all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Figma Plugin API, no alternatives needed
- Architecture: HIGH - Documented in official Figma developer docs
- Pitfalls: HIGH - Verified against existing codebase and official docs

**Research date:** 2026-01-17
**Valid until:** 60 days (stable API, patterns unlikely to change)
