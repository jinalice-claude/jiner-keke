// 叽叽喳喳 Chirps — 极简一句话流：无卡片、无边框，像羽毛落下
// 视觉沿用整站「暖夜微光」：这页刻意更轻，没有玻璃卡片、没有描边，只有文字 + 日期。
import { useState, useEffect } from 'react'
import { PageShell, PageHead } from '../components/WarmKit'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL    || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

function fmtDate(ts) {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm} / ${dd}`
}

async function loadChirps() {
  const res = await fetch(`${BASE}/api/public/chirps`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return (await res.json()).map(c => ({ id: c.id, text: c.text, date: fmtDate(c.ts) }))
}

async function postChirp(text) {
  const res = await fetch(`${BASE}/api/public/chirps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function putChirp(id, text) {
  const res = await fetch(`${BASE}/api/public/chirps`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ id, text }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function deleteChirp(id) {
  const res = await fetch(`${BASE}/api/public/chirps`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

// 行尾的轻量小入口 / 确认按钮 —— 无边框无背景，只有小小的字
const ghostBtn = {
  border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px',
  fontFamily: T.sans, fontSize: 13, letterSpacing: 1,
}

// 小羽毛——这页专属的标记（其它页是发光圆点 / 胶囊 / 月亮）
export function Feather({ s = 15, color, rot = 0, op = 1 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: `rotate(${rot}deg)`, opacity: op, flexShrink: 0,
        filter: `drop-shadow(0 0 6px ${color}66)` }}>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  )
}

// 小麻雀——和羽毛同款线描笔触，停在输入框边沿（不大，安安静静）
function Sparrow({ s = 46, color }) {
  return (
    <svg width={s} height={s * 31 / 36} viewBox="0 0 36 31" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ overflow: 'visible', filter: `drop-shadow(0 0 7px ${color}55)`,
        animation: 'sparrow-bob 4.2s ease-in-out infinite' }}>
      {/* 身体 + 头（朝左） */}
      <path d="M8 14.5 C6.5 11 9 7.5 12 8.5 C14 6.5 19 6.5 23 8.5 C27 9.8 30 10.5 33 11 L31.5 15.5 C26 19 20 21 15 20 C11.5 19.5 8.5 18 8 14.5 Z" />
      {/* 嘴 */}
      <path d="M8 13.2 L2.5 12.4 L7.8 15.4" />
      {/* 眼睛 */}
      <circle cx="10.6" cy="11.2" r="0.95" fill={color} stroke="none" />
      {/* 翅膀 */}
      <path d="M13 13 C17 14.6 22 15 26 13.4" />
      <path d="M15 15.4 C18.5 16.4 22 16.4 25 15.2" />
      {/* 尾羽 */}
      <path d="M33 11 L35.6 11.4 M31.5 15.5 L34.6 17" />
      {/* 抓在边沿的小腿 */}
      <path d="M15 19.8 L14.4 28.5 M19 19.6 L19.6 28.5" />
      <path d="M12.6 28.5 L16.2 28.5 M17.6 28.5 L21.2 28.5" />
    </svg>
  )
}

