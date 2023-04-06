import { Matrix, Vec3 } from '@/shared/lib/vectorMath/classes'
import { Rgb, oklab } from 'culori'

type Positions = {
  rgb: Vec3
  oklab: Vec3
}
export class Dot {
  public id: string
  public cssColor: string
  public position: Positions
  constructor(public r: number, public g: number, public b: number) {
    this.id = `${r},${g},${b}`
    this.cssColor = `rgb(${r},${g},${b})`
    const rgbColor = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 } as Rgb
    const oklabColor = oklab(rgbColor)

    this.position = {
      rgb: new Vec3(rgbColor.r, rgbColor.g, rgbColor.b).transform(rgbMx),
      oklab: new Vec3(oklabColor.a, oklabColor.l, oklabColor.b),
    }
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
.rotateZ(45)
.rotateX(45)
.rotateY(180)
