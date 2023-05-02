import { Color, Mode, Rgb, interpolate } from 'culori'
import type { MorgphState } from '.'
import * as THREE from 'three'
import { rgb } from 'culori'
import { spaces } from './spaces'
import { lerp } from '@/shared/lib/math'
import { Line } from '@react-three/drei'
import { useMemo } from 'react'

type GradientProps = {
  colorA: Color
  colorB: Color
  mode?: Mode
  steps?: number
  morphState: MorgphState
}

export function Gradient(props: GradientProps) {
  const { colorA, colorB, mode, steps = 64, morphState } = props

  const { colors, positions, vertexColors } = useMemo(() => {
    const start = rgb(colorA)
    const end = rgb(colorB)

    const interpolator = interpolate([start, end], mode)
    const colors = [] as Rgb[]

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      colors.push(rgb(interpolator(t)))
      // colors.push({
      //   mode: 'rgb',
      //   r: lerp(start.r, end.r, t),
      //   g: lerp(start.g, end.g, t),
      //   b: lerp(start.b, end.b, t),
      // } as Rgb)
    }

    const positions = spaces.map(space => {
      return colors.map(color => {
        const vector = new THREE.Vector3(...space.toPosition(color))
        if (space.mx) vector.applyMatrix4(space.mx)
        return [vector.x, vector.y, vector.z] as [number, number, number]
      })
    })

    const vertexColors = colors.map(color => {
      return [color.r, color.g, color.b] as [number, number, number]
    })

    return { colors, positions, vertexColors }
  }, [colorA, colorB, mode, steps])

  const currentPositions = useMemo(() => {
    return positions[morphState.from].map((from, i) => {
      const to = positions[morphState.to][i]
      return [
        lerp(from[0], to[0], morphState.t),
        lerp(from[1], to[1], morphState.t),
        lerp(from[2], to[2], morphState.t),
      ] as [number, number, number]
    })
  }, [positions, morphState])

  return (
    <>
      <Line
        points={currentPositions}
        color={0xffffff}
        vertexColors={vertexColors}
        lineWidth={10}
      />
    </>
  )
}
