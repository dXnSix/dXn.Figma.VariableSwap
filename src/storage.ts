import { STORAGE_KEYS } from './constants';
import type { PluginMessage, ScopeMode } from './types';

// Load mapping from storage (prefers saved over draft)
export async function loadMapping(): Promise<string | null> {
  try {
    const saved = await figma.clientStorage.getAsync(STORAGE_KEYS.SAVED_MAPPING);
    if (saved) return saved;

    const draft = await figma.clientStorage.getAsync(STORAGE_KEYS.DRAFT_MAPPING);
    return draft || null;
  } catch (error) {
    console.error('Failed to load mapping:', error);
    return null;
  }
}

// Save confirmed mapping and clear draft
export async function saveMapping(json: string): Promise<boolean> {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEYS.SAVED_MAPPING, json);
    await figma.clientStorage.deleteAsync(STORAGE_KEYS.DRAFT_MAPPING);
    return true;
  } catch (error) {
    console.error('Failed to save mapping:', error);
    figma.ui.postMessage({
      type: 'storage-error',
      error: 'Could not save mapping. Storage may be full.'
    } as PluginMessage);
    return false;
  }
}

// Save draft (auto-save as user types)
export async function saveDraft(json: string): Promise<boolean> {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEYS.DRAFT_MAPPING, json);
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    // No UI notification for draft failures - too noisy
    return false;
  }
}

// Load scope preference from storage
export async function loadScope(): Promise<ScopeMode> {
  try {
    const scope = await figma.clientStorage.getAsync(STORAGE_KEYS.SCOPE_PREFERENCE);
    if (scope === 'document' || scope === 'page' || scope === 'selection') {
      return scope;
    }
    return 'selection';
  } catch (error) {
    return 'selection';
  }
}

// Save scope preference to storage
export async function saveScope(scope: ScopeMode): Promise<void> {
  await figma.clientStorage.setAsync(STORAGE_KEYS.SCOPE_PREFERENCE, scope);
}
