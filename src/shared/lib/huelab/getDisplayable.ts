import type { Color, Oklch, Rgb } from 'culori'
import { oklch, rgb } from 'culori'
import { findHighest } from './binarySearch'
import { inGlitchRegion } from './glitchRegion'

const RGB_TRESHOLD = 1 / 256 / 2

/** Checks if RGB values are in range 0-1 */
function displayableRgb<T extends { r: number; g: number; b: number }>(
  color: T,
  tolerance = 0
): boolean {
  const min = 0 - tolerance
  const max = 1 + tolerance
  return (
    color.r >= min &&
    color.r <= max &&
    color.g >= min &&
    color.g <= max &&
    color.b >= min &&
    color.b <= max
  )
}

/** Clamps RGB values to 0-1 range */
function clampRgb<T extends { r: number; g: number; b: number }>(color: T): T {
  return { ...color, r: clamp(color.r), g: clamp(color.g), b: clamp(color.b) }
}

export function clampToRgb(color: Color, tolerance = RGB_TRESHOLD) {
  const rgbColor = rgb(color)
  if (displayableRgb(rgbColor, tolerance)) {
    return clampRgb(rgbColor)
  }
  const okColor = oklch(color)
  let c = findHighest(
    c => displayableRgb(rgb({ ...okColor, c }), tolerance),
    [0, okColor.c]
  )
  return clampRgb(rgb({ ...okColor, c }))
}

export function oklchDisplayable(color: Oklch): Rgb | false {
  const rgbColor = rgb(color)
  if (displayableRgb(rgbColor)) return rgbColor

  // Check hue region
  if (inGlitchRegion(color)) {
    return clampRgb(rgbColor)
  }
  return false
}

// —————————————————————————————————————————————————————————————————————————————

// Helpers

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n))
}
