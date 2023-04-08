import { Matrix } from './matrix'

export class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}

  /** Create vector from array */
  static fromArray(arr: number[]): Vec3 {
    return new Vec3(arr[0], arr[1], arr[2])
  }

  /** Convert vector to array */
  toArray(): number[] {
    return [this.x, this.y, this.z]
  }

  /** Multiply vector by matrix */
  transform(m: Matrix): Vec3 {
    const { x, y, z } = this
    return new Vec3(
      x * m.m00 + y * m.m10 + z * m.m20 + m.m30,
      x * m.m01 + y * m.m11 + z * m.m21 + m.m31,
      x * m.m02 + y * m.m12 + z * m.m22 + m.m32
    )
  }

  /** Add two vectors */
  add(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  /** Subtract two vectors */
  sub(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  /** Multiply vector by scalar */
  scale(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s)
  }

  /** Dot product of two vectors */
  dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  /** Cross product of two vectors */
  cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    )
  }

  /** Angle between two vectors in radians */
  angle(v: Vec3): number {
    return Math.acos(this.dot(v) / (this.length() * v.length()))
  }

  /** Angle between two vectors in degrees */
  angleDeg(v: Vec3): number {
    return this.angle(v) * (180 / Math.PI)
  }

  /** Length of vector */
  length(): number {
    return Math.sqrt(this.dot(this))
  }

  /** Normalize vector to length 1 */
  normalize(): Vec3 {
    return this.scale(1 / this.length())
  }
}
