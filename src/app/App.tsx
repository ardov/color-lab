import { Routes, Route } from 'react-router-dom'
import './index.scss'
import './reset.scss'
import { Themer } from '@/pages/themer'

export default function App() {
  return (
    <Routes>
      <Route index element={<Themer />} />
      <Route path="*" element={<Themer />} />
    </Routes>
  )
}