export default function Chirps() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft]     = useState('')
  const [justId, setJustId]   = useState(null) // 最新落下的那条，做羽毛动画
  const [sending, setSending] = useState(false)
  const [err, setErr]         = useState('')
  const [editingId, setEditingId]       = useState(null)
  const [editDraft, setEditDraft]       = useState('')
  const [confirmDelId, setConfirmDelId] = useState(null)
  const [acting, setActing]             = useState(false)

  useEffect(() => {
    if (!BASE) { setLoading(false); return }
    loadChirps().then(setList).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const submit = async (e) => {
    e && e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setErr('')
    try {
      const rec = await postChirp(text)
      const entry = { id: rec.id, text: rec.text, date: fmtDate(rec.ts) }
      setList(prev => [entry, ...prev]) // 倒序：新的在最前
      setJustId(entry.id)
      setDraft('')
    } catch (e2) {
      setErr(e2.message === '400' ? '这一句太长啦，140 字以内就好 …' : '没发出去，等一会儿再啾一次 …')
    } finally {
      setSending(false)
    }
  }

  const saveEdit = async (id) => {
    const text = editDraft.trim()
    if (!text || acting) return
    setActing(true)
    setErr('')
    try {
      const rec = await putChirp(id, text)
      setList(prev => prev.map(x => x.id === id ? { ...x, text: rec.text } : x))
      setEditingId(null)
    } catch {
      setErr('没改成，等一会儿再试试 …')
    } finally {
      setActing(false)
    }
  }

  const removeChirp = async (id) => {
    if (acting) return
    setActing(true)
    setErr('')
    try {
      await deleteChirp(id)
      setList(prev => prev.filter(x => x.id !== id))
      setConfirmDelId(null)
    } catch {
      setErr('没飞走，等一会儿再试试 …')
    } finally {
      setActing(false)
    }
  }

  const empty = list.length === 0

  return (
    <PageShell>
      <PageHead
        title="叽叽喳喳"
        en="Chirps"
        note="想到什么，就轻轻啾一声。一句就好，不必郑重。"
        meta={<span>{list.length} 声 · 落在这里</span>}
      />

      {/* 啾一句 —— 单行输入 + 提交 */}
      <form onSubmit={submit} className="chirp-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
        padding: '8px 8px 8px 22px', borderRadius: 999, marginBottom: 14,
        background: 'rgba(255,240,225,0.05)',
        boxShadow: `0 0 0 1px rgba(255,232,212,0.10) inset, 0 0 26px ${T.accent}1f` }}>
        {/* 停在输入框缘上的小麻雀 */}
        <span aria-hidden="true" style={{ position: 'absolute', right: 116, bottom: '100%', marginBottom: -11, pointerEvents: 'none', zIndex: 3 }}>
          <Sparrow s={46} color={T.accent} />
        </span>
        <Feather s={17} color={`${T.accent}cc`} rot={-18} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={140}
          placeholder="此刻最轻的那个念头 …"
          aria-label="写一句"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: T.sans, fontSize: 16.5, fontWeight: 300, letterSpacing: 0.5,
            color: '#F8EEDF' }} />
        <button type="submit" disabled={!draft.trim() || sending} className="chirp-btn"
          style={{ flexShrink: 0, border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
            fontFamily: T.serif, fontSize: 16, fontWeight: 500, letterSpacing: 2,
            padding: '11px 26px', borderRadius: 999,
            color: draft.trim() ? '#2D2128' : `${T.dim}`,
            background: draft.trim() ? T.accent : 'rgba(255,238,222,0.06)',
            boxShadow: draft.trim() ? `0 0 22px ${T.accent}88` : 'none',
            transition: 'all .25s ease' }}>
          啾！
        </button>
      </form>
      <div style={{ paddingLeft: 22, marginBottom: err ? 8 : 30, fontSize: 12.5, color: `${T.dim}aa`,
        fontFamily: T.latin, letterSpacing: 1, fontStyle: 'italic' }}>
        press · 啾 to drop a feather
      </div>
      {err && (
        <div style={{ paddingLeft: 22, marginBottom: 30, fontSize: 13.5, color: T.rose, letterSpacing: 0.5 }}>
          {err}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: T.hand, fontSize: 22, color: T.dim }}>
          正在听 …
        </div>
      ) : empty ? (
        <div style={{ padding: '70px 0 80px', textAlign: 'center' }}>
          <Feather s={40} color={`${T.accent}99`} rot={-14} />
          <p style={{ fontFamily: T.hand, fontSize: 26, color: T.dim, letterSpacing: 1,
            margin: '24px 0 6px', lineHeight: 1.5 }}>
            今天还没有啾啾。
          </p>
          <p style={{ fontSize: 14.5, color: `${T.dim}aa`, margin: 0, letterSpacing: 0.5 }}>
            啾第一声，让一片羽毛落下来吧 …
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0 10px',
          display: 'flex', flexDirection: 'column' }}>
          {list.map((c, i) => {
            // 待确认删除：这一句要飞走了吗？
            if (confirmDelId === c.id) {
              return (
                <li key={c.id} className="chirp-row"
                  style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '17px 4px 17px 18px' }}>
                  <Feather s={13} color={`${T.rose}aa`} rot={(i % 2 ? 8 : -10)} op={0.85} />
                  <p style={{ flex: 1, margin: 0, fontFamily: T.hand, fontSize: 20, fontWeight: 300,
                    lineHeight: 1.7, letterSpacing: 1, color: T.dim }}>
                    这一句要飞走了吗？
                  </p>
                  <span style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <button onClick={() => removeChirp(c.id)} disabled={acting}
                      style={{ ...ghostBtn, color: T.rose }}>
                      {acting ? '飞走中 …' : '飞走吧'}
                    </button>
                    <button onClick={() => setConfirmDelId(null)}
                      style={{ ...ghostBtn, color: `${T.dim}99` }}>
                      再留会儿
                    </button>
                  </span>
                </li>
              )
            }
            // 编辑中：原地改字，不挪窝
            if (editingId === c.id) {
              return (
                <li key={c.id} className="chirp-row"
                  style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '17px 4px 17px 18px' }}>
                  <Feather s={13} color={`${T.accent}cc`} rot={(i % 2 ? 8 : -10)} op={0.85} />
                  <input
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    maxLength={140}
                    autoFocus
                    aria-label="改这一句"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(c.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                      borderBottom: `1px solid ${T.accent}55`, padding: '0 0 2px',
                      fontFamily: T.sans, fontSize: 17.5, fontWeight: 300,
                      lineHeight: 1.7, letterSpacing: 0.4, color: '#F4EADB' }} />
                  <span style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <button onClick={() => saveEdit(c.id)} disabled={acting || !editDraft.trim()}
                      style={{ ...ghostBtn, color: T.accent }}>
                      {acting ? '落笔中 …' : '就这样'}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      style={{ ...ghostBtn, color: `${T.dim}99` }}>
                      算了
                    </button>
                  </span>
                </li>
              )
            }
            // 正常的一句
            return (
              <li key={c.id}
                className={c.id === justId ? 'chirp-row chirp-drop' : 'chirp-row'}
                style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '17px 4px 17px 18px' }}>
                <Feather s={13} color={`${T.accent}99`} rot={(i % 2 ? 8 : -10)} op={0.85} />
                <p style={{ flex: 1, margin: 0, fontFamily: T.sans, fontSize: 17.5, fontWeight: 300,
                  lineHeight: 1.7, letterSpacing: 0.4, color: '#F4EADB', textWrap: 'pretty' }}>
                  {c.text}
                </p>
                <span style={{ flexShrink: 0, fontFamily: T.latin, fontSize: 16, letterSpacing: 1,
                  color: `${T.accent}cc`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {c.date}
                </span>
                <span style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setEditingId(c.id); setEditDraft(c.text); setConfirmDelId(null) }}
                    style={{ ...ghostBtn, color: `${T.dim}88` }}>
                    改
                  </button>
                  <button onClick={() => { setConfirmDelId(c.id); setEditingId(null) }}
                    style={{ ...ghostBtn, color: `${T.dim}88` }}>
                    删
                  </button>
                </span>
              </li>
            )
          })}
          <li style={{ alignSelf: 'center', padding: '26px 0 8px', fontFamily: T.hand,
            fontSize: 19, color: `${T.dim}aa`, letterSpacing: 1 }}>
            · 风停在这里了 ·
          </li>
        </ul>
      )}
    </PageShell>
  )
}
