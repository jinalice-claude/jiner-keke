import { useState, useEffect } from 'react'
import { PageShell, PageHead, HintRow } from '../components/WarmKit'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL   || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

async function saveDiary({ title, content }) {
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ content: `【日记】${title}\n\n${content}`, tags: 'diary,jiner-keke', importance: 5 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function updateDiary(id, { title, content }) {
  const res = await fetch(`${BASE}/api/public/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id, content: `【日记】${title}\n\n${content}` }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function deleteDiary(id) {
  const res = await fetch(`${BASE}/api/public/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function loadDiaries() {
  const res = await fetch(`${BASE}/api/public/list?tag=diary`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const list = await res.json()
  return list.map((b, i) => {
    const lines = b.content.split('\n')
    const titleLine = lines.find(l => l.includes('【日记】')) || ''
    const title = titleLine.replace('【日记】', '').trim() || `日记 ${i + 1}`
    const content = lines.filter(l => !l.includes('【日记】')).join('\n').trim()
    return {
      id: b.id,
      title,
      content,
      date: b.created ? b.created.slice(0, 10) : new Date().toISOString().slice(0, 10),
    }
  })
}

function shortDate(str) {
  const d = new Date(str)
  return `${d.getMonth() + 1} · ${d.getDate()}`
}

function weekday(str) {
  const d = new Date(str)
  return `周${'日一二三四五六'[d.getDay()]}`
}

// 内联输入框样式（暗色主题）
const inputStyle = {
  background: 'rgba(255,240,225,0.06)', border: '1px solid rgba(255,232,212,0.2)',
  borderRadius: 10, padding: '10px 14px', color: T.cream, fontFamily: T.sans,
  fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
}
const textareaStyle = { ...inputStyle, lineHeight: 1.8, resize: 'vertical' }

export default function Diary() {
  const [entries, setEntries]         = useState([])
  const [activeId, setActiveId]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [writing, setWriting]         = useState(false)
  const [editing, setEditing]         = useState(false)
  const [confirmDel, setConfirmDel]   = useState(false)
  const [form, setForm]               = useState({ title: '', content: '' })
  const [editForm, setEditForm]       = useState({ title: '', content: '' })
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  function load() {
    if (!BASE) { setLoading(false); return }
    setLoading(true)
    loadDiaries()
      .then(list => {
        setEntries(list)
        if (list.length && !activeId) setActiveId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])   // eslint-disable-line

  const featured   = entries.find(e => e.id === activeId) || entries[0]
  const pastEntries = entries.filter(e => e.id !== featured?.id)

  function startEdit() {
    if (!featured) return
    setEditForm({ title: featured.title, content: featured.content })
    setEditing(true)
    setConfirmDel(false)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await saveDiary(form)
      setWriting(false)
      setForm({ title: '', content: '' })
      load()
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function handleUpdate() {
    if (!editForm.title.trim() || !editForm.content.trim()) return
    setSaving(true)
    try {
      await updateDiary(featured.id, editForm)
      setEditing(false)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!featured) return
    setDeleting(true)
    try {
      await deleteDiary(featured.id)
      setConfirmDel(false)
      setActiveId(null)
      load()
    } catch { alert('删除失败，请重试') }
    finally { setDeleting(false) }
  }

  const totalCount = entries.length
  const latestDate = entries[0] ? shortDate(entries[0].date) : ''

  return (
    <PageShell>
      <PageHead
        title="日记本" en="Diary"
        note="把这些天的心情，一页一页写下来。"
        meta={totalCount ? <span>共 {totalCount} 篇 · 2026<br />最近更新 {latestDate}</span> : null}
      />

      {/* 写日记按钮 */}
      {!writing && !editing && (
        <button onClick={() => setWriting(true)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          borderRadius: 14, padding: '18px', marginBottom: 22, cursor: 'pointer',
          border: '1px dashed rgba(255,232,212,0.24)', background: 'transparent',
          color: T.accent, fontFamily: T.hand, fontSize: 22, letterSpacing: 1, width: '100%',
        }}>
          ✎ 写一篇新的日记
        </button>
      )}

      {/* 写日记表单 */}
      {writing && (
        <div style={{ ...T.glass, borderRadius: 20, padding: '30px 34px', marginBottom: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 18, top: 26, bottom: 26, width: 2, borderRadius: 2, background: `${T.accent}77`, boxShadow: `0 0 10px ${T.accent}55` }} />
          <div style={{ marginBottom: 14 }}>
            <input
              placeholder="标题"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ ...inputStyle, fontSize: 20, fontFamily: T.serif, fontWeight: 500 }}
            />
          </div>
          <textarea
            placeholder="写下今天……"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={10}
            style={textareaStyle}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 26px', background: T.accent, color: '#2D2128', border: 'none',
              borderRadius: 20, cursor: 'pointer', fontFamily: T.serif, fontSize: 15, fontWeight: 500,
            }}>
              {saving ? '保存中…' : '保存'}
            </button>
            <button onClick={() => { setWriting(false); setForm({ title: '', content: '' }) }} style={{
              padding: '10px 22px', background: 'rgba(255,240,225,0.06)', color: T.dim,
              border: '1px solid rgba(255,232,212,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14,
            }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* 编辑表单 */}
      {editing && featured && (
        <div style={{ ...T.glass, borderRadius: 20, padding: '30px 34px', marginBottom: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 18, top: 26, bottom: 26, width: 2, borderRadius: 2, background: `${T.accent}77`, boxShadow: `0 0 10px ${T.accent}55` }} />
          <div style={{ marginBottom: 14 }}>
            <input
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              style={{ ...inputStyle, fontSize: 20, fontFamily: T.serif, fontWeight: 500 }}
            />
          </div>
          <textarea
            value={editForm.content}
            onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
            rows={10}
            style={textareaStyle}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleUpdate} disabled={saving} style={{
              padding: '10px 26px', background: T.accent, color: '#2D2128', border: 'none',
              borderRadius: 20, cursor: 'pointer', fontFamily: T.serif, fontSize: 15, fontWeight: 500,
            }}>
              {saving ? '保存中…' : '保存修改'}
            </button>
            <button onClick={() => setEditing(false)} style={{
              padding: '10px 22px', background: 'rgba(255,240,225,0.06)', color: T.dim,
              border: '1px solid rgba(255,232,212,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14,
            }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* 加载中 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          正在翻开日记本 …
        </div>
      )}

      {/* 精选 / 最新一篇 */}
      {!loading && !writing && !editing && featured && (
        <div style={{ ...T.glass, borderRadius: 20, padding: '30px 34px 30px 40px', position: 'relative', overflow: 'hidden', marginBottom: 22 }}>
          <div style={{ position: 'absolute', left: 18, top: 26, bottom: 26, width: 2, borderRadius: 2, background: `${T.accent}77`, boxShadow: `0 0 10px ${T.accent}55` }} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: T.latin, fontSize: 30, color: T.accent, letterSpacing: 1, whiteSpace: 'nowrap' }}>{shortDate(featured.date)}</span>
              <h2 style={{ fontFamily: T.serif, fontSize: 27, fontWeight: 500, margin: 0, letterSpacing: 1, color: '#F8EEDF' }}>{featured.title}</h2>
            </div>
            <span style={{ fontSize: 13, color: T.dim }}>{weekday(featured.date)}</span>
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 2, color: T.cream, margin: '16px 0 18px', maxWidth: 820, whiteSpace: 'pre-wrap' }}>
            {featured.content}
          </p>
          {/* 操作行 */}
          {confirmDel ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: T.dim }}>确定删除这篇日记？</span>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: '6px 18px', background: '#C05A5A', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 13 }}>
                {deleting ? '删除中…' : '确定'}
              </button>
              <button onClick={() => setConfirmDel(false)} style={{ padding: '6px 16px', background: 'rgba(255,240,225,0.06)', color: T.dim, border: '1px solid rgba(255,232,212,0.2)', borderRadius: 14, cursor: 'pointer', fontSize: 13 }}>
                取消
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
              <HintRow c={T.accent}>
                <button onClick={startEdit} style={{ background: 'none', border: 'none', color: `${T.cream}99`, cursor: 'pointer', fontSize: 13, padding: 0 }}>编辑 →</button>
              </HintRow>
              <HintRow c="#C05A5A">
                <button onClick={() => setConfirmDel(true)} style={{ background: 'none', border: 'none', color: `${T.cream}77`, cursor: 'pointer', fontSize: 13, padding: 0 }}>删除</button>
              </HintRow>
            </div>
          )}
        </div>
      )}

      {/* 过往日记网格 */}
      {!loading && pastEntries.length > 0 && (
        <div className="grid-2" style={{ marginTop: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {pastEntries.map(e => (
            <div key={e.id} onClick={() => { setActiveId(e.id); setEditing(false); setWriting(false); setConfirmDel(false) }}
              style={{
                ...T.glass, borderRadius: 18, padding: '24px 28px',
                display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: T.latin, fontSize: 20, color: T.accent, letterSpacing: 1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{shortDate(e.date)}</span>
                <h3 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500, margin: 0, letterSpacing: 1, color: T.cream }}>{e.title}</h3>
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.8, color: T.dim, margin: 0,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {e.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 没有日记时的提示 */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          还没有日记，点上方按钮开始写吧 …
        </div>
      )}

      {/* 底部留白提示 */}
      {!loading && entries.length > 0 && (
        <div style={{ marginTop: 24, borderRadius: 18, padding: '26px', textAlign: 'center',
          border: '1px dashed rgba(255,232,212,0.2)', color: `${T.dim}cc`, fontFamily: T.hand, fontSize: 21, letterSpacing: 1 }}>
          更早的日子，还在慢慢补上来 …
        </div>
      )}
    </PageShell>
  )
}
