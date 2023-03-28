export type Vec3 = [number, number, number]

export function multiplyNum([x, y, z]: Vec3, num: number): Vec3 {
  return [x * num, y * num, z * num]
}

export function substract([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 {
  return [x1 - x2, y1 - y2, z1 - z2]
}

export function add([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 {
  return [x1 + x2, y1 + y2, z1 + z2]
}

export function distance([x, y, z]: Vec3) {
  return Math.sqrt(x * x + y * y + z * z)
}

export function normalize(v: Vec3): Vec3 {
  let d = distance(v)
  return [v[0] / d, v[1] / d, v[2] / d]
}

export function dot([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3) {
  return x1 * x2 + y1 * y2 + z1 * z2
}

export function cross([a1, a2, a3]: Vec3, [b1, b2, b3]: Vec3): Vec3 {
  return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1]
}

// prettier-ignore
export function getMatrixForLine(a: Vec3, b: Vec3) {
    const vec = substract(b,a)
    const xDir = normalize(vec)
    // const zDir = normalize(cross(xDir,[0,1,0]))
    const zDir = normalize([-xDir[1],xDir[0],-xDir[2]])
    const yDir = normalize(cross(xDir, zDir))
    return [
        xDir[0], -xDir[1], xDir[2], 0,
        yDir[0], -yDir[1], yDir[2], 0,
        zDir[0], -zDir[1], zDir[2], 0,
        a[0],    -a[1],    a[2],    1,
    ]
}

/*
  A
   |\
   | \
   |__\
  B    C
*/

export function position2matrix(position: [Vec3, Vec3, Vec3], size: number) {
  const [a, b, c] = position
  const xVec = substract(c, b)
  const yVec = substract(a, b)
  const zVec = normalize(cross(yVec, xVec))
  // prettier-ignore
  return [
    ...xVec, 0,
    ...yVec, 0,
    ...zVec, 0,
    b[0]* size, b[1]* size, b[2]* size, 1
  ]
}
