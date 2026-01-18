import { processNode } from './nodeProcessor';
import {
  ParsedMapping,
  VariableMapping,
  StyleMapping,
  VariableMappingTable,
  StyleMappingTable,
  ScopeMode, MappingInput,
} from './helpers/types';



// Parse input mapping to unified format
function parseMapping(input: MappingInput): ParsedMapping {
  return {
    variables: input.variables || [],
    styles: input.styles || [],
  };
}

// Build variable mapping table from variable mapping entries
function buildVariableMappingTable(mappingEntries: VariableMapping[]): VariableMappingTable {
  const variableMapping: VariableMappingTable = {};
  for (const entry of mappingEntries) {
    if (typeof entry.old === 'string') {
      variableMapping[entry.old] = entry.new;
    } else {
      // Array format: each old value maps to the same new value
      for (const oldValue of entry.old) {
        variableMapping[oldValue] = entry.new;
      }
    }
  }
  return variableMapping;
}

// Build style mapping tables by type
function buildStyleMappingTables(styleEntries: StyleMapping[]): {
  paint: StyleMappingTable;
  text: StyleMappingTable;
  effect: StyleMappingTable;
  grid: StyleMappingTable;
} {
  const tables = {
    paint: {} as StyleMappingTable,
    text: {} as StyleMappingTable,
    effect: {} as StyleMappingTable,
    grid: {} as StyleMappingTable,
  };

  for (const entry of styleEntries) {
    tables[entry.type][entry.old] = entry.new;
  }

  return tables;
}

// Get nodes based on scope mode
function getNodesForScope(scope: ScopeMode): readonly SceneNode[] {
  switch (scope) {
    case 'document': {
      const allNodes: SceneNode[] = [];
      for (const page of figma.root.children) {
        allNodes.push(...page.children);
      }
      return allNodes;
    }
    case 'page':
      return figma.currentPage.children;
    case 'selection':
    default:
      return figma.currentPage.selection;
  }
}

// Main swap function - processes nodes based on scope
export async function runSwap(mappingInput: MappingInput, scope: ScopeMode = 'selection') {
  const parsed = parseMapping(mappingInput);
  const variableMapping = buildVariableMappingTable(parsed.variables);
  const styleMappings = buildStyleMappingTables(parsed.styles);

  const nodes = getNodesForScope(scope);
  let changesMade = 0;

  if (nodes.length === 0) {
    const messages = {
      selection: 'No nodes selected',
      page: 'Current page is empty',
      document: 'Document is empty'
    };
    figma.notify(messages[scope]);
    return;
  }

  for (const node of nodes) {
    changesMade = await processNode(node, variableMapping, styleMappings, changesMade);
  }

  // Notify the result - plugin stays open for multiple runs
  figma.notify(`${changesMade} changes made`);
}
