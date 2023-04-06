import { Matrix, multyplyMatrices, scale } from './useDragRotation'
import { Vec3, substract, normalize, cross } from './vectors'

/*
  A
   |\
   | \
   |__\
  B    C
*/
const POLYGON_SIZE = 20

export function position2matrix(position: [Vec3, Vec3, Vec3], size: number) {
  const [a, b, c] = position
  const xVec = substract(c, b)
  const yVec = substract(a, b)
  const zVec = normalize(cross(yVec, xVec))
  // prettier-ignore
  const mx = [
    ...xVec, 0,
    ...yVec, 0,
    ...zVec, 0,
    b[0] * size, b[1] * size, b[2] * size, 1
  ] as Matrix;
  return multyplyMatrices(mx, scale(size / POLYGON_SIZE))
}
