import { Routes, Route } from 'react-router-dom'
import './reset.scss'
import './index.scss'
import { Themer } from '@/pages/themer'
import { Splitter } from '@/pages/splitter'
import { Harmony } from '@/pages/harmony'
import { P3Space } from '@/pages/p3-space'
import { Receiver } from '@/pages/receiver'
import { Spaces } from '@/pages/space'

export default function App() {
  return (
    <Routes>
      <Route index element={<Themer />} />
      <Route path="/p3-space" element={<P3Space />} />
      <Route path="/splitter" element={<Splitter />} />
      <Route path="/harmony" element={<Harmony />} />
      <Route path="/receiver" element={<Receiver />} />
      <Route path="/spaces" element={<Spaces />} />
      <Route path="*" element={<Themer />} />
    </Routes>
  )
}
