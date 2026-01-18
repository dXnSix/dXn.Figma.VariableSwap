// Find a paint style by name, checking local styles first
export async function findPaintStyleByName(name: string): Promise<PaintStyle | null> {
  // Check local styles first
  const localStyles = await figma.getLocalPaintStylesAsync();
  const local = localStyles.find((s: PaintStyle) => s.name === name);
  if (local) return local;

  // Library styles require the style to already be used in the document
  // or imported via key. For now, we only support local styles.
  // If you need library style support, the style must already be present in the document.
  return null;
}

// Find a text style by name, checking local styles first
export async function findTextStyleByName(name: string): Promise<TextStyle | null> {
  // Check local styles first
  const localStyles = await figma.getLocalTextStylesAsync();
  const local = localStyles.find((s: TextStyle) => s.name === name);
  if (local) return local;

  return null;
}

// Find an effect style by name, checking local styles first
export async function findEffectStyleByName(name: string): Promise<EffectStyle | null> {
  // Check local styles first
  const localStyles = await figma.getLocalEffectStylesAsync();
  const local = localStyles.find((s: EffectStyle) => s.name === name);
  if (local) return local;

  return null;
}

// Find a grid style by name, checking local styles first
export async function findGridStyleByName(name: string): Promise<GridStyle | null> {
  // Check local styles first
  const localStyles = await figma.getLocalGridStylesAsync();
  const local = localStyles.find((s: GridStyle) => s.name === name);
  if (local) return local;

  return null;
}
