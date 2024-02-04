import { betterToe } from '@/shared/lib/huelab'
import { oklab, oklch } from 'culori'

export const getMaxChroma = (
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) => {
  if (l <= 0 || l >= 1) return 0
  // this method is only implemented for srgb
  if (gamut !== 'srgb') return 0
  /*
   Manually routing convertions to the fastest way okhsl -> oklab -> oklch
   This avoids the overhead and works x2 faster
  */
  const { c } = oklch(oklab({ mode: 'okhsl', h, s: 1, l: betterToe(l) }))
  return c
}
