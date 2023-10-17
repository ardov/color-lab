import type { FC } from 'react'

import { Touchpad, clamp } from './Touchpad'
import { Pointer } from './Pointer'
import { Gamut, MAX_GAMUT_CHROMA } from './shared'
import { Canvas } from './Canvas'

export const LCPanel: FC<{
  width: number
  height: number
  lr: number
  c: number
  h: number
  gamut?: Gamut
  pointerColor?: string | null
  children?: React.ReactNode
  onChange: (l: number, c: number) => void
}> = props => {
  const {
    width,
    height,
    lr,
    c,
    h,
    gamut = 'srgb',
    pointerColor,
    children,
    onChange,
  } = props
  const maxChroma = MAX_GAMUT_CHROMA[gamut]

  return (
    <Touchpad
      onKey={offset => {
        const nextL = clamp(lr - offset.top)
        const nextC = clamp(c + offset.left * maxChroma, 0, maxChroma)
        onChange(nextL, nextC)
      }}
      onMove={position => {
        const { left, top } = position
        onChange(1 - top, left * maxChroma)
      }}
    >
      <Canvas
        width={width}
        height={height}
        hue={h}
        gamut={gamut}
        className="pckr__canvas"
      />
      <Pointer color={pointerColor} left={c / maxChroma} top={1 - lr} />
      {children}
    </Touchpad>
  )
}
