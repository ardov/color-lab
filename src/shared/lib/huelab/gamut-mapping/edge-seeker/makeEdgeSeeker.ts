import { type OKLCH, getLutItem } from './utils'
import { makeLut } from './lut/makeLut'

const SLICES = 400

export function makeEdgeSeeker(
  rgbToOklch: (r: number, g: number, b: number) => OKLCH
) {
  const lut = makeLut(rgbToOklch, SLICES)
  let cachedHue = 0
  let cachedItem = getLutItem(0, lut)
  const lutItemGetter = (hue: number) => {
    if (hue === cachedHue) return cachedItem
    cachedHue = hue
    return (cachedItem = getLutItem(hue, lut))
  }

  return function getMaxChroma(l: number, h: number) {
    if (l <= 0 || l >= 1) return 0
    const lutItem = lutItemGetter(h)

    // The bottom (dark) part is always a straight line
    if (l <= lutItem.l) return (l / lutItem.l) * lutItem.c

    // The top (bright) part is approximated by an arc
    const x = (1 - l) / (1 - lutItem.l) // Normalize l to 0-1 in arc space
    return lutItem.c * intersectionWithArc(x, lutItem.curvature)
  }
}

/** Finds the intersection of a line and an arc */
function intersectionWithArc(x: number, curvature: number): number {
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
