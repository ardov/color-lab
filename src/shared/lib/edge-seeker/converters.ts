type RGB = { r: number; g: number; b: number }
type XYZ = { x: number; y: number; z: number }
type LMS = { l: number; m: number; s: number }
type LAB = { l: number; a: number; b: number }
type LCH = { l: number; c: number; h: number }

const linearize = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

const rgbToLinear = ({ r, g, b }: RGB): RGB => ({
  r: linearize(r),
  g: linearize(g),
  b: linearize(b),
})

// prettier-ignore
const lrgbToXyz = ({r, g, b}: RGB): XYZ => ({
  x: 0.41239079926595934 * r + 0.35758433938387800 * g + 0.18048078840183430 * b,
  y: 0.21263900587151027 * r + 0.71516867876775600 * g + 0.07219231536073371 * b,
  z: 0.01933081871559182 * r + 0.11919477979462598 * g + 0.95053215224966070 * b,
})

// prettier-ignore
const lp3ToXyz = ({r, g, b}: RGB): XYZ => ({
  x: 0.4865709486482162 * r + 0.26566769316909306 * g + 0.1982172852343625 * b,
  y: 0.2289745640697488 * r + 0.69173852183650640 * g + 0.0792869140937450 * b,
  z: 0.0000000000000000 * r + 0.04511338185890264 * g + 1.0439443689009760 * b,
})

// prettier-ignore
const xyzToLms = ({x, y, z}: XYZ): LMS => ({
  l: 0.8190224379967030 * x + 0.3619062600528904 * y - 0.1288737815209879 * z,
  m: 0.0329836539323885 * x + 0.9292868615863434 * y + 0.0361446663506424 * z,
  s: 0.0481771893596242 * x + 0.2642395317527308 * y + 0.6335478284694309 * z,
})

// prettier-ignore
const lmsToOklab = ({l, m, s}: LMS): LAB => {
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  
  return {
    l: 0.2104542683093140 * l_ + 0.7936177747023054 * m_ - 0.0040720430116193 * s_,
    a: 1.9779985324311684 * l_ - 2.4285922420485799 * m_ + 0.4505937096174110 * s_,
    b: 0.0259040424655478 * l_ + 0.7827717124575296 * m_ - 0.8086757549230774 * s_,
  }
}

const normalizeHue = (h: number) => ((h % 360) + 360) % 360

const oklabToOklch = ({ l, a, b }: LAB): LCH => {
  const precision = 1e-6
  const isAchromatic = Math.abs(a) < precision && Math.abs(b) < precision
  const c = isAchromatic ? 0 : Math.hypot(a, b)
  const h = isAchromatic ? 0 : normalizeHue(Math.atan2(b, a) * (180 / Math.PI))
  return { l, c, h }
}

const xyzToOklch = (xyz: XYZ): LCH => oklabToOklch(lmsToOklab(xyzToLms(xyz)))

/** RGB → Linear RGB → XYZ → OKLab → OKLCH */
export const srgbToOklch = (rgb: RGB): LCH =>
  xyzToOklch(lrgbToXyz(rgbToLinear(rgb)))

/** P3 → Linear P3 → XYZ → OKLab → OKLCH */
export const p3ToOklch = (p3: RGB): LCH => xyzToOklch(lp3ToXyz(rgbToLinear(p3)))
