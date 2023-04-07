import { betterToe } from '@/shared/lib/huevo'
import { Matrix, Vec3 } from '@/shared/lib/vectorMath/classes'
import { Rgb, lab, oklab } from 'culori'

type Positions = {
  RGB: Vec3
  OKLAB: Vec3
  OKLrAB: Vec3
  LAB: Vec3
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

  return {
    RGB: new Vec3(rgbColor.r, rgbColor.g, rgbColor.b).transform(rgbMx),
    OKLAB: new Vec3(oklabColor.a, oklabColor.l, oklabColor.b),
    OKLrAB: new Vec3(oklabColor.a, betterToe(oklabColor.l), oklabColor.b),
    LAB: new Vec3(labColor.a / 100, labColor.l / 100, labColor.b / 100),
  }
}
