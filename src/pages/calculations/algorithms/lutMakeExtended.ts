/*
  In this file I'll try to describe the shape of the top part of the OKLCH color space.
  For any LC slice the bottom part is a straight line from a cusp to the black point. And the shape of the top part is a curve.
  I'll try to find a function that describes this curve. Maybe exponential will work.
*/

import { lerp } from '@/shared/lib/math'
import { findClosest } from './lutFindClosest'
import { getColor } from './lutGetColor'
import { makeLut } from './lutMake'
import { Pow } from './types'

export type LutPoint = { l: number; c: number; h: number; pow: number }

export function makeExtendedLut(
  gamut: 'srgb' | 'display-p3',
  slicesPerSection: number
): LutPoint[] {
  // A list of the most colorful colors (the peaks in OKLCH)
  const cusps = makeLut(gamut, slicesPerSection, 0.5)
  // A list of colors in the top part of the OKLCH space that will help to define the curve
  const topPoints = makeLut(gamut, slicesPerSection, 0.78)

  const pows = topPoints.map(point => {
    const cusp = getColor(point.h, cusps)
    // remap the chroma and luminance to a value between 0 and 1
    const c = point.c / cusp.c
    const l = (1 - point.l) / (1 - cusp.l)
    // calculate the pow
    const pow = Math.log(c) / Math.log(l)
    return { h: point.h, pow } as Pow
  })

  return cusps.map(cusp => {
    const { pow } = getPow(cusp.h, pows)
    return { ...cusp, pow }
  })
}

export function getLutPoint(h: number, lut: LutPoint[]): LutPoint {
  const { min, max, t } = findClosest(h, lut)
  if (t === 0) return min
  const pow = lerp(min.pow, max.pow, t)
  const l = lerp(min.l, max.l, t)
  const c = lerp(min.c, max.c, t)
  return { l, c, h, pow }
}

export function getMaxC(l: number, cusp: LutPoint): number {
  if (l <= cusp.l) {
    return (l / cusp.l) * cusp.c
  }
  const t = (1 - l) / (1 - cusp.l)
  return cusp.c * Math.pow(t, cusp.pow)
}

function getPow(h: number, lut: Pow[]): Pow {
  const { min, max, t } = findClosest(h, lut)
  if (t === 0) return min
  const pow = lerp(min.pow, max.pow, t)
  return { pow, h }
}
