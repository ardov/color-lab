import { useCallback, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import './styles.scss'
import { P3, Rgb, rgb } from 'culori'
import { spaces } from './spaces'
import { Slider } from '@/shared/ui/Slider'
import { Button } from '@/shared/ui/Button'

export function Spaces3d() {
  const { segments, wireframe } = useControls('Display', {
    segments: { value: 24, min: 1, max: 32, step: 4 },
    wireframe: false,
  })
  const { showP3, opacity } = useControls('P3', {
    showP3: false,
    opacity: { value: 0.2, min: 0, max: 1, step: 0.1 },
  })
  const [fromTo, setFromTo] = useState([0, 0] as [number, number])
  const [progress, setProgress] = useState(1)
  const [morphTargetInfluences, setMorphTargetInfluences] = useState(
    spaces.map((_, i) => (i === 0 ? 1 : 0) as number)
  )

  const interpolate = useCallback((t: number, fromTo: [number, number]) => {
    setProgress(t)
    setMorphTargetInfluences(influences => {
      return influences.map((_, i) => {
        if (i === fromTo[1]) return t
        if (i === fromTo[0]) return 1 - t
        return 0
      })
    })
  }, [])

  const currentSpace = progress < 0.5 ? fromTo[0] : fromTo[1]

  const goTo = useCallback(
    (i: number) => {
      setFromTo([fromTo[1], i])
      setProgress(1)

      const animationLength = 1000
      const start = Date.now()
      const end = start + animationLength
      requestAnimationFrame(animate)

      function animate() {
        const now = Date.now()
        // Cosine interpolation
        const t =
          0.5 * (1 - Math.cos(((now - start) / animationLength) * Math.PI))
        interpolate(t, [fromTo[1], i])
        if (now < end) requestAnimationFrame(animate)
      }
    },
    [fromTo, interpolate]
  )

  const rgbGeometry = useMemo(() => makeRgbCube(segments), [segments])
  const p3Geometry = useMemo(() => makeP3Cube(segments), [segments])

  return (
    <div className="main">
      <div className="buttons">
        {spaces.map((space, i) => (
          <Button
            key={space.name}
            onClick={() => goTo(i)}
            className={currentSpace === i ? 'current' : ''}
          >
            {space.name}
          </Button>
        ))}
      </div>
      <div className="status">
        {spaces[fromTo[0]].name} → {spaces[fromTo[1]].name}
        <Slider
          min={0}
          max={1}
          step={0.001}
          value={[progress]}
          onValueChange={value => interpolate(value[0], fromTo)}
          style={{ width: 400 }}
        />
      </div>
      <main className="canvas">
        <Canvas
          flat
          linear
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 0, 2],
          }}
        >
          <OrbitControls makeDefault />
          <group position={[0, -0.5, 0]}>
            <mesh
              geometry={rgbGeometry}
              material={
                new THREE.MeshBasicMaterial({
                  side: THREE.DoubleSide,
                  vertexColors: true,
                  wireframe,
                })
              }
              morphTargetInfluences={morphTargetInfluences}
            />
            {showP3 && (
              <mesh
                geometry={p3Geometry}
                material={
                  new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    vertexColors: true,
                    wireframe: true,
                    transparent: true,
                    opacity,
                  })
                }
                morphTargetInfluences={morphTargetInfluences}
              />
            )}
          </group>
          {/* <axesHelper args={[5]} /> */}
        </Canvas>
      </main>
    </div>
  )
}

// ———————————————————————————————————————————————————————————————————————————
// ———————————————————————————————————————————————————————————————————————————
// ———————————————————————————————————————————————————————————————————————————

function makeRgbCube(segments = 32) {
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

  for (let i = 0; i < count; i++) {
    const start = i * itemSize
    const r = array[start]
    const g = array[start + 1]
    const b = array[start + 2]

    const rgbColor = { mode: 'rgb', r, g, b } as Rgb

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

function makeP3Cube(segments = 32) {
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
    const r = array[start]
    const g = array[start + 1]
    const b = array[start + 2]

    const p3Color = { mode: 'p3', r, g, b } as P3
    const rgbColor = rgb(p3Color)

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

export function getRgbMatrix() {
  const s = 1 / Math.sqrt(3)
  return new THREE.Matrix4()
    .fromArray([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    .multiply(new THREE.Matrix4().makeScale(s, s, s))
    .multiply(new THREE.Matrix4().makeRotationY(rad(180)))
    .multiply(new THREE.Matrix4().makeRotationX(rad(-35)))
    .multiply(new THREE.Matrix4().makeRotationZ(rad(45)))
}

export function rad(deg?: number) {
  return ((deg || 0) * Math.PI) / 180
}
