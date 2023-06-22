import { betterToe, betterToeInv } from '@/shared/lib/huelab'
import { Color, Oklch, oklch } from 'culori'

export type Oklrch = {
  mode: 'oklrch'
  l: number
  c: number
  h?: number
  alpha?: number
}

export function oklrch(color: Color): Oklrch {
  const okColor = oklch(color)
  return {
    mode: 'oklrch',
    l: betterToe(okColor.l),
    c: okColor.c,
    h: okColor.h,
    alpha: okColor.alpha,
  }
}

export function oklrchToOklch(color: Oklrch): Oklch {
  return {
    mode: 'oklch',
    l: betterToeInv(color.l),
    c: color.c,
    h: color.h,
    alpha: color.alpha,
  }
}
