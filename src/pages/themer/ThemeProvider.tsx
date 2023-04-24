import { formatHex } from 'culori'
import { useEffect, useMemo, useState } from 'react'
import { TTheme, makeTheme, applyTheme, flattenTheme } from '@/shared/lib/theme'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack/Stack'
import { entries } from '@/shared/types'
import { Slider } from '@/shared/ui/Slider'
import { Tooltip } from '@/shared/ui/Tooltip'
import { getContrastColor } from '@/shared/lib/huelab'

export function ThemeProvider(props: {
  theme: 'dark' | 'light'
  onChange: (light: TTheme, dark: TTheme) => void
  onToggle: () => void
}) {
  const themeType = props.theme
  const [mainH, setMainH] = useState(280)
  const [hueShift, setHueShift] = useState(0)
  const [mainC, setMainC] = useState(0.01)
  // const [accH, setAccH] = useState(280)
  const [accC, setAccC] = useState(0.3)
  const [cr, setCr] = useState(7)

  const lightTheme = useMemo(
    () =>
      makeTheme({
        mainC,
        mainH,
        accC,
        accH: mainH,
        type: 'light',
        cr,
        hueShift,
      }),
    [accC, cr, hueShift, mainC, mainH]
  )
  const darkTheme = useMemo(
    () =>
      makeTheme({
        mainC,
        mainH,
        accC,
        accH: mainH,
        type: 'dark',
        cr,
        hueShift,
      }),
    [accC, cr, hueShift, mainC, mainH]
  )

  useEffect(() => {
    props.onChange(lightTheme, darkTheme)
  }, [darkTheme, lightTheme, props])

  let theme = themeType === 'light' ? lightTheme : darkTheme

  const toShow = entries(flattenTheme(theme.c))

  applyTheme(document.body, theme)

  return (
    <Stack gap={1} p={3} style={{ color: 'var(--c-main-text-primary)' }}>
      <Button onClick={props.onToggle}>Toggle theme</Button>
      <label>
        <span>Btn contrast: {cr}</span>
        <Slider
          min={0}
          max={21}
          step={0.1}
          value={[cr]}
          onValueChange={value => setCr(value[0])}
        />
      </label>

      <label>
        <Tooltip content={mainH}>
          <span>Hue: {mainH}</span>
        </Tooltip>
        <Slider
          min={0}
          max={360}
          value={[mainH]}
          onValueChange={value => setMainH(value[0])}
        />
      </label>

      <label>
        <span>Hue shift: {hueShift}</span>
        <Slider
          min={-100}
          max={100}
          value={[hueShift]}
          onValueChange={value => setHueShift(value[0])}
        />
      </label>

      <label>
        <span>Main chroma: {mainC}</span>
        <Slider
          min={0}
          max={0.3}
          step={0.005}
          value={[mainC]}
          onValueChange={value => setMainC(value[0])}
        />
      </label>
      {/* <label>
        <span>accH: {accH}</span>
        <Slider
          min={0}
          max={360}
          value={[accH]}
          onValueChange={value => setAccH(value[0])}
        />
      </label> */}

      <label>
        <span>Accent chroma: {accC}</span>
        <Slider
          min={0}
          max={0.3}
          step={0.005}
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
                color: formatHex(getContrastColor(val)),
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
