import { Layout } from '@/shared/ui/Layout'
import { Showcase } from '@/shared/ui/Showcase'
import { ThemeProvider } from './ThemeProvider'
import { useCallback, useState } from 'react'
import { TTheme } from '@/shared/lib/theme'

export function Themer() {
  const [light, setLight] = useState<TTheme | undefined>()
  const [dark, setDark] = useState<TTheme | undefined>()
  const updateThemes = useCallback((light: TTheme, dark: TTheme) => {
    setLight(light)
    setDark(dark)
  }, [])

  return (
    <Layout
      leftPanel={<ThemeProvider onChange={updateThemes} />}
      mainPanel={<Showcase theme={light} />}
      mainPanel2={<Showcase theme={dark} />}
    />
  )
}
