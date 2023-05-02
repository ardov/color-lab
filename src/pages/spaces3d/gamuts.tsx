import * as THREE from 'three'
import { Hsl, P3, Prophoto, Rec2020, Rgb, rgb } from 'culori'
import { spaces } from './spaces'

type GamutName = 'rgb' | 'p3' | 'rec2020' | 'prophoto'

const toRgb = (from: GamutName, r: number, g: number, b: number) => {
  if (from === 'rgb') return { mode: 'rgb', r, g, b } as Rgb
  if (from === 'p3') return rgb({ mode: 'p3', r, g, b } as P3)
  if (from === 'rec2020') return rgb({ mode: 'rec2020', r, g, b } as Rec2020)
  if (from === 'prophoto') return rgb({ mode: 'prophoto', r, g, b } as Prophoto)
  throw new Error('Invalid space')
}

const hslToRgb = (h: number, s: number, l: number, mode: GamutName) => {
  const { r, g, b } = rgb({ mode: 'hsl', h, s, l } as Hsl)
  return { mode, r, g, b } as Rgb
}

export function makeCubeGeometry(
  space: 'rgb' | 'p3' | 'rec2020' | 'prophoto' = 'rgb',
  segments = 32
) {
  const geometry = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments)
  geometry.translate(0.5, 0.5, 0.5)
  const initialPositions = geometry.attributes.position as THREE.BufferAttribute
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(initialPositions.array, 3)
  )

  const { array, itemSize, count } = geometry.attributes
    .color as THREE.BufferAttribute

  let positions = spaces.map(() => [] as number[])
  // let color = [] as number[]
  for (let i = 0; i < count; i++) {
    const start = i * itemSize

    const rgbColor = toRgb(
      space,
      array[start],
      array[start + 1],
      array[start + 2]
    )

    spaces.forEach((space, i) => {
      const [x, y, z] = space.toPosition(rgbColor)
      positions[i].push(x, y, z)
    })
  }

  geometry.morphAttributes.position = spaces.map((space, i) => {
    const attribute = new THREE.Float32BufferAttribute(positions[i], 3)
    if (space.mx) attribute.applyMatrix4(space.mx)
    return attribute
  })

  geometry.attributes.position = geometry.morphAttributes.position[0]
  geometry.computeVertexNormals()

  return geometry
}

export function makePlaneGeometry(
  space: 'rgb' | 'p3' | 'rec2020' | 'prophoto' = 'rgb',
  resolution = 32,
  saturation = 1
) {
  const heightSegments = 24
  const geometry = new THREE.PlaneGeometry(1, 1, resolution, heightSegments)
  geometry.translate(0.5, 0.5, 0)
  const pos = geometry.attributes.position as THREE.BufferAttribute

  const gridStep = 1 / heightSegments

  let positions = spaces.map(() => [] as number[])
  let color = [] as number[]

  for (let i = 0; i < pos.count; i++) {
    const start = i * pos.itemSize
    const x = pos.array[start]
    const y = pos.array[start + 1]
    const h = x * 360

    const hsl = { mode: 'hsl', h, s: saturation, l: y } as Hsl
    const { r, g, b } = rgb(hsl)

    color.push(r, g, b)

    const rgbColor = hslToRgb(h, saturation, y, space)

    const getRefColor = () => {
      if (!saturation) return h
      if (y === 1) return hslToRgb(h, saturation, 1 - gridStep, space)
      if (y === 0) return hslToRgb(h, saturation, gridStep, space)
      return undefined
    }

    spaces.forEach((space, i) => {
      const [x, y, z] = space.toPosition(rgbColor, getRefColor())
      positions[i].push(x, y, z)
    })
  }

  const colorAttribute = new THREE.Float32BufferAttribute(color, 3)
  geometry.setAttribute('color', colorAttribute)

  geometry.morphAttributes.position = spaces.map((space, i) => {
    const attribute = new THREE.Float32BufferAttribute(positions[i], 3)
    if (space.mx) attribute.applyMatrix4(space.mx)
    return attribute
  })

  // geometry.attributes.position = geometry.morphAttributes.position[0]
  // geometry.computeVertexNormals()

  return geometry
}

export function makeIndicatorGeometry(colorInitial: {
  r: number
  g: number
  b: number
}) {
  const size = 0.05
  const geometry = new THREE.BoxGeometry(size, size, size)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const colorRgb = {
    mode: 'rgb',
    r: colorInitial.r / 255,
    g: colorInitial.g / 255,
    b: colorInitial.b / 255,
  } as Rgb
  const positionsInSpaces = spaces.map(space => space.toPosition(colorRgb))

  let positions = spaces.map(() => [] as number[])
  let color = [] as number[]

  for (let i = 0; i < pos.count; i++) {
    const start = i * pos.itemSize
    const coordinates = [
      pos.array[start],
      pos.array[start + 1],
      pos.array[start + 2],
    ]

    color.push(colorRgb.r, colorRgb.g, colorRgb.b)

    spaces.forEach((space, i) => {
      positions[i].push(
        positionsInSpaces[i][0] + coordinates[0],
        positionsInSpaces[i][1] + coordinates[1],
        positionsInSpaces[i][2] + coordinates[2]
      )
    })
  }

  const colorAttribute = new THREE.Float32BufferAttribute(color, 3)
  geometry.setAttribute('color', colorAttribute)

  geometry.morphAttributes.position = spaces.map((space, i) => {
    const attribute = new THREE.Float32BufferAttribute(positions[i], 3)
    if (space.mx) attribute.applyMatrix4(space.mx)
    return attribute
  })

  geometry.attributes.position = geometry.morphAttributes.position[0]

  return geometry
}
