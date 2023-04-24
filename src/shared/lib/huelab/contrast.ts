import { APCAcontrast, sRGBtoY } from 'apca-w3'
import { clampRgb, Color, oklch, Oklch, parse, rgb, wcagContrast } from 'culori'
import { findLowest, findHighest } from './binarySearch'
import { clampChroma } from './colors'

export function apcaContrast(bg: Color | string, txt: Color | string): number {
  return Math.abs(APCAcontrast(sRGBtoY(toRgb(txt)), sRGBtoY(toRgb(bg))))

  function toRgb(c: Color | string): [number, number, number] {
    const color = typeof c === 'string' ? rgb(parse(c)) : rgb(c)
    if (!color) throw new Error('Unknown colors')
    const clamped = clampRgb(color)
    return [clamped.r * 255, clamped.g * 255, clamped.b * 255]
  }
}

export function getContrastColor(
  bg: Color | string,
  targetLc: number = 200,
  mode: 'wcag' | 'apca' = 'apca',
  chroma?: number,
  hue?: number | ((l: number) => number)
): Oklch {
  const contrast = mode === 'apca' ? apcaContrast : wcagContrast
  const bgColor = typeof bg === 'string' ? oklch(parse(bg)) : oklch(bg)
  if (!bgColor) throw new Error('Unknown color')
  const lcWhite = contrast(bgColor, '#fff')
  const lcBlack = contrast(bgColor, '#000')

  const makeOklch = (l: number) => {
    const c = chroma === undefined ? bgColor.c : chroma
    const h =
      hue === undefined
        ? bgColor.h || 0
        : typeof hue === 'number'
        ? hue
        : hue(l)
    return clampChroma({ mode: 'oklch', l, c, h })
  }

  const checker = (l: number) => {
    return contrast(bgColor, makeOklch(l)) >= targetLc
  }

  if (lcWhite > lcBlack) {
    // going up
    if (lcWhite < targetLc) return makeOklch(1)
    let l = findLowest(checker, [bgColor.l, 1])
    return makeOklch(l)
  } else {
    if (lcBlack < targetLc) return makeOklch(0)
    let l = findHighest(checker, [0, bgColor.l])
    return makeOklch(l)
  }
}
