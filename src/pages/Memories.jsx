import { useState, useEffect } from 'react'
import { PageShell, PageHead } from '../components/WarmKit'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL    || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

async function loadMemories() {
  const res = await fetch(`${BASE}/api/public/list?tag=memory`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  return data.map(b => ({
    id: b.id,
    content: b.content || '',
    date: b.created ? b.created.slice(0, 10) : new Date().toISOString().slice(0, 10),
  }))
}

async function saveMemory(content) {
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ content, tags: 'memory,jiner-keke', importance: 7 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function bubbleDate(str) {
  const d = new Date(str)
  return `${String(d.getMonth() + 1).padStart(2, '0')}·${String(d.getDate()).padStart(2, '0')}`
}

// 每个泡泡的视觉参数，按索引循环
const BUBBLE_PARAMS = [
  { size: 196, offset:  0, dur: 7.0 },
  { size: 184, offset: 42, dur: 8.0 },
  { size: 228, offset: 10, dur: 9.0 },
  { size: 170, offset: 56, dur: 6.5 },
  { size: 210, offset: 18, dur: 8.5 },
  { size: 176, offset: 34, dur: 7.5 },
  { size: 192, offset: 26, dur: 7.8 },
  { size: 164, offset: 48, dur: 6.8 },
]

function bubbleStyle(size, glow, offset, dur) {
  return {
    width: size, height: size, borderRadius: '50%', flexShrink: 0, marginTop: offset,
    background: `radial-gradient(circle at 42% 36%, rgba(255,240,225,0.10) 0%, rgba(255,240,225,0.04) 52%, transparent 74%)`,
    border: `1px solid ${glow}3a`,
    boxShadow: `0 1px 0 rgba(255,240,225,0.1) inset, 0 14px 36px rgba(20,12,10,0.3), 0 0 30px ${glow}33`,
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
    animation: `bubble-bob ${dur}s ease-in-out infinite`,
  }
}

// 文字泡泡
function TextBubble({ size, glow, offset, dur, date, children }) {
  return (
    <div style={bubbleStyle(size, glow, offset, dur)}>
      <div>
        <div style={{ fontFamily: T.latin, fontSize: 14, letterSpacing: 2, color: glow, marginBottom: 8 }}>{date}</div>
        <p style={{ fontFamily: T.serif, fontSize: size > 200 ? 18 : 16, fontWeight: 500, lineHeight: 1.7, margin: 0, color: '#F8EEDF', letterSpacing: 1 }}>
          {children}
        </p>
      </div>
    </div>
  )
}

// 照片泡泡（img 占位，src 留空供瑾儿之后填）
function PhotoBubble({ src = '', cap, size, glow, offset, dur }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: offset,
      animation: `bubble-bob ${dur}s ease-in-out infinite` }}>
      <div style={{ width: size, height: size, borderRadius: '50%', padding: 6,
        border: `1px solid ${glow}3a`, boxShadow: `0 14px 36px rgba(20,12,10,0.3), 0 0 28px ${glow}33`,
        background: 'rgba(255,240,225,0.04)', overflow: 'hidden' }}>
        {src ? (
          <img src={src} alt={cap || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          // 空占位：虚线圆 + 提示文字
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,232,212,0.28)' }}>
            <div style={{ fontSize: 22, color: `${T.accent}88`, lineHeight: 1 }}>📷</div>
            <div style={{ fontFamily: T.hand, fontSize: 14, color: `${T.dim}88`, marginTop: 4 }}>照片占位</div>
          </div>
        )}
      </div>
      {cap && <div style={{ fontSize: 13, color: T.dim, letterSpacing: 1 }}>{cap}</div>}
    </div>
  )
}

const inputStyle = {
  background: 'rgba(255,240,225,0.06)', border: '1px solid rgba(255,232,212,0.2)',
  borderRadius: 10, padding: '10px 14px', color: T.cream, fontFamily: T.sans,
  fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
}

export default function Memories() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [writing, setWriting]   = useState(false)
  const [text, setText]         = useState('')
  const [saving, setSaving]     = useState(false)

  function load() {
    if (!BASE) { setLoading(false); return }
    setLoading(true)
    loadMemories().then(setMemories).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])  // eslint-disable-line

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    try {
      await saveMemory(text.trim())
      setText('')
      setWriting(false)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  return (
    <PageShell>
      <PageHead
        title="记忆碎片" en="Fragments"
        note="一闪一闪的瞬间，像泡泡一样从记忆里浮上来。"
        meta={memories.length ? <span>已收藏 {memories.length} 片</span> : null}
      />

      {/* 写碎片表单 */}
      {writing ? (
        <div style={{ ...T.glass, borderRadius: 20, padding: '28px 30px', marginBottom: 24 }}>
          <textarea
            placeholder="写下这一刻 …"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            style={{ ...inputStyle, lineHeight: 1.8, resize: 'vertical' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 26px', background: T.accent, color: '#2D2128', border: 'none',
              borderRadius: 20, cursor: 'pointer', fontFamily: T.serif, fontSize: 15, fontWeight: 500,
            }}>
              {saving ? '收好了 …' : '收下来'}
            </button>
            <button onClick={() => { setWriting(false); setText('') }} style={{
              padding: '10px 22px', background: 'rgba(255,240,225,0.06)', color: T.dim,
              border: '1px solid rgba(255,232,212,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14,
            }}>
              取消
            </button>
          </div>
        </div>
      ) : null}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          正在唤起记忆 …
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 28, padding: '20px 0 10px' }}>

          {/* 照片泡泡占位（固定位置，瑾儿之后可填入 src） */}
          <PhotoBubble size={196} glow={T.accent} offset={0}  dur={7}   cap="窗台上的那束花" />

          {/* API 文字碎片 */}
          {memories.map((m, i) => {
            const p    = BUBBLE_PARAMS[i % BUBBLE_PARAMS.length]
            const glow = i % 2 === 0 ? T.accent : T.rose
            // 每隔 3 个文字泡泡插入一个照片占位
            const showPhoto = i > 0 && i % 3 === 0
            return (
              <TextBubble key={m.id} size={p.size} glow={glow} offset={p.offset} dur={p.dur} date={bubbleDate(m.date)}>
                {m.content.length > 60 ? m.content.slice(0, 58) + '…' : m.content}
              </TextBubble>
            )
          })}

          {/* 第二个照片占位 */}
          <PhotoBubble size={176} glow={T.rose}   offset={6}  dur={8.5} cap="一起做的晚饭" />

          {/* 续收泡泡 */}
          <div onClick={() => setWriting(true)} style={{
            width: 156, height: 156, borderRadius: '50%', marginTop: 18, flexShrink: 0, cursor: 'pointer',
            border: '1px dashed rgba(255,232,212,0.26)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: `${T.dim}cc`, animation: 'bubble-bob 7.8s ease-in-out infinite',
          }}>
            <div style={{ fontSize: 26, color: T.accent, lineHeight: 1 }}>+</div>
            <div style={{ fontFamily: T.hand, fontSize: 18, marginTop: 4 }}>再收一片</div>
          </div>

        </div>
      )}

      {!loading && memories.length === 0 && !writing && (
        <div style={{ textAlign: 'center', padding: '0 0 20px', fontFamily: T.hand, fontSize: 20, color: `${T.dim}88` }}>
          还没有碎片，点「+」开始收第一片 …
        </div>
      )}
    </PageShell>
  )
}
