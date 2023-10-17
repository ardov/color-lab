import { formatCss, formatHex, parse, parseHex } from 'culori'
import { useCallback, useEffect } from 'react'

import { useState } from 'react'
import { clampChroma } from '@/shared/lib/huelab'
import { HueSlider } from './HueSlider'
import { LCPanel } from './LCPanel'
import { Gamut, MAX_GAMUT_CHROMA } from './shared'
import './picker.scss'
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
      defaultGamut={'srgb'}
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
  return formatHex(clampChroma(oklrchToOklch(oklrch), 'srgb'))
}

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

function IntentionPicker(
  props: DivProps & {
    value: Oklrch
    cssColor?: string | null
    defaultGamut?: Gamut
    onColorChange: (color: Oklrch) => void
  }
) {
  const {
    value,
    cssColor,
    onColorChange: onChange,
    defaultGamut = 'srgb',
    className,
    ...rest
  } = props
  const width = 280
  const height = 360

  const [gamutState, setGamutState] = useState(defaultGamut)
  const handleKeyDown = useKeyControlls(value, onChange, defaultGamut)

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
        gamut={gamutState}
        pointerColor={cssColor}
        onChange={(l, c) => onChange({ ...value, l, c })}
      />
      <div className="pckr__addons">
        <HueSlider
          hue={value.h || 0}
          onChange={h => onChange({ ...value, h })}
        />
      </div>
      <div className="pckr__addons">
        <AxisFields value={value} gamut={gamutState} onChange={onChange} />
        <IOField
          value={value}
          gamut={gamutState}
          onChange={onChange}
          onGamutChange={setGamutState}
        />
      </div>
    </div>
  )
}

const AxisFields = (props: {
  value: Oklrch
  gamut: Gamut
  onChange: (value: Oklrch) => void
}) => {
  const { value, onChange, gamut } = props
  return (
    <div className="pckr__axis-fields">
      <div className="pckr__axis-field">
        <input
          id="pckr__axis-field--l"
          type="number"
          value={round(value.l * 100, 1)}
          onChange={e => {
            let l = Number(e.target.value) / 100
            if (l > 1) l = 1
            if (l < 0) l = 0
            onChange({ ...value, l })
          }}
        />
        <label htmlFor="pckr__axis-field--l">L</label>
      </div>
      <div className="pckr__axis-field">
        <input
          id="pckr__axis-field--c"
          type="number"
          value={round((100 * value.c) / MAX_GAMUT_CHROMA['srgb'], 1)}
          min={0}
          max={(100 * MAX_GAMUT_CHROMA[gamut]) / MAX_GAMUT_CHROMA['srgb']}
          onChange={e => {
            let c = (Number(e.target.value) / 100) * MAX_GAMUT_CHROMA['srgb']
            if (c > MAX_GAMUT_CHROMA[gamut]) c = MAX_GAMUT_CHROMA[gamut]
            if (c < 0) c = 0
            onChange({ ...value, c })
          }}
        />
        <label htmlFor="pckr__axis-field--c">C</label>
      </div>
      <div className="pckr__axis-field">
        <input
          id="pckr__axis-field--h"
          type="number"
          value={round(value.h || 0, 1)}
          onChange={e => {
            let h = Number(e.target.value) % 360
            if (h < 0) h += 360
            onChange({ ...value, h })
          }}
        />
        <label htmlFor="pckr__axis-field--h">H</label>
      </div>
    </div>
  )
}

const IOField = (props: {
  value: Oklrch
  gamut: Gamut
  onChange: (value: Oklrch) => void
  onGamutChange: (gamut: Gamut) => void
}) => {
  const { value, onChange, gamut, onGamutChange } = props
  const valueHex =
    gamut === 'srgb'
      ? formatHex(clampChroma(oklrchToOklch(value), 'srgb'))
      : formatCss(clampChroma(oklrchToOklch(value), gamut))

  const [input, setInput] = useState<string>(valueHex)
  const [inFocus, setInFocus] = useState(false)

  useEffect(() => {
    if (!inFocus) setInput(valueHex)
  }, [inFocus, valueHex])

  return (
    <div className="pckr__axis-fields">
      <div className="pckr__axis-field">
        <input
          id="pckr__io-field"
          type="text"
          value={input}
          onFocus={() => setInFocus(true)}
          onChange={e => {
            setInput(e.target.value)
            const color = strToOklrch(e.target.value)
            if (color) onChange(color)
          }}
          onBlur={() => {
            setInput(valueHex)
            setInFocus(false)
          }}
          style={{ paddingLeft: 8 }}
        />
      </div>
      <button
        style={{ flexGrow: 0 }}
        onClick={() => {
          onGamutChange(gamut === 'srgb' ? 'display-p3' : 'srgb')
        }}
      >
        {gamut}
      </button>
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
      // Skip if input is focused
      if (e.target instanceof HTMLInputElement) return
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
            c: clamp(value.c - cStep * multiplier, 0, MAX_GAMUT_CHROMA[gamut]),
          })
          break
        case 'KeyD':
          onChange({
            ...value,
            c: clamp(value.c + cStep * multiplier, 0, MAX_GAMUT_CHROMA[gamut]),
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

/**
 * Round a number to a given number of decimals
 * @param value
 * @param decimals
 * @returns
 */
function round(value: number, decimals = 0) {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

function strToOklrch(str: string): Oklrch | null {
  const color = parse(str)
  if (!color) return null
  return oklrch(color)
}
