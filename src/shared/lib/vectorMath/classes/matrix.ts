import { Vec3 } from './vec3'

// prettier-ignore
export type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
]

/** Transform matrix and its methods */
export class Matrix {
  /** The matrix elements */
  elements: Matrix4

  // prettier-ignore
  constructor(
    public m00: number, public m01: number, public m02: number, public m03: number,
    public m10: number, public m11: number, public m12: number, public m13: number,
    public m20: number, public m21: number, public m22: number, public m23: number,
    public m30: number, public m31: number, public m32: number, public m33: number,
  ) {
    // prettier-ignore
    this.elements = [
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33,
    ]
  }

  static identity(): Matrix {
    // prettier-ignore
    return new Matrix(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    )
  }

  static fromArray(arr: number[]): Matrix {
    // prettier-ignore
    return new Matrix(
      arr[0],  arr[1],  arr[2],  arr[3],
      arr[4],  arr[5],  arr[6],  arr[7],
      arr[8],  arr[9],  arr[10], arr[11],
      arr[12], arr[13], arr[14], arr[15],
    )
  }

  static fromMatrix(m: Matrix4): Matrix {
    // prettier-ignore
    return new Matrix(
      m[0],  m[1],  m[2],  m[3],
      m[4],  m[5],  m[6],  m[7],
      m[8],  m[9],  m[10], m[11],
      m[12], m[13], m[14], m[15]
    )
  }

  static fromTranslation(v: Vec3): Matrix {
    // prettier-ignore
    return new Matrix(
      1,   0,   0,   0,
      0,   1,   0,   0,
      0,   0,   1,   0,
      v.x, v.y, v.z, 1
    )
  }

  static fromScale(factor: number): Matrix {
    // prettier-ignore
    return new Matrix(
      factor, 0,      0,      0,
      0,      factor, 0,      0,
      0,      0,      factor, 0,
      0,      0,      0,      1
    )
  }

  static fromScaleVec(v: Vec3): Matrix {
    // prettier-ignore
    return new Matrix(
      v.x, 0,   0,   0,
      0,   v.y, 0,   0,
      0,   0,   v.z, 0,
      0,   0,   0,   1
    )
  }

  static fromRotationX(deg: number): Matrix {
    const rad = (deg * Math.PI) / 180
    const c = Math.cos(rad)
    const s = Math.sin(rad)
    // prettier-ignore
    return new Matrix(
      1, 0,  0, 0,
      0, c,  s, 0,
      0, -s, c, 0,
      0, 0,  0, 1
    )
  }

  static fromRotationY(deg: number): Matrix {
    const rad = (deg * Math.PI) / 180
    const c = Math.cos(rad)
    const s = Math.sin(rad)
    // prettier-ignore
    return new Matrix(
      c, 0, -s, 0,
      0, 1, 0,  0,
      s, 0, c,  0,
      0, 0, 0,  1
    )
  }

  static fromRotationZ(deg: number): Matrix {
    const rad = (deg * Math.PI) / 180
    const c = Math.cos(rad)
    const s = Math.sin(rad)
    // prettier-ignore
    return new Matrix(
      c,  s, 0, 0,
      -s, c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1
    )
  }

  static fromRotationAxis(axis: Vec3, rad: number): Matrix {
    const c = Math.cos(rad)
    const s = Math.sin(rad)
    const t = 1 - c
    const { x, y, z } = axis
    // prettier-ignore
    return new Matrix(
      t * x * x + c,     t * x * y + s * z, t * x * z - s * y, 0,
      t * x * y - s * z, t * y * y + c,     t * y * z + s * x, 0,
      t * x * z + s * y, t * y * z - s * x, t * z * z + c,     0,
      0,                 0,                 0,                 1
    )
  }

  // Export methods

  toArray(): number[] {
    return this.elements
  }

  toCssMatrix(): string {
    return `matrix3d(${this.elements.join(',')})`
  }

  //  Below are methods that return a new Matrix4

  /** Returns a new matrix that is the result of multiplying this matrix with another */
  add(m: Matrix): Matrix {
    // prettier-ignore
    return new Matrix(
      this.m00 + m.m00, this.m01 + m.m01, this.m02 + m.m02, this.m03 + m.m03,
      this.m10 + m.m10, this.m11 + m.m11, this.m12 + m.m12, this.m13 + m.m13,
      this.m20 + m.m20, this.m21 + m.m21, this.m22 + m.m22, this.m23 + m.m23,
      this.m30 + m.m30, this.m31 + m.m31, this.m32 + m.m32, this.m33 + m.m33
    )
  }

