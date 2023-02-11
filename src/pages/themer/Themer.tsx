import { Layout } from '@/shared/ui/Layout'
import { Showcase } from '@/shared/ui/Showcase'
import { ThemeProvider } from './ThemeProvider'
import { useCallback, useState } from 'react'
import { TTheme } from '@/shared/lib/theme'

const viewModes = ['both', 'dark', 'light']

export function Themer() {
  const [currMode, setCurrMode] = useState(0)
  const [light, setLight] = useState<TTheme | undefined>()
  const [dark, setDark] = useState<TTheme | undefined>()
  const updateThemes = useCallback((light: TTheme, dark: TTheme) => {
    setLight(light)
    setDark(dark)
  }, [])

  const toggleMode = useCallback(() => {
    setCurrMode(m => (m + 1) % viewModes.length)
  }, [])

  return (
    <Layout
      leftPanel={
        <ThemeProvider
          theme={currMode === 1 ? 'dark' : 'light'}
          onChange={updateThemes}
          onToggle={toggleMode}
        />
      }
      mainPanel={currMode !== 1 && <Showcase theme={light} />}
      mainPanel2={currMode !== 2 && <Showcase theme={dark} />}
    />
  )
}
