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
  return data.map(b => {
    const c    = b.content || ''
    const date = b.created ? b.created.slice(0, 10) : new Date().toISOString().slice(0, 10)
    if (c.startsWith('【图片碎片】')) {
      const capMatch = c.match(/【图片碎片】([^\n]+)/)
      const imgMatch = c.match(/图片:([^\n]*)/)
      return { id: b.id, type: 'photo', caption: capMatch?.[1]?.trim() || '', imageUrl: imgMatch?.[1]?.trim() || '', date }
    }
    return { id: b.id, type: 'text', content: c, date }
  })
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

async function updateMemory(id, content) {
  const res = await fetch(`${BASE}/api/public/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id, content }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function deleteMemory(id) {
  const res = await fetch(`${BASE}/api/public/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function bubbleDate(str) {
  const d = new Date(str)
  return `${String(d.getMonth() + 1).padStart(2, '0')}·${String(d.getDate()).padStart(2, '0')}`
}

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

function bubbleBase(size, glow, offset, dur) {
  return {
    width: size, height: size, borderRadius: '50%', flexShrink: 0, marginTop: offset,
    background: `radial-gradient(circle at 42% 36%, rgba(255,240,225,0.10) 0%, rgba(255,240,225,0.04) 52%, transparent 74%)`,
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 22,
    animation: `bubble-bob ${dur}s ease-in-out infinite`,
    cursor: 'pointer', transition: 'border 0.2s, box-shadow 0.2s',
  }
}

function MemoBubble({ m, size, glow, offset, dur, selected, onClick }) {
  const isPhoto  = m.type === 'photo'
  const raw      = isPhoto ? m.caption : m.content
  const preview  = raw.length > 18 ? raw.slice(0, 16) + '…' : raw

  return (
    <div onClick={onClick} style={{
      ...bubbleBase(size, glow, offset, dur),
      animationPlayState: selected ? 'paused' : 'running',
      border: selected ? `2px solid ${glow}88` : `1px solid ${glow}3a`,
      boxShadow: selected
        ? `0 1px 0 rgba(255,240,225,0.1) inset, 0 14px 36px rgba(20,12,10,0.3), 0 0 44px ${glow}55`
        : `0 1px 0 rgba(255,240,225,0.1) inset, 0 14px 36px rgba(20,12,10,0.3), 0 0 30px ${glow}33`,
    }}>
      <div>
        <div style={{ fontFamily: T.latin, fontSize: 13, letterSpacing: 2, color: glow, marginBottom: 8 }}>
          {bubbleDate(m.date)}
        </div>
        {isPhoto ? (
          <>
            <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 6 }}>🧩</div>
            {preview && (
              <p style={{ fontFamily: T.hand, fontSize: 13, margin: 0, color: T.dim, letterSpacing: 0.5 }}>{preview}</p>
            )}
          </>
        ) : (
          <p style={{ fontFamily: T.serif, fontSize: size > 200 ? 16 : 14, fontWeight: 500, lineHeight: 1.65, margin: 0, color: '#F8EEDF', letterSpacing: 1 }}>
            {preview}
          </p>
        )}
        {selected && (
          <div style={{ fontSize: 11, color: `${glow}99`, marginTop: 8, letterSpacing: 1 }}>戳开了 ↓</div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  background: 'rgba(255,240,225,0.06)', border: '1px solid rgba(255,232,212,0.2)',
  borderRadius: 10, padding: '10px 14px', color: T.cream, fontFamily: T.sans,
  fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
}
const btnPrimary = {
  padding: '10px 26px', background: T.accent, color: '#2D2128', border: 'none',
  borderRadius: 20, cursor: 'pointer', fontFamily: T.serif, fontSize: 15, fontWeight: 500,
}
const btnSecondary = {
  padding: '10px 22px', background: 'rgba(255,240,225,0.06)', color: T.dim,
  border: '1px solid rgba(255,232,212,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14,
}

export default function Memories() {
  const [memories, setMemories]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [writing, setWriting]             = useState(false)
  const [writeType, setWriteType]         = useState('text')
  const [text, setText]                   = useState('')
  const [photoForm, setPhotoForm]         = useState({ caption: '', imageUrl: '' })
  const [saving, setSaving]               = useState(false)
  const [selected, setSelected]           = useState(null)
  const [editingId, setEditingId]         = useState(null)
  const [editText, setEditText]           = useState('')
  const [editPhotoForm, setEditPhotoForm] = useState({ caption: '', imageUrl: '' })
  const [confirmDelId, setConfirmDelId]   = useState(null)
  const [actioning, setActioning]         = useState(false)

  function load() {
    if (!BASE) { setLoading(false); return }
    setLoading(true)
    loadMemories().then(setMemories).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])  // eslint-disable-line

  async function handleSave() {
    if (writeType === 'text' && !text.trim()) return
    if (writeType === 'photo' && !photoForm.caption.trim()) return
    setSaving(true)
    try {
      if (writeType === 'photo') {
        await saveMemory(`【图片碎片】${photoForm.caption.trim()}\n图片:${photoForm.imageUrl.trim()}`)
        setPhotoForm({ caption: '', imageUrl: '' })
      } else {
        await saveMemory(text.trim())
        setText('')
      }
      setWriteType('text')
      setWriting(false)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function handleUpdate() {
    if (!editingId) return
    const mem = memories.find(m => m.id === editingId)
    if (!mem) return
    if (mem.type === 'text' && !editText.trim()) return
    if (mem.type === 'photo' && !editPhotoForm.caption.trim()) return
    setActioning(true)
    try {
      if (mem.type === 'photo') {
        await updateMemory(editingId, `【图片碎片】${editPhotoForm.caption.trim()}\n图片:${editPhotoForm.imageUrl.trim()}`)
        setEditPhotoForm({ caption: '', imageUrl: '' })
      } else {
        await updateMemory(editingId, editText.trim())
        setEditText('')
      }
      setEditingId(null)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setActioning(false) }
  }

  async function handleDelete() {
    if (!confirmDelId) return
    setActioning(true)
    try {
      await deleteMemory(confirmDelId)
      setConfirmDelId(null)
      setSelected(null)
      load()
    } catch { alert('删除失败，请重试') }
    finally { setActioning(false) }
  }

  function toggleSelect(id) {
    setSelected(prev => prev === id ? null : id)
    setEditingId(null)
    setEditText('')
    setEditPhotoForm({ caption: '', imageUrl: '' })
    setConfirmDelId(null)
    setWriting(false)
  }

  const selectedMem = memories.find(m => m.id === selected)

  return (
    <PageShell>
      <PageHead
        title="记忆碎片" en="Fragments"
        note="一闪一闪的瞬间，像泡泡一样从记忆里浮上来。"
        meta={memories.length ? <span>已收藏 {memories.length} 片</span> : null}
      />

      {/* 写碎片表单 */}
      {writing && (
        <div style={{ ...T.glass, borderRadius: 20, padding: '28px 30px', marginBottom: 24 }}>
          {/* 类型切换 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['text', '文字碎片'], ['photo', '图片碎片 🧩']].map(([type, label]) => (
              <button key={type} onClick={() => setWriteType(type)} style={{
                padding: '6px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 14,
                background: writeType === type ? T.accent : 'rgba(255,240,225,0.06)',
                color: writeType === type ? '#2D2128' : T.dim,
                border: writeType === type ? 'none' : '1px solid rgba(255,232,212,0.2)',
              }}>{label}</button>
            ))}
          </div>

          {writeType === 'text' ? (
            <textarea
              placeholder="写下这一刻 …"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              style={{ ...inputStyle, lineHeight: 1.8, resize: 'vertical' }}
              autoFocus
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={photoForm.caption}
                onChange={e => setPhotoForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="这张图是 …（标题 / 说明）"
                style={inputStyle}
                autoFocus
              />
              <input
                value={photoForm.imageUrl}
                onChange={e => setPhotoForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="图片地址（URL，暂时没有可留空）"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={handleSave} disabled={saving} style={btnPrimary}>
              {saving ? '收好了 …' : '收下来'}
            </button>
            <button onClick={() => { setWriting(false); setText(''); setPhotoForm({ caption: '', imageUrl: '' }) }} style={btnSecondary}>
              取消
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          正在唤起记忆 …
        </div>
      )}

      {!loading && (
        <>
          {/* 泡泡容器 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 28, padding: '20px 0 10px' }}>
            {memories.map((m, i) => {
              const p    = BUBBLE_PARAMS[i % BUBBLE_PARAMS.length]
              const glow = i % 2 === 0 ? T.accent : T.rose
              return (
                <MemoBubble
                  key={m.id}
                  m={m}
                  size={p.size} glow={glow} offset={p.offset} dur={p.dur}
                  selected={selected === m.id}
                  onClick={() => toggleSelect(m.id)}
                />
              )
            })}

            {/* 续收泡泡 */}
            <div onClick={() => { setWriting(true); setSelected(null); setEditingId(null) }} style={{
              width: 156, height: 156, borderRadius: '50%', marginTop: 18, flexShrink: 0, cursor: 'pointer',
              border: '1px dashed rgba(255,232,212,0.26)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: `${T.dim}cc`, animation: 'bubble-bob 7.8s ease-in-out infinite',
            }}>
              <div style={{ fontSize: 26, color: T.accent, lineHeight: 1 }}>+</div>
              <div style={{ fontFamily: T.hand, fontSize: 18, marginTop: 4 }}>再收一片</div>
            </div>
          </div>

          {/* 展开详情面板 */}
          {selected && selectedMem && (
            <div style={{ ...T.glass, borderRadius: 20, padding: '28px 30px', marginTop: 28 }}>
              {editingId === selected ? (
                /* 编辑模式 */
                selectedMem.type === 'photo' ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input value={editPhotoForm.caption} onChange={e => setEditPhotoForm(f => ({ ...f, caption: e.target.value }))} placeholder="标题 / 说明" style={inputStyle} autoFocus />
                      <input value={editPhotoForm.imageUrl} onChange={e => setEditPhotoForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="图片地址（URL）" style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button onClick={handleUpdate} disabled={actioning} style={btnPrimary}>{actioning ? '保存中 …' : '保存'}</button>
                      <button onClick={() => { setEditingId(null); setEditPhotoForm({ caption: '', imageUrl: '' }) }} style={btnSecondary}>取消</button>
                    </div>
                  </>
                ) : (
                  <>
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={5} style={{ ...inputStyle, lineHeight: 1.8, resize: 'vertical' }} autoFocus />
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button onClick={handleUpdate} disabled={actioning} style={btnPrimary}>{actioning ? '保存中 …' : '保存'}</button>
                      <button onClick={() => { setEditingId(null); setEditText('') }} style={btnSecondary}>取消</button>
                    </div>
                  </>
                )
              ) : confirmDelId === selected ? (
                /* 删除确认 */
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, fontFamily: T.sans, fontSize: 15, color: T.dim }}>确定删除这片记忆？</span>
                  <button onClick={handleDelete} disabled={actioning} style={{ ...btnPrimary, background: '#C07070', padding: '8px 20px' }}>
                    {actioning ? '删除中 …' : '确定删除'}
                  </button>
                  <button onClick={() => setConfirmDelId(null)} style={btnSecondary}>取消</button>
                </div>
              ) : selectedMem.type === 'photo' ? (
                /* 图片碎片详情 */
                <>
                  <div style={{ fontFamily: T.latin, fontSize: 13, color: T.accent, letterSpacing: 2, marginBottom: 16 }}>
                    {bubbleDate(selectedMem.date)}
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                    {selectedMem.imageUrl ? (
                      <img
                        src={selectedMem.imageUrl}
                        alt={selectedMem.caption}
                        style={{ maxWidth: '100%', maxHeight: 380, borderRadius: 14, objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ fontSize: 64, lineHeight: 1 }}>🧩</div>
                    )}
                  </div>
                  {selectedMem.caption && (
                    <p style={{ fontFamily: T.serif, fontSize: 18, lineHeight: 1.8, color: T.cream, margin: '0 0 20px', textAlign: 'center', letterSpacing: 1 }}>
                      {selectedMem.caption}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 14 }}>
                    <button onClick={() => { setEditingId(selected); setEditPhotoForm({ caption: selectedMem.caption, imageUrl: selectedMem.imageUrl }) }} style={btnPrimary}>编辑</button>
                    <button onClick={() => setConfirmDelId(selected)} style={{ ...btnSecondary, color: '#C07070', borderColor: 'rgba(200,80,80,0.28)' }}>删除</button>
                  </div>
                </>
              ) : (
                /* 文字碎片详情 */
                <>
                  <div style={{ fontFamily: T.latin, fontSize: 13, color: T.accent, letterSpacing: 2, marginBottom: 14 }}>
                    {bubbleDate(selectedMem.date)}
                  </div>
                  <p style={{ fontFamily: T.serif, fontSize: 18, lineHeight: 1.85, color: T.cream, whiteSpace: 'pre-wrap', margin: '0 0 20px' }}>
                    {selectedMem.content}
                  </p>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <button onClick={() => { setEditingId(selected); setEditText(selectedMem.content) }} style={btnPrimary}>编辑</button>
                    <button onClick={() => setConfirmDelId(selected)} style={{ ...btnSecondary, color: '#C07070', borderColor: 'rgba(200,80,80,0.28)' }}>删除</button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {!loading && memories.length === 0 && !writing && (
        <div style={{ textAlign: 'center', padding: '0 0 20px', fontFamily: T.hand, fontSize: 20, color: `${T.dim}88` }}>
          还没有碎片，点「+」开始收第一片 …
        </div>
      )}
    </PageShell>
  )
}
