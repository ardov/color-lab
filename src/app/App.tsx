import './index.scss'
import './reset.scss'
import { blend, formatHex, Oklch, oklch, parse, Rgb } from 'culori'
import { calcAPCA, getAlphaColor, getContrastText } from '@/shared/lib/colors'
import { useEffect, useState } from 'react'
import { resolveRow } from '@/shared/lib/color-row'
import { makeTheme } from './theme'
import { applyTheme, flattenTheme } from './applyTheme'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack/Stack'
import { entries } from '@/shared/types'
import { Slider } from '@/shared/ui/Slider'
import { Layout } from '@/shared/ui/Layout'
import { Notice } from '@/shared/ui/Notice'

function App() {
  const [bg, setBg] = useState('#ffffff')
  const [target, setTarget] = useState('#33ffff')
  const alpha = getAlphaColor(parse(bg) as Rgb, parse(target) as Rgb)
  const bgLch = oklch(parse(bg)) as Oklch
  return (
    <Layout
      leftPanel={<ThemeProvider />}
      mainPanel={
        <Stack gap={1} p={3} axis="y">
          <Stack gap={1} axis="x">
            <Button use="primary" disabled>
              12345
            </Button>
            <Button use="primary">12345</Button>
            <Button use="secondary">12345</Button>
            <Button use="tetriary">12345</Button>
          </Stack>
          <Notice title={'Hello!'} />
        </Stack>
      }
    />
    // <div className="App">
    //   <input type="color" value={bg} onChange={e => setBg(e.target.value)} />
    //   <input
    //     type="color"
    //     value={target}
    //     onChange={e => setTarget(e.target.value)}
    //   />
    //   <pre>{bg}</pre>
    //   <pre>{bg}</pre>
    //   <pre>{bg}</pre>
    //   <pre>{bg}</pre>
    //   <pre>{bg}</pre>
    //   <pre>{bg}</pre>
    //   <pre>
    //     l: {bgLch.l.toFixed(2)}
    //     c: {bgLch.c.toFixed(2)}
    //     h: {bgLch.h?.toFixed(2)}
    //   </pre>
    //   <pre>
    //     <ColorSpan value={bg} name="Bg" /> Lc for white:{' '}
    //     {calcAPCA(bg, '#FFF').toFixed(1)}
    //   </pre>
    //   <pre>
    //     <ColorSpan value={bg} name="Bg" /> Lc for black:{' '}
    //     {calcAPCA(bg, '#000').toFixed(1)}
    //   </pre>

    //   <pre>
    //     Background: <ColorSpan value={bg} />
    //   </pre>
    //   <pre>
    //     Target: <ColorSpan value={target} />
    //   </pre>
    //   <pre>
    //     Alpha: <ColorSpan value={alpha} /> | {alpha.alpha}
    //   </pre>
    //   <pre>Alpha on white: {formatHex(blend(['#fff', alpha]))} </pre>

    //   <pre>
    //     <ColorSpan value={bg} name="Bg">
    //       <ColorSpan value={target} name="Target" />
    //     </ColorSpan>{' '}
    //     <ColorSpan value={target} name="Target" />
    //     <br />
    //     <ColorSpan value={bg} name="Bg">
    //       <ColorSpan value={alpha} name="alpha" />
    //     </ColorSpan>{' '}
    //     <ColorSpan value={alpha} name="alpha" />
    //   </pre>
    //   <pre>
    //     {resolveRow(bgLch.h || 0, bgLch.c, [
    //       0.98,
    //       0.95,
    //       { type: 'luminance', index: 1, change: -0.06 },
    //       { type: 'contrast', index: 1, value: 30 },
    //       { type: 'contrast', index: 1, value: 45 },
    //       { type: 'contrast', index: 1, value: 60 },
    //       { type: 'contrast', index: 1, value: 75 },
    //       { type: 'contrast', index: 1, value: 90 },
    //       { type: 'contrast', index: 1, value: 100 },
    //     ]).map((color, i) => (
    //       <ColorSpan key={i} value={color} name={i.toString()} />
    //     ))}
    //   </pre>
    //   <ThemeProvider />

    // </div>
  )
}

export default App

function ThemeProvider() {
  const [mainH, setMainH] = useState(0)
  const [mainC, setMainC] = useState(0.01)
  const [accH, setAccH] = useState(280)
  const [accC, setAccC] = useState(0.3)
  const [cr, setCr] = useState(60)
  const [themeType, setThemeType] = useState<'light' | 'dark'>('light')

  const toggleTheme = () =>
    setThemeType(t => (t === 'light' ? 'dark' : 'light'))

  const theme = makeTheme({ mainC, mainH, accC, accH, type: themeType, cr })

  const toShow = entries(flattenTheme(theme.c))

  applyTheme(document.body, theme)

  return (
    <Stack gap={1} p={3} style={{ color: 'var(--c-main-text-primary)' }}>
      <Button onClick={toggleTheme}>Toggle theme</Button>
      <label>
        <span>cr: {cr}</span>
        <Slider
          min={0}
          max={120}
          value={[cr]}
          onValueChange={value => setCr(value[0])}
        />
      </label>

      <label>
        <span>mainH: {mainH}</span>
        <Slider
          min={0}
          max={360}
          value={[mainH]}
          onValueChange={value => setMainH(value[0])}
        />
      </label>

      <label>
        <span>mainC: {mainC}</span>
        <Slider
          min={0}
          max={0.3}
          step={0.01}
          value={[mainC]}
          onValueChange={value => setMainC(value[0])}
        />
      </label>
      <label>
        <span>accH: {accH}</span>
        <Slider
          min={0}
          max={360}
          value={[accH]}
          onValueChange={value => setAccH(value[0])}
        />
      </label>

      <label>
        <span>accC: {accC}</span>
        <Slider
          min={0}
          max={0.3}
          step={0.01}
          value={[accC]}
          onValueChange={value => setAccC(value[0])}
        />
      </label>

      <div>
        {toShow.map(([name, val]) => {
          const varName = '--c-' + name
          return (
            <pre
              key={name}
              style={{
                padding: 8,
                background: val,
                color: formatHex(getContrastText(val)),
              }}
              onClick={() => navigator.clipboard.writeText(varName)}
            >
              {varName}
            </pre>
          )
        })}
      </div>
    </Stack>
  )
}
