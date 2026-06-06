import { useState, useEffect } from 'react'
import styles from './Memories.module.css'
import phStyles from './Placeholder.module.css'

const BASE = import.meta.env.VITE_OMBRE_MCP_URL || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

async function loadMemories() {
  const res = await fetch(`${BASE}/api/public/list?tag=memory`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.map(b => ({
    id: b.id,
    content: b.content || '',
    tags: (b.tags || []).join(', '),
    created_at: b.created || new Date().toISOString(),
  }))
}

async function saveMemory({ content, tags }) {
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Public-Token': TOKEN },
    body: JSON.stringify({
      content,
      tags: `memory,jiner-keke${tags ? ',' + tags : ''}`,
      importance: 7,
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export default function Memories() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [writing, setWriting] = useState(false)
  const [form, setForm] = useState({ content: '', tags: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!BASE) { setLoading(false); return }
    loadMemories()
      .then(setMemories)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!form.content.trim()) return
    setSaving(true)
    try {
      await saveMemory(form)
      const list = await loadMemories()
      setMemories(list)
      setWriting(false)
      setForm({ content: '', tags: '' })
    } catch {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (!BASE) {
    return (
      <div className={phStyles.page}>
        <div className={phStyles.inner}>
          <p className={phStyles.icon}>🧩</p>
          <h2 className={phStyles.title}>记忆碎片</h2>
          <p className={phStyles.desc}>请配置 <code>VITE_OMBRE_MCP_URL</code></p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>记忆碎片</h2>
        <p className={styles.sub}>我们的故事</p>
      </div>

      {writing ? (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '560px' }}>
          <textarea
            placeholder="写下这一刻……"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={6}
            style={{ fontSize: '15px', lineHeight: '1.8', border: '1px solid #eee', borderRadius: '8px', padding: '12px', outline: 'none', resize: 'vertical', background: 'transparent' }}
          />
          <input
            placeholder="标签（用逗号分隔，可选）"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            style={{ fontSize: '13px', border: 'none', borderBottom: '1px solid #ddd', padding: '6px 0', outline: 'none', background: 'transparent' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              {saving ? '保存中…' : '保存'}
            </button>
            <button onClick={() => setWriting(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => setWriting(true)} style={{ margin: '0 24px 20px', padding: '8px 20px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            + 记录碎片
          </button>
          {loading ? (
            <p style={{ padding: '24px', opacity: 0.5 }}>正在唤起记忆…</p>
          ) : error ? (
            <p style={{ padding: '24px', color: 'var(--rose)' }}>加载失败：{error}</p>
          ) : memories.length === 0 ? (
            <p style={{ padding: '24px', opacity: 0.5 }}>还没有记忆碎片，点上方按钮记录第一个。</p>
          ) : (
            <div className={styles.grid}>
              {memories.map(mem => (
                <div key={mem.id} className={styles.card}>
                  <p className={styles.content}>{mem.content}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
