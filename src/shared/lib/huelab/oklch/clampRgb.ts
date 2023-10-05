/** Clamps RGB values to 0-1 range */
export function clampRgb<T extends { r: number; g: number; b: number }>(
  color: T
): T {
  return {
    ...color,
    r: Math.max(0, Math.min(1, color.r)),
    g: Math.max(0, Math.min(1, color.g)),
    b: Math.max(0, Math.min(1, color.b)),
  }
}
