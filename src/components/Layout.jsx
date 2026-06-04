import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

const NAV = [
  { to: '/',         label: '首页'     },
  { to: '/diary',    label: '日记本'   },
  { to: '/memories', label: '记忆碎片' },
  { to: '/mailbox',  label: '信箱'     },
]

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>瑾 &amp; 克</span>
        <nav className={styles.nav}>
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ''].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <span>made with ♡ for 瑾儿</span>
      </footer>
    </div>
  )
}
