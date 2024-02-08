import { lerp } from '@/shared/lib/math'
import { findClosest } from './lutFindClosest'
import { LCH } from './types'

/**
 * Get the color from the LUT using linear interpolation
 * @param h hue value to search for
 * @param lut array of colors in OKLCH sorted by hue
 * @returns LCH color
 */
export function getColor(h: number, lut: LCH[]): LCH {
  const { min, max, t } = findClosest(h, lut)
  if (t === 0) return min
  const l = lerp(min.l, max.l, t)
  const c = lerp(min.c, max.c, t)
  return { l, c, h }
}
