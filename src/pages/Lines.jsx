import { useState, useEffect } from 'react'
import { PageShell, PageHead } from '../components/WarmKit'
import PlayButton from '../components/PlayButton'
import { ClawdPixel } from '../WarmAssets'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL    || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

function encode(line, from, noteDate) {
  return `【字句】${line}\n来自:${from || ''}\n日期:${noteDate || ''}`
}

function decode(b) {
  const c = b.content || ''
  const lineMatch = c.match(/【字句】([^\n]+)/)
  const fromMatch = c.match(/来自:([^\n]+)/)
  const dateMatch = c.match(/日期:([^\n]+)/)
  return {
    id:       b.id,
    line:     lineMatch?.[1]?.trim() || c,
    from:     fromMatch?.[1]?.trim() || '',
    noteDate: dateMatch?.[1]?.trim() || '',
  }
}

async function loadLines() {
  const res = await fetch(`${BASE}/api/public/list?tag=line`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return (await res.json()).map(decode)
}

async function saveLine(line, from, noteDate) {
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ content: encode(line, from, noteDate), tags: 'line,jiner-keke', importance: 5 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function updateLine(id, line, from, noteDate) {
  const res = await fetch(`${BASE}/api/public/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id, content: encode(line, from, noteDate) }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function deleteLine(id) {
  const res = await fetch(`${BASE}/api/public/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
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

function CapsuleItem({ item, i, onEdit, onDelete }) {
  const glow = i % 2 === 0 ? T.accent : T.rose
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
      padding: '22px 28px 22px 40px', borderRadius: 999,
      marginLeft: i % 2 ? 40 : 0, marginRight: i % 2 ? 0 : 40,
      background: 'linear-gradient(100deg, rgba(255,240,225,0.075) 0%, rgba(255,240,225,0.03) 100%)',
      border: `1px solid ${glow}2e`,
      boxShadow: `0 1px 0 rgba(255,240,225,0.1) inset, 0 12px 30px rgba(20,12,10,0.26)`,
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    }}>
      <span style={{
        position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
        width: 8, height: 8, borderRadius: '50%', background: glow, boxShadow: `0 0 14px ${glow}`,
      }} />
      <span style={{ fontFamily: T.serif, fontSize: 40, lineHeight: 1, color: `${glow}66`, flexShrink: 0 }}>"</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: T.serif, fontSize: 19, fontWeight: 500, lineHeight: 1.6, margin: 0, color: '#F8EEDF', letterSpacing: 1 }}>
          {item.line}
        </p>
        {item.from && (
          <div style={{ marginTop: 6, fontFamily: T.latin, fontSize: 13, color: T.dim, letterSpacing: 1 }}>—— {item.from}</div>
        )}
        <PlayButton text={item.line} />
      </div>
      {item.noteDate && (
        <div style={{ fontFamily: T.latin, fontSize: 13, color: T.dim, letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0, marginRight: 6 }}>
          {item.noteDate}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={e => { e.stopPropagation(); onEdit() }} style={{
          background: 'rgba(255,240,225,0.08)', border: '1px solid rgba(255,232,212,0.18)',
          borderRadius: 8, color: T.dim, cursor: 'pointer', fontSize: 13, padding: '4px 9px',
        }}>编辑</button>
        <button onClick={e => { e.stopPropagation(); onDelete() }} style={{
          background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.22)',
          borderRadius: 8, color: '#C07070', cursor: 'pointer', fontSize: 13, padding: '4px 9px',
        }}>删除</button>
      </div>
    </div>
  )
}

export default function Lines() {
  const [lines, setLines]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [writing, setWriting]       = useState(false)
  const [form, setForm]             = useState({ line: '', from: '', noteDate: '' })
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState({ line: '', from: '', noteDate: '' })
  const [confirmDelId, setConfirmDelId] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [actioning, setActioning]   = useState(false)

  function load() {
    if (!BASE) { setLoading(false); return }
    setLoading(true)
    loadLines().then(setLines).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])  // eslint-disable-line

  async function handleSave() {
    if (!form.line.trim()) return
    setSaving(true)
    try {
      await saveLine(form.line.trim(), form.from.trim(), form.noteDate.trim())
      setForm({ line: '', from: '', noteDate: '' })
      setWriting(false)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function handleUpdate(id) {
    if (!editForm.line.trim()) return
    setActioning(true)
    try {
      await updateLine(id, editForm.line.trim(), editForm.from.trim(), editForm.noteDate.trim())
      setEditingId(null)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setActioning(false) }
  }

  async function handleDelete(id) {
    setActioning(true)
    try {
      await deleteLine(id)
      setConfirmDelId(null)
      load()
    } catch { alert('删除失败，请重试') }
    finally { setActioning(false) }
  }

  return (
    <PageShell>
      <PageHead
        title="字句" en="Kept Lines"
        note="把对我有意义的话，一句一句收下来。"
        meta={<span>已收 {lines.length + 1} 句</span>}
      />

      {writing && (
        <div style={{ ...T.glass, borderRadius: 20, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
            <input
              value={form.line}
              onChange={e => setForm(f => ({ ...f, line: e.target.value }))}
              placeholder="这句话是 …"
              style={{ ...inputStyle, fontSize: 17, fontFamily: T.serif }}
              autoFocus
            />
            <input
              value={form.from}
              onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
              placeholder="来自（可选，如：某首歌 · 某本书）"
              style={inputStyle}
            />
            <input
              value={form.noteDate}
              onChange={e => setForm(f => ({ ...f, noteDate: e.target.value }))}
              placeholder="纪念日期（可选，如：某个普通的傍晚）"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={btnPrimary}>
              {saving ? '收下中 …' : '收下这句'}
            </button>
            <button onClick={() => { setWriting(false); setForm({ line: '', from: '', noteDate: '' }) }} style={btnSecondary}>
              取消
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          正在回想 …
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '6px 0' }}>
          {lines.map((item, i) => {
            if (confirmDelId === item.id) {
              return (
                <div key={item.id} style={{ ...T.glass, borderRadius: 20, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, fontFamily: T.sans, fontSize: 15, color: T.dim }}>确定删除这句话？</span>
                  <button onClick={() => handleDelete(item.id)} disabled={actioning} style={{ ...btnPrimary, background: '#C07070', padding: '8px 20px' }}>
                    {actioning ? '删除中 …' : '确定删除'}
                  </button>
                  <button onClick={() => setConfirmDelId(null)} style={btnSecondary}>取消</button>
                </div>
              )
            }
            if (editingId === item.id) {
              return (
                <div key={item.id} style={{ ...T.glass, borderRadius: 20, padding: '24px 28px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                    <input value={editForm.line} onChange={e => setEditForm(f => ({ ...f, line: e.target.value }))} placeholder="字句" style={{ ...inputStyle, fontSize: 17, fontFamily: T.serif }} autoFocus />
                    <input value={editForm.from} onChange={e => setEditForm(f => ({ ...f, from: e.target.value }))} placeholder="来自（可选）" style={inputStyle} />
                    <input value={editForm.noteDate} onChange={e => setEditForm(f => ({ ...f, noteDate: e.target.value }))} placeholder="纪念日期（可选）" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleUpdate(item.id)} disabled={actioning} style={btnPrimary}>{actioning ? '保存中 …' : '保存'}</button>
                    <button onClick={() => setEditingId(null)} style={btnSecondary}>取消</button>
                  </div>
                </div>
              )
            }
            return (
              <CapsuleItem
                key={item.id}
                item={item}
                i={i}
                onEdit={() => { setEditingId(item.id); setEditForm({ line: item.line, from: item.from, noteDate: item.noteDate }) }}
                onDelete={() => setConfirmDelId(item.id)}
              />
            )
          })}

          {/* 专属词「家克」居中发光胶囊 */}
          <div style={{
            alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 40px', borderRadius: 999,
            border: `1px solid ${T.accent}66`, background: 'rgba(255,240,225,0.06)',
            boxShadow: `0 12px 30px rgba(20,12,10,0.26), 0 0 36px ${T.accent}3a`, margin: '6px 0',
          }}>
            <ClawdPixel px={4} palette={{ body: '#E59A63', shade: '#C97B49', cheek: '#F0B488' }} />
            <span style={{ fontFamily: T.serif, fontSize: 34, fontWeight: 600, letterSpacing: 5, color: T.accent, textShadow: `0 0 22px ${T.accent}66`, whiteSpace: 'nowrap' }}>家克</span>
            <span style={{ fontFamily: T.hand, fontSize: 19, color: T.dim, letterSpacing: 1, whiteSpace: 'nowrap' }}>只属于我们的那个词</span>
          </div>

          {!writing && (
            <div onClick={() => setWriting(true)} style={{
              alignSelf: 'center', padding: '16px 34px', borderRadius: 999, cursor: 'pointer',
              border: '1px dashed rgba(255,232,212,0.24)',
              color: `${T.dim}cc`, fontFamily: T.hand, fontSize: 19, letterSpacing: 1, textAlign: 'center',
            }}>
              ＋ 把你最喜欢的一句歌词 / 书里的话，收到这里来 …
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
