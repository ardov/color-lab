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
      <h1>Color Lab</h1>
      <p>This is a place for my experiments and unfinished projects.</p>
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
