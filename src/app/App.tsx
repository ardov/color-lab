import './App.css'
import './index.css'
import {
  blend,
  Color,
  formatHex,
  formatHex8,
  Oklch,
  oklch,
  parse,
  rgb,
  Rgb,
} from 'culori'
import { calcAPCA, findTextTone, getAlphaColor } from '@/shared/lib/colors'
import { ReactNode, useState } from 'react'
import { resolveRow } from '@/shared/lib/color-row'

function App() {
  const [bg, setBg] = useState('#ffffff')
  const [target, setTarget] = useState('#33ffff')
  const alpha = getAlphaColor(parse(bg) as Rgb, parse(target) as Rgb)
  const bgLch = oklch(parse(bg)) as Oklch
  return (
    <div className="App">
      <input type="color" value={bg} onChange={e => setBg(e.target.value)} />
      <input
        type="color"
        value={target}
        onChange={e => setTarget(e.target.value)}
      />
      <pre>{bg}</pre>
      <pre>{bg}</pre>
      <pre>{bg}</pre>
      <pre>{bg}</pre>
      <pre>{bg}</pre>
      <pre>{bg}</pre>
      <pre>
        l: {bgLch.l.toFixed(2)}
        c: {bgLch.c.toFixed(2)}
        h: {bgLch.h?.toFixed(2)}
      </pre>
      <pre>
        <ColorSpan value={bg} name="Bg" /> Lc for white:{' '}
        {calcAPCA(bg, '#FFF').toFixed(1)}
      </pre>
      <pre>
        <ColorSpan value={bg} name="Bg" /> Lc for black:{' '}
        {calcAPCA(bg, '#000').toFixed(1)}
      </pre>

      <pre>
        Background: <ColorSpan value={bg} />
      </pre>
      <pre>
        Target: <ColorSpan value={target} />
      </pre>
      <pre>
        Alpha: <ColorSpan value={alpha} /> | {alpha.alpha}
      </pre>
      <pre>Alpha on white: {formatHex(blend(['#fff', alpha]))} </pre>

      <pre>
        <ColorSpan value={bg} name="Bg">
          <ColorSpan value={target} name="Target" />
        </ColorSpan>{' '}
        <ColorSpan value={target} name="Target" />
        <br />
        <ColorSpan value={bg} name="Bg">
          <ColorSpan value={alpha} name="alpha" />
        </ColorSpan>{' '}
        <ColorSpan value={alpha} name="alpha" />
      </pre>
      <pre>
        {resolveRow(bgLch.h || 0, bgLch.c, [
          0.98,
          0.95,
          { type: 'luminance', index: 1, change: -0.06 },
          { type: 'contrast', index: 1, value: 30 },
          { type: 'contrast', index: 1, value: 45 },
          { type: 'contrast', index: 1, value: 60 },
          { type: 'contrast', index: 1, value: 75 },
          { type: 'contrast', index: 1, value: 90 },
          { type: 'contrast', index: 1, value: 100 },
        ]).map((color, i) => (
          <ColorSpan key={i} value={color} name={i.toString()} />
        ))}
      </pre>
    </div>
  )
}

export default App

function ColorSpan(props: {
  value: Color | string
  name?: string
  children?: ReactNode
}) {
  const { value, name, children } = props
  const bg =
    (typeof value === 'string' ? rgb(parse(value)) : rgb(value)) ||
    ({ mode: 'rgb', r: 1, g: 0, b: 0, alpha: 1 } as Rgb)
  // const textColor = getContrastText(bg)
  const textColor = findTextTone(bg, 60, 1)
  const borderColor = findTextTone(bg, 15)
  // const borderColor = adjustL(bg, -0.1)

  const border = formatHex8(borderColor)
  const bgHex = formatHex8(bg)
  const txtHex = formatHex8(textColor)

  return (
    <span
      style={{
        background: bgHex,
        padding: '2px 0',
        borderRadius: 8,
        // border: '1px solid ' + border,
      }}
    >
      <span
        style={{ color: txtHex, padding: '0px 6px' }}
        onClick={() => navigator.clipboard.writeText(bgHex)}
      >
        {name || bgHex}
      </span>
      {children}
    </span>
  )
}
