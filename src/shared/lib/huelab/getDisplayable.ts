import type { Color, Oklch, Rgb } from 'culori'
import { oklch, rgb } from 'culori'

const RGB_TRESHOLD = 1 / 256 / 2

export function clampToRgb(color: Color, tolerance = RGB_TRESHOLD) {
  const rgbColor = rgb(color)
  if (displayableRgb(rgbColor)) return rgbColor

  if (tolerance && displayableRgb(rgbColor, tolerance))
    return clampRgb(rgbColor)

  const okColor = oklch(color)
  let c = findHighest(
    c => displayableRgb(rgb({ ...okColor, c }), tolerance),
    [0, okColor.c]
  )
  return clampRgb(rgb({ ...okColor, c }))
}

function clampRgb<T extends { r: number; g: number; b: number }>(color: T): T {
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  return { ...color, r: clamp(color.r), g: clamp(color.g), b: clamp(color.b) }
}

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

/** Finds highest number in a given range that returns true */
function findHighest(
  checker: (n: number) => boolean,
  range: [number, number] = [0, 1],
  threshold: number = 0.0001
): number {
  if (checker(range[1])) return range[1]
  let start = range[0]
  let end = range[1]
  let midle = (start + end) / 2

  while (end - start > threshold) {
    if (checker(midle)) start = midle
    else end = midle
    midle = (start + end) / 2
  }
  return start
}

const blue = oklch({ mode: 'rgb', r: 0, g: 0, b: 1 })
// l: 0.4520137183853429
// c: 0.31321437166460125
// h: 264.052020638055

const minHue = 264.052 // Hue of blue is 264.052020638055
const maxHue = 264.208 // Edge of the hue bend is about 264.2078018429991
const maxL = 0.49
const blueL = 0.4520137183853429

const slopeToBlack = blue.c / blue.l
const slopeToWhite = blue.c / (1 - blue.l)

export function oklchDisplayable(color: Oklch): Rgb | false {
  const rgbColor = rgb(color)
  if (displayableRgb(rgbColor)) return rgbColor

  // Check hue region
  if (color.h && color.h <= maxHue && color.h >= minHue) {
    // if (color.l <= blueL && color.c <= color.l * slopeToBlack)
    //   return clampRgb(rgbColor)
    // if (color.l <= maxL && color.c <= (1 - color.l) * slopeToWhite)
    //   return clampRgb(rgbColor)
  }

  return false
}

function isInsideProblematicRegion({ l, c, h }: Oklch) {
  return
}

// ok hue: 264.05156 {mode: 'oklch', l: 0.48982591220262894, c: 0.2877734133082898, h: 264.05156440145964}

// 0.3132 - 0.2878
// 0.3132
