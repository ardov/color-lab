import { Routes, Route } from 'react-router-dom'
import './index.scss'
import './reset.scss'
import { Themer } from '@/pages/themer'
import { Channelizer } from '@/pages/Channelizer'

export default function App() {
  return (
    <Routes>
      <Route index element={<Themer />} />
      <Route path="/channelizer" element={<Channelizer />} />
      <Route path="*" element={<Themer />} />
    </Routes>
  )
}
