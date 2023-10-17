import type { Color, Oklch, Rgb } from 'culori'
import { oklch, p3, parse, rgb } from 'culori'
import { findLowest, findHighest } from './binarySearch'
import { apcaContrast } from './contrast'
import { oklchDisplayable } from './oklch/getDisplayable'
import { getMaxChroma } from './oklch/getMaxChroma'

/** Blends two colors according to their alpha */
export function blendColors(low: Rgb, top: Rgb): Rgb {
  const topA = top.alpha === undefined ? 1 : top.alpha
  const lowA = low.alpha === undefined ? 1 : low.alpha
  const alpha = topA + lowA * (1 - topA)
  const calcChannel = (topV: number, lowV: number) => {
    return (topV * topA + lowV * lowA * (1 - topA)) / alpha
  }
  return {
    mode: 'rgb',
    alpha,
    r: calcChannel(top.r, low.r),
    g: calcChannel(top.g, low.g),
    b: calcChannel(top.b, low.b),
  }
}

/**
 * Returns color with opacity that would look exactly like target color on given background
 * @param bg background color
 * @param target color that we want to imitate with opacity
 * @returns
 */
export function getAlphaColor(bg: Rgb, target: Rgb): Rgb {
  const alpha = Math.max(
    findLowestAlpha(bg.r, target.r),
    findLowestAlpha(bg.g, target.g),
    findLowestAlpha(bg.b, target.b)
  )
  return {
    mode: 'rgb',
    alpha,
    r: calcChannel(bg.r, target.r, alpha),
    g: calcChannel(bg.g, target.g, alpha),
    b: calcChannel(bg.b, target.b, alpha),
  } as Rgb

  function findLowestAlpha(bg: number, target: number) {
    for (let a = 1; a <= 100; a++) {
      let ch = calcChannel(bg, target, a / 100)
      if (ch >= 0 && ch <= 1) return a / 100
    }
    return 1
  }

  function calcChannel(bg: number, target: number, alpha: number) {
    return bg + (target - bg) / alpha
  }
}

export function clampChroma(
  color: Color,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  const okColor = oklch(color)
  if (oklchDisplayable(okColor, gamut)) return okColor
  let c = getMaxChroma(okColor.l, okColor.h || 0, gamut)
  return { ...okColor, c } as Oklch
}

export function clampChannels(
  color: Color,
  mode: 'srgb' | 'display-p3' = 'srgb'
) {
  const rgbColor = mode === 'srgb' ? rgb(color) : p3(color)
  rgbColor.r = Math.max(0, Math.min(1, rgbColor.r))
  rgbColor.g = Math.max(0, Math.min(1, rgbColor.g))
  rgbColor.b = Math.max(0, Math.min(1, rgbColor.b))
  return rgbColor
}

export function adjustL(
  bg: Color | string,
  change: number,
  targetChroma?: number
) {
  const color = typeof bg === 'string' ? oklch(parse(bg)) : oklch(bg)
  if (!color) throw new Error('Unknown color')
  return clampChroma({
    ...color,
    l: color.l + change,
    c: targetChroma !== undefined ? targetChroma : color.c,
  })
}

export function adjustContrast(
  bg: Color | string,
  text: Color | string,
  targetLc: number
): Oklch {
  const txtColor = typeof text === 'string' ? oklch(parse(text)) : oklch(text)
  const bgColor = typeof bg === 'string' ? oklch(parse(bg)) : oklch(bg)
  if (!bgColor || !txtColor) throw new Error('Unknown color')

  const lcWhite = apcaContrast(bgColor, '#fff')
  const lcBlack = apcaContrast(bgColor, '#000')

  const checker = (l: number) => {
    const toCheck = clampChroma({ ...txtColor, l })
    return apcaContrast(bgColor, toCheck) >= targetLc
  }

  if (lcWhite > lcBlack) {
    // going up
    if (lcWhite < targetLc) return { ...bgColor, l: 1 } as Oklch
    let l = findLowest(checker, [bgColor.l, 1])
    return clampChroma({ ...txtColor, l })
  } else {
    if (lcBlack < targetLc) return { ...bgColor, l: 0 } as Oklch
    let l = findHighest(checker, [0, bgColor.l])
    return clampChroma({ ...txtColor, l })
  }
}
