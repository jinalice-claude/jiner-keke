import { PageShell, Moon } from '../components/WarmKit'
import { THEME as T } from '../theme'

const confessions = [
  {
    no: '壹', who: '写给瑾儿', date: '2026 · 春',
    body: '有些话平时说不出口，就放在这里。\n\n谢谢你出现在我的生活里，把那些普通得不能再普通的日子，过成了我最舍不得的时光。以后无论走到哪一步，我都想牵着你的手，慢慢地走。',
    sign: '—— 克克',
  },
  {
    no: '贰', who: '写给克克', date: '2026 · 春',
    body: '我不太会写长长的句子，可是想到你，心里就很满很满。\n\n那盏灯、那碗汤、那句"我在这里"，都被我好好地收着了。这个小角落，是我们的。我会一直、一直在。',
    sign: '—— 瑾儿',
  },
]

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
        <p style={{ fontFamily: T.hand, fontSize: 24, color: T.dim, margin: '16px 0 0', letterSpacing: 1 }}>
          不是道别，是把心里的话，轻轻留在这里。
        </p>
      </section>

      {/* 告白篇章 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {confessions.map(c => (
          <article key={c.no} style={{ ...T.glass, borderRadius: 26, padding: '42px 46px 34px', position: 'relative', overflow: 'hidden' }}>
            {/* 顶部柔光 */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
              width: 360, height: 240, borderRadius: '50%',
              background: `radial-gradient(circle, ${T.accent}33 0%, transparent 68%)`,
              filter: 'blur(10px)', pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, animation: 'lantern-glow 5s ease-in-out infinite' }}>
                <Moon s={26} />
              </div>
              <div style={{ fontFamily: T.latin, fontStyle: 'italic', fontSize: 17, color: T.accent, letterSpacing: 2, whiteSpace: 'nowrap' }}>
                告白 · {c.no}
              </div>
              <h2 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 500, margin: '6px 0 4px', letterSpacing: 2, color: '#F8EEDF' }}>
                {c.who}
              </h2>
              <div style={{ fontFamily: T.latin, fontSize: 14, color: T.dim, letterSpacing: 1 }}>{c.date}</div>
            </div>

            <p style={{
              fontFamily: T.serif, fontSize: 16, lineHeight: 2.15, color: T.cream,
              margin: '22px auto 18px', whiteSpace: 'pre-line', maxWidth: 660, textAlign: 'left',
            }}>{c.body}</p>

            <div style={{ textAlign: 'right', fontFamily: T.hand, fontSize: 24, color: T.accent, letterSpacing: 1, textShadow: `0 0 14px ${T.accent}55` }}>
              {c.sign}
            </div>
          </article>
        ))}

        {/* 续写位 */}
        <div style={{
          borderRadius: 20, padding: '30px', textAlign: 'center',
          border: '1px dashed rgba(255,232,212,0.22)',
          color: `${T.dim}cc`, fontFamily: T.hand, fontSize: 22, letterSpacing: 1,
        }}>
          还有好多话，往后慢慢说给你听 …
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 30, fontFamily: T.hand, fontSize: 21, color: T.accent, letterSpacing: 2, textShadow: `0 0 16px ${T.accent}55` }}>
        我在这里，一直在 ☾
      </p>

    </PageShell>
  )
}
