import { useEffect, useRef, useState } from 'react'

const { sin, cos, PI } = Math

type Point = [number, number, number, number]

// prettier-ignore
type Matrix = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
]

// prettier-ignore
export const getIdentityMatrix = (): Matrix => [
  -1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]

// prettier-ignore
export const getYinvertedIdentityMatrix = (): Matrix => [
  1,  0, 0, 0,
  0, -1, 0, 0,
  0,  0, 1, 0,
  0,  0, 0, 1
]

const transformMatrix = (matrix: Matrix, deltaX: number, deltaY: number) => {
  const rate = 0.5
  const rotateX = xRotation(deltaY * rate)
  const rotateY = yRotation(-deltaX * rate)
  const transformMatrix = multiplyTwoMatrices(rotateX, rotateY)
  return multiplyTwoMatrices(transformMatrix, matrix)
}

const onCorner = () =>
  multyplyMatrices(
    yRotation(180),
    xRotation(45),
    zRotation(45),
    scale(1 / Math.sqrt(3)),
    getIdentityMatrix()
  )
const crnrMx = onCorner()
export const pointTo = (
  p: [number, number, number]
): [number, number, number] => {
  const r = multiplyMatrixAndPoint(crnrMx, [...p, 0])
  return [r[0], r[1], r[2]]
}

// const initial = onCorner()
const initial = getYinvertedIdentityMatrix()

export function useDragRotation() {
  const ref = useRef<HTMLDivElement>(null)
  const [matrix, setMatrix] = useState(initial)
  const [isDown, setIsDown] = useState(false)
  const [startPosition, setStartPosition] = useState([0, 0])

  useEffect(() => {
    const div = ref.current
    if (!div) return

    const handleStart = (e: MouseEvent) => {
      setIsDown(true)
      setStartPosition([e.clientX, e.clientY])
    }
    const handleMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      let deltaX = e.clientX - startPosition[0]
      let deltaY = e.clientY - startPosition[1]
      setStartPosition([e.clientX, e.clientY])
      setMatrix(transformMatrix(matrix, deltaX, deltaY))
    }
    const handleEnd = (e: MouseEvent) => {
      setIsDown(false)
    }
    const restoreInitial = () => {
      setMatrix(initial)
    }

    div.addEventListener('pointerdown', handleStart)
    div.addEventListener('dblclick', restoreInitial)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleEnd)
    return () => {
      div.removeEventListener('pointerdown', handleStart)
      div.removeEventListener('dblclick', restoreInitial)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleEnd)
    }
  }, [isDown, matrix, startPosition])

  return { sceneRef: ref, matrix, setMatrix }
}

// point • matrix
// prettier-ignore
function multiplyMatrixAndPoint(matrix: Matrix, point: Point): Point {
  let [x, y, z, w] = point
  let [
    c0r0, c1r0, c2r0, c3r0,
    c0r1, c1r1, c2r1, c3r1,
    c0r2, c1r2, c2r2, c3r2,
    c0r3, c1r3, c2r3, c3r3,
  ] = matrix
  return [
    x * c0r0 + y * c0r1 + z * c0r2 + w * c0r3,
    x * c1r0 + y * c1r1 + z * c1r2 + w * c1r3,
    x * c2r0 + y * c2r1 + z * c2r2 + w * c2r3,
    x * c3r0 + y * c3r1 + z * c3r2 + w * c3r3,
  ]
}

export function multyplyMatrices(initial: Matrix, ...params: Matrix[]) {
  return params.reduce((m, curr) => multiplyTwoMatrices(m, curr), initial)
}

// matrixB • matrixA
// prettier-ignore
export function multiplyTwoMatrices(mA: Matrix, mB: Matrix): Matrix {
  let row0 = [mB[ 0], mB[ 1], mB[ 2], mB[ 3]] as Point
  let row1 = [mB[ 4], mB[ 5], mB[ 6], mB[ 7]] as Point
  let row2 = [mB[ 8], mB[ 9], mB[10], mB[11]] as Point
  let row3 = [mB[12], mB[13], mB[14], mB[15]] as Point
  return [
    ...multiplyMatrixAndPoint(mA, row0),
    ...multiplyMatrixAndPoint(mA, row1),
    ...multiplyMatrixAndPoint(mA, row2),
    ...multiplyMatrixAndPoint(mA, row3),
  ] as Matrix
}

// prettier-ignore
export function xRotation(deg: number): Matrix {
  let a = deg  * (PI / 180)
  return [
       1,       0,        0,     0,
       0,  cos(a),  -sin(a),     0,
       0,  sin(a),   cos(a),     0,
       0,       0,        0,     1
  ];
}

// prettier-ignore
export function yRotation(deg: number): Matrix {
  let a = deg  * (PI / 180)
  return [
     cos(a),   0, sin(a),   0,
          0,   1,      0,   0,
    -sin(a),   0, cos(a),   0,
          0,   0,      0,   1
  ];
}

// prettier-ignore
export function zRotation(deg: number): Matrix {
  let a = deg  * (PI / 180)
  return [
    cos(a), -sin(a),    0,    0,
    sin(a),  cos(a),    0,    0,
         0,       0,    1,    0,
         0,       0,    0,    1
  ];
}

// prettier-ignore
export function scale(s: number): Matrix {
  return [
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, s, 0,
    0, 0, 0, 1
  ];
}
