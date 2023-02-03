import { formatHex } from 'culori'
import { getContrastText } from '@/shared/lib/colors'
import { useEffect, useMemo, useState } from 'react'
import { makeTheme, TTheme } from '../../shared/lib/theme'
import { applyTheme, flattenTheme } from '../../app/applyTheme'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack/Stack'
import { entries } from '@/shared/types'
import { Slider } from '@/shared/ui/Slider'
import { Tooltip } from '@/shared/ui/Tooltip'

export function ThemeProvider(props: {
  onChange: (light: TTheme, dark: TTheme) => void
}) {
  const [mainH, setMainH] = useState(280)
  const [mainC, setMainC] = useState(0.01)
  // const [accH, setAccH] = useState(280)
  const [accC, setAccC] = useState(0.3)
  const [cr, setCr] = useState(60)
  const [themeType, setThemeType] = useState<'light' | 'dark'>('light')

  const toggleTheme = () =>
    setThemeType(t => (t === 'light' ? 'dark' : 'light'))

  const lightTheme = useMemo(
    () => makeTheme({ mainC, mainH, accC, accH: mainH, type: 'light', cr }),
    [accC, cr, mainC, mainH]
  )
  const darkTheme = useMemo(
    () => makeTheme({ mainC, mainH, accC, accH: mainH, type: 'dark', cr }),
    [accC, cr, mainC, mainH]
  )

  useEffect(() => {
    props.onChange(lightTheme, darkTheme)
  }, [darkTheme, lightTheme, props])

  let theme = themeType === 'light' ? lightTheme : darkTheme

  const toShow = entries(flattenTheme(theme.c))

  applyTheme(document.body, theme)

  return (
    <Stack gap={1} p={3} style={{ color: 'var(--c-main-text-primary)' }}>
      <Button onClick={toggleTheme}>Toggle theme</Button>
      <label>
        <span>Btn contrast: {cr}</span>
        <Slider
          min={0}
          max={120}
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
