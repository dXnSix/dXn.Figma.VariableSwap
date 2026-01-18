import { colorsMatch, tryParseColor } from './colorUtils';
import type { VariableMappingTable } from './types';

// Find matching new variable for a fill (checks bound variable first, then hardcoded color)
export async function findMatchingNewVariable(
  fill: SolidPaint,
  fillIndex: number,
  node: SceneNode,
  variableMapping: VariableMappingTable
): Promise<string | null> {
  // Priority 1: Match by bound variable name (COLR-01)
  if ('boundVariables' in node) {
    const boundVariable = node.boundVariables?.fills?.[fillIndex];
    if (boundVariable) {
      const variable = await figma.variables.getVariableByIdAsync(boundVariable.id);
      if (variable && variableMapping[variable.name]) {
        console.log(`  Matched by variable name: ${variable.name}`);
        return variableMapping[variable.name];
      }
    }
  }

  // Priority 2: Match by hardcoded color value (COLR-02, COLR-03)
  for (const [oldSource, newVariable] of Object.entries(variableMapping)) {
    const sourceColor = tryParseColor(oldSource);
    if (sourceColor && colorsMatch(fill.color, sourceColor)) {
      console.log(`  Matched by color value: ${oldSource}`);
      return newVariable;
    }
  }

  return null;
}

// Find matching new variable for a stroke (checks bound variable first, then hardcoded color)
export async function findMatchingNewVariableForStroke(
  stroke: SolidPaint,
  strokeIndex: number,
  node: SceneNode,
  variableMapping: VariableMappingTable
): Promise<string | null> {
  // Priority 1: Match by bound variable name (COLR-01)
  if ('boundVariables' in node) {
    const boundVariable = node.boundVariables?.strokes?.[strokeIndex];
    if (boundVariable) {
      const variable = await figma.variables.getVariableByIdAsync(boundVariable.id);
      if (variable && variableMapping[variable.name]) {
        console.log(`  Matched stroke by variable name: ${variable.name}`);
        return variableMapping[variable.name];
      }
    }
  }

  // Priority 2: Match by hardcoded color value (COLR-02, COLR-03)
  for (const [oldSource, newVariable] of Object.entries(variableMapping)) {
    const sourceColor = tryParseColor(oldSource);
    if (sourceColor && colorsMatch(stroke.color, sourceColor)) {
      console.log(`  Matched stroke by color value: ${oldSource}`);
      return newVariable;
    }
  }

  return null;
}
