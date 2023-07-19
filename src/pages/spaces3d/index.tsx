import { ReactNode, useCallback, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import {
  CameraControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei'
import { useControls } from 'leva'
import './styles.scss'
import { spaces } from './spaces'
import { Boundary } from './Boundary'
import { Slider } from '@/shared/ui/Slider'
import { Button } from '@/shared/ui/Button'
import { makePlaneGeometry } from './gamuts'
import { Gradient } from './gradient'
import { Mode, Rgb } from 'culori'
import { ARButton, XR, useXR } from '@react-three/xr'
import { GamutPlane } from './XRayPlane'

export default function Spaces3d() {
  const morphState = useMorphState()
  const influences = useSpaceInfluence(morphState.state)
  const currentSpace =
    morphState.state.t < 0.5 ? morphState.state.from : morphState.state.to
  const [gradientMode, setGradientMode] = useState<Mode>('rgb')

  const { segments, wireframe, boundary } = useControls(
    'Display',
    {
      wireframe: false,
      boundary: false,
      segments: { value: 48, min: 6, max: 120, step: 12 },
    },
    { collapsed: true }
  )
  const { sRGB, P3, Rec2020, Prophoto, opacity } = useControls(
    'Gamuts',
    {
      sRGB: true,
      P3: false,
      Rec2020: false,
      Prophoto: false,
      opacity: { value: 0.2, min: 0, max: 1, step: 0.1 },
    },
    { collapsed: true }
  )
  const { colorA, colorB, show } = useControls(
    'Gradient',
    {
      show: false,
      colorA: { r: 255, b: 0, g: 0 },
      colorB: { r: 255, b: 255, g: 0 },
    },
    { collapsed: true }
  )
  const { show: showXray, angle } = useControls(
    'X-ray',
    {
      show: false,
      angle: { value: 0, min: 0, max: 360, step: 0.1 },
    },
    { collapsed: true }
  )

  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null)

  const colorARgb = useMemo(
    () =>
      ({
        mode: 'rgb',
        r: colorA.r / 255,
        g: colorA.g / 255,
        b: colorA.b / 255,
      } as Rgb),
    [colorA]
  )
  const colorBRgb = useMemo(
    () =>
      ({
        mode: 'rgb',
        r: colorB.r / 255,
        g: colorB.g / 255,
        b: colorB.b / 255,
      } as Rgb),
    [colorB]
  )

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
      <div className="ui">
        <div className="buttons">
          {spaces.map((space, i) => (
            <Button
              key={space.name}
              onClick={() => morphState.goTo(i)}
              className={currentSpace === i ? 'current' : ''}
            >
              {space.name}
            </Button>
          ))}
        </div>
        <div className="status">
          {spaces[morphState.state.from].name} →{' '}
          {spaces[morphState.state.to].name}
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={[morphState.state.t]}
            onValueChange={value => morphState.setProgress(value[0])}
            style={{ width: 400 }}
          />
        </div>
        {show && gradientMode !== spaces[currentSpace].mode && (
          <div className="status">
            <Button onClick={() => setGradientMode(spaces[currentSpace].mode)}>
              Set gradient in {spaces[currentSpace].name}
            </Button>
          </div>
        )}
      </div>

      <ARButton />

      <main className="canvas">
        <Canvas
          flat
          linear
          orthographic
          camera={{
            position: [0, 0, 2],
            zoom: 350,
          }}
        >
          <XR referenceSpace="local">
            {/* <Box
            args={[0.1, 0.1, 0.1]}
            material={new THREE.MeshNormalMaterial()}
            position={selectedPoint?.toArray() || [0, 0, 0]}
          /> */}

            <SceneWrapper>
              {showXray && <GamutPlane space={currentSpace} angle={angle} />}
              {show && (
                <Gradient
                  colorA={colorARgb}
                  colorB={colorBRgb}
                  mode={gradientMode}
                  morphState={morphState.state}
                />
              )}

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
                morphTargetInfluences={influences}
              />

              {sRGB && (
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
                  morphTargetInfluences={influences}
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
              morphTargetInfluences={influences}
            /> */}

              {P3 && (
                <mesh
                  geometry={p3Geometry}
                  material={secondaryMaterial}
                  morphTargetInfluences={influences}
                />
              )}
              {Rec2020 && (
                <mesh
                  geometry={rec2020Geometry}
                  material={secondaryMaterial}
                  morphTargetInfluences={influences}
                />
              )}
              {Prophoto && (
                <mesh
                  geometry={prophotoGeometry}
                  material={secondaryMaterial}
                  morphTargetInfluences={influences}
                />
              )}
            </SceneWrapper>
            {/* <axesHelper args={[1]} /> */}
          </XR>
        </Canvas>
      </main>
    </div>
  )
}

export type MorgphState = {
  from: number
  to: number
  t: number
}

function useMorphState(initial = { from: 0, to: 0, t: 1 } as MorgphState) {
  const [morphState, setMorphState] = useState<MorgphState>(initial)

  const setProgress = useCallback((t: number) => {
    t = Math.max(0, Math.min(1, t))
    setMorphState(state => ({ ...state, t }))
  }, [])

  const goTo = useCallback(
    (i: number, animationLength = 1000) => {
      if (!animationLength) {
        setMorphState(state => ({ from: state.to, to: i, t: 1 }))
        return
      }

      setMorphState(state => {
        let current = state.t < 0.5 ? state.from : state.to
        return { from: current, to: i, t: 0 }
      })
      const start = Date.now()
      const end = start + animationLength
      requestAnimationFrame(animate)

      function animate() {
        const now = Date.now()
        const t = (now - start) / animationLength
        setProgress(cosine(t))
        if (now < end) requestAnimationFrame(animate)
      }
    },
    [setProgress]
  )

  return { state: morphState, goTo, setProgress }
}

function useSpaceInfluence(morphState: MorgphState) {
  const { from, to, t } = morphState

  const morphTargetInfluences = useMemo(() => {
    const influences = new Array(spaces.length).fill(0)
    if (from === to) {
      influences[from] = 1
      return influences
    }
    influences[from] = 1 - t
    influences[to] = t
    return influences
  }, [from, to, t])

  return morphTargetInfluences
}

/** Cosine interpolation */
function cosine(t: number) {
  return 0.5 * (1 - Math.cos(t * Math.PI))
}

function SceneWrapper({ children }: { children: ReactNode }) {
  const isInAR = useXR(state => state.isPresenting)
  return (
    <>
      {!isInAR && (
        <>
          <CameraControls makeDefault />
          {/* <PerspectiveCamera position={[0, 0, 2]} makeDefault={perspective} /> */}
          {/* <OrthographicCamera
            position={[0, 0, 2]}
            zoom={350}
            // makeDefault={!perspective}
            makeDefault
          /> */}
        </>
      )}
      <group
        position={isInAR ? [0, 0, -0.5] : [0, -0.5, 0]}
        scale={isInAR ? [0.4, 0.4, 0.4] : undefined}
      >
        {children}
      </group>
    </>
  )
}
