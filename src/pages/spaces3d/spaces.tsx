import * as THREE from 'three'
import {
  Rgb,
  dlab,
  hsl,
  hsv,
  jab,
  lab,
  lch,
  luv,
  okhsl,
  okhsv,
  oklab,
  oklch,
  rgb,
  xyz50,
  yiq,
} from 'culori'
import { betterToe } from '@/shared/lib/huelab'
import { Box, Cylinder, Plane } from '@react-three/drei'
import { useEffect, useRef } from 'react'

const invertedX = () =>
  new THREE.Matrix4().fromArray([
    -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ])

type SpaceObj = {
  name: string
  mx?: THREE.Matrix4
  boundary?: BoundaryType
  fn: (color: Rgb, ref?: Rgb | number) => [number, number, number]
}
export const spaces: SpaceObj[] = [
  {
    name: 'sRGB',
    mx: getRgbMatrix(),
    fn: color => {
      const { r, g, b } = rgb(color)
      return [r, g, b]
    },
  },
  {
    name: 'HSL',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(-28))),
    fn: color => {
      const { h, s, l } = hsl(color)
      return [Math.cos(rad(h)) * s, l, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'OKHSL',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(20))),
    fn: color => {
      const { h, s, l } = okhsl(color)
      return [Math.cos(rad(h)) * s, l, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'HSV',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(-28))),
    fn: color => {
      const { h, s, v } = hsv(color)
      return [Math.cos(rad(h)) * s, v, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'OKHSV',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(20))),
    fn: color => {
      const { h, s, v } = okhsv(color)
      return [Math.cos(rad(h)) * s, v, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'OKLAB',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(18))),
    fn: color => {
      const { l, a, b } = oklab(color)
      return [a, l, b]
    },
  },
  {
    name: 'OKLrAB',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(18))),
    fn: color => {
      const { l, a, b } = oklab(color)
      return [a, betterToe(l), b]
    },
  },
  {
    name: 'OKLrCH',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(18))),
    fn: (color, ref) => {
      const { l, c, h } = oklch(color)
      const lr = 1 - betterToe(l)

      const getAngle = () => {
        if (typeof ref === 'number') return ref
        if (ref) return oklch(ref).h || 0
        return h || 0
      }

      const angle = getAngle()
      return [Math.cos(rad(angle)) * lr, c, Math.sin(rad(angle)) * lr]
    },
  },
  {
    name: 'LAB',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(9))),
    fn: color => {
      const { l, a, b } = lab(color)
      return [a / 100, l / 100, b / 100]
    },
  },
  {
    name: 'LCH',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(9))),
    fn: (color, ref) => {
      const { l, c, h } = lch(color)
      const lightness = 1 - l / 100

      const getAngle = () => {
        if (typeof ref === 'number') return ref
        if (ref) return oklch(ref).h || 0
        return h || 0
      }

      const angle = getAngle()

      return [
        Math.cos(rad(angle)) * lightness,
        c / 100,
        Math.sin(rad(angle)) * lightness,
      ]
    },
  },
  {
    name: 'CIELuv',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(-5))),
    fn: color => {
      const { l, u, v } = luv(color)
      return [u / 100, l / 100, v / 100]
    },
  },
  {
    name: 'DIN99 Lab',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(9))),
    fn: color => {
      const { l, a, b } = dlab(color)
      return [a / 100, l / 100, b / 100]
    },
  },
  {
    name: 'Jab',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(9))),
    fn: color => {
      const { j, a, b } = jab(color)
      const m = 1 / 0.222
      return [a * m, j * m, b * m]
    },
  },
  {
    name: 'YIQ',
    mx: invertedX().multiply(new THREE.Matrix4().makeRotationY(rad(45))),
    fn: color => {
      const { y, i, q } = yiq(color)
      return [q, y, i]
    },
  },
  {
    name: 'CIE xyY',
    mx: getXyzMatrix(),
    boundary: 'unitBox',
    fn: color => {
      if (color.r === 0 && color.g === 0 && color.b === 0) {
        const { x, y, z } = xyz50({ mode: 'rgb', r: 1, g: 1, b: 1 })
        const sum = x + y + z
        return [x / sum, y / sum, 0]
      }
      const { x, y, z } = xyz50(color)
      const sum = x + y + z
      return [x / sum, y / sum, y]
    },
  },
]

type BoundaryType = 'unitBox' | 'planeXY' | 'cylinder'

type BoundaryProps = {
  type?: BoundaryType
  mx?: THREE.Matrix4
}

const boundaryMaterial = new THREE.MeshBasicMaterial({
  color: 'red',
  wireframe: true,
})

export function Boundary(props: BoundaryProps) {
  const { type, mx } = props
  const mesh = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (mesh.current && mx) {
      mesh.current.applyMatrix4(mx)
    }
  }, [mesh, mx, type])

  if (!type) return null
  if (type === 'unitBox') {
    return (
      <Box
        args={[1, 1, 1]}
        position={[0.5, 0.5, 0.5]}
        material={boundaryMaterial}
        ref={mesh}
      />
    )
  }
  if (type === 'planeXY') {
    return (
      <Plane
        args={[1, 1]}
        position={[0.5, 0.5, 0]}
        material={boundaryMaterial}
        ref={mesh}
      />
    )
  }
  if (type === 'cylinder') {
    return (
      <Cylinder
        args={[1, 1, 1, 32]}
        position={[0, 0.1, 0]}
        material={boundaryMaterial}
        ref={mesh}
      />
    )
  }
  return null
}

function getRgbMatrix() {
  const s = 1 / Math.sqrt(3)
  return new THREE.Matrix4()
    .identity()
    .multiply(new THREE.Matrix4().makeScale(s, s, s))
    .multiply(new THREE.Matrix4().makeRotationY(rad(180)))
    .multiply(new THREE.Matrix4().makeRotationX(rad(-35)))
    .multiply(new THREE.Matrix4().makeRotationZ(rad(45)))
}

function getXyzMatrix() {
  return new THREE.Matrix4()
    .identity()
    .multiply(new THREE.Matrix4().makeTranslation(0.36, 0, -0.08))
    .multiply(new THREE.Matrix4().makeRotationY(rad(-146)))
    .multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.5))
    .multiply(new THREE.Matrix4().makeRotationX(rad(-90)))
}

function rad(deg?: number) {
  return ((deg || 0) * Math.PI) / 180
}
