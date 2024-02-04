import { findHighest } from '../binarySearch'
import { oklchDisplayable } from './getDisplayable'

/**
 * Searches for the maximum chroma in OKLCH space that is in gamut.
 * Uses a binary search to find the maximum chroma.
 * @param l The lightness value [0, 1]
 * @param h The hue value [0, 360]
 * @param gamut The gamut to search in 'srgb' or 'display-p3'
 * @returns The maximum chroma value
 */
export function getMaxChroma(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
): number {
  if (l <= 0 || l >= 1) return 0
  const maxChroma = findHighest(
    c => Boolean(oklchDisplayable({ l, c, h, mode: 'oklch' }, gamut)),
    [0, 0.4],
    0.000048
  )
  return maxChroma
}
