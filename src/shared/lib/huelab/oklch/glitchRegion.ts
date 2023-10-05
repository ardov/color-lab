/*
Oklch has a small problematic region where blue colors appear non-displayable. It happens due to significant distortion of the blue colors that makes L*C slices non-continuous.
*/

import type { Oklch } from 'culori'

/**
 * Computed value of pure blue #0000ff in oklch.
 * Result of `oklch({ mode: 'rgb', r: 0, g: 0, b: 1 })`
 */
const BLUE = {
  mode: 'oklch',
  l: 0.4520137183853429,
  c: 0.31321437166460125,
  h: 264.052020638055,
}

// Region limits
const REGION_MIN_L = 0
const REGION_MAX_L = 0.49
const REGION_MIN_HUE = BLUE.h
const REGION_MAX_HUE = 264.208 // Edge of region is at about 264.2078018429991

// Max chroma slopes
const PEAK_L = BLUE.l
const PEAK_C = BLUE.c
const SLOPE_TO_BLACK = PEAK_C / PEAK_L
const SLOPE_TO_WHITE = PEAK_C / (1 - PEAK_L)

const getChromaLimit = (lightness: number) => {
  if (lightness <= PEAK_L) return lightness * SLOPE_TO_BLACK
  return (1 - lightness) * SLOPE_TO_WHITE
}

/**
 * Checks if color is in problematic region.
 * @param color Color in oklch
 * @returns True if color is in problematic region
 */
export function inGlitchRegion({ l, c, h }: Oklch) {
  if (l <= REGION_MIN_L || l > REGION_MAX_L) return false
  if (!h || h < REGION_MIN_HUE || h > REGION_MAX_HUE) return false
  // The color is in the problematic region so we artificially define the chroma limit
  if (c > getChromaLimit(l)) return false
  return true
}
