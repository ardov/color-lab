import * as THREE from 'three'
import {
  Mode,
  Rgb,
  dlab,
  dlch,
  hsl,
  hsv,
  jab,
  lab,
  lch,
  lchuv,
  luv,
  okhsl,
  okhsv,
  oklab,
  oklch,
  p3,
  rgb,
  xyz50,
  yiq,
} from 'culori'
import { betterToe, betterToeInv } from '@/shared/lib/huelab'

const colorToAlign: Rgb = { mode: 'rgb', r: 1, g: 1, b: 0 }

export type BoundaryType = 'unitBox' | 'cylinder'

type SpaceObj = {
  /** Unique color space name */
  name: string
  /** Culori mode */
  mode: Mode
  /** Matrix to align the space with others */
  mx?: THREE.Matrix4
  /** Space limits */
  boundary?: BoundaryType
  /** Function to convert color to 3D coordinates */
  toPosition: (color: Rgb, ref?: Rgb | number) => [number, number, number]
  /** Function to convert 3D coordinates to color */
  fromPosition: (x: number, y: number, z: number) => Rgb
}

// —————————————————————————————————————————————————————————————————————————————
// RGB SPACES
// —————————————————————————————————————————————————————————————————————————————

/** RGB */
const rgbSpace: SpaceObj = {
  name: 'sRGB',
  mode: 'rgb',
  mx: getRgbMatrix(),
  toPosition: color => {
    const { r, g, b } = rgb(color)
    return [r, g, b]
  },
  fromPosition: (x, y, z) => {
    return { mode: 'rgb', r: x, g: y, b: z } as Rgb
  },
}

/** HSL */
const hslSpace: SpaceObj = {
  name: 'HSL',
  mode: 'hsl',
  mx: alignToHue(hsl(colorToAlign).h),
  toPosition: color => {
    const { h, s, l } = hsl(color)
    return toCylinder(h, s, l)
  },
  fromPosition: (x, y, z) => {
    const [h, s, l] = fromCylinder(x, y, z)
    return rgb({ mode: 'hsl', h, s, l })
  },
}

/** HSV */
const hsvSpace: SpaceObj = {
  name: 'HSV',
  mode: 'hsv',
  mx: alignToHue(hsv(colorToAlign).h),
  toPosition: color => {
    const { h, s, v } = hsv(color)
    return toCylinder(h, s, v)
  },
  fromPosition: (x, y, z) => {
    const [h, s, v] = fromCylinder(x, y, z)
    return rgb({ mode: 'hsv', h, s, v })
  },
}

// —————————————————————————————————————————————————————————————————————————————
// GAMUT SPACES
// —————————————————————————————————————————————————————————————————————————————

/** P3 */
const p3Space: SpaceObj = {
  name: 'P3',
  mode: 'p3',
  mx: getRgbMatrix(),
  toPosition: color => {
    const { r, g, b } = p3(color)
    return [r, g, b]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'p3', r: x, g: y, b: z })
  },
}

// —————————————————————————————————————————————————————————————————————————————
// OKLAB SPACES
// —————————————————————————————————————————————————————————————————————————————

/** OKLAB */
const oklabSpace: SpaceObj = {
  name: 'OKLAB',
  mode: 'oklab',
  mx: alignToHue(oklch(colorToAlign).h),
  toPosition: color => {
    const { l, a, b } = oklab(color)
    return [b, l, a]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'oklab', l: y, a: z, b: x })
  },
}

/** OKLrAB */
const oklrabSpace: SpaceObj = {
  name: 'OKLrAB',
  mode: 'oklab',
  mx: alignToHue(oklch(colorToAlign).h),
  toPosition: color => {
    const { l, a, b } = oklab(color)
    return [b, betterToe(l), a]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'oklab', l: betterToeInv(y), a: z, b: x })
  },
}

