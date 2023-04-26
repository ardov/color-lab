import { useCallback, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import {
  VRButton,
  ARButton,
  XR,
  Controllers,
  Hands,
  RayGrab,
} from '@react-three/xr'
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
import { makeIndicatorGeometry, makePlaneGeometry } from './gamuts'

export function SpacesVR() {
  const { segments, wireframe, boundary, perspective } = useControls(
    'Display',
    {
      perspective: true,
      wireframe: false,
      boundary: false,
      segments: { value: 48, min: 6, max: 120, step: 12 },
    }
  )
  const { P3, Rec2020, Prophoto, opacity } = useControls('Secondary', {
    P3: false,
    Rec2020: false,
    Prophoto: false,
    opacity: { value: 0.2, min: 0, max: 1, step: 0.1 },
  })
  const { color, show } = useControls('Color', {
    show: true,
    color: { r: 200, b: 125, g: 106 },
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

  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null)

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

  const indicatorGeometry = useMemo(() => makeIndicatorGeometry(color), [color])

  const rgbGeometry2 = useMemo(
    () => makePlaneGeometry('rgb', segments, 1),
    [segments]
  )
  const grayGeometry = useMemo(
    () => makePlaneGeometry('rgb', segments, 0),
    [segments]
  )
  const p3Geometry = useMemo(
    () => makePlaneGeometry('p3', segments),
    [segments]
  )
  const rec2020Geometry = useMemo(
    () => makePlaneGeometry('rec2020', segments),
    [segments]
  )
  const prophotoGeometry = useMemo(
    () => makePlaneGeometry('prophoto', segments),
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
      <VRButton />
      <main className="canvas">
        <Canvas flat linear>
          <XR>
            <Controllers />
            <Hands />
            <CameraControls makeDefault />
            <PerspectiveCamera position={[0, 0, 2]} makeDefault={perspective} />
            <OrthographicCamera
              position={[0, 0, 2]}
              zoom={350}
              makeDefault={!perspective}
            />

            {/* <Box
            args={[0.1, 0.1, 0.1]}
            material={new THREE.MeshNormalMaterial()}
            position={selectedPoint?.toArray() || [0, 0, 0]}
          /> */}

            <RayGrab>
              <group position={[-0.5, 0.5, 0]} scale={[0.5, 0.5, 0.5]}>
                <mesh
                  onClick={e => setSelectedPoint(e.point)}
                  geometry={rgbGeometry2}
                  material={
                    new THREE.MeshBasicMaterial({
                      side: THREE.DoubleSide,
                      vertexColors: true,
                      wireframe,
                    })
                  }
                  morphTargetInfluences={morphTargetInfluences}
                />

                <mesh
                  onClick={e => setSelectedPoint(e.point)}
                  geometry={grayGeometry}
                  material={
                    new THREE.MeshBasicMaterial({
                      side: THREE.DoubleSide,
                      vertexColors: true,
                      wireframe,
                    })
                  }
                  morphTargetInfluences={morphTargetInfluences}
                />
                {show && (
                  <mesh
                    geometry={indicatorGeometry}
                    material={
                      new THREE.MeshBasicMaterial({
                        vertexColors: true,
                      })
                    }
                    morphTargetInfluences={morphTargetInfluences}
                  />
                )}
                {boundary && (
                  <Boundary
                    type={spaces[currentSpace].boundary}
                    mx={spaces[currentSpace].mx}
                  />
                )}
                {/* <mesh
              onClick={e => setSelectedPoint(e.point)}
              geometry={rgbGeometry}
              material={
                new THREE.MeshBasicMaterial({
                  side: THREE.DoubleSide,
                  vertexColors: true,
                  wireframe,
                })
              }
              morphTargetInfluences={morphTargetInfluences}
            /> */}

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
            </RayGrab>
            {/* <axesHelper args={[1]} /> */}
          </XR>
        </Canvas>
      </main>
    </div>
  )
}
