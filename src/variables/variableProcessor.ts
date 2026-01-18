import { findVariableByName } from './variableLookup';
import type { VariableMappingTable, ScalarProperty } from '../helpers/types';
import { ALL_SCALAR_PROPERTIES as SCALAR_PROPS } from '../helpers/types';

// Check if a property exists and is bindable on the node
function hasProperty(node: SceneNode, property: string): boolean {
  return property in node;
}

// Get the bound variable name for a scalar property
async function getBoundVariableName(
  node: SceneNode,
  property: ScalarProperty
): Promise<string | null> {
  if (!('boundVariables' in node) || !node.boundVariables) {
    return null;
  }

  const binding = (node.boundVariables as Record<string, VariableAlias | undefined>)[property];
  if (!binding || !('id' in binding)) {
    return null;
  }

  const variable = await figma.variables.getVariableByIdAsync(binding.id);
  return variable?.name || null;
}

// Process all scalar variable bindings on a node
export async function processScalarVariables(
  node: SceneNode,
  variableMapping: VariableMappingTable
): Promise<number> {
  let changesMade = 0;

  for (const property of SCALAR_PROPS) {
    // Skip if property doesn't exist on this node type
    if (!hasProperty(node, property)) {
      continue;
    }

    // Special handling for 'characters' - only on text nodes
    if (property === 'characters' && node.type !== 'TEXT') {
      continue;
    }

    const currentVarName = await getBoundVariableName(node, property);
    if (!currentVarName) {
      continue;
    }

    const newVarName = variableMapping[currentVarName];
    if (!newVarName) {
      continue;
    }

    const newVariable = await findVariableByName(newVarName);
    if (!newVariable) {
      figma.notify(`Variable "${newVarName}" not found`, { error: true });
      continue;
    }

    try {
      // Use setBoundVariable for scalar properties
      (node as SceneNode & { setBoundVariable: (prop: string, variable: Variable) => void })
        .setBoundVariable(property, newVariable);
      console.log(`Node "${node.name}" ${property}: ${currentVarName} -> ${newVarName}`);
      changesMade++;
    } catch (error) {
      console.error(`Failed to set ${property} on "${node.name}":`, error);
    }
  }

  return changesMade;
}
