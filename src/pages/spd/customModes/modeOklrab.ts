// ignore ts errors
// @ts-nocheck

import {
  Oklab,
  Oklch,
  Rgb,
  convertLabToLch,
  convertLchToLab,
  getMode,
  oklab,
  rgb,
  useMode,
} from 'culori'

const modeOklab = getMode('oklab')
const oklrabName = 'oklrab'
type Oklrab = Omit<Oklab, 'mode'> & { mode: typeof oklrabName }

const convertOklabToOklrab = (color: Oklab): Oklrab => ({
  ...color,
  mode: oklrabName,
  l: betterToe(color.l),
})
const convertRgbToOklrab = (color: Rgb): Oklrab =>
  convertOklabToOklrab(oklab(color))
const convertOklrabToOklab = (color: Oklrab): Oklab => ({
  ...color,
  mode: 'oklab',
  l: betterToeInv(color.l),
})
const convertOklrabToRgb = (color: Oklrab): Rgb =>
  rgb(convertOklrabToOklab(color))

// eslint-disable-next-line react-hooks/rules-of-hooks
export const oklrab = useMode({
  ...modeOklab,

  mode: oklrabName,

  toMode: {
    oklab: convertOklrabToOklab,
    rgb: convertOklrabToRgb,
  },

  fromMode: {
    oklab: convertOklabToOklrab,
    rgb: convertRgbToOklrab,
  },

  parse: undefined,
  serialize: (c: Oklrab): string => {
    const okColor = convertOklrabToOklab(c)
    return modeOklab.serialize(okColor)
  },
})

//
//
//
//
// OKLCH

const modeOklch = getMode('oklch')
const oklrchName = 'oklrch'
type Oklrch = Omit<Oklch, 'mode'> & { mode: typeof oklrabName }

// eslint-disable-next-line react-hooks/rules-of-hooks
export const oklrch = useMode({
  ...modeOklch,

  mode: oklrchName,

  toMode: {
    oklrab: (c: Oklrch) => convertLchToLab(c, 'oklrab'),
    rgb: (c: Oklrch) => convertOklrabToRgb(convertLchToLab(c, 'oklrab')),
  },

  fromMode: {
    rgb: c => convertLabToLch(convertRgbToOklrab(c), 'oklrch'),
    oklrab: c => convertLabToLch(c, 'oklrch'),
  },

  parse: undefined,
  serialize: undefined,
})

/*
  This toe functions described here
  https://bottosson.github.io/posts/colorpicker/#intermission---a-new-lightness-estimate-for-oklab
*/

const k1 = 0.206
const k2 = 0.03
const k3 = (1 + k1) / (1 + k2)

/** Converts OKLAB lightnes to Lab-like */
function betterToe(x: number) {
  return (
    0.5 *
    (k3 * x - k1 + Math.sqrt((k3 * x - k1) * (k3 * x - k1) + 4 * k2 * k3 * x))
  )
}

/** Converts Lab-like lightness back to OKLAB */
function betterToeInv(x: number) {
  return (x * x + k1 * x) / (k3 * (x + k2))
}
