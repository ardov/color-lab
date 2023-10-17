import { Color, Oklch, Rgb, oklch, rgb } from 'culori'
import { displayable } from '../displayable'
import { findHighest } from '../binarySearch'
import { oklchDisplayable } from './getDisplayable'

function isDisplayable(color: Color) {}

function clampChroma(color: Color, gamut: PredefinedColorSpace = 'srgb') {
  //  check if the color is visible
}

function clampChromaToSrgb(color: Color) {
  const rgbColor = rgb(color)
  if (displayable(rgbColor, 'srgb')) return rgbColor
  const okColor = oklch(color)
  let lastRgbColor = rgbColor
  let chroma = findHighest(
    c => {
      const newColor = { ...okColor, c }
      const displayable = oklchDisplayable(newColor, 'srgb')
      if (displayable) {
        lastRgbColor = displayable as Rgb
        return true
      }
      return false
    },
    [0, 0.4]
  )
  return {
    oklch: { ...okColor, c: chroma } as Oklch,
    rgb: lastRgbColor,
  }
}

// export function clampChroma(
//   color: Color,
//   mode: 'srgb' | 'display-p3' = 'srgb'
// ) {
//   const okColor = oklch(color)
//   if (displayable(okColor, mode)) return okColor
//   let c = findHighest(c => displayable({ ...okColor, c }, mode), [0, 0.4])
//   return { ...okColor, c } as Oklch
// }
