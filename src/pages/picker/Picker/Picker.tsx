import { formatHex, parseHex } from 'culori'
import { useCallback, useEffect } from 'react'

import { useState } from 'react'
import { clampChroma } from '@/shared/lib/huelab'
import { HueSlider } from './HueSlider'
import { LCPanel } from './LCPanel'
import { Gamut, getMaxChroma } from './shared'
import './Picker.scss'
import { oklrch, Oklrch, oklrchToOklch } from './oklrch'
import { clamp } from './Touchpad'

type PickerEvent = {
  /** Gamut clamped hex */
  value: string // hex
  oklch: Oklrch // intention
}

export function HexPicker(props: {
  value: string
  onChange: (event: PickerEvent) => void
}) {
  const { value, onChange } = props
  const [intention, setIntention] = useState<Oklrch>(toOklrch(value))
  const [hex, setHex] = useState<string | null>(null)

  useEffect(() => {
    if (isEqualHex(value, hex)) return
    // Value changed from outside
    setHex(value)
    setIntention(toOklrch(value))
  }, [intention, hex, value])

  const onIntentionChange = useCallback(
    (color: Oklrch) => {
      setIntention(color)
      const newHex = toHex(color)
      setHex(newHex)
      onChange({ value: newHex, oklch: color })
    },
    [onChange]
  )

  return (
    <IntentionPicker
      value={intention}
      cssColor={hex}
      onColorChange={onIntentionChange}
      gamut={Gamut.SRGB}
    />
  )
}

function isEqualHex(a: any, b: any) {
  if (a === b) return true
  if (typeof a !== 'string' || typeof b !== 'string') return false
  return a.toLowerCase().replace('#', '') === b.toLowerCase().replace('#', '')
}
function toOklrch(hex: string): Oklrch {
  return oklrch(parseHex(hex))
}
function toHex(oklrch: Oklrch): string {
  return formatHex(clampChroma(oklrchToOklch(oklrch), Gamut.SRGB))
}

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

function IntentionPicker(
  props: DivProps & {
    value: Oklrch
    cssColor?: string | null
    gamut?: Gamut
    onColorChange: (color: Oklrch) => void
  }
) {
  const {
    value,
    cssColor,
    onColorChange: onChange,
    gamut = Gamut.SRGB,
    className,
    ...rest
  } = props
  const width = 280
  const height = 360

  const handleKeyDown = useKeyControlls(value, onChange, gamut)

  return (
    <div
      className={['pckr__wrapper', className].filter(Boolean).join(', ')}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <LCPanel
        width={width}
        height={height}
        lr={value.l}
        c={value.c}
        h={value.h || 0}
        gamut={gamut}
        pointerColor={cssColor}
        onChange={(l, c) => onChange({ ...value, l, c })}
      />
      <div style={{ padding: 8 }}>
        <HueSlider
          hue={value.h || 0}
          onChange={h => onChange({ ...value, h })}
        />
      </div>
    </div>
  )
}

/**
 * Use gaming like controls to change the color
 * W/S: Lightness
 * A/D: Chroma
 * Q/E: Hue
 * Shift: 5x step
 * Alt: 0.2x step
 */
function useKeyControlls(
  value: Oklrch,
  onChange: (value: Oklrch) => void,
  gamut: Gamut
) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      const lStep = 0.01
      const cStep = 0.005
      const hStep = 0.5
      const multiplier = e.shiftKey ? 5 : e.altKey ? 0.2 : 1
      switch (e.code) {
        // Handle WASD keys
        case 'KeyW':
          onChange({ ...value, l: clamp(value.l + lStep * multiplier) })
          break
        case 'KeyS':
          onChange({ ...value, l: clamp(value.l - lStep * multiplier) })
          break
        case 'KeyA':
          onChange({
            ...value,
            c: clamp(value.c - cStep * multiplier, 0, getMaxChroma(gamut)),
          })
          break
        case 'KeyD':
          onChange({
            ...value,
            c: clamp(value.c + cStep * multiplier, 0, getMaxChroma(gamut)),
          })
          break
        case 'KeyQ':
          onChange({ ...value, h: (value.h || 0) - hStep * multiplier })
          break
        case 'KeyE':
          onChange({ ...value, h: (value.h || 0) + hStep * multiplier })
          break
      }
    },
    [gamut, onChange, value]
  )
}
