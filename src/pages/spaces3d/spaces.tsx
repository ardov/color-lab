import * as THREE from 'three'
import {
  Mode,
  Rgb,
  dlab,
  dlch,
  hsl,
  hsv,
  jab,
  lab,
  lch,
  lchuv,
  luv,
  okhsl,
  okhsv,
  oklab,
  oklch,
  p3,
  rgb,
  xyz50,
  yiq,
} from 'culori'
import { betterToe } from '@/shared/lib/huelab'
import { Box, Cylinder, Plane } from '@react-three/drei'
import { useEffect, useRef } from 'react'

const colorToAlign: Rgb = { mode: 'rgb', r: 1, g: 1, b: 0 }

type BoundaryType = 'unitBox' | 'planeXY' | 'cylinder'

type SpaceObj = {
  /** Unique color space name */
  name: string
  /** Culori mode */
  mode: Mode
  /** Matrix to align the space with others */
  mx?: THREE.Matrix4
  /** Space limits */
  boundary?: BoundaryType
  /** Function to convert color to 3D coordinates */
  fn: (color: Rgb, ref?: Rgb | number) => [number, number, number]
}

export const spaces: SpaceObj[] = [
  {
    name: 'sRGB',
    mode: 'rgb',
    mx: getRgbMatrix(),
    fn: color => {
      const { r, g, b } = rgb(color)
      return [r, g, b]
    },
  },
  {
    name: 'HSL',
    mode: 'hsl',
    mx: alignToHue(hsl(colorToAlign).h),
    fn: color => {
      const { h, s, l } = hsl(color)
      return [Math.sin(rad(h)) * s, l, Math.cos(rad(h)) * s]
    },
  },
  {
    name: 'HSV',
    mode: 'hsv',
    mx: alignToHue(hsv(colorToAlign).h),
    fn: color => {
      const { h, s, v } = hsv(color)
      return [Math.sin(rad(h)) * s, v, Math.cos(rad(h)) * s]
    },
  },
  {
    name: 'P3',
    mode: 'p3',
    mx: getRgbMatrix(),
    fn: color => {
      const { r, g, b } = p3(color)
      return [r, g, b]
    },
  },
  {
    name: 'OKHSL',
    mode: 'okhsl',
    mx: alignToHue(okhsl(colorToAlign).h),
    fn: color => {
      const { h, s, l } = okhsl(color)
      return [Math.sin(rad(h)) * s, l, Math.cos(rad(h)) * s]
    },
  },
  {
    name: 'OKHSV',
    mode: 'okhsv',
    mx: alignToHue(okhsv(colorToAlign).h),
    fn: color => {
      const { h, s, v } = okhsv(color)
      return [Math.sin(rad(h)) * s, v, Math.cos(rad(h)) * s]
    },
  },
  {
    name: 'OKLAB',
    mode: 'oklab',
    mx: alignToHue(oklch(colorToAlign).h),
    fn: color => {
      const { l, a, b } = oklab(color)
      return [b, l, a]
    },
  },
  {
    name: 'OKLrAB',
    mode: 'oklab',
    mx: alignToHue(oklch(colorToAlign).h),
    fn: color => {
      const { l, a, b } = oklab(color)
      return [b, betterToe(l), a]
    },
  },
  {
    name: 'OKLrCH',
    mode: 'oklch',
    mx: alignToHue(oklch(colorToAlign).h),
    fn: (color, ref) => {
      const { l, c, h } = oklch(color)
      const lr = 1 - betterToe(l)

      const getAngle = () => {
        if (typeof ref === 'number') return ref
        if (ref) return oklch(ref).h || 0
        return h || 0
      }

      const angle = getAngle()
      return [Math.sin(rad(angle)) * lr, c, Math.cos(rad(angle)) * lr]
    },
  },
  {
    name: 'LAB',
    mode: 'lab',
    mx: alignToHue(lch(colorToAlign).h),
    fn: color => {
      const { l, a, b } = lab(color)
      return [b / 100, l / 100, a / 100]
    },
  },
  {
    name: 'LCH',
    mode: 'lch',
    mx: alignToHue(lch(colorToAlign).h),
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
        Math.sin(rad(angle)) * lightness,
        c / 100,
        Math.cos(rad(angle)) * lightness,
      ]
    },
  },
  {
    name: 'CIELuv',
    mode: 'luv',
    mx: alignToHue(lchuv(colorToAlign).h),
    fn: color => {
      const { l, u, v } = luv(color)
      return [v / 100, l / 100, u / 100]
    },
  },
  {
    name: 'DIN99 Lab',
    mode: 'dlab',
    mx: alignToHue(dlch(colorToAlign).h),
    fn: color => {
      const { l, a, b } = dlab(color)
      return [b / 100, l / 100, a / 100]
    },
  },
  {
    name: 'Jab',
    mode: 'jab',
    mx: alignToHue(100),
    fn: color => {
      const { j, a, b } = jab(color)
      const m = 1 / 0.222
      return [b * m, j * m, a * m]
    },
  },
  {
    name: 'YIQ',
    mode: 'yiq',
    mx: alignToHue(135),
    fn: color => {
      const { y, i, q } = yiq(color)
      return [i, y, q]
    },
  },
  {
    name: 'CIE xyY',
    mode: 'xyz50',
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

function alignToHue(hue?: number) {
  return new THREE.Matrix4().makeRotationY(-rad(hue))
}
