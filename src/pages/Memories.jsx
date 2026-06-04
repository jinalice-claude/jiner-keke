import { useState, useEffect } from 'react'
import styles from './Memories.module.css'
import phStyles from './Placeholder.module.css'

// ── Ombre Brain API ──────────────────────────────────────────────────────────
// Replace OMBRE_MCP_URL with your deployed Ombre Brain MCP endpoint.
// The `breath` tool retrieves recent memories.
const OMBRE_MCP_URL = import.meta.env.VITE_OMBRE_MCP_URL || ''

async function fetchMemories() {
  if (!OMBRE_MCP_URL) return []

  const res = await fetch(`${OMBRE_MCP_URL}/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: 'breath',
      params: { max_tokens: 4000 },
    }),
  })
  if (!res.ok) throw new Error('Failed to fetch memories')
  const data = await res.json()
  // data.memories is expected to be an array of { id, content, tags, importance, created_at }
  return Array.isArray(data.memories) ? data.memories : []
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Memories() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!OMBRE_MCP_URL) {
      setLoading(false)
      return
    }
    fetchMemories()
      .then(setMemories)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (!OMBRE_MCP_URL) {
    return (
      <div className={phStyles.page}>
        <div className={phStyles.inner}>
          <p className={phStyles.icon}>🧩</p>
          <h2 className={phStyles.title}>记忆碎片</h2>
          <p className={phStyles.desc}>
            在 <code>.env</code> 中配置 <code>VITE_OMBRE_MCP_URL</code> 后，
            <br />这里会显示 Ombre Brain 里的记忆列表。
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={phStyles.page}>
        <p className={phStyles.desc} style={{ paddingTop: '80px' }}>正在唤起记忆…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={phStyles.page}>
        <p className={phStyles.desc} style={{ paddingTop: '80px', color: 'var(--rose)' }}>
          加载失败：{error}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>记忆碎片</h2>
        <p className={styles.sub}>从 Ombre Brain 浮现</p>
      </div>
      <div className={styles.grid}>
        {memories.map(mem => (
          <div key={mem.id} className={styles.card}>
            <p className={styles.content}>{mem.content}</p>
            {mem.tags && (
              <div className={styles.tags}>
                {String(mem.tags).split(',').map(t => (
                  <span key={t} className={styles.tag}>{t.trim()}</span>
                ))}
              </div>
            )}
            {mem.created_at && (
              <p className={styles.date}>
                {new Date(mem.created_at).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
