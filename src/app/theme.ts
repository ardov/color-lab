import {
  adjustContrast,
  adjustL,
  clampChroma,
  getAlphaColor,
} from '@/shared/lib/colors'
import { formatHsl } from 'culori'

type TThemeOpts = {
  mainC?: number
  mainH?: number
  accC?: number
  accH?: number
  cr?: number
  type?: 'light' | 'dark'
}

function makeColor(l: number, c: number, h: number) {
  return clampChroma({ l, c, h, mode: 'oklch' })
}

export function makeTheme(opts: TThemeOpts) {
  const mainH = opts.mainH || 0
  const mainC = opts.mainC || 0
  const accH = opts.accH || 0
  const accC = opts.accC || 0
  const cr = opts.cr || 60
  const themeType = opts.type || 'light'

  const theme = {
    r: { m: '8px', l: '12px', xl: '16px' },
    c: {
      acc: makeTokens(accC, accH, themeType, cr),
      main: makeTokens(mainC, mainH, themeType, cr),
    },
  }

  return theme
}

function makeTokens(
  c: number,
  h: number,
  type: 'light' | 'dark',
  contrast?: number
) {
  const cr = contrast || 60
  const base = type === 'light' ? makeColor(1, 0, 0) : makeColor(0.1, 0, 0)
  const invert = type === 'light' ? makeColor(0, 0, 0) : makeColor(1, 0, 0)
  const start = type === 'light' ? 0.97 : 0.2
  const step = (type === 'light' ? -1 : 2) * 0.04

  const surface = makeColor(start, c, h)
  const surfaceHover = adjustL(surface, step, c)
  const surfaceActive = adjustL(surfaceHover, step, c) //adjustContrast( surface, { l: 0, c, h, mode: 'oklch' }, 15)

  const divider = surfaceActive //adjustL(surfaceHover, step, c)

  const btnNormal = adjustContrast(base, { l: 0, c, h, mode: 'oklch' }, cr)
  const btnHover = adjustL(btnNormal, step, c)
  const btnActive = adjustL(btnHover, step, c)
  const btnText = adjustContrast(btnNormal, { l: 0, c, h, mode: 'oklch' }, 75)

  const textSecondary = adjustContrast(
    surfaceHover,
    { l: 0, c, h, mode: 'oklch' },
    60
  )
  const textPrimary = adjustContrast(
    surfaceHover,
    { l: 0, c, h, mode: 'oklch' },
    90
  )

  return {
    base: formatHsl(base),
    'surface-normal': formatHsl(surface),
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
