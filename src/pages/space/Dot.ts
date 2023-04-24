import { betterToe } from '@/shared/lib/huelab'
import { Matrix, Vec3 } from '@/shared/lib/vectorMath/classes'
import { Rgb, hsl, hsv, lab, lrgb, okhsl, okhsv, oklab } from 'culori'

type Positions = {
  RGB: Vec3
  OKLAB: Vec3
  OKLrAB: Vec3
  LAB: Vec3
  HSL: Vec3
  HSV: Vec3
  OKHSL: Vec3
  OKHSV: Vec3
  LRGB: Vec3
}
export class Dot {
  public id: string
  public cssColor: string
  public position: Positions
  constructor(public r: number, public g: number, public b: number) {
    this.id = `${r},${g},${b}`
    this.cssColor = `rgb(${r},${g},${b})`
    this.position = makePositions(r, g, b)
  }
}

// prettier-ignore
const rgbMx = new Matrix(
  -1, 0, 0, 0,
  0,  1, 0, 0,
  0,  0, 1, 0,
  0,  0, 0, 1
)
.scale(1 / Math.sqrt(3))
.rotateZ(-45)
.rotateX(-new Vec3(0, Math.sqrt(2), 1).angleDeg(new Vec3(0, 1, 0)))
.rotateY(180)

function makePositions(r: number, g: number, b: number) {
  const rgbColor = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 } as Rgb
  const oklabColor = oklab(rgbColor)
  const labColor = lab(rgbColor)
  const hslColor = hsl(rgbColor)
  const hslRadHue = (hslColor.h || 0) * (Math.PI / 180)
  const hsvColor = hsv(rgbColor)
  const hsvRadHue = (hsvColor.h || 0) * (Math.PI / 180)
  const okhslColor = okhsl(rgbColor)
  const okhslRadHue = (okhslColor.h || 0) * (Math.PI / 180)
  const okhsvColor = okhsv(rgbColor)
  const okhsvRadHue = (okhsvColor.h || 0) * (Math.PI / 180)
  const lrgbColor = lrgb(rgbColor)

  return {
    RGB: new Vec3(rgbColor.r, rgbColor.g, rgbColor.b).transform(rgbMx),
    OKLAB: new Vec3(oklabColor.a, oklabColor.l, oklabColor.b).transform(
      Matrix.fromRotationY(20)
    ),
    OKLrAB: new Vec3(
      oklabColor.a,
      betterToe(oklabColor.l),
      oklabColor.b
    ).transform(Matrix.fromRotationY(20)),
    LAB: new Vec3(
      labColor.a / 100,
      labColor.l / 100,
      labColor.b / 100
    ).transform(Matrix.fromRotationY(8)),
    HSL: new Vec3(
      Math.cos(hslRadHue) * hslColor.s,
      hslColor.l,
      Math.sin(hslRadHue) * hslColor.s
    ).transform(Matrix.fromRotationY(-30)),
    HSV: new Vec3(
      Math.cos(hsvRadHue) * hsvColor.s,
      hsvColor.v,
      Math.sin(hsvRadHue) * hsvColor.s
    ).transform(Matrix.fromRotationY(-30)),
    OKHSL: new Vec3(
      Math.cos(okhslRadHue) * okhslColor.s,
      okhslColor.l,
      Math.sin(okhslRadHue) * okhslColor.s
    ).transform(Matrix.fromRotationY(18)),
    OKHSV: new Vec3(
      Math.cos(okhsvRadHue) * okhsvColor.s,
      okhsvColor.v,
      Math.sin(okhsvRadHue) * okhsvColor.s
    ).transform(Matrix.fromRotationY(20)),
    LRGB: new Vec3(lrgbColor.r, lrgbColor.g, lrgbColor.b).transform(rgbMx),
  }
}
