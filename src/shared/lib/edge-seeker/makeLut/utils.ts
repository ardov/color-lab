export type RGB = { r: number; g: number; b: number }
export type LCH = { l: number; c: number; h: number }
export type LutItem = { l: number; c: number; h: number; curvature: number }

/** Linear interpolation */
export function lerp(start: number, end: number, t: number) {
  t = Math.max(0, Math.min(t, 1))
  return start * (1 - t) + end * t
}

/** Interpolate between two colors by hue */
export function lerpColorByHue(start: LCH, end: LCH, hue: number) {
  if (hue === start.h) return start
  if (hue === end.h) return end
  const t = (hue - start.h) / (end.h - start.h)
  const l = lerp(start.l, end.l, t)
  const c = lerp(start.c, end.c, t)
  return { l, c, h: hue } as LCH
}

/** Interpolate between two items of a lookup table by hue */
function lerpLutItemsByHue(start: LutItem, end: LutItem, hue: number) {
  if (hue === start.h) return start
  if (hue === end.h) return end
  const t = (hue - start.h) / (end.h - start.h)
  const l = lerp(start.l, end.l, t)
  const c = lerp(start.c, end.c, t)
  const curvature = lerp(start.curvature, end.curvature, t)
  return { l, c, h: hue, curvature } as LutItem
}

/**
 * Find 2 closest items in the array
 * @param hue value to search for
 * @param lut array sorted by hue
 */
function findClosest<T extends { h: number }>(hue: number, lut: T[]): [T, T] {
  let start = 0
  let end = lut.length - 1
  let mid = Math.floor((start + end) / 2)

  while (start <= end) {
    if (lut[mid].h === hue) {
      return [lut[mid], lut[mid]]
    } else if (lut[mid].h < hue) {
      start = mid + 1
    } else {
      end = mid - 1
    }
    mid = Math.floor((start + end) / 2)
  }
  return [lut[mid], lut[mid + 1]]
}

/**
 * Get the color from the LUT using linear interpolation
 * @param h hue value to search for
 * @param lut array of colors in OKLCH sorted by hue
 * @returns LCH color
 */
export function getColor(h: number, lut: LCH[]): LCH {
  const [min, max] = findClosest(h, lut)
  return lerpColorByHue(min, max, h)
}

/** Returns coordinates of a cusp color and a curvature for a given hue. */
export function getLutItem(hue: number, lut: LutItem[]): LutItem {
  const [min, max] = findClosest(hue, lut)
  return lerpLutItemsByHue(min, max, hue)
}

/** Checks if hues go clockwise */
export function isCW(h1: number, h2: number): boolean {
  h1 = h1 % 360
  h2 = h2 % 360
  let diff = h2 - h1
  if (diff < 0) diff += 360
  return diff >= 0 && diff <= 180
}
