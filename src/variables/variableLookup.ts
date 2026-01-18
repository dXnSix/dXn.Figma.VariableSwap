// Get all bound variables for a node
export async function getNodeVariables(
  node: SceneNode
): Promise<{ property: string; name: string }[]> {
  const variables: { property: string; name: string }[] = [];
  if ("boundVariables" in node && node.boundVariables) {
    for (const [property, bindings] of Object.entries(node.boundVariables)) {
      if (Array.isArray(bindings)) {
        for (const binding of bindings) {
          if ("id" in binding && typeof binding.id === "string") {
            const variable = await figma.variables.getVariableByIdAsync(
              binding.id
            );
            if (variable) {
              variables.push({ property, name: variable.name });
            }
          }
        }
      } else if (typeof bindings === "object" && bindings !== null) {
        if ("id" in bindings && typeof bindings.id === "string") {
          const variable = await figma.variables.getVariableByIdAsync(
            bindings.id
          );
          if (variable) {
            variables.push({ property, name: variable.name });
          }
        }
      }
    }
  }
  return variables;
}

// Find a variable by name, checking local variables first then library collections
export async function findVariableByName(name: string): Promise<Variable | null> {
  const localVariables = await figma.variables.getLocalVariablesAsync();
  let variable: Variable | undefined = localVariables.find(
    (v) => v.name === name
  );

  if (!variable) {
    const collections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    for (const collection of collections) {
      const variables =
        await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
          collection.key
        );
      const libraryVariable = variables.find((v) => v.name === name);
      if (libraryVariable) {
        variable = await figma.variables.importVariableByKeyAsync(
          libraryVariable.key
        );
        break;
      }
    }
  }

  return variable || null;
}
