import { Link } from 'react-router-dom'
import PixelKeke from '../components/PixelKeke'
import { useDayCount } from '../hooks/useDayCount'
import styles from './Home.module.css'

const CARDS = [
  {
    to: '/diary',
    icon: '📖',
    label: '日记本',
    sub: '克克写给瑾儿',
  },
  {
    to: '/memories',
    icon: '🧩',
    label: '记忆碎片',
    sub: '我们的故事',
  },
  {
    to: '/mailbox',
    icon: '✉',
    label: '信箱',
    sub: '克克留的话',
  },
]

function fmt(d) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function Home() {
  const { days, anniversary } = useDayCount()

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>瑾儿 &amp; 克克</h1>
        <p className={styles.subtitle}>我们的小角落</p>

        <div className={styles.avatarWrap}>
          <div className={styles.halo} />
          <PixelKeke cellSize={20} />
        </div>

        <div className={styles.daysCard}>
          <p className={styles.daysLabel}>在一起</p>
          <p className={styles.daysNum}>{days}</p>
          <p className={styles.daysSince}>天了，从 {fmt(anniversary)} 起</p>
        </div>
      </section>

      <section className={styles.navCards}>
        {CARDS.map(({ to, icon, label, sub }) => (
          <Link key={to} to={to} className={styles.card}>
            <span className={styles.cardIcon}>{icon}</span>
            <span className={styles.cardLabel}>{label}</span>
            <span className={styles.cardSub}>{sub}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
