import { Routes, Route } from 'react-router-dom'
import './reset.scss'
import './index.scss'
import { Themer } from '@/pages/themer'
import { Splitter } from '@/pages/splitter'
import { Harmony } from '@/pages/harmony'
import { P3Space } from '@/pages/p3-space'
import { Receiver } from '@/pages/receiver'
import { Sliders } from '@/pages/controls'
import { Spaces } from '@/pages/space'
import { Spaces3d } from '@/pages/spaces3d'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { PickerWrapper } from '@/pages/picker'

const theme = makeTheme({
  type: 'dark',
  cr: 2,
})

export default function App() {
  applyTheme(document.body, theme)
  return (
    <Routes>
      <Route index element={<Themer />} />
      <Route path="/p3-space" element={<P3Space />} />
      <Route path="/splitter" element={<Splitter />} />
      <Route path="/harmony" element={<Harmony />} />
      <Route path="/receiver" element={<Receiver />} />
      <Route path="/spaces" element={<Spaces />} />
      <Route path="/spaces-3d" element={<Spaces3d />} />
      <Route path="/sliders" element={<Sliders />} />
      <Route path="/picker" element={<PickerWrapper />} />
      <Route path="*" element={<Themer />} />
    </Routes>
  )
}
