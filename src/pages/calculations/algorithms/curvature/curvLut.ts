import { lerp } from '@/shared/lib/math'
import { findClosest } from '../lutFindClosest'
import { getColor } from '../lutGetColor'
import { makeLut } from '../lutMake'
import { calculateCurvature, findYForGivenX } from './curv'

export type LutPoint = {
  l: number
  c: number
  h: number
  curvature: number
}

/**
 * Generates a lookup table with the most colorful colors and curvatures of a top section.
 * @param gamut target gamut
 * @param slicesPerSection defines how precise the lookup table will be
 */
export function makeCurvLut(
  gamut: 'srgb' | 'display-p3',
  slicesPerSection: number
): LutPoint[] {
  // A list of the most colorful colors (the peaks in OKLCH)
  const cusps = makeLut(gamut, slicesPerSection, 0.5)
  // Colors in the top section of the OKLCH space needed to calculate curvature
  const topPoints = makeLut(gamut, slicesPerSection, 0.75)

  return cusps.map(cusp => {
    const point = getColor(cusp.h, topPoints)
    // Normalize chroma and luminance to 0-1
    const l = (1 - point.l) / (1 - cusp.l)
    const c = point.c / cusp.c
    const curvature = calculateCurvature(l, c)
    return { ...cusp, curvature }
  })
}

/**
 * Returns coordinates of a cusp color and a curvature for a given hue.
 * @param h hue
 * @param lut lookup table
 */
export function getLutPoint(h: number, lut: LutPoint[]): LutPoint {
  const { min, max, t } = findClosest(h, lut)
  if (t === 0) return min
  const curvature = lerp(min.curvature, max.curvature, t)
  const l = lerp(min.l, max.l, t)
  const c = lerp(min.c, max.c, t)
  return { l, c, h, curvature }
}

/**
 * Calculate the maximum chroma for a given luminance
 * @param l luminance
 * @param data lookup table point
 */
export function getMaxC(l: number, data: LutPoint): number {
  // The bottom part is a straight line
  if (l <= data.l) return (l / data.l) * data.c
  // The top part is a curve
  const t = (1 - l) / (1 - data.l)
  return data.c * findYForGivenX(t, data.curvature)
}
