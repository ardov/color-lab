// ignore ts errors
// @ts-nocheck

import {
  Oklch,
  Rgb,
  Xyz65,
  convertLabToLch,
  convertLchToLab,
  fixupAlpha,
  getMode,
  interpolatorLinear,
  oklab,
  rgb,
  useMode,
  xyz65,
} from 'culori'
import { OklabExtended_to_XYZ, XYZ_to_OklabExtended } from './oklabExtended'

const modeOklab = getMode('oklab')
const OklabxName = 'oklabx'
type Oklabx = {
  mode: 'oklabx'
  l: number
  a: number
  b: number
  alpha?: number
}

const oklabxToXyz65 = (color: Oklabx) => {
  const [x, y, z] = OklabExtended_to_XYZ([color.l, color.a, color.b])
  return { mode: 'xyz65', x, y, z } as Xyz65
}
const xyz65ToOklabx = (color: Xyz65) => {
  const [l, a, b] = XYZ_to_OklabExtended([color.x, color.y, color.z])
  return { mode: OklabxName, l, a, b } as Oklabx
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const oklabx = useMode({
  // ...modeOklab,

  mode: OklabxName,
  channels: ['l', 'a', 'b', 'alpha'],

  toMode: {
    xyz65: oklabxToXyz65,
    rgb: (color: Oklabx) => rgb(oklabxToXyz65(color)),
  },

  fromMode: {
    xyz65: xyz65ToOklabx,
    rgb: (color: Rgb) => xyz65ToOklabx(xyz65(color)),
  },

  interpolate: {
    l: interpolatorLinear,
    a: interpolatorLinear,
    b: interpolatorLinear,
    alpha: {
      use: interpolatorLinear,
      fixup: fixupAlpha,
    },
  },

  // parse: undefined,
  serialize: (c: Oklabx) => modeOklab.serialize(oklab(c)),
})

//
//
//
//
// OKLCHX

const modeOklch = getMode('oklch')
const oklchxName = 'oklchx'
type Oklchx = Omit<Oklch, 'mode'> & { mode: typeof oklchxName }

// eslint-disable-next-line react-hooks/rules-of-hooks
export const oklchx = useMode({
  ...modeOklch,

  mode: oklchxName,

  toMode: {
    oklabx: (c: Oklchx) => convertLchToLab(c, 'oklabx'),
    rgb: (c: Oklchx) => rgb(oklabxToXyz65(convertLchToLab(c, 'oklabx'))),
  },

  fromMode: {
    rgb: (c: Rgb) => convertLabToLch(xyz65ToOklabx(xyz65(c)), 'oklchx'),
    oklabx: (c: Oklabx) => convertLabToLch(c, 'oklchx'),
  },

  parse: undefined,
  serialize: undefined,
})
