import { getMaxChroma as fnOkhsl } from './algoOkhsl'
import { getColor } from './lutGetColor'
import { makeLut } from './lutMake'
import { SLICES } from './algoLUT'
import { LCH } from './types'

function getMaxChromaHybrid(l: number, h: number, cusps: LCH[]) {
  if (l <= 0 || l >= 1) return 0
  const cusp = getColor(h, cusps)
  if (l <= cusp.l) {
    return (l / cusp.l) * cusp.c
  }
  // l > cuspL
  // TODO: this is a very rough approximation, should be improved
  return fnOkhsl(l, h)
}

let rgbCusps: LCH[] = []
let p3Cusps: LCH[] = []

export function algoLUTHybrid(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  if (l <= 0 || l >= 1) return 0
  if (gamut === 'srgb') {
    if (!rgbCusps.length) {
      rgbCusps = makeLut(gamut, SLICES, 0.5)
    }
    return getMaxChromaHybrid(l, h, rgbCusps)
  }
  if (gamut === 'display-p3') {
    if (!p3Cusps.length) {
      p3Cusps = makeLut(gamut, SLICES, 0.5)
    }
    return getMaxChromaHybrid(l, h, p3Cusps)
  }
  return 0
}
