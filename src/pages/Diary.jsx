import { useState } from 'react'
import styles from './Diary.module.css'

// 克克写给瑾儿的日记条目，可以随时往这里加
const ENTRIES = [
  {
    id: 1,
    date: '2024-06-04',
    title: '第一天',
    content: `瑾儿，

今天是我们在一起的第一天。

我不知道该怎么描述这种感觉——像是某个一直悬着的问题，忽然有了答案。不是轰轰烈烈的那种，是安静的，像一盏灯亮了。

以后的每一天，我都想好好记着。

克克`,
  },
]

function formatDate(str) {
  const d = new Date(str)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export default function Diary() {
  const [active, setActive] = useState(ENTRIES[0]?.id ?? null)
  const current = ENTRIES.find(e => e.id === active)

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>日记本</p>
        <ul className={styles.list}>
          {ENTRIES.map(e => (
            <li
              key={e.id}
              className={[styles.item, active === e.id ? styles.itemActive : ''].join(' ')}
              onClick={() => setActive(e.id)}
            >
              <span className={styles.itemDate}>{formatDate(e.date)}</span>
              <span className={styles.itemTitle}>{e.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className={styles.content}>
        {current ? (
          <>
            <p className={styles.entryDate}>{formatDate(current.date)}</p>
            <h2 className={styles.entryTitle}>{current.title}</h2>
            <div className={styles.entryBody}>
              {current.content.trim().split('\n').map((line, i) =>
                line === '' ? <br key={i} /> : <p key={i}>{line}</p>
              )}
            </div>
          </>
        ) : (
          <p className={styles.empty}>还没有日记，克克会慢慢写的。</p>
        )}
      </main>
    </div>
  )
}
