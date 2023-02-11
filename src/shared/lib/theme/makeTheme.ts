import { makeColors } from './makeColors'
import { makeShadows } from './theme'

export type TThemeOpts = {
  mainC?: number
  mainH?: number
  accC?: number
  accH?: number
  hueShift?: number
  cr?: number
  type?: 'light' | 'dark'
}

export type TTheme = ReturnType<typeof makeTheme>

export function makeTheme(opts: TThemeOpts) {
  const mainH = opts.mainH || 0
  const mainC = opts.mainC || 0
  const accH = opts.accH || 0
  const accC = opts.accC || 0
  const hueShift = opts.hueShift || 0
  const cr = opts.cr || 60
  const themeType = opts.type || 'light'

  const theme = {
    r: { m: '8px', l: '12px', xl: '16px' },
    c: {
      acc: makeColors(themeType, {
        chroma: accC,
        hue: accH,
        contrast: cr,
        hueShift,
      }),
      main: makeColors(themeType, {
        chroma: mainC,
        hue: mainH,
        contrast: cr,
        hueShift,
      }),
    },
    shadow: makeShadows(mainC && Math.max(mainC, 0.06), mainH, themeType),
  }

  return theme
}
