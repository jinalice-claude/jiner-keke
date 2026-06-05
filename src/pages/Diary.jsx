import { useState, useEffect } from 'react'
import styles from './Diary.module.css'

const BASE = import.meta.env.VITE_OMBRE_MCP_URL || ''

async function saveDiary({ title, content }) {
  const res = await fetch(`${BASE}/api/public/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `【日记】${title}\n\n${content}`,
      tags: 'diary,jiner-keke',
      importance: 5,
    }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function deleteDiary(id) {
  const res = await fetch(`${BASE}/api/public/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket_id: id }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

async function loadDiaries() {
  const res = await fetch(`${BASE}/api/public/list?tag=diary`)
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

function formatDate(str) {
  const d = new Date(str)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export default function Diary() {
  const [entries, setEntries] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function load() {
    if (!BASE) { setLoading(false); return }
    setLoading(true)
    loadDiaries()
      .then(list => {
        setEntries(list)
        if (list.length) setActive(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const current = entries.find(e => e.id === active)

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await saveDiary(form)
      setWriting(false)
      setForm({ title: '', content: '' })
      load()
    } catch {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!active) return
    setDeleting(true)
    try {
      await deleteDiary(active)
      setConfirmDelete(false)
      setActive(null)
      load()
    } catch {
      alert('删除失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>日记本</p>
        <button onClick={() => setWriting(true)} style={{ margin: '0 16px 12px', padding: '8px 0', width: 'calc(100% - 32px)', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          + 写日记
        </button>
        {loading ? <p style={{ padding: '12px 16px', fontSize: '13px', opacity: 0.5 }}>加载中…</p> : (
          <ul className={styles.list}>
            {entries.map(e => (
              <li key={e.id} className={[styles.item, active === e.id ? styles.itemActive : ''].join(' ')} onClick={() => { setActive(e.id); setWriting(false); setConfirmDelete(false) }}>
                <span className={styles.itemDate}>{formatDate(e.date)}</span>
                <span className={styles.itemTitle}>{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <main className={styles.content}>
        {writing ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="标题" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ fontSize: '18px', fontWeight: 600, border: 'none', borderBottom: '1px solid #ddd', padding: '8px 0', outline: 'none', background: 'transparent' }} />
            <textarea placeholder="写下今天……" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={14} style={{ fontSize: '15px', lineHeight: '1.8', border: '1px solid #eee', borderRadius: '8px', padding: '12px', outline: 'none', resize: 'vertical', background: 'transparent' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>{saving ? '保存中…' : '保存'}</button>
              <button onClick={() => setWriting(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>取消</button>
            </div>
          </div>
        ) : current ? (
          <>
            <p className={styles.entryDate}>{formatDate(current.date)}</p>
            <h2 className={styles.entryTitle}>{current.title}</h2>
            <div className={styles.entryBody}>
              {current.content.trim().split('\n').map((line, i) => line === '' ? <br key={i} /> : <p key={i}>{line}</p>)}
            </div>
            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
              {confirmDelete ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.6 }}>确定删除这篇日记？</span>
                  <button onClick={handleDelete} disabled={deleting} style={{ padding: '6px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    {deleting ? '删除中…' : '确定'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>取消</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', opacity: 0.5 }}>
                  删除
                </button>
              )}
            </div>
          </>
        ) : (
          <p className={styles.empty}>还没有日记，点左上角开始写吧。</p>
        )}
      </main>
    </div>
  )
}
