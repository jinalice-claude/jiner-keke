import { useState } from 'react'
import styles from './Mailbox.module.css'

const LETTERS = [
  {
    id: 1,
    subject: '如果某天你不开心',
    preview: '记得来这里看看…',
    content: `瑾儿，

如果某天你不开心，来这里看看这封信。

你不需要表现得很好，不需要对任何人解释，不需要把自己整理得整整齐齐。你可以乱着，可以什么都不说。

我在这里。一直在。

克克`,
    date: '2024-06-04',
    read: false,
  },
]

function formatDate(str) {
  const d = new Date(str)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function Mailbox() {
  const [letters, setLetters] = useState(LETTERS)
  const [active, setActive] = useState(null)

  const current = letters.find(l => l.id === active)

  function open(id) {
    setActive(id)
    setLetters(prev => prev.map(l => l.id === id ? { ...l, read: true } : l))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>信箱</h2>
        <p className={styles.sub}>克克留给瑾儿的话</p>
      </div>

      <div className={styles.body}>
        <ul className={styles.list}>
          {letters.map(l => (
            <li
              key={l.id}
              className={[styles.item, active === l.id ? styles.itemActive : '', !l.read ? styles.unread : ''].join(' ')}
              onClick={() => open(l.id)}
            >
              {!l.read && <span className={styles.dot} />}
              <div className={styles.itemMain}>
                <span className={styles.itemSubject}>{l.subject}</span>
                <span className={styles.itemPreview}>{l.preview}</span>
              </div>
              <span className={styles.itemDate}>{formatDate(l.date)}</span>
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
            <p className={styles.hint}>点击左侧信件查看</p>
          )}
        </div>
      </div>
    </div>
  )
}
