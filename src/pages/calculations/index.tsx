import { Stack } from '@/shared/ui/Stack'
import { Color, formatHex, oklch, rgb } from 'culori'
import { getCuspByHue, precalculateCusps } from './getCusp'
import { useState } from 'react'

const cusps = precalculateCusps()

export default function P3Space() {
  const [color, setColor] = useState('#ff0000')
  // const cusp = getCuspForColor(color)
  // const hexCusp = formatHex(cusp)

  return (
    <Stack axis="y" gap={1} p={3} className="root" style={{ color: 'black' }}>
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
      />

      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>
      <pre>Hello</pre>

      {/* <pre>r: {cusp?.r.toFixed(5)}</pre>
      <pre>g: {cusp?.g.toFixed(5)}</pre>
      <pre>b: {cusp?.b.toFixed(5)}</pre>
      <pre>hexCusp: {hexCusp}</pre> */}
    </Stack>
  )
}

// function getCuspForColor(color: Color | string) {
//   const oklchColor = oklch(color)
//   if (!oklchColor) return
//   const [l, c, h] = getCuspByHue(oklchColor.h || 0, cusps)
//   const cusp = rgb({ mode: 'oklch', l, c, h })
//   return cusp
// }
