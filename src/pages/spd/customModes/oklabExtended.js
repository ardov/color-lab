/*
  The code is based on the following comment of Björn Ottosson:
  https://github.com/w3c/csswg-drafts/issues/9449#issuecomment-1948512394
 */

// Matrices definition
const MATRIX_1_XYZ_TO_LMS = [
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707],
]
const MATRIX_2_LMS_TO_LAB = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
]
const MATRIX_1_LMS_TO_XYZ = matrixInverse(MATRIX_1_XYZ_TO_LMS)
const MATRIX_2_LAB_TO_LMS = matrixInverse(MATRIX_2_LMS_TO_LAB)

/**
 * Conversion from OklabExtended to XYZ
 * @param {[number,number,number]} Lab
 * @returns {[number,number,number]} XYZ
 */
export function OklabExtended_to_XYZ(Lab) {
  let LMS = dotProd(MATRIX_2_LAB_TO_LMS, Lab)
  let LMS_prime = uncompress(spow(compress(LMS), 3))
  let XYZ = dotProd(MATRIX_1_LMS_TO_XYZ, LMS_prime)
  return XYZ
}

/**
 * Conversion from XYZ to OklabExtended
 * @param {[number,number,number]} XYZ
 * @returns {[number,number,number]} Lab
 */
export function XYZ_to_OklabExtended(XYZ) {
  let LMS = dotProd(MATRIX_1_XYZ_TO_LMS, XYZ)
  let LMS_prime = uncompress(spow(compress(LMS), 1 / 3))
  let Lab = dotProd(MATRIX_2_LMS_TO_LAB, LMS_prime)
  return Lab
}

//
//
//
//
//
//

// Compression function
function compress([x, y, z]) {
  let C = (x + y + z) / 3
  let R = Math.sqrt((x - C) ** 2 + (y - C) ** 2 + (z - C) ** 2)
  R *= Math.sqrt(2 / 3)

  if (R === 0 || C === 0) return [0, 0, 0]

  x = (x - C) / R
  y = (y - C) / R
  z = (z - C) / R

  let r = R / C
  let s = -Math.min(x, y, z)

  let t =
    1 /
    (0.5 + ((s - 0.5) ** 2 + (Math.sqrt(4 / r ** 2 + 1) - 1) ** 2 / 4) ** 0.5)

  x = C * x * t + C
  y = C * y * t + C
  z = C * z * t + C

  return [x, y, z].map(x => (isNaN(x) ? 0 : x))
}

// Uncompression function
function uncompress([x, y, z]) {
  let C = (x + y + z) / 3
  let R = Math.sqrt((x - C) ** 2 + (y - C) ** 2 + (z - C) ** 2)
  R *= Math.sqrt(2 / 3)

  if (R === 0 || C === 0) return [0, 0, 0]

  x = (x - C) / R
  y = (y - C) / R
  z = (z - C) / R

  let t = R / C
  let s = -Math.min(x, y, z)

  let r =
    2 /
    Math.sqrt((2 * Math.sqrt((1 / t - 0.5) ** 2 - (s - 0.5) ** 2) + 1) ** 2 - 1)

  x = C * x * r + C
  y = C * y * r + C
  z = C * z * r + C

  return [x, y, z].map(x => (isNaN(x) ? 0 : x))
}

// Element-wise power function with sign preservation
function spow(a, p) {
  return a.map(x => {
    const res = Math.sign(x) * Math.abs(x) ** p
    return isNaN(res) ? 0 : res
  })
}

function matrixInverse(m) {
  // Calculate the determinant of the matrix
  const det =
    m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])

  if (det === 0) {
    throw new Error('The matrix has no inverse (determinant is 0).')
  }

  const invDet = 1 / det

  // Calculate the adjugate matrix
  const adjugate = [
    [
      (m[1][1] * m[2][2] - m[2][1] * m[1][2]) * invDet,
      (m[0][1] * m[2][2] - m[0][2] * m[2][1]) * invDet * -1,
      (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet,
    ],
    [
      (m[1][0] * m[2][2] - m[1][2] * m[2][0]) * invDet * -1,
      (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet,
      (m[0][0] * m[1][2] - m[1][0] * m[0][2]) * invDet * -1,
    ],
    [
      (m[1][0] * m[2][1] - m[2][0] * m[1][1]) * invDet,
      (m[0][0] * m[2][1] - m[2][0] * m[0][1]) * invDet * -1,
      (m[0][0] * m[1][1] - m[1][0] * m[0][1]) * invDet,
    ],
  ]

  return adjugate
}

function dotProd(matrix, vector) {
  if (matrix.length !== 3 || vector.length !== 3) {
    throw new Error(
      'The matrix must be 3x3 and the vector must be 3-dimensional.'
    )
  }

  return matrix.map(row =>
    row.reduce((acc, val, index) => acc + val * vector[index], 0)
  )
}
