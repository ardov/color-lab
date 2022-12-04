import {
  clampChroma,
  clampRgb,
  Color,
  Oklch,
  oklch,
  parse,
  rgb,
  Rgb,
} from 'culori'
import { APCAcontrast, sRGBtoY } from 'apca-w3'
import { findLowest, findHighest } from './binary-search'

export function blendColors(low: Rgb, top: Rgb) {
  const topA = top.alpha === undefined ? 1 : top.alpha
  const lowA = low.alpha === undefined ? 1 : low.alpha

  const alpha = topA + lowA * (1 - topA)

  const getC = (topV: number, lowV: number) =>
    (topV * topA + lowV * lowA * (1 - topA)) / alpha

  return {
    mode: 'rgb',
    alpha,
    r: getC(top.r, low.r),
    g: getC(top.g, low.g),
    b: getC(top.b, low.b),
  } as Rgb
}

export function getAlphaColor(bg: Rgb, target: Rgb) {
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
}

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

export function calcAPCA(bg: Color | string, txt: Color | string): number {
  return Math.abs(APCAcontrast(sRGBtoY(toRgb(txt)), sRGBtoY(toRgb(bg))))

  function toRgb(c: Color | string): [number, number, number] {
    const color = typeof c === 'string' ? rgb(parse(c)) : rgb(c)
    if (!color) throw new Error('Unknown colors')
    const clamped = clampRgb(color)
    return [clamped.r * 255, clamped.g * 255, clamped.b * 255]
  }
}

export function getContrastText(
  bg: Color | string,
  colors: (Color | string)[] = ['#fff', '#000']
) {
  let contrast = 0
  let txt = rgb(parse('#000')) as Rgb
  colors.forEach(c => {
    let lc = calcAPCA(bg, c)

    if (lc > contrast) {
      contrast = lc
      txt = rgb(c) as Rgb
    }
  })
  return txt
}

export function adjustL(bg: Color | string, change: number) {
  const c = typeof bg === 'string' ? oklch(parse(bg)) : oklch(bg)
  if (!c) throw new Error('Unknown color')
  c.l += change
  return clampChroma(c, 'oklch')
}

export function findTextTone(bg: Color | string, targetLc: number, c?: number) {
  const color = typeof bg === 'string' ? oklch(parse(bg)) : oklch(bg)
  if (!color) throw new Error('Unknown color')
  const lcWhite = calcAPCA(color, '#fff')
  const lcBlack = calcAPCA(color, '#000')

  const checker = (l: number) => {
    const toCheck = clampChroma({ ...color, l, c: c || color.c }, 'oklch')
    return calcAPCA(color, toCheck) >= targetLc
  }

  if (lcWhite > lcBlack) {
    // going up
    if (lcWhite < targetLc) return { ...color, l: 1 } as Oklch
    let l = findLowest(checker, [color.l, 1])
    return clampChroma({ ...color, l }, 'oklch')
  } else {
    if (lcBlack < targetLc) return { ...color, l: 0 } as Oklch
    let l = findHighest(checker, [0, color.l])
    return clampChroma({ ...color, l, c: c || color.c }, 'oklch')
  }
}
