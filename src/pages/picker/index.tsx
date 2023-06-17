import { betterToeInv, clampChroma } from '@/shared/lib/huelab'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { formatCss, formatHex, Oklch, oklch, parseHex } from 'culori'
import { FC, useState } from 'react'
import { CanvasComparison } from './CanvasComparison'
import { clamp, Interactive } from './Interactive'
import './picker.scss'
import { Pointer } from './Pointer'
import { getMaxChroma } from './shared'
import './polyfill.js'

const theme = makeTheme({})

export function Picker() {
  applyTheme(document.body, theme)
  const [luminosity, setLuminosity] = useState(0.5)
  const [chroma, setChroma] = useState(0)
  const [hue, setHue] = useState(0)
  const [mode, setMode] = useState<'srgb' | 'display-p3'>('srgb')
  const width = 280
  const height = 360

  const maxChroma = getMaxChroma(mode)

  const color = clampChroma(
    {
      mode: 'oklch',
      l: betterToeInv(luminosity),
      c: chroma,
      h: hue,
    },
    mode
  )

  const bgColor = formatHex(
    clampChroma({ mode: 'oklch', l: 0.3, c: 0.04, h: hue })
  )
  const shadowColor = formatHex(
    clampChroma({ mode: 'oklch', l: 0.14, c: 0.08, h: hue })
  )
  const textColor = formatHex(
    clampChroma({ mode: 'oklch', l: 0.6, c: 0.1, h: hue })
  )

  return (
    <div
      className="picker-scene"
      style={{ background: `radial-gradient(at 50% 64%, ${bgColor}, black)` }}
    >
      <div
        className="wrapper"
        style={{
          boxShadow: `
            0 8px 32px -16px ${shadowColor},
            0 16px 64px -24px ${shadowColor}
            `,
        }}
      >
        <Interactive
          onKey={offset => {
            setChroma(clamp(chroma + offset.left * maxChroma, 0, maxChroma))
            setLuminosity(luminosity - offset.top)
          }}
          onInput={position => {
            const { left, top } = position
            setChroma(left * maxChroma)
            setLuminosity(1 - top)
          }}
        >
          <CanvasComparison
            width={width}
            height={height}
            hue={hue}
            mode={mode}
          />
          <Pointer
            color={formatHex(color)}
            left={chroma / maxChroma}
            top={1 - luminosity}
          />
        </Interactive>

        <div
          style={{
            padding: '16px 16px 8px',
            color: textColor,
            fontFamily: 'monospace',
            fontSize: 15,
            textAlign: 'center',
          }}
          onClick={() => setMode(mode === 'srgb' ? 'display-p3' : 'srgb')}
        >
          {formatCss(roundColor(color))}
        </div>
        <div style={{ padding: 8 }}>
          <HueSlider hue={hue} onChange={setHue} />
        </div>
      </div>
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

const gradient = makeHueGradient(50, 'srgb', 0.75)

const HueSlider: FC<{
  hue: number
  onChange: (hue: number) => void
}> = props => {
  const { hue, onChange } = props
  const deg = hue > 360 ? hue % 360 : hue
  const left = deg / 360
  return (
    <Interactive
      onKey={offset => {
        onChange(hue + (offset.left - offset.top) * 360)
      }}
      onMove={offset => onChange(offset.left * 360)}
    >
      <div className="hue-slider" style={{ background: gradient }} />
      <Pointer
        color={formatHex(
          clampChroma({ mode: 'oklch', l: 0.75, c: 0.5, h: hue })
        )}
        left={left}
      />
    </Interactive>
  )
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
