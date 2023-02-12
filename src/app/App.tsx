import { Routes, Route } from 'react-router-dom'
import './index.scss'
import './reset.scss'
import { Themer } from '@/pages/themer'
import { Splitter } from '@/pages/splitter'
import { Harmony } from '@/pages/harmony'

export default function App() {
  return (
    <Routes>
      <Route index element={<Themer />} />
      <Route path="/splitter" element={<Splitter />} />
      <Route path="/harmony" element={<Harmony />} />
      <Route path="*" element={<Themer />} />
    </Routes>
  )
}
