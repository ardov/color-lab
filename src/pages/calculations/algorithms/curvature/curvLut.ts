import { lerp } from '@/shared/lib/math'
import { findClosest } from '../lutFindClosest'
import { getColor } from '../lutGetColor'
import { makeLut } from '../lutMake'
import { calculateCurvature, findYForGivenX } from './curv'

export type LutPoint = {
  l: number
  c: number
  h: number
  curv: number
}

export function makeCurvLut(
  gamut: 'srgb' | 'display-p3',
  slicesPerSection: number
): LutPoint[] {
  // A list of the most colorful colors (the peaks in OKLCH)
  const cusps = makeLut(gamut, slicesPerSection, 0.5)
  // A list of colors in the top part of the OKLCH space that will help to define the curve
  const topPoints = makeLut(gamut, slicesPerSection, 0.75)

  return cusps.map(cusp => {
    const point = getColor(cusp.h, topPoints)
    // remap the chroma and luminance to a value between 0 and 1
    const c = point.c / cusp.c
    const l = (1 - point.l) / (1 - cusp.l)
    // calculate the pow
    const curv = calculateCurvature(l, c)
    return { ...cusp, curv }
  })
}

export function getLutPoint(h: number, lut: LutPoint[]): LutPoint {
  const { min, max, t } = findClosest(h, lut)
  if (t === 0) return min
  const curv = lerp(min.curv, max.curv, t)
  if (isNaN(curv)) debugger
  const l = lerp(min.l, max.l, t)
  const c = lerp(min.c, max.c, t)
  return { l, c, h, curv }
}

export function getMaxC(l: number, cusp: LutPoint): number {
  if (l <= cusp.l) {
    return (l / cusp.l) * cusp.c
  }
  const t = (1 - l) / (1 - cusp.l)
  return cusp.c * findYForGivenX(t, cusp.curv)
}
