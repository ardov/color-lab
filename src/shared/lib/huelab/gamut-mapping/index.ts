import { Color, P3, Rgb, oklch, p3, rgb } from 'culori'
import { makeEdgeSeeker } from './edge-seeker'

const converters = {
  srgb: (r: number, g: number, b: number) => {
    const { l, c, h = 0 } = oklch({ mode: 'rgb', r, g, b })
    return { l, c, h }
  },
  'display-p3': (r: number, g: number, b: number) => {
    const { l, c, h = 0 } = oklch({ mode: 'p3', r, g, b })
    return { l, c, h }
  },
  rec2020: (r: number, g: number, b: number) => {
    const { l, c, h = 0 } = oklch({ mode: 'rec2020', r, g, b })
    return { l, c, h }
  },
}

const getSrgbEdge = makeEdgeSeeker(converters['srgb'])
const getP3Edge = makeEdgeSeeker(converters['display-p3'])

export function getEdge(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  if (gamut === 'srgb') return getSrgbEdge(l, h)
  if (gamut === 'display-p3') return getP3Edge(l, h)
  throw new Error('Unknown gamut')
}

export function toSrgb(color: Color): Rgb {
  if (color.mode === 'rgb' && isInRgbGamut(color)) {
    return color as Rgb
  }
  const okColor = oklch(color)
  okColor.c = getSrgbEdge(okColor.l, okColor.h || 0)
  return clipToRgbGamut(rgb(okColor))
}

export function toDisplayP3(color: Color): P3 {
  if (color.mode === 'p3' && isInRgbGamut(color)) {
    return color as P3
  }
  const okColor = oklch(color)
  okColor.c = getP3Edge(okColor.l, okColor.h || 0)
  return clipToRgbGamut(p3(okColor))
}

// Helpers

type RGB = { r: number; g: number; b: number }

function isInRgbGamut({ r, g, b }: RGB) {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1
}

function clipToRgbGamut<T extends RGB>(color: T): T {
  color.r = Math.max(0, Math.min(1, color.r))
  color.g = Math.max(0, Math.min(1, color.g))
  color.b = Math.max(0, Math.min(1, color.b))
  return color
}
