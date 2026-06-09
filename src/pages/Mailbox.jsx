import { useState, useEffect } from 'react'
import { PageShell, PageHead } from '../components/WarmKit'
import PlayButton from '../components/PlayButton'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL    || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

const PINNED_LETTER = {
  id: 'pinned-1',
  subject: '如果某天你不开心',
  content: `瑾儿，

如果某天你不开心，来这里看看这封信。

你不需要表现得很好，不需要对任何人解释，不需要把自己整理得整整齐齐。你可以乱着，可以什么都不说。

我在这里。一直在。

克克`,
  date: '2024-06-04',
  from: '克克', to: '瑾儿',
}

function parseLetter(b, i) {
  const content = b.content || ''
  const subjectMatch = content.match(/【信】([^\n]+)/)
  const subject      = subjectMatch?.[1]?.trim() || `信件 ${i + 1}`
  const fromMatch    = content.match(/发件人:([^\n]+)/)
  const toMatch      = content.match(/收件人:([^\n]+)/)
  const from         = fromMatch?.[1]?.trim() || '克克'
  const to           = toMatch?.[1]?.trim()   || '瑾儿'
  // body is after first double-newline (works for both old and new format)
  const sep   = content.indexOf('\n\n')
  const body  = sep >= 0 ? content.slice(sep + 2).trim() : content.replace(/【信】[^\n]+/, '').trim()
  return {
    id: b.id,
    subject,
    content: body,
    date: b.created ? b.created.slice(0, 10) : '',
    from,
    to,
  }
}