/** OKLrCH */
const oklrchSpace: SpaceObj = {
  name: 'OKLrCH',
  mode: 'oklch',
  mx: alignToHue(oklch(colorToAlign).h),
  toPosition: (color, ref) => {
    const { l, c, h } = oklch(color)
    const lr = 1 - betterToe(l)
    const getAngle = () => {
      if (typeof ref === 'number') return ref
      if (ref) return oklch(ref).h || 0
      return h || 0
    }
    const angle = getAngle()
    return [Math.sin(rad(angle)) * lr, c, Math.cos(rad(angle)) * lr]
  },
  fromPosition: (x, y, z) => {
    const [h, l, c] = fromCylinder(x, y, z)
    return rgb({ mode: 'oklch', l: betterToeInv(1 - l), c, h })
  },
}

/** OKHSL */
const okhslSpace: SpaceObj = {
  name: 'OKHSL',
  mode: 'okhsl',
  mx: alignToHue(okhsl(colorToAlign).h),
  toPosition: color => {
    const { h, s, l } = okhsl(color)
    return toCylinder(h, s, l)
  },
  fromPosition: (x, y, z) => {
    const [h, s, l] = fromCylinder(x, y, z)
    return rgb({ mode: 'okhsl', h, s, l })
  },
}

/** OKHSV */
const okhsvSpace: SpaceObj = {
  name: 'OKHSV',
  mode: 'okhsv',
  mx: alignToHue(okhsv(colorToAlign).h),
  toPosition: color => {
    const { h, s, v } = okhsv(color)
    return toCylinder(h, s, v)
  },
  fromPosition: (x, y, z) => {
    const [h, s, v] = fromCylinder(x, y, z)
    return rgb({ mode: 'okhsv', h, s, v })
  },
}

// —————————————————————————————————————————————————————————————————————————————
// CIE SPACES
// —————————————————————————————————————————————————————————————————————————————

/** CIELAB */
const labSpace: SpaceObj = {
  name: 'LAB',
  mode: 'lab',
  mx: alignToHue(lch(colorToAlign).h),
  toPosition: color => {
    const { l, a, b } = lab(color)
    return [b / 100, l / 100, a / 100]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'lab', l: y * 100, a: z * 100, b: x * 100 })
  },
}

/** CIELCH */
const lchSpace: SpaceObj = {
  name: 'LCH',
  mode: 'lch',
  mx: alignToHue(lch(colorToAlign).h),
  toPosition: (color, ref) => {
    const { l, c, h } = lch(color)
    const lightness = 1 - l / 100
    const getAngle = () => {
      if (typeof ref === 'number') return ref
      if (ref) return oklch(ref).h || 0
      return h || 0
    }
    const angle = getAngle()
    return [
      Math.sin(rad(angle)) * lightness,
      c / 100,
      Math.cos(rad(angle)) * lightness,
    ]
  },
  fromPosition: (x, y, z) => {
    const [h, l, c] = fromCylinder(x, y, z)
    return rgb({ mode: 'lch', l: (1 - l) * 100, c: c * 100, h })
  },
}

/** CIELUV */
const luvSpace: SpaceObj = {
  name: 'CIELuv',
  mode: 'luv',
  mx: alignToHue(lchuv(colorToAlign).h),
  toPosition: color => {
    const { l, u, v } = luv(color)
    return [v / 100, l / 100, u / 100]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'luv', l: y * 100, u: z * 100, v: x * 100 })
  },
}

/** CIExyY */
const xyySpace: SpaceObj = {
  name: 'CIE xyY',
  mode: 'xyz50',
  mx: getXyzMatrix(),
  boundary: 'unitBox',
  toPosition: color => {
    if (color.r === 0 && color.g === 0 && color.b === 0) {
      const { x, y, z } = xyz50({ mode: 'rgb', r: 1, g: 1, b: 1 })
      const sum = x + y + z
      return [x / sum, y / sum, 0]
    }
    const { x, y, z } = xyz50(color)
    const sum = x + y + z
    return [x / sum, y / sum, y]
  },
  fromPosition: (x, y, z) => {
    const inverseTransform = (x: number, y: number, Y: number) => {
      const X = (Y / y) * x
      const Z = (Y / y) * (1 - x - y)
      return [X, Y, Z]
    }
    const inversed = inverseTransform(x, y, z)
    return rgb({
      mode: 'xyz50',
      x: inversed[0],
      y: inversed[1],
      z: inversed[2],
    })
  },
}

