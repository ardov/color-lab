import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Stack } from '@/shared/ui/Stack'
import magic from './magic.jpg'
import './styles.scss'

const theme = makeTheme({})

export default function P3Space() {
  applyTheme(document.body, theme)

  return (
    <Stack axis="y" gap={1} p={3} className="root">
      <img src={magic} alt="" width={1} />

      {/* <div
        className="polygon"
        style={
          {
            '--size': '400px',
            '--color-a': 'var(--super-white)',
            '--color-b': 'var(--super-yellow)',
            '--color-c': 'var(--super-cyan)',
          } as React.CSSProperties
        }
      /> */}
      <div className="white-text">Hello world</div>

      <button
        style={{
          // color: 'var(--super-white)',
          // background: 'white',
          background: 'var(--super-bluish)',
          color: 'white',
          border: 'none',
          margin: '40px auto',
          padding: '8px 24px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        Click me
      </button>
    </Stack>
  )
}
