import { useCallback, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import {
  Box,
  CameraControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei'
import { useControls } from 'leva'
import './styles.scss'
import { spaces, Boundary } from './spaces'
import { Slider } from '@/shared/ui/Slider'
import { Button } from '@/shared/ui/Button'
import { makeCubeGeometry } from './gamuts'

export function Spaces3d() {
  const { segments, wireframe, boundary, perspective } = useControls(
    'Display',
    {
      perspective: true,
      wireframe: false,
      boundary: false,
      segments: { value: 24, min: 1, max: 32, step: 4 },
    }
  )
  const { P3, Rec2020, Prophoto, opacity } = useControls('Secondary', {
    P3: false,
    Rec2020: false,
    Prophoto: false,
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

  const rgbGeometry = useMemo(
    () => makeCubeGeometry('rgb', segments),
    [segments]
  )
  const p3Geometry = useMemo(() => makeCubeGeometry('p3', segments), [segments])
  const rec2020Geometry = useMemo(
    () => makeCubeGeometry('rec2020', segments),
    [segments]
  )
  const prophotoGeometry = useMemo(
    () => makeCubeGeometry('prophoto', segments),
    [segments]
  )

  const secondaryMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        vertexColors: true,
        wireframe: true,
        transparent: true,
        opacity,
      }),
    [opacity]
  )

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
          // camera={{
          //   fov: 75,
          //   near: 0.1,
          //   far: 1000,
          //   position: [0, 0, 2],
          // }}
        >
          <CameraControls makeDefault />
          <PerspectiveCamera position={[0, 0, 2]} makeDefault={perspective} />
          <OrthographicCamera
            position={[0, 0, 2]}
            zoom={350}
            makeDefault={!perspective}
          />
          {/* <Box
            args={[1, 1, 1]}
            material={
              new THREE.MeshBasicMaterial({
                wireframe: true,
              })
            }
          /> */}
          <group position={[0, -0.5, 0]}>
            {boundary && (
              <Boundary
                type={spaces[currentSpace].boundary}
                mx={spaces[currentSpace].mx}
              />
            )}
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
            {P3 && (
              <mesh
                geometry={p3Geometry}
                material={secondaryMaterial}
                morphTargetInfluences={morphTargetInfluences}
              />
            )}
            {Rec2020 && (
              <mesh
                geometry={rec2020Geometry}
                material={secondaryMaterial}
                morphTargetInfluences={morphTargetInfluences}
              />
            )}
            {Prophoto && (
              <mesh
                geometry={prophotoGeometry}
                material={secondaryMaterial}
                morphTargetInfluences={morphTargetInfluences}
              />
            )}
          </group>
          {/* <axesHelper args={[1]} /> */}
        </Canvas>
      </main>
    </div>
  )
}
