import { clampChroma } from '@/shared/lib/colors'

export function makeColor(l: number, c: number, h: number) {
  return clampChroma({ l, c, h, mode: 'oklch' })
}
