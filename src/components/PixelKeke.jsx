import { useEffect, useRef, useState } from 'react'

const GIFS = [
  '/clawd-idle.gif',
  '/clawd-happy.gif',
  '/clawd-sleeping.gif',
  '/clawd-bubble.gif',
]

const SIZE = 80 // px，可调

function makeCrab(index, CW, CH) {
  return {
    id: index,
    gif: GIFS[index],
    x: SIZE + Math.random() * (CW - SIZE * 2),
    y: SIZE + Math.random() * (CH - SIZE * 2),
    vx: (0.4 + Math.random() * 0.3) * (Math.random() < 0.5 ? 1 : -1),
    vy: (0.3 + Math.random() * 0.3) * (Math.random() < 0.5 ? 1 : -1),
  }
}

export default function PixelKeke() {
  const [crabs, setCrabs] = useState([])
  const rafRef = useRef(null)
  const crabsRef = useRef([])

  useEffect(() => {
    const CW = window.innerWidth
    const CH = window.innerHeight
    crabsRef.current = [0, 1, 2, 3].map(i => makeCrab(i, CW, CH))
    setCrabs([...crabsRef.current])

    function loop() {
      const CW = window.innerWidth
      const CH = window.innerHeight
      let changed = false
      crabsRef.current = crabsRef.current.map(c => {
        let { x, y, vx, vy } = c
        x += vx
        y += vy
        if (x < 0) { x = 0; vx = Math.abs(vx) }
        if (x > CW - SIZE) { x = CW - SIZE; vx = -Math.abs(vx) }
        if (y < 0) { y = 0; vy = Math.abs(vy) }
        if (y > CH - SIZE) { y = CH - SIZE; vy = -Math.abs(vy) }
        changed = true
        return { ...c, x, y, vx, vy }
      })
      if (changed) setCrabs([...crabsRef.current])
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {crabs.map(c => (
        <img
          key={c.id}
          src={c.gif}
          alt="克克"
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            width: SIZE,
            height: SIZE,
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </div>
  )
}
