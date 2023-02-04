import { Routes, Route } from 'react-router-dom'
import './index.scss'
import './reset.scss'
import { Themer } from '@/pages/themer'
import { Splitter } from '@/pages/Channelizer'

export default function App() {
  return (
    <Routes>
      <Route index element={<Themer />} />
      <Route path="/splitter" element={<Splitter />} />
      <Route path="*" element={<Themer />} />
    </Routes>
  )
}