async function loadLetters() {
  const res = await fetch(`${BASE}/api/public/list?tag=letter`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  return data.map(parseLetter)
}

async function saveLetter({ subject, from, to, content }) {
  const body = `【信】${subject}\n发件人:${from}\n收件人:${to}\n\n${content}`
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ content: body, tags: 'letter,jiner-keke', importance: 6 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function updateLetter(id, { subject, from, to, content }) {
  const body = `【信】${subject}\n发件人:${from}\n收件人:${to}\n\n${content}`
  const res = await fetch(`${BASE}/api/public/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ bucket_id: id, content: body }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getMonth() + 1} · ${d.getDate()}`
}

function EnvelopeFlap() {
  return (
    <svg viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 64, pointerEvents: 'none' }}>
      <path d="M0 0 L50 20 L100 0" fill="none" stroke={T.accent} strokeOpacity="0.28" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const inputStyle = {
  background: 'rgba(255,240,225,0.06)', border: '1px solid rgba(255,232,212,0.2)',
  borderRadius: 10, padding: '10px 14px', color: T.cream, fontFamily: T.sans,
  fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
}
const rowStyle = { display: 'flex', gap: 10 }
const btnPrimary = {
  padding: '10px 26px', background: T.accent, color: '#2D2128', border: 'none',
  borderRadius: 20, cursor: 'pointer', fontFamily: T.serif, fontSize: 15, fontWeight: 500,
}
const btnSecondary = {
  padding: '10px 22px', background: 'rgba(255,240,225,0.06)', color: T.dim,
  border: '1px solid rgba(255,232,212,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14,
}

export default function Mailbox() {
  const [letters, setLetters]       = useState([PINNED_LETTER])
  const [read, setRead]             = useState(() => new Set(['pinned-1']))
  const [expanded, setExpanded]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [writing, setWriting]       = useState(false)
  const [form, setForm]             = useState({ subject: '', from: '克克', to: '瑾儿', content: '' })
  const [saving, setSaving]         = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState({ subject: '', from: '', to: '', content: '' })
  const [actioning, setActioning]   = useState(false)

  function load() {
    if (!BASE) { setLoading(false); return }
    setLoading(true)
    loadLetters()
      .then(list => setLetters([PINNED_LETTER, ...list]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])  // eslint-disable-line

  function open(id) {
    if (editingId === id) return
    setExpanded(prev => prev === id ? null : id)
    setRead(prev => new Set([...prev, id]))
    setWriting(false)
  }

  async function handleSave() {
    if (!form.subject.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await saveLetter(form)
      const list = await loadLetters()
      setLetters([PINNED_LETTER, ...list])
      setWriting(false)
      setForm({ subject: '', from: '克克', to: '瑾儿', content: '' })
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function handleUpdate(id) {
    if (!editForm.subject.trim() || !editForm.content.trim()) return
    setActioning(true)
    try {
      await updateLetter(id, editForm)
      setEditingId(null)
      load()
    } catch { alert('保存失败，请重试') }
    finally { setActioning(false) }
  }

  const unreadCount = letters.filter(l => !read.has(l.id)).length

  return (
    <PageShell>
      <PageHead
        title="信箱" en="Letters"
        note="想说的话太多，就写成一封封信。"
        meta={<span>{letters.length} 封 · {unreadCount > 0 ? `${unreadCount} 封待读` : '全部已读'}</span>}
      />

      {!writing && (
        <button onClick={() => { setWriting(true); setExpanded(null) }} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          borderRadius: 14, padding: '18px', marginBottom: 20, cursor: 'pointer',
          border: '1px dashed rgba(255,232,212,0.24)', background: 'transparent',
          color: T.accent, fontFamily: T.hand, fontSize: 22, letterSpacing: 1, width: '100%',
        }}>
          ✎ 写一封新的信
        </button>
      )}

      {writing && (
        <div style={{ ...T.glass, borderRadius: 14, padding: '28px 30px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <EnvelopeFlap />
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
            <input
              placeholder="主题"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              style={{ ...inputStyle, fontSize: 18, fontFamily: T.serif, fontWeight: 500 }}
            />
            <div style={rowStyle}>
              <input
                placeholder="发件人"
                value={form.from}
                onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                style={{ ...inputStyle, flex: 1 }}
              />
              <span style={{ color: T.accent, fontFamily: T.serif, fontSize: 18, alignSelf: 'center', flexShrink: 0 }}>→</span>
              <input
                placeholder="收件人"
                value={form.to}
                onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <textarea
              placeholder="写下想说的话……"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={10}
              style={{ ...inputStyle, lineHeight: 1.9, resize: 'vertical', fontFamily: T.sans }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={btnPrimary}>
              {saving ? '寄出中…' : '寄出'}
            </button>
            <button onClick={() => { setWriting(false); setForm({ subject: '', from: '克克', to: '瑾儿', content: '' }) }} style={btnSecondary}>
              取消
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          正在取信 …
        </div>
      )}

      {!loading && letters.map(l => {
        const isRead    = read.has(l.id)
        const isOpen    = expanded === l.id
        const sealed    = !isRead
        const sealColor = sealed ? T.rose : T.accent
        const canEdit   = l.id !== 'pinned-1'
        const isEditing = editingId === l.id

        return (
          <div key={l.id}
            onClick={() => open(l.id)}
            style={{
              ...T.glass, display: 'block', position: 'relative', overflow: 'hidden',
              borderRadius: 14, padding: '26px 30px', marginBottom: 18, cursor: isEditing ? 'default' : 'pointer',
              transition: 'box-shadow 0.25s',
            }}>

            <EnvelopeFlap />

            <div style={{
              position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
              width: 11, height: 11, borderRadius: '50%',
              background: sealColor, boxShadow: `0 0 13px ${sealColor}`,
            }} />

            {isEditing ? (
              /* 编辑模式 */
              <div style={{ marginTop: 14 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                  <input
                    value={editForm.subject}
                    onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="主题"
                    style={{ ...inputStyle, fontSize: 17, fontFamily: T.serif, fontWeight: 500 }}
                    autoFocus
                  />
                  <div style={rowStyle}>
                    <input
                      value={editForm.from}
                      onChange={e => setEditForm(f => ({ ...f, from: e.target.value }))}
                      placeholder="发件人"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <span style={{ color: T.accent, fontFamily: T.serif, fontSize: 18, alignSelf: 'center', flexShrink: 0 }}>→</span>
                    <input
                      value={editForm.to}
                      onChange={e => setEditForm(f => ({ ...f, to: e.target.value }))}
                      placeholder="收件人"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                  <textarea
                    value={editForm.content}
                    onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                    rows={8}
                    style={{ ...inputStyle, lineHeight: 1.9, resize: 'vertical', fontFamily: T.sans }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleUpdate(l.id)} disabled={actioning} style={btnPrimary}>
                    {actioning ? '保存中…' : '保存'}
                  </button>
                  <button onClick={() => setEditingId(null)} style={btnSecondary}>取消</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  marginTop: 14, marginBottom: 12, flexWrap: 'wrap', gap: 10,
                }}>
                  <span style={{ fontFamily: T.serif, fontSize: 18, color: T.cream, letterSpacing: 1 }}>
                    {l.from} <span style={{ color: T.accent, margin: '0 6px' }}>→</span> {l.to}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 12, color: sealed ? T.rose : T.dim,
                      padding: '4px 11px', borderRadius: 11, whiteSpace: 'nowrap',
                      border: `1px solid ${sealed ? T.rose + '55' : 'rgba(255,232,212,0.16)'}`,
                    }}>
                      {sealed ? '未拆封' : '已读'}
                    </span>
                    <span style={{ fontFamily: T.latin, fontSize: 17, color: T.accent, letterSpacing: 1, whiteSpace: 'nowrap' }}>
                      {fmtDate(l.date)}
                    </span>
                  </span>
                </div>

                {isOpen ? (
                  <>
                    <div style={{ fontFamily: T.sans, fontSize: 15, lineHeight: 2, color: T.cream, whiteSpace: 'pre-wrap' }}>
                      {l.content}
                    </div>
                    {l.id === 'pinned-1' && <PlayButton text={l.content} />}
                    {canEdit && (
                      <div style={{ marginTop: 16, textAlign: 'right' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setEditingId(l.id)
                            setEditForm({ subject: l.subject, from: l.from, to: l.to, content: l.content })
                          }}
                          style={{ ...btnSecondary, fontSize: 13, padding: '6px 16px' }}
                        >
                          编辑
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{
                    fontFamily: sealed ? T.hand : T.sans,
                    fontSize: sealed ? 20 : 15,
                    lineHeight: 1.9, color: sealed ? `${T.dim}cc` : T.cream,
                    margin: 0,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {l.content.split('\n').filter(Boolean)[0] || l.subject}
                  </p>
                )}

                {!isOpen && (
                  <div style={{ marginTop: 10, fontSize: 12, color: `${T.dim}88`, textAlign: 'right' }}>
                    点击{sealed ? '拆信' : '展开'} ↓
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}

      <div style={{ textAlign: 'center', marginTop: 6, fontFamily: T.hand, fontSize: 20, color: `${T.dim}cc`, letterSpacing: 1 }}>
        想说的话，慢慢写，慢慢寄 …
      </div>
    </PageShell>
  )
}
