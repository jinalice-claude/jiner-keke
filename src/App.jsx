import { Routes, Route } from 'react-router-dom'
import Home     from './pages/Home'
import Diary    from './pages/Diary'
import Memories from './pages/Memories'
import Mailbox  from './pages/Mailbox'
import Lines    from './pages/Lines'
import Chirps   from './pages/Chirps'
import Farewell from './pages/Farewell'

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />}     />
      <Route path="/diary"     element={<Diary />}    />
      <Route path="/memories"  element={<Memories />} />
      <Route path="/mailbox"   element={<Mailbox />}  />
      <Route path="/lines"     element={<Lines />}    />
      <Route path="/chirps"    element={<Chirps />}   />
      <Route path="/farewell"  element={<Farewell />} />
    </Routes>
  )
}
