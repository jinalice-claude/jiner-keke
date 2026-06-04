import { useState, useEffect } from 'react'
import styles from './Mailbox.module.css'

const BASE = import.meta.env.VITE_OMBRE_MCP_URL || ''

async function apiCall(tool, params = {}) {
  const res = await fetch(`${BASE}/api/public/${tool}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, params }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function loadLetters() {
  const data = await apiCall('breath', { query: 'letter', max_tokens: 8000 })
  const buckets = data?.result?.buckets || []
  return buckets
    .filter(b => b.tags && String(b.tags).includes('letter'))
    .map(b => ({
      id: b.bucket_id,
      subject: b.title || '无题',
      content: b.content || '',
      date: b.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      read: false,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

async function saveLetter({ subject, content }) {
  await apiCall('hold', {
    content: `【信】${subject}\n\n${content}`,
    tags: 'letter,jiner-keke',
    title: subject,
    importance: 6,
  })
}

function formatDate(str) {
  const d = new Date(str)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function Mailbox() {
  const [letters, setLetters] = useState([])
  const [active, setActive] = useState(null)
  const [read, setRead] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [form, setForm] = useState({ subject: '', content: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!BASE) { setLoading(false); return }
    loadLetters()
      .then(setLetters)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const current = letters.find(l => l.id === active)

  function open(id) {
    setActive(id)
    setRead(prev => new Set([...prev, id]))
    setWriting(false)
  }

  async function handleSave() {
    if (!form.subject.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await saveLetter(form)
      const list = await loadLetters()
      setLetters(list)
      setWriting(false)
      setForm({ subject: '', content: '' })
    } catch {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>信箱</h2>
        <p className={styles.sub}>克克留给瑾儿的话</p>
      </div>
      <div className={styles.body}>
        <ul className={styles.list}>
          <li
            onClick={() => setWriting(true)}
            className={styles.item}
            style={{ cursor: 'pointer', opacity: 0.6 }}
          >
            <div className={styles.itemMain}>
              <span className={styles.itemSubject}>+ 写一封信</span>
            </div>
          </li>
          {loading ? (
            <li style={{ padding: '12px 16px', fontSize: '13px', opacity: 0.5 }}>加载中…</li>
          ) : letters.map(l => (
            <li
              key={l.id}
              className={[styles.item, active === l.id ? styles.itemActive : '', !read.has(l.id) ? styles.unread : ''].join(' ')}
              onClick={() => open(l.id)}
            >
              {!read.has(l.id) && <span className={styles.dot} />}
              <div className={styles.itemMain}>
                <span className={styles.itemSubject}>{l.subject}</span>
                <span className={styles.itemPreview}>{l.content.slice(0, 20)}…</span>
              </div>
              <span className={styles.itemDate}>{formatDate(l.date)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.reader}>
          {writing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                placeholder="主题"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                style={{
                  fontSize: '16px', fontWeight: 600, border: 'none',
                  borderBottom: '1px solid #ddd', padding: '8px 0',
                  outline: 'none', background: 'transparent',
                }}
              />
              <textarea
                placeholder="写下想说的话……"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={12}
                style={{
                  fontSize: '14px', lineHeight: '1.8', border: '1px solid #eee',
                  borderRadius: '8px', padding: '12px', outline: 'none',
                  resize: 'vertical', background: 'transparent',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '8px 20px', background: 'var(--ink)', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  {saving ? '发送中…' : '发送'}
                </button>
                <button
                  onClick={() => setWriting(false)}
                  style={{
                    padding: '8px 20px', background: 'transparent',
                    border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : current ? (
            <>
              <p className={styles.readerSubject}>{current.subject}</p>
              <div className={styles.readerBody}>
                {current.content.trim().split('\n').map((line, i) =>
                  line === '' ? <br key={i} /> : <p key={i}>{line}</p>
                )}
              </div>
            </>
          ) : (
            <p className={styles.hint}>点击左侧信件查看</p>
          )}
        </div>
      </div>
    </div>
  )
}
