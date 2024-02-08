import { LutPoint, getLutPoint, getMaxC, makeCurvLut } from './curvLut'

export const SLICES = 256

const lutGetter = makeLutGetter()
// lutGetter('srgb')

export function algoCurvLUT(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  if (l <= 0 || l >= 1) return 0
  const luts = lutGetter(gamut)
  const cusp = getLutPoint(h, luts)
  return getMaxC(l, cusp)
}

function makeLutGetter() {
  let cachedLuts: Record<'srgb' | 'display-p3', LutPoint[] | undefined> = {
    srgb: undefined,
    'display-p3': undefined,
  }

  return function getCusps(gamut: 'srgb' | 'display-p3'): LutPoint[] {
    if (!cachedLuts[gamut]) {
      cachedLuts[gamut] = makeCurvLut(gamut, SLICES)
    }
    return cachedLuts[gamut] as LutPoint[]
  }
}
