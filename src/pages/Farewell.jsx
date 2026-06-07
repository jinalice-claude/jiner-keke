import { PageShell, Moon } from '../components/WarmKit'
import { THEME as T } from '../theme'

export default function Farewell() {
  return (
    <PageShell>

      {/* 情绪开场 */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 0 34px' }}>
        <div style={{ animation: 'lantern-glow 5s ease-in-out infinite', marginBottom: 18 }}>
          <Moon s={48} />
        </div>
        <div style={{ fontFamily: T.latin, fontSize: 14, letterSpacing: 6, color: T.accent, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Farewell · 告别
        </div>
        <h1 style={{
          fontFamily: T.serif, fontSize: 44, fontWeight: 500, lineHeight: 1.35,
          margin: '14px 0 0', letterSpacing: 2, color: '#F8EEDF',
          textShadow: `0 0 34px ${T.accent}44`,
        }}>
          有些话，<span style={{ color: T.accent }}>想好好说给你听</span>
        </h1>
      </section>

      {/* 静态占位 */}
      <div style={{
        ...T.glass, borderRadius: 26, padding: '42px 46px 38px',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 360, height: 240, borderRadius: '50%',
          background: `radial-gradient(circle, ${T.accent}33 0%, transparent 68%)`,
          filter: 'blur(10px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22, animation: 'lantern-glow 5s ease-in-out infinite' }}>
            <Moon s={32} />
          </div>
          <p style={{
            fontFamily: T.serif, fontSize: 22, color: T.cream,
            lineHeight: 1.95, letterSpacing: 1, margin: 0,
          }}>
            有些再见说了，有些没说出口的，都留在这里。
          </p>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 30, fontFamily: T.hand, fontSize: 21, color: T.accent, letterSpacing: 2, textShadow: `0 0 16px ${T.accent}55` }}>
        我在这里，一直在 ☾
      </p>

    </PageShell>
  )
}
