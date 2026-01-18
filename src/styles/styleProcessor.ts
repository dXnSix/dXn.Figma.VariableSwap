import {
  findPaintStyleByName,
  findTextStyleByName,
  findEffectStyleByName,
  findGridStyleByName,
} from './styleLookup';
import type { StyleMappingTable } from '../helpers/types';

type StyleMappings = {
  paint: StyleMappingTable;
  text: StyleMappingTable;
  effect: StyleMappingTable;
  grid: StyleMappingTable;
};

// Process fill style on a node
async function processFillStyle(
  node: SceneNode,
  paintMapping: StyleMappingTable
): Promise<number> {
  if (!('fillStyleId' in node)) return 0;

  const styleId = node.fillStyleId;
  if (!styleId || styleId === '' || typeof styleId === 'symbol') return 0;

  const currentStyle = await figma.getStyleByIdAsync(styleId);
  if (!currentStyle) return 0;

  const newStyleName = paintMapping[currentStyle.name];
  if (!newStyleName) return 0;

  const newStyle = await findPaintStyleByName(newStyleName);
  if (!newStyle) {
    figma.notify(`Paint style "${newStyleName}" not found`, { error: true });
    return 0;
  }

  try {
    await (node as SceneNode & { setFillStyleIdAsync: (id: string) => Promise<void> })
      .setFillStyleIdAsync(newStyle.id);
    console.log(`Node "${node.name}" fill style: ${currentStyle.name} -> ${newStyleName}`);
    return 1;
  } catch (error) {
    console.error(`Failed to set fill style on "${node.name}":`, error);
    return 0;
  }
}

// Process stroke style on a node
async function processStrokeStyle(
  node: SceneNode,
  paintMapping: StyleMappingTable
): Promise<number> {
  if (!('strokeStyleId' in node)) return 0;

  const styleId = node.strokeStyleId;
  if (!styleId || styleId === '' || typeof styleId === 'symbol') return 0;

  const currentStyle = await figma.getStyleByIdAsync(styleId);
  if (!currentStyle) return 0;

  const newStyleName = paintMapping[currentStyle.name];
  if (!newStyleName) return 0;

  const newStyle = await findPaintStyleByName(newStyleName);
  if (!newStyle) {
    figma.notify(`Paint style "${newStyleName}" not found`, { error: true });
    return 0;
  }

  try {
    await (node as SceneNode & { setStrokeStyleIdAsync: (id: string) => Promise<void> })
      .setStrokeStyleIdAsync(newStyle.id);
    console.log(`Node "${node.name}" stroke style: ${currentStyle.name} -> ${newStyleName}`);
    return 1;
  } catch (error) {
    console.error(`Failed to set stroke style on "${node.name}":`, error);
    return 0;
  }
}

// Process text style on a node
async function processTextStyle(
  node: SceneNode,
  textMapping: StyleMappingTable
): Promise<number> {
  if (node.type !== 'TEXT') return 0;
  if (!('textStyleId' in node)) return 0;

  const styleId = node.textStyleId;
  if (!styleId || styleId === '' || typeof styleId === 'symbol') return 0;

  const currentStyle = await figma.getStyleByIdAsync(styleId);
  if (!currentStyle) return 0;

  const newStyleName = textMapping[currentStyle.name];
  if (!newStyleName) return 0;

  const newStyle = await findTextStyleByName(newStyleName);
  if (!newStyle) {
    figma.notify(`Text style "${newStyleName}" not found`, { error: true });
    return 0;
  }

  try {
    await (node as TextNode).setTextStyleIdAsync(newStyle.id);
    console.log(`Node "${node.name}" text style: ${currentStyle.name} -> ${newStyleName}`);
    return 1;
  } catch (error) {
    console.error(`Failed to set text style on "${node.name}":`, error);
    return 0;
  }
}

// Process effect style on a node
async function processEffectStyle(
  node: SceneNode,
  effectMapping: StyleMappingTable
): Promise<number> {
  if (!('effectStyleId' in node)) return 0;

  const styleId = node.effectStyleId;
  if (!styleId || styleId === '' || typeof styleId === 'symbol') return 0;

  const currentStyle = await figma.getStyleByIdAsync(styleId);
  if (!currentStyle) return 0;

  const newStyleName = effectMapping[currentStyle.name];
  if (!newStyleName) return 0;

  const newStyle = await findEffectStyleByName(newStyleName);
  if (!newStyle) {
    figma.notify(`Effect style "${newStyleName}" not found`, { error: true });
    return 0;
  }

  try {
    await (node as SceneNode & { setEffectStyleIdAsync: (id: string) => Promise<void> })
      .setEffectStyleIdAsync(newStyle.id);
    console.log(`Node "${node.name}" effect style: ${currentStyle.name} -> ${newStyleName}`);
    return 1;
  } catch (error) {
    console.error(`Failed to set effect style on "${node.name}":`, error);
    return 0;
  }
}

// Process grid style on a node
async function processGridStyle(
  node: SceneNode,
  gridMapping: StyleMappingTable
): Promise<number> {
  if (!('gridStyleId' in node)) return 0;

  const styleId = node.gridStyleId;
  if (!styleId || styleId === '' || typeof styleId === 'symbol') return 0;

  const currentStyle = await figma.getStyleByIdAsync(styleId);
  if (!currentStyle) return 0;

  const newStyleName = gridMapping[currentStyle.name];
  if (!newStyleName) return 0;

  const newStyle = await findGridStyleByName(newStyleName);
  if (!newStyle) {
    figma.notify(`Grid style "${newStyleName}" not found`, { error: true });
    return 0;
  }

  try {
    await (node as SceneNode & { setGridStyleIdAsync: (id: string) => Promise<void> })
      .setGridStyleIdAsync(newStyle.id);
    console.log(`Node "${node.name}" grid style: ${currentStyle.name} -> ${newStyleName}`);
    return 1;
  } catch (error) {
    console.error(`Failed to set grid style on "${node.name}":`, error);
    return 0;
  }
}

// Process all styles on a node
export async function processStyles(
  node: SceneNode,
  styleMappings: StyleMappings
): Promise<number> {
  let changesMade = 0;

  // Only process styles if mappings exist
  if (Object.keys(styleMappings.paint).length > 0) {
    changesMade += await processFillStyle(node, styleMappings.paint);
    changesMade += await processStrokeStyle(node, styleMappings.paint);
  }

  if (Object.keys(styleMappings.text).length > 0) {
    changesMade += await processTextStyle(node, styleMappings.text);
  }

  if (Object.keys(styleMappings.effect).length > 0) {
    changesMade += await processEffectStyle(node, styleMappings.effect);
  }

  if (Object.keys(styleMappings.grid).length > 0) {
    changesMade += await processGridStyle(node, styleMappings.grid);
  }

  return changesMade;
}
