import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { applyTheme, makeTheme } from '@/shared/lib/theme'

import './reset.scss'
import './index.scss'
import { paths } from './paths'
import List from './List'

const theme = makeTheme({
  type: 'dark',
  cr: 2,
})

export default function App() {
  applyTheme(document.body, theme)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<List />} />
        {paths.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<List />} />
      </Routes>
    </Suspense>
  )
}
