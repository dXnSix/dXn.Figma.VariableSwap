/// <reference types="@figma/plugin-typings" />

// Variable mapping entry (supports old format and new variables array)
export type VariableMapping = {
  old: string | string[];
  new: string;
};

// Style mapping entry with explicit type
export type StyleMapping = {
  old: string;
  new: string;
  type: 'paint' | 'text' | 'effect' | 'grid';
};

// Scope mode for node selection
export type ScopeMode = 'selection' | 'page' | 'document';

// New unified format (Option A)
export type FullMapping = {
  variables?: VariableMapping[];
  styles?: StyleMapping[];
};

// Legacy format is just VariableMapping[]
export type LegacyMapping = VariableMapping[];

// Input can be either format
export type MappingInput = FullMapping | LegacyMapping;

// Parsed mapping passed to swap engine
export type ParsedMapping = {
  variables: VariableMapping[];
  styles: StyleMapping[];
};

// Message types for UI-plugin communication
export type UIMessage =
  | { type: 'run'; mapping: MappingInput; scope: ScopeMode }
  | { type: 'load-mapping' }
  | { type: 'save-mapping'; json: string }
  | { type: 'save-draft'; json: string }
  | { type: 'save-scope'; scope: ScopeMode }
  | { type: 'load-scope' };

// Plugin -> UI messages
export type PluginMessage =
  | { type: 'mapping-loaded'; json: string | null }
  | { type: 'scope-loaded'; scope: ScopeMode }
  | { type: 'storage-error'; error: string };

// Variable mapping lookup table
export type VariableMappingTable = { [key: string]: string };

// Style mapping lookup table (keyed by style name, value is new style name)
export type StyleMappingTable = { [key: string]: string };

// Supported scalar properties for variable binding
export const SPACING_PROPERTIES = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'itemSpacing',
  'counterAxisSpacing',
] as const;

export const DIMENSION_PROPERTIES = [
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
] as const;

export const CORNER_PROPERTIES = [
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
] as const;

export const STROKE_WEIGHT_PROPERTIES = [
  'strokeWeight',
  'strokeTopWeight',
  'strokeRightWeight',
  'strokeBottomWeight',
  'strokeLeftWeight',
] as const;

export const OTHER_BINDABLE_PROPERTIES = [
  'opacity',
  'characters',
  'visible',
] as const;

// All bindable scalar properties (non-paint)
export const ALL_SCALAR_PROPERTIES = [
  ...SPACING_PROPERTIES,
  ...DIMENSION_PROPERTIES,
  ...CORNER_PROPERTIES,
  ...STROKE_WEIGHT_PROPERTIES,
  ...OTHER_BINDABLE_PROPERTIES,
] as const;

export type ScalarProperty = typeof ALL_SCALAR_PROPERTIES[number];
