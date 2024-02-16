import { oklch } from 'culori'
import { makeGamutMapper } from './edge-seeker'

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

const toSRGB = makeGamutMapper(converters.srgb)
const toDisplayP3 = makeGamutMapper(converters['display-p3'])

export function wrappedAlgorithm(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  if (gamut === 'srgb') return toSRGB(l, h)
  if (gamut === 'display-p3') return toDisplayP3(l, h)
  throw new Error('Unknown gamut')
}
