import { findMatchingNewVariable, findMatchingNewVariableForStroke } from './matchingEngine';
import { findVariableByName } from './variableLookup';
import { processScalarVariables } from './variableProcessor';
import { processStyles } from './styleProcessor';
import type { VariableMappingTable, StyleMappingTable } from './types';

type StyleMappings = {
  paint: StyleMappingTable;
  text: StyleMappingTable;
  effect: StyleMappingTable;
  grid: StyleMappingTable;
};

// Recursive function to process nodes and their children
export async function processNode(
  node: SceneNode,
  variableMapping: VariableMappingTable,
  styleMappings: StyleMappings,
  changesMade: number
): Promise<number> {
  // Process fills - check all solid fills for variable or color match
  if ('fills' in node && Array.isArray(node.fills)) {
    const mutableFills = [...node.fills];
    let fillsModified = false;

    for (let i = 0; i < node.fills.length; i++) {
      const fill = node.fills[i];
      if (fill.type !== 'SOLID') continue;

      const newVariableName = await findMatchingNewVariable(fill, i, node, variableMapping);
      if (newVariableName) {
        const newVariable = await findVariableByName(newVariableName);
        if (newVariable) {
          console.log(`Node "${node.name}" fill ${i}: ${newVariableName}`);
          mutableFills[i] = figma.variables.setBoundVariableForPaint(fill, 'color', newVariable);
          fillsModified = true;
          changesMade++;
        } else {
          figma.notify(`Variable "${newVariableName}" not found`, { error: true });
        }
      }
    }

    if (fillsModified) {
      node.fills = mutableFills;
    }
  }

  // Process strokes - check all solid strokes for variable or color match
  if ('strokes' in node && Array.isArray(node.strokes)) {
    const mutableStrokes = [...node.strokes];
    let strokesModified = false;

    for (let i = 0; i < node.strokes.length; i++) {
      const stroke = node.strokes[i];
      if (stroke.type !== 'SOLID') continue;

      const newVariableName = await findMatchingNewVariableForStroke(stroke, i, node, variableMapping);
      if (newVariableName) {
        const newVariable = await findVariableByName(newVariableName);
        if (newVariable) {
          console.log(`Node "${node.name}" stroke ${i}: ${newVariableName}`);
          mutableStrokes[i] = figma.variables.setBoundVariableForPaint(stroke, 'color', newVariable);
          strokesModified = true;
          changesMade++;
        } else {
          figma.notify(`Variable "${newVariableName}" not found`, { error: true });
        }
      }
    }

    if (strokesModified) {
      node.strokes = mutableStrokes;
    }
  }

  // Process scalar variable bindings (spacing, dimensions, corner radius, etc.)
  changesMade += await processScalarVariables(node, variableMapping);

  // Process style replacements
  changesMade += await processStyles(node, styleMappings);

  // Process children nodes
  if ("children" in node) {
    for (const child of node.children) {
      changesMade = await processNode(child, variableMapping, styleMappings, changesMade);
    }
  }

  return changesMade;
}
