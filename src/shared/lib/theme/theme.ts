import { adjustContrast, adjustL, getAlphaColor } from '@/shared/lib/huevo'
import { formatHsl, hsl } from 'culori'
import { makeColor } from './makeColor'

export function makeColors(
  c: number,
  h: number,
  type: 'light' | 'dark',
  contrast?: number
) {
  const cr = contrast || 60
  const step = (type === 'light' ? -1 : 1.5) * 0.04
  const baseL = type === 'light' ? 1 : 0.2
  const surfaceL = type === 'light' ? 0.975 : 0.225
  const appBgL = type === 'light' ? 0.975 : 0.1

  /** Card color: white for light theme and dark gray for dark theme */
  const base = makeColor(baseL, c, h)

  /** App bg: for light = surface, for dark – darker */
  const appBg = makeColor(appBgL, c, h)

  const surfaceChroma = Math.min(c, 0.08)
  const surfaceNormal = makeColor(surfaceL, surfaceChroma, h)
  const surfaceHover = adjustL(surfaceNormal, step, surfaceChroma)
  const surfaceActive = adjustL(surfaceHover, step, surfaceChroma)
  // const surfaceActive = adjustContrast(base, { l: 0, c, h, mode: 'oklch' }, 15)
  // const surfaceHover = makeColor((surface.l + surfaceActive.l) / 2, c, h)

  const divider = surfaceHover //adjustL(surfaceHover, step, c)

  const btnNormal = adjustContrast(base, { l: 0, c, h, mode: 'oklch' }, cr)
  const btnHover = adjustL(btnNormal, step, c)
  const btnActive = adjustL(btnHover, step, c)
  const btnText = adjustContrast(btnNormal, { l: 0, c, h, mode: 'oklch' }, 75)

  const textSecondary = adjustContrast(
    surfaceHover,
    { l: 0, c, h, mode: 'oklch' },
    75
  )
  const textPrimary = adjustContrast(
    surfaceHover,
    { l: 0, c, h, mode: 'oklch' },
    90
  )

  return {
    'app-bg': formatHsl(appBg),
    base: formatHsl(base),
    'surface-normal': formatHsl(surfaceNormal),
    'surface-hover': formatHsl(surfaceHover),
    'surface-active': formatHsl(surfaceActive),

    divider: formatHsl(divider),

    'btn-normal': formatHsl(btnNormal),
    'btn-hover': formatHsl(btnHover),
    'btn-active': formatHsl(btnActive),
    'btn-text': formatHsl(btnText),

    'text-secondary': formatHsl(textSecondary),
    'text-primary': formatHsl(textPrimary),
  }
}

export function makeShadows(c: number, h: number, type: 'light' | 'dark') {
  const surfaceL = type === 'light' ? 0.975 : 0.225
  const color2 = makeColor(surfaceL / 1.2, c, h)
  let cHsl = hsl(color2)
  const shadowColor = `${+(cHsl.h || 0).toFixed(3)}deg ${+(
    cHsl.s * 100
  ).toFixed(3)}% ${+(cHsl.l * 100).toFixed(3)}%`
  return {
    color: shadowColor,
    elevation1: `0px 0.4px 0.6px hsl(var(--shadow-color) / 0.07),
    0px 0.8px 1.1px -0.4px hsl(var(--shadow-color) / 0.2),
    0px 1.6px 2.2px -0.7px hsl(var(--shadow-color) / 0.33)`,
    elevation2: `0px 0.4px 0.6px hsl(var(--shadow-color) / 0.08),
    0px 1.8px 2.5px -0.2px hsl(var(--shadow-color) / 0.18),
    0px 3.8px 5.3px -0.5px hsl(var(--shadow-color) / 0.28),
    0px 8px 11.2px -0.7px hsl(var(--shadow-color) / 0.37)`,
    elevation3: `0px 0.4px 0.6px hsl(var(--shadow-color) / 0.08),
    0px 3.7px 5.2px -0.1px hsl(var(--shadow-color) / 0.14),
    0px 6.6px 9.2px -0.2px hsl(var(--shadow-color) / 0.2),
    0px 10.2px 14.2px -0.4px hsl(var(--shadow-color) / 0.26),
    0px 15.5px 21.6px -0.5px hsl(var(--shadow-color) / 0.32),
    0px 23.3px 32.5px -0.6px hsl(var(--shadow-color) / 0.38),
    0px 34.6px 48.3px -0.7px hsl(var(--shadow-color) / 0.44)`,
  }
}
