import type { Oklch, P3, Rgb } from 'culori'
import { p3, rgb } from 'culori'
import { inGlitchRegion } from './glitchRegion'
import { displayable } from '../displayable'
import { clampRgb } from './clampRgb'

/**
 * Returns displayable RGB color if possible, otherwise false.
 * Takes into account glitch region.
 * @param color Oklch color
 * @param gamut Gamut to check against
 */
function oklchDisplayable(color: Oklch, gamut: 'srgb'): Rgb | false
function oklchDisplayable(color: Oklch, gamut: 'display-p3'): P3 | false
function oklchDisplayable(
  color: Oklch,
  gamut: 'srgb' | 'display-p3'
): Rgb | P3 | false
function oklchDisplayable(
  color: Oklch,
  gamut: 'srgb' | 'display-p3' = 'srgb'
): Rgb | P3 | false {
  if (gamut === 'srgb') {
    const rgbColor = rgb(color)
    if (displayable(rgbColor, gamut)) return rgbColor
    if (inGlitchRegion(color)) return clampRgb(rgbColor)
    return false
  }

  if (gamut === 'display-p3') {
    const p3Color = p3(color)
    if (displayable(p3Color, gamut)) return p3Color
    return false
  }

  throw new Error(`Unknown gamut: ${gamut}`)
}

export { oklchDisplayable }
