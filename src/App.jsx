import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Diary from './pages/Diary'
import Memories from './pages/Memories'
import Mailbox from './pages/Mailbox'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/mailbox" element={<Mailbox />} />
      </Route>
    </Routes>
  )
}
