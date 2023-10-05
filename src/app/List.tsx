import { Link } from 'react-router-dom'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { paths } from './paths'

const theme = makeTheme({
  type: 'light',
  cr: 2,

  mainC: 1,
  mainH: 200,
  accC: 1,
  accH: 260,
})

export default function List() {
  applyTheme(document.body, theme)
  return (
    <div
      style={{
        padding: '24px 56px',
        display: 'grid',
        placeContent: 'center',
        height: '100%',
        backgroundColor: 'var(--c-main-base)',
      }}
    >
      <h1>Ardov's Color Lab</h1>
      <p>
        It's a place for my experiments, ideas and undercooked stuff.{' '}
        <a href="https://github.com/ardov/color-lab">Messy source code</a>
      </p>
      <ul>
        {paths.map(({ path, name, description }) => (
          <li key={path}>
            <Link to={path}>{name}</Link> <span>{description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
