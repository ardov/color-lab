export type Vec3 = [number, number, number]

/** Scales vector by a number */
export function scale([x, y, z]: Vec3, s: number): Vec3 {
  return [x * s, y * s, z * s]
}

/** Substracts two vectors */
export function substract([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 {
  return [x1 - x2, y1 - y2, z1 - z2]
}

/** Adds two vectors */
export function add([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 {
  return [x1 + x2, y1 + y2, z1 + z2]
}

/** Calculates the length of a vector */
export function length([x, y, z]: Vec3) {
  return Math.sqrt(x * x + y * y + z * z)
}

/** Normalizes a vector to a length of 1 */
export function normalize(v: Vec3): Vec3 {
  let d = length(v)
  return [v[0] / d, v[1] / d, v[2] / d]
}

/** Calculates the dot product of two vectors */
export function dot([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3) {
  return x1 * x2 + y1 * y2 + z1 * z2
}

/** Calculates the cross product of two vectors */
export function cross([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 {
  return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2]
}
