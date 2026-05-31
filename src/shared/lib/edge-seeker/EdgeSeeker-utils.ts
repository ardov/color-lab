type LutItem = { l: number; c: number; h: number; curvature: number }

/** Linear interpolation */
function lerp(start: number, end: number, t: number) {
  t = Math.max(0, Math.min(t, 1))
  return start * (1 - t) + end * t
}

/**
 * Find 2 closest items in the array and return their hue indexes
 * @param hue value to search for
 * @param lut a Float32Array with 4 values per item: h, c, l, curvature. The array is sorted by hue
 * @returns [index, index + 1]
 */
function findClosest(hue: number, lut: Float32Array): [number, number] {
  let start = 0
  let end = lut.length / 4 - 1
  let mid = Math.floor((start + end) / 2)

  while (start <= end) {
    const idx = mid * 4
    if (lut[idx] === hue) return [idx, idx]
    if (lut[idx] < hue) start = mid + 1
    else end = mid - 1
    mid = Math.floor((start + end) / 2)
  }
  const idx1 = mid * 4
  const idx2 = idx1 + 4
  return [idx1, idx2]
}

/**
 * Returns coordinates of a cusp color and a curvature for a given hue.
 * @param hue hue
 * @param lut lookup table
 */
export function getLutItem(hue: number, lut: Float32Array): LutItem {
  const [minIdx, maxIdx] = findClosest(hue, lut)

  /** Interpolate between two items of a lookup table by hue */
  const minH = lut[minIdx]
  const minC = lut[minIdx + 1]
  const minL = lut[minIdx + 2]
  const minCurvature = lut[minIdx + 3]

  const maxH = lut[maxIdx]
  const maxC = lut[maxIdx + 1]
  const maxL = lut[maxIdx + 2]
  const maxCurvature = lut[maxIdx + 3]

  if (hue === minH) {
    return { l: minL, c: minC, h: minH, curvature: minCurvature }
  }
  if (hue === maxH) {
    return { l: maxL, c: maxC, h: maxH, curvature: maxCurvature }
  }

  const t = (hue - minH) / (maxH - minH)
  const l = lerp(minL, maxL, t)
  const c = lerp(minC, maxC, t)
  const curvature = lerp(minCurvature, maxCurvature, t)
  return { l, c, h: hue, curvature }
}

/** Finds the intersection of a line and an arc */
export function intersectWithArc(x: number, curvature: number): number {
  if (curvature === 0) return x // straight line

  const radius = Math.abs(1 / curvature)
  // Midpoint of the line segment from (0,0) to (1,1)
  const midpoint = { x: 0.5, y: 0.5 }

  // Distance from midpoint to any of the points (0,0) or (1,1)
  const halfDiagonal = Math.sqrt(midpoint.x ** 2 + midpoint.y ** 2)

  // Distance from midpoint to the center (using Pythagorean theorem)
  const distanceToCenter = Math.sqrt(radius ** 2 - halfDiagonal ** 2)

  // Since the bisector's slope is -1, the line is at 45 degrees, so the offsets for h and k are equal
  const offset = distanceToCenter / Math.sqrt(2)

  // Position of the center of the circle. Sign helps to determine the correct center
  const centerX = (curvature > 0 ? offset : -offset) + midpoint.x
  const centerY = (curvature > 0 ? -offset : offset) + midpoint.y

  // Calculate y for given x
  const underRoot = radius ** 2 - (x - centerX) ** 2

  // If the value under the square root is negative, no solution exists for this center
  if (underRoot < 0) return 0
  const sqrtVal = Math.sqrt(underRoot)
  const res1 = centerY + sqrtVal
  if (res1 >= 0 && res1 <= 1) return res1
  else return centerY - sqrtVal
}

/** Normalize hue to 0-360 range */
export const normalizeHue = (h: number) => ((h % 360) + 360) % 360
