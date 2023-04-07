import { Matrix } from '@/shared/lib/vectorMath/classes'
import { Dot } from './Dot'

const POLYGON_SIZE = 20

/*
  A
   |\
   | \
   |__\
  B    C
*/
//              ↑    ↙    ↘
type Polygon = [Dot, Dot, Dot]

export function polygon2matrix(
  polygon: Polygon,
  key: keyof Dot['position'],
  size: number
) {
  const a = polygon[0].position[key]
  const b = polygon[1].position[key]
  const c = polygon[2].position[key]
  const xVec = c.sub(b)
  const yVec = a.sub(b)
  const zVec = yVec.cross(xVec).normalize()

  // prettier-ignore
  return new Matrix(
    xVec.x, xVec.y, xVec.z, 0,
    yVec.x, yVec.y, yVec.z, 0,
    zVec.x, zVec.y, zVec.z, 0,
    0,      0,      0,      1
  )
  .scale(size / POLYGON_SIZE)
  .translate(b.x * size, b.y * size, b.z * size)
  .toCssMatrix()
}

export function makeRgbCube(divs: number) {
  let polygons = [] as Polygon[]

  const step = 255 / divs

  const front = [] as Dot[][]
  const back = [] as Dot[][]
  const left = [] as Dot[][]
  const right = [] as Dot[][]
  const top = [] as Dot[][]
  const bottom = [] as Dot[][]

  for (let i = 0; i <= divs; i++) {
    const frontRow = [] as Dot[]
    const backRow = [] as Dot[]
    const leftRow = [] as Dot[]
    const rightRow = [] as Dot[]
    const topRow = [] as Dot[]
    const bottomRow = [] as Dot[]

    front.push(frontRow)
    back.push(backRow)
    left.push(leftRow)
    right.push(rightRow)
    top.push(topRow)
    bottom.push(bottomRow)

    for (let j = 0; j <= divs; j++) {
      const frontDot = new Dot(Math.round(i * step), Math.round(j * step), 255)
      const backDot = new Dot(Math.round(i * step), Math.round(j * step), 0)
      const leftDot = new Dot(0, Math.round(i * step), Math.round(j * step))
      const rightDot = new Dot(255, Math.round(i * step), Math.round(j * step))
      const topDot = new Dot(Math.round(i * step), 255, Math.round(j * step))
      const bottomDot = new Dot(Math.round(i * step), 0, Math.round(j * step))

      frontRow.push(frontDot)
      backRow.push(backDot)
      leftRow.push(leftDot)
      rightRow.push(rightDot)
      topRow.push(topDot)
      bottomRow.push(bottomDot)

      if (i > 0 && j > 0) {
        const polygonsToAdd: Polygon[] = [
          // Front
          [frontRow[j - 1], front[i - 1][j - 1], front[i - 1][j]],
          [frontRow[j - 1], frontRow[j], front[i - 1][j]],
          // Back
          [backRow[j - 1], back[i - 1][j - 1], back[i - 1][j]],
          [backRow[j - 1], backRow[j], back[i - 1][j]],
          // Left
          [leftRow[j - 1], left[i - 1][j - 1], left[i - 1][j]],
          [leftRow[j - 1], leftRow[j], left[i - 1][j]],
          // Right
          [rightRow[j - 1], right[i - 1][j - 1], right[i - 1][j]],
          [rightRow[j - 1], rightRow[j], right[i - 1][j]],
          // Top
          [topRow[j - 1], top[i - 1][j - 1], top[i - 1][j]],
          [topRow[j - 1], topRow[j], top[i - 1][j]],
          // Bottom
          [bottomRow[j - 1], bottom[i - 1][j - 1], bottom[i - 1][j]],
          [bottomRow[j - 1], bottomRow[j], bottom[i - 1][j]],
        ]
        polygons.push(...polygonsToAdd)
      }
    }
  }

  return polygons
}
