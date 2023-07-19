import { clampChroma } from '@/shared/lib/huelab'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { entries } from '@/shared/types'
import { ColorSpan } from '@/shared/ui/ColorSpan'
import { Slider } from '@/shared/ui/Slider'
import { Stack } from '@/shared/ui/Stack'
import { useState } from 'react'

const theme = makeTheme({})

export default function Harmony() {
  applyTheme(document.body, theme)
  const [hue, setHue] = useState(0)
  const [c, setChroma] = useState(0.4)
  const hues = buildHues(hue)

  return (
    <Stack axis="y" gap={1} p={3}>
      <label>
        <span>Accent hue: {hue}</span>
        <Slider
          min={0}
          max={360}
          value={[hue]}
          onValueChange={value => setHue(value[0])}
        />
      </label>
      <label>
        <span>Chroma: {c}</span>
        <Slider
          min={0}
          max={0.4}
          value={[c]}
          step={0.01}
          onValueChange={value => setChroma(value[0])}
        />
      </label>
      <>
        {entries(hues)
          .filter(v => !!v)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([name, h]) => (
            <ColorSpan
              key={name}
              value={'#fff'}
              name={name.padEnd(8, ' ') + String(h).padStart(3, ' ')}
            >
              <ColorSpan
                value={clampChroma({ mode: 'oklch', l: 0.9, c, h })}
                name={'90%'}
              />
              <ColorSpan
                value={clampChroma({ mode: 'oklch', l: 0.75, c, h })}
                name={'75%'}
              />
              <ColorSpan
                value={clampChroma({ mode: 'oklch', l: 0.5, c, h })}
                name={'50%'}
              />
              <ColorSpan
                value={clampChroma({ mode: 'oklch', l: 0.3, c, h })}
                name={'30%'}
              />
            </ColorSpan>
          ))}
      </>
    </Stack>
  )
}

function getHueGroup(hue: number = 0) {
  hue = deg(hue)
  if (hue <= 30) return 'error'
  if (hue <= 100) return 'warning'
  if (hue <= 200) return 'success'
  if (hue <= 300) return 'info'
  if (hue <= 320) return ''
  return 'error'
}

type THues = {
  accent: number
  info: number
  error: number
  warning: number
  success: number
}

function buildHues(x: number) {
  x = deg(x)
  const hues: Partial<THues> = {
    accent: x,
    // info: 0,
    // error: 0,
    // warning: 0,
    // success: 0,
  }

  const add = (h: number) => {
    const group = getHueGroup(h)
    if (group && hues[group] === undefined) hues[group] = h
  }

  add(x)
  add(x + 180)
  add(x + 180 + 60)
  add(x + 180 - 60)
  add(x + 180 + 90)
  add(x + 180 - 90)
  add(x + 180 + 30)
  add(x + 180 - 30)
  add(x + 180 + 120)
  add(x + 180 - 120)

  return hues as THues
}

function deg(d: number) {
  return Math.abs(d % 360)
}
