import { runSwap } from './swapEngine';
import { loadMapping, saveMapping, saveDraft, loadScope, saveScope } from './storage';
import type { UIMessage, PluginMessage } from './types';

// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 390, themeColors: true });

// Handle messages from UI
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'run') {
    try {
      await runSwap(msg.mapping, msg.scope);
    } catch (error) {
      figma.notify(
        error instanceof Error ? error.message : 'An error occurred',
        { error: true }
      );
      console.error('Swap error:', error);
    }
  } else if (msg.type === 'load-mapping') {
    const json = await loadMapping();
    figma.ui.postMessage({ type: 'mapping-loaded', json } as PluginMessage);
  } else if (msg.type === 'save-mapping') {
    await saveMapping(msg.json);
  } else if (msg.type === 'save-draft') {
    await saveDraft(msg.json);
  } else if (msg.type === 'load-scope') {
    const scope = await loadScope();
    figma.ui.postMessage({ type: 'scope-loaded', scope } as PluginMessage);
  } else if (msg.type === 'save-scope') {
    await saveScope(msg.scope);
  }
};
