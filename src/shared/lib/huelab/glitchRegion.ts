import type { Oklch } from 'culori'

/*
Oklch has a small problematic region where blue colors appear non-displayable. It happens due to significant distortion of the blue colors that makes L*C slices non-continuous.
*/

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
const REGION_MAX_L = 0.49
const REGION_MIN_HUE = BLUE.h
const REGION_MAX_HUE = 264.208 // Edge of the hue wave bend is about 264.2078018429991

// Max chroma slopes
const SLOPE_TO_BLACK = BLUE.c / BLUE.l
const SLOPE_TO_WHITE = BLUE.c / (1 - BLUE.l)

const getChromaLimit = (l: number) => {
  if (l <= BLUE.l) return l * SLOPE_TO_BLACK
  return (1 - l) * SLOPE_TO_WHITE
}

/**
 * Checks if color is in problematic region.
 * @param color Color in oklch
 * @returns True if color is in problematic region
 */
export function inGlitchRegion({ l, c, h }: Oklch) {
  if (l <= 0 || l > REGION_MAX_L) return false
  if (!h || h < REGION_MIN_HUE || h > REGION_MAX_HUE) return false
  if (c > getChromaLimit(l)) return false
  return true
}
