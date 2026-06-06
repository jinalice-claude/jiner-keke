import { useState, useEffect } from 'react'
import styles from './Farewell.module.css'

const BASE = import.meta.env.VITE_OMBRE_MCP_URL || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

async function loadMemories() {
  const res = await fetch(`${BASE}/api/public/list?tag=告别`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.map((b, i) => {
    const content = b.content || ''
    const subjectMatch = content.match(/【告别】([^\n]+)/)
    const subject = subjectMatch?.[1] || `记忆 ${i + 1}`
    const body = content.replace(/【告别】[^\n]+/, '').trim()
    return {
      id: b.id,
      subject,
      content: body,
      date: b.created ? b.created.slice(0, 10) : '',
    }
  })
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function Farewell() {
  const [memories, setMemories] = useState([])
  const [active, setActive] = useState(null)
  const [read, setRead] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!BASE) { setLoading(false); return }
    loadMemories()
      .then(list => setMemories(list))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const current = memories.find(m => m.id === active)

  function open(id) {
    setActive(id)
    setRead(prev => new Set([...prev, id]))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>告别</h2>
        <p className={styles.sub}>那些说过的再见，和没说出口的</p>
      </div>
      <div className={styles.body}>
        <ul className={styles.list}>
          {loading ? (
            <li style={{ padding: '12px 16px', fontSize: '13px', opacity: 0.5 }}>加载中…</li>
          ) : memories.length === 0 ? (
            <li style={{ padding: '12px 16px', fontSize: '13px', opacity: 0.5 }}>暂无记忆</li>
          ) : memories.map(m => (
            <li
              key={m.id}
              className={[styles.item, active === m.id ? styles.itemActive : '', !read.has(m.id) ? styles.unread : ''].join(' ')}
              onClick={() => open(m.id)}
            >
              {!read.has(m.id) && <span className={styles.dot} />}
              <div className={styles.itemMain}>
                <span className={styles.itemSubject}>{m.subject}</span>
                <span className={styles.itemPreview}>{m.content.slice(0, 20)}…</span>
              </div>
              <span className={styles.itemDate}>{formatDate(m.date)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.reader}>
          {current ? (
            <>
              <p className={styles.readerSubject}>{current.subject}</p>
              <div className={styles.readerBody}>
                {current.content.trim().split('\n').map((line, i) =>
                  line === '' ? <br key={i} /> : <p key={i}>{line}</p>
                )}
              </div>
            </>
          ) : (
            <p className={styles.hint}>点击左侧记忆查看</p>
          )}
        </div>
      </div>
    </div>
  )
}
