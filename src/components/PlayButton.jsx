import { useState, useRef, useEffect } from 'react'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL    || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

export default function PlayButton({ text }) {
  const [status,  setStatus]  = useState('idle')  // 'idle' | 'loading' | 'playing'
  const [err,     setErr]     = useState(false)
  const [hovered, setHovered] = useState(false)
  const audioRef   = useRef(null)
  const blobUrlRef = useRef(null)

  useEffect(() => () => {
    if (audioRef.current)   audioRef.current.pause()
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
  }, [])

  function clearAudio() {
    if (audioRef.current)   { audioRef.current.pause(); audioRef.current = null }
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
  }

  async function handleClick(e) {
    e.stopPropagation()
    if (status === 'loading') return
    if (status === 'playing') { clearAudio(); setStatus('idle'); return }
    setStatus('loading')
    try {
      const res = await fetch(`${BASE}/api/public/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      blobUrlRef.current = url
      const audio = new Audio(url)
      audioRef.current  = audio
      audio.onended = () => { clearAudio(); setStatus('idle') }
      await audio.play()
      setStatus('playing')
    } catch {
      clearAudio()
      setStatus('idle')
      setErr(true)
      setTimeout(() => setErr(false), 1500)
    }
  }

  const isLoading = status === 'loading'
  const isPlaying = status === 'playing'
  const active    = isPlaying || hovered
  const color       = active ? T.accent : T.dim
  const borderColor = active ? 'rgba(231,178,126,0.45)' : 'rgba(255,232,212,0.16)'
  const glow        = isPlaying ? `0 0 8px ${T.accent}55` : 'none'

  return (
    <div
      style={{ marginTop: 12, textAlign: 'right', position: 'relative' }}
      onClick={e => e.stopPropagation()}
    >
      <style>{`@keyframes pb-spin { to { transform: rotate(360deg) } }`}</style>

      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={isPlaying ? '停止朗读' : '朗读这封信'}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${borderColor}`,
          background: 'transparent',
          color,
          cursor: isLoading ? 'default' : 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
          transition: 'color 0.2s, border-color 0.2s, box-shadow 0.2s',
          boxShadow: glow,
          outline: 'none',
        }}
      >
        {isLoading ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
               style={{ animation: 'pb-spin 0.9s linear infinite' }}>
            <circle cx="7" cy="7" r="5.5"
                    stroke="currentColor" strokeWidth="1.5"
                    strokeDasharray="20 15" strokeLinecap="round" />
          </svg>
        ) : isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="2" width="3" height="8" rx="1" fill="currentColor" />
            <rect x="7" y="2" width="3" height="8" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polygon points="3,2 10,6 3,10" fill="currentColor" />
          </svg>
        )}
      </button>

      {err && (
        <span style={{
          position: 'absolute', right: 34, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 11, color: T.rose,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          网络不稳，再试试
        </span>
      )}
    </div>
  )
}
