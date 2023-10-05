import { betterToeInv, clampChroma } from '@/shared/lib/huelab'
import { formatCss, formatHex, hsl, Oklch, oklch, parseHex } from 'culori'
import { useState } from 'react'

import './styles.scss'
import { Gamut } from './Picker/shared'
import { HexPicker } from './Picker'
import { gradientToRgb } from '@/shared/lib/huelab/gradientToRgb'
import { Oklrch } from './Picker/oklrch'
import { ColorInput, Input } from './Input'

// console.log(
//   'gradientToRgb',
//   gradientToRgb(
//     [
//       ['#000', 0],
//       ['#fff', 1],
//     ],
//     'oklch'
//   ).map(stop => [formatHex(stop[0]), stop[1]])
// )

printHues()
// printAngDiff()

export default function PickerWrapper() {
  const [gamut, setGamut] = useState<Gamut>('srgb')
  const [hex, setHex] = useState('#0000ff')
  const [intention, setIntention] = useState(null as Oklrch | null)
  const [val, setVal] = useState('#ff00ff')

  const h = intention?.h || 0

  const bgColor = formatHex(
    clampChroma({
      mode: 'oklch',
      l: 0.3,
      c: Math.min(intention?.c || 0, 0.04),
      h: h,
    })
  )
  const bgColor2 = formatHex(
    clampChroma({
      mode: 'oklch',
      l: betterToeInv(0.04),
      c: Math.min(intention?.c || 0, 0.04),
      h: h,
    })
  )
  // const shadowColor = formatCss(
  //   hsl(clampChroma({ mode: 'oklch', l: 0.8, c: 0.2, h: h, alpha: 0.08 }))
  // )
  // const textColor = formatHex(
  //   clampChroma({ mode: 'oklch', l: 0.6, c: 0.1, h: h })
  // )

  return (
    <div
      className="picker-scene"
      style={{
        background: `radial-gradient(70% 80% at 50% 72%, ${bgColor}, ${bgColor2})`,
      }}
    >
      {/* <Input />
      <ColorInput
        value={val}
        onChange={e => {
          console.log(e)

          setVal(e.value || '')
          if (e.color) {
            setHex(formatHex(e.color))
          }
        }}
      /> */}

      <HexPicker
        value={hex}
        onChange={e => {
          setHex(e.value)
          setIntention(e.oklch)
        }}
        // style={{
        //   boxShadow: `0 -16px 24px 0px ${shadowColor}`,
        // }}
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

function printHues() {
  const step = 1
  const treshold = 0.05
  const colors = new Array(360 / step).fill(0).map((_, i) => {
    const h = i * step
    return oklch({ mode: 'hsl', h, l: 0.5, s: 1 })
  })
  colors.forEach((color, i, arr) => {
    const hslHue = i * step
    const oklchHue = color.h!
    const prevH = i === 0 ? arr[arr.length - 1].h! : arr[i - 1].h!
    const nextH = i === arr.length - 1 ? arr[0].h! : arr[i + 1].h!
    const predictedH = (prevH + nextH) / 2
    const error = Math.abs(oklchHue - predictedH)

    const angleDiff = oklchHue - prevH
    console.log(
      `${hslHue.toFixed(1).padStart(5, ' ')}°`,
      // color.h?.toFixed(5),
      'diff ',
      // error > treshold ? '❌ ' + error : '✅'
      // color
      100 * angleDiff,
      color
    )
  })
}

function printAngDiff() {
  const bits = 8
  const steps = 2 ** bits
  const step = 1 / steps
  const hues = new Array(steps).fill(0).map((_, i) => {
    const hslColor = hsl({ mode: 'rgb', r: i * step, g: 1, b: 0 })
    return hslColor.h!
  })
  hues.forEach((hue, i, arr) => {
    const prevHue = i === 0 ? 0 : arr[i - 1]
    const angleDiff = Math.abs(hue - prevHue)
    console.log(angleDiff)
  })
}
