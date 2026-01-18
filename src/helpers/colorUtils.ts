import { COLOR_TOLERANCE } from './constants';

// Compare two RGB colors within tolerance (handles 32-bit float precision issues)
export function colorsMatch(color1: RGB, color2: RGB, tolerance: number = COLOR_TOLERANCE): boolean {
  return (
    Math.abs(color1.r - color2.r) < tolerance &&
    Math.abs(color1.g - color2.g) < tolerance &&
    Math.abs(color1.b - color2.b) < tolerance
  );
}

/**
 * Attempts to parse a color from a string.
 * @param source
 * @returns RGB object if parsing is successful, otherwise null.
 */
export function tryParseColor(source: string): RGB | null {
  const trimmed = source.trim().toLowerCase();
  if (!trimmed.startsWith('#') && !trimmed.startsWith('rgb')) {
    return null;
  }
  try {
    const rgba = figma.util.rgba(source);
    return { r: rgba.r, g: rgba.g, b: rgba.b };
  } catch {
    return null;
  }
}
