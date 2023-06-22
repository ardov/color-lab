import { betterToeInv, clampChroma } from '@/shared/lib/huelab'
import { formatCss, formatHex, hsl, Oklch, oklch, parseHex } from 'culori'
import { useState } from 'react'

import './styles.scss'
import { Gamut } from './Picker/shared'
import { HexPicker } from './Picker'

export function PickerWrapper() {
  const [hue, setHue] = useState(0)
  const [gamut, setGamut] = useState<Gamut>(Gamut.SRGB)
  const [hex, setHex] = useState('#ff00ff')

  const bgColor = formatHex(
    clampChroma({ mode: 'oklch', l: 0.3, c: 0.04, h: hue })
  )
  const shadowColor = formatCss(
    hsl(clampChroma({ mode: 'oklch', l: 0.8, c: 0.2, h: hue, alpha: 0.08 }))
  )
  const textColor = formatHex(
    clampChroma({ mode: 'oklch', l: 0.6, c: 0.1, h: hue })
  )

  return (
    <div
      className="picker-scene"
      style={{ background: `radial-gradient(at 50% 64%, ${bgColor}, black)` }}
    >
      <div>{hex}</div>
      <HexPicker
        value={hex}
        onChange={setHex}
        style={{
          boxShadow: `0 -16px 24px 0px ${shadowColor}`,
        }}
      />
    </div>
  )
}

const roundColor = (color: Oklch) => {
  const hex = formatHex(color)

  let errors = 0
  let channel = 'l' as 'l' | 'c' | 'h'
  let digits = 3
  // let copy = { ...color } as Oklch
  let copy = oklch(parseHex(hex))
  copy.l = +color.l.toFixed(digits)
  copy.c = +color.c.toFixed(digits)
  copy.h = +(color.h || 0).toFixed(digits)

  while (errors < 3 && digits >= 0) {
    const newChannel = round(copy[channel] || 0, digits)
    if (formatHex({ ...copy, [channel]: newChannel }) !== hex) {
      errors++
    } else {
      copy[channel] = newChannel
      errors = 0
    }
    channel = channel === 'l' ? 'c' : channel === 'c' ? 'h' : 'l'
    if (channel === 'l') digits--
  }
  return copy

  function round(n: number, digits: number) {
    const factor = Math.pow(10, digits)
    return parseFloat((Math.round(n * factor) / factor).toFixed(digits))
  }
}

function makeHueGradient(
  steps: number,
  mode: 'srgb' | 'display-p3' = 'srgb',
  l = 0.75
) {
  const colors = new Array(steps)
    .fill(0)
    .map((_, i) => {
      const h = (i / steps) * 360
      return clampChroma({ mode: 'oklch', l, c: 0.5, h }, mode)
    })
    .map(formatHex)
  return `linear-gradient(to right, ${colors.join(', ')})`
}