  sub(m: Matrix): Matrix {
    // prettier-ignore
    return new Matrix(
      this.m00 - m.m00, this.m01 - m.m01, this.m02 - m.m02, this.m03 - m.m03,
      this.m10 - m.m10, this.m11 - m.m11, this.m12 - m.m12, this.m13 - m.m13,
      this.m20 - m.m20, this.m21 - m.m21, this.m22 - m.m22, this.m23 - m.m23,
      this.m30 - m.m30, this.m31 - m.m31, this.m32 - m.m32, this.m33 - m.m33
    )
  }

  mul(m: Matrix): Matrix {
    return new Matrix(
      this.m00 * m.m00 + this.m01 * m.m10 + this.m02 * m.m20 + this.m03 * m.m30,
      this.m00 * m.m01 + this.m01 * m.m11 + this.m02 * m.m21 + this.m03 * m.m31,
      this.m00 * m.m02 + this.m01 * m.m12 + this.m02 * m.m22 + this.m03 * m.m32,
      this.m00 * m.m03 + this.m01 * m.m13 + this.m02 * m.m23 + this.m03 * m.m33,
      this.m10 * m.m00 + this.m11 * m.m10 + this.m12 * m.m20 + this.m13 * m.m30,
      this.m10 * m.m01 + this.m11 * m.m11 + this.m12 * m.m21 + this.m13 * m.m31,
      this.m10 * m.m02 + this.m11 * m.m12 + this.m12 * m.m22 + this.m13 * m.m32,
      this.m10 * m.m03 + this.m11 * m.m13 + this.m12 * m.m23 + this.m13 * m.m33,
      this.m20 * m.m00 + this.m21 * m.m10 + this.m22 * m.m20 + this.m23 * m.m30,
      this.m20 * m.m01 + this.m21 * m.m11 + this.m22 * m.m21 + this.m23 * m.m31,
      this.m20 * m.m02 + this.m21 * m.m12 + this.m22 * m.m22 + this.m23 * m.m32,
      this.m20 * m.m03 + this.m21 * m.m13 + this.m22 * m.m23 + this.m23 * m.m33,
      this.m30 * m.m00 + this.m31 * m.m10 + this.m32 * m.m20 + this.m33 * m.m30,
      this.m30 * m.m01 + this.m31 * m.m11 + this.m32 * m.m21 + this.m33 * m.m31,
      this.m30 * m.m02 + this.m31 * m.m12 + this.m32 * m.m22 + this.m33 * m.m32,
      this.m30 * m.m03 + this.m31 * m.m13 + this.m32 * m.m23 + this.m33 * m.m33
    )
  }

  rotateX(angle: number): Matrix {
    return this.mul(Matrix.fromRotationX(angle))
  }

  rotateY(angle: number): Matrix {
    return this.mul(Matrix.fromRotationY(angle))
  }

  rotateZ(angle: number): Matrix {
    return this.mul(Matrix.fromRotationZ(angle))
  }

  scale(factor: number): Matrix {
    return this.mul(Matrix.fromScale(factor))
  }

  translate(x: number, y: number, z: number): Matrix {
    // prettier-ignore
    return new Matrix(
      this.m00,     this.m01,     this.m02,     this.m03,
      this.m10,     this.m11,     this.m12,     this.m13,
      this.m20,     this.m21,     this.m22,     this.m23,
      this.m30 + x, this.m31 + y, this.m32 + z, this.m33
    )
  }

  rotateByVector(initial: Vec3, target: Vec3): Matrix {
    const axis = initial.cross(target)
    const angle = initial.angle(target)
    const transform = Matrix.fromRotationAxis(axis, angle)
    return this.mul(transform)
  }

  equals(other: Matrix): boolean {
    return (
      this.m00 === other.m00 &&
      this.m01 === other.m01 &&
      this.m02 === other.m02 &&
      this.m03 === other.m03 &&
      this.m10 === other.m10 &&
      this.m11 === other.m11 &&
      this.m12 === other.m12 &&
      this.m13 === other.m13 &&
      this.m20 === other.m20 &&
      this.m21 === other.m21 &&
      this.m22 === other.m22 &&
      this.m23 === other.m23 &&
      this.m30 === other.m30 &&
      this.m31 === other.m31 &&
      this.m32 === other.m32 &&
      this.m33 === other.m33
    )
  }
}
