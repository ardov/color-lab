import type { FC } from 'react'

import { formatHex } from 'culori'
import { clampChroma } from '@/shared/lib/huelab'
import { Touchpad } from './Touchpad'
import { Pointer } from './Pointer'

export const HueSlider: FC<{
  hue: number
  onChange: (hue: number) => void
}> = props => {
  const { hue, onChange } = props
  const left = normalizeHue(hue) / 360
  return (
    <Touchpad
      onKey={offset => {
        onChange(hue + (offset.left - offset.top) * 360)
      }}
      onMove={offset => onChange(normalizeHue(offset.left * 360))}
      unclamped
    >
      <div className="pckr__hue-slider" />
      <Pointer
        color={formatHex(
          clampChroma({ mode: 'oklch', l: 0.75, c: 0.5, h: hue })
        )}
        left={left}
        ring="black"
      />
    </Touchpad>
  )
}

const normalizeHue = (hue: number) => {
  if (hue >= 0 && hue <= 360) return hue
  let normalized = hue % 360
  return normalized < 0 ? 360 + normalized : normalized
}
