import { useEffect, useRef } from 'react'

// Official Clawd colour palette (orange-brown, warm)
const _ = null
const O = '#E8651A' // orange body
const o = '#F4944A' // light orange
const D = '#B84A0C' // dark orange / shadow
const W = '#FFFFFF' // eye white
const E = '#1A0A00' // eye pupil
const H = '#F0C060' // highlight / shine
const G = '#C85010' // claw dark
const g = '#F07830' // claw mid

// 9 wide × 7 tall — Clawd top-view crab
const SPRITE = [
  [G, g, _, _, _, _, _, g, G],
  [G, o, O, O, O, O, O, o, G],
  [o, O, W, H, O, H, W, O, o],
  [o, O, E, O, O, O, E, O, o],
  [o, O, O, O, O, O, O, O, o],
  [G, o, O, O, D, O, O, o, G],
  [G, G, o, O, O, O, o, G, G],
]

const COLS = SPRITE[0].length  // 9
const ROWS = SPRITE.length     // 7

export default function PixelKeke({ cellSize = 16 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  const W_PX = COLS * cellSize
  const H_PX = ROWS * cellSize
  // extra canvas height for float travel
  const CANVAS_H = H_PX + cellSize * 2

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let start = null

    function draw(ts) {
      if (!start) start = ts
      const t = (ts - start) / 1000          // seconds
      const float = Math.sin(t * 1.4) * cellSize  // ±1 cell

      ctx.clearRect(0, 0, W_PX, CANVAS_H)

      // subtle shadow
      const shadowY = H_PX + cellSize + Math.sin(t * 1.4) * (cellSize * 0.4)
      const shadowA = 0.10 + 0.05 * Math.sin(t * 1.4)
      ctx.save()
      ctx.globalAlpha = shadowA
      ctx.fillStyle = '#8B4513'
      ctx.beginPath()
      ctx.ellipse(W_PX / 2, shadowY, W_PX * 0.38, cellSize * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // sprite
      const offsetY = cellSize + float
      SPRITE.forEach((row, y) => {
        row.forEach((color, x) => {
          if (color) {
            ctx.fillStyle = color
            ctx.fillRect(x * cellSize, offsetY + y * cellSize, cellSize, cellSize)
          }
        })
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [cellSize, W_PX, H_PX, CANVAS_H])

  return (
    <canvas
      ref={canvasRef}
      width={W_PX}
      height={CANVAS_H}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      aria-label="克克 Clawd 像素螃蟹"
    />
  )
}
