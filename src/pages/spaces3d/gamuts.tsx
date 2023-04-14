import * as THREE from 'three'
import { P3, Prophoto, Rec2020, Rgb, rgb } from 'culori'
import { spaces } from './spaces'

type SpaceName = 'rgb' | 'p3' | 'rec2020' | 'prophoto'

const toRgb = (from: SpaceName, r: number, g: number, b: number) => {
  if (from === 'rgb') return { mode: 'rgb', r, g, b } as Rgb
  if (from === 'p3') return rgb({ mode: 'p3', r, g, b } as P3)
  if (from === 'rec2020') return rgb({ mode: 'rec2020', r, g, b } as Rec2020)
  if (from === 'prophoto') return rgb({ mode: 'prophoto', r, g, b } as Prophoto)
  throw new Error('Invalid space')
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
      const [x, y, z] = space.fn(rgbColor)
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
