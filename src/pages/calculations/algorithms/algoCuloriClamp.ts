import { clampChroma } from 'culori'

export function culoriClamp(
  l: number,
  h: number,
  gamut: 'srgb' | 'display-p3' = 'srgb'
) {
  return clampChroma({ l, c: 0.5, h, mode: 'oklch' }, 'oklch').c
}
