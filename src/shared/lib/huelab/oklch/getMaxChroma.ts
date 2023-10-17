import { findHighest } from '../binarySearch'
import { oklchDisplayable } from './getDisplayable'

export function getMaxChroma(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  const maxChroma = findHighest(
    c => !!oklchDisplayable({ l, c, h, mode: 'oklch' }, gamut),
    [0, 0.4]
  )
  return maxChroma
}
