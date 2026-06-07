import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Diary from './pages/Diary'
import Memories from './pages/Memories'
import Mailbox from './pages/Mailbox'
import Farewell from './pages/Farewell'
import Lines from './pages/Lines'

export default function App() {
  return (
    <Routes>
      {/* 已迁移到暖夜微光（自带 PageShell） */}
      <Route path="/"      element={<Home />}  />
      <Route path="/diary" element={<Diary />} />

      {/* 其余页面：等待逐页迁移，暂用旧 Layout */}
      <Route element={<Layout />}>
        <Route path="/memories" element={<Memories />} />
        <Route path="/mailbox"  element={<Mailbox />}  />
        <Route path="/farewell" element={<Farewell />} />
        <Route path="/lines"    element={<Lines />}    />
      </Route>
    </Routes>
  )
}