// —————————————————————————————————————————————————————————————————————————————
// OTHER SPACES
// —————————————————————————————————————————————————————————————————————————————

/** DIN99 LAB */
const dlabSpace: SpaceObj = {
  name: 'DIN99 Lab',
  mode: 'dlab',
  mx: alignToHue(dlch(colorToAlign).h),
  toPosition: color => {
    const { l, a, b } = dlab(color)
    return [b / 100, l / 100, a / 100]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'dlab', l: y * 100, a: z * 100, b: x * 100 })
  },
}

/** JAB */
const jabSpace: SpaceObj = {
  name: 'Jab',
  mode: 'jab',
  mx: alignToHue(100),
  toPosition: color => {
    const { j, a, b } = jab(color)
    const m = 1 / 0.222
    return [b * m, j * m, a * m]
  },
  fromPosition: (x, y, z) => {
    const m = 0.222
    return rgb({ mode: 'jab', j: y * m, a: z * m, b: x * m })
  },
}

/** YIQ */
const yiqSpace: SpaceObj = {
  name: 'YIQ',
  mode: 'yiq',
  mx: alignToHue(135),
  toPosition: color => {
    const { y, i, q } = yiq(color)
    return [i, y, q]
  },
  fromPosition: (x, y, z) => {
    return rgb({ mode: 'yiq', y: y, i: x, q: z })
  },
}

// —————————————————————————————————————————————————————————————————————————————
// SPACES LIST
// —————————————————————————————————————————————————————————————————————————————

export const spaces: SpaceObj[] = [
  rgbSpace,
  hslSpace,
  hsvSpace,
  p3Space,
  okhslSpace,
  okhsvSpace,
  oklabSpace,
  oklrabSpace,
  oklrchSpace,
  labSpace,
  lchSpace,
  luvSpace,
  dlabSpace,
  jabSpace,
  yiqSpace,
  xyySpace,
]

// —————————————————————————————————————————————————————————————————————————————
// HELPERS
// —————————————————————————————————————————————————————————————————————————————

function getRgbMatrix() {
  const s = 1 / Math.sqrt(3)
  return new THREE.Matrix4()
    .identity()
    .multiply(new THREE.Matrix4().makeScale(s, s, s))
    .multiply(new THREE.Matrix4().makeRotationY(rad(180)))
    .multiply(new THREE.Matrix4().makeRotationX(rad(-35)))
    .multiply(new THREE.Matrix4().makeRotationZ(rad(45)))
}

function getXyzMatrix() {
  return new THREE.Matrix4()
    .identity()
    .multiply(new THREE.Matrix4().makeTranslation(0.36, 0, -0.08))
    .multiply(new THREE.Matrix4().makeRotationY(rad(-146)))
    .multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.5))
    .multiply(new THREE.Matrix4().makeRotationX(rad(-90)))
}

function rad(deg?: number) {
  return ((deg || 0) * Math.PI) / 180
}

function deg(rad?: number) {
  return ((rad || 0) * 180) / Math.PI
}

function alignToHue(hue?: number) {
  return new THREE.Matrix4().makeRotationY(-rad(hue))
}

function toCylinder(
  h: number | undefined,
  s: number,
  l: number
): [number, number, number] {
  return [Math.sin(rad(h)) * s, l, Math.cos(rad(h)) * s]
}

// Inverse of toCylinder
function fromCylinder(
  x: number,
  y: number,
  z: number
): [number | undefined, number, number] {
  const h = Math.atan2(x, z)
  const s = Math.sqrt(x * x + z * z)
  return [deg(h), s, y]
}
