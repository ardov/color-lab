import { remap } from '@/shared/lib/math'
import { getColor } from './lutGetColor'
import { makeLut } from './lutMake'
import { LCH } from './types'

export const SLICES = 256

const lutGetter = makeLutGetter()
lutGetter('srgb')

export function algoLUT(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  if (l <= 0 || l >= 1) return 0
  const luts = lutGetter(gamut)
  const cusp = getColor(h, luts.cusps)
  if (l <= cusp.l) {
    return (l / cusp.l) * cusp.c
  }

  const top0 = getColor(h, luts.top0)
  if (l <= top0.l) {
    return remap(l, cusp.l, top0.l, cusp.c, top0.c)
  }

  const top1 = getColor(h, luts.top1)
  if (l <= top1.l) {
    return remap(l, top0.l, top1.l, top0.c, top1.c)
  }

  return ((1 - l) / (1 - top1.l)) * top1.c
}

function makeLutGetter() {
  type LUTs = { top0: LCH[]; top1: LCH[]; cusps: LCH[] }
  let cachedLuts: Record<'srgb' | 'display-p3', LUTs | undefined> = {
    srgb: undefined,
    'display-p3': undefined,
  }

  return function getCusps(gamut: 'srgb' | 'display-p3'): LUTs {
    if (!cachedLuts[gamut]) {
      const cusps = makeLut(gamut, SLICES, 0.5)
      const top0 = makeLut(gamut, SLICES, 0.68)
      const top1 = makeLut(gamut, SLICES, 0.82)
      cachedLuts[gamut] = { top0, top1, cusps }
    }
    return cachedLuts[gamut] as LUTs
  }
}
