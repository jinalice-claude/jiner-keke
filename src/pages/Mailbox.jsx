import { useState, useEffect } from 'react'
import { PageShell, PageHead } from '../components/WarmKit'
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

async function loadLetters() {
  const res = await fetch(`${BASE}/api/public/list?tag=letter`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  return data.map((b, i) => {
    const content = b.content || ''
    const subjectMatch = content.match(/【信】([^\n]+)/)
    const subject = subjectMatch?.[1] || `信件 ${i + 1}`
    const body = content.replace(/【信】[^\n]+/, '').trim()
    return {
      id: b.id,
      subject,
      content: body,
      date: b.created ? b.created.slice(0, 10) : '',
      from: '克克', to: '瑾儿',
    }
  })
}

async function saveLetter({ subject, content }) {
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ content: `【信】${subject}\n\n${content}`, tags: 'letter,jiner-keke', importance: 6 }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getMonth() + 1} · ${d.getDate()}`
}

// 信封折线 SVG
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

export default function Mailbox() {
  const [letters, setLetters]   = useState([PINNED_LETTER])
  const [read, setRead]         = useState(() => new Set(['pinned-1']))
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [writing, setWriting]   = useState(false)
  const [form, setForm]         = useState({ subject: '', content: '' })
  const [saving, setSaving]     = useState(false)

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
      setForm({ subject: '', content: '' })
    } catch { alert('保存失败，请重试') }
    finally { setSaving(false) }
  }

  const unreadCount = letters.filter(l => !read.has(l.id)).length

  return (
    <PageShell>
      <PageHead
        title="信箱" en="Letters"
        note="想说的话太多，就写成一封封信。"
        meta={<span>{letters.length} 封 · {unreadCount > 0 ? `${unreadCount} 封待读` : '全部已读'}</span>}
      />

      {/* 写信按钮 */}
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

      {/* 写信表单 */}
      {writing && (
        <div style={{ ...T.glass, borderRadius: 14, padding: '28px 30px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <EnvelopeFlap />
          <div style={{ marginTop: 14, marginBottom: 12 }}>
            <input
              placeholder="主题"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              style={{ ...inputStyle, fontSize: 18, fontFamily: T.serif, fontWeight: 500 }}
            />
          </div>
          <textarea
            placeholder="写下想说的话……"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={10}
            style={{ ...inputStyle, lineHeight: 1.9, resize: 'vertical', fontFamily: T.sans }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 26px', background: T.accent, color: '#2D2128', border: 'none',
              borderRadius: 20, cursor: 'pointer', fontFamily: T.serif, fontSize: 15, fontWeight: 500,
            }}>
              {saving ? '寄出中…' : '寄出'}
            </button>
            <button onClick={() => { setWriting(false); setForm({ subject: '', content: '' }) }} style={{
              padding: '10px 22px', background: 'rgba(255,240,225,0.06)', color: T.dim,
              border: '1px solid rgba(255,232,212,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14,
            }}>
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

      {/* 信件列表 */}
      {!loading && letters.map(l => {
        const isRead    = read.has(l.id)
        const isOpen    = expanded === l.id
        const sealed    = !isRead
        const sealColor = sealed ? T.rose : T.accent

        return (
          <div key={l.id} onClick={() => open(l.id)}
            style={{
              ...T.glass, display: 'block', position: 'relative', overflow: 'hidden',
              borderRadius: 14, padding: '26px 30px', marginBottom: 18, cursor: 'pointer',
              transition: 'box-shadow 0.25s',
            }}>

            <EnvelopeFlap />

            {/* 封蜡印 */}
            <div style={{
              position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
              width: 11, height: 11, borderRadius: '50%',
              background: sealColor, boxShadow: `0 0 13px ${sealColor}`,
            }} />

            {/* 发件人 → 收件人 + 状态 + 日期 */}
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

            {/* 预览 / 展开全文 */}
            {isOpen ? (
              <div style={{ fontFamily: T.sans, fontSize: 15, lineHeight: 2, color: T.cream, whiteSpace: 'pre-wrap' }}>
                {l.content}
              </div>
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

            {/* 展开提示 */}
            {!isOpen && (
              <div style={{ marginTop: 10, fontSize: 12, color: `${T.dim}88`, textAlign: 'right' }}>
                点击{sealed ? '拆信' : '展开'} ↓
              </div>
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
