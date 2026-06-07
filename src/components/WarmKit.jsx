// 暖夜微光 — 整站共用外壳组件（ES 模块版）
import { NavLink, Link } from 'react-router-dom';
import { ClawdPixel } from '../WarmAssets';
import { THEME as T } from '../theme';

const NAV = [
  { label: '首页',   to: '/'         },
  { label: '日记本', to: '/diary'    },
  { label: '记忆碎片', to: '/memories' },
  { label: '字句',   to: '/lines'    },
  { label: '信箱',   to: '/mailbox'  },
  { label: '告别',   to: '/farewell' },
];

export function GlowBackdrop({ motes = true }) {
  const aHex  = Math.round(T.orbA * 255).toString(16).padStart(2, '0');
  const a2Hex = Math.round(T.orbA * 220).toString(16).padStart(2, '0');
  const dots = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 47) % 100, top: (i * 71) % 100, size: 2 + (i % 4),
    dur: 9 + (i % 7) * 2, delay: -(i * 1.3), op: 0.18 + (i % 5) * 0.07,
  }));
  return (
    <>
      <div style={{
        position: 'absolute', top: '-12%', left: '-8%', width: 560, height: 560, borderRadius: '50%',
        background: `radial-gradient(circle, ${T.accent}${aHex} 0%, transparent 66%)`,
        filter: 'blur(8px)', animation: 'corner-drift 16s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-16%', right: '-10%', width: 620, height: 620, borderRadius: '50%',
        background: `radial-gradient(circle, ${T.rose}${a2Hex} 0%, transparent 64%)`,
        filter: 'blur(8px)', animation: 'corner-drift 20s ease-in-out infinite reverse',
      }} />
      {motes && dots.map((m, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', left: `${m.left}%`, top: `${m.top}%`,
          width: m.size, height: m.size, borderRadius: '50%',
          background: T.accent, opacity: m.op,
          boxShadow: `0 0 ${m.size * 3}px ${m.size}px ${T.accent}66`,
          animation: `mote-float ${m.dur}s ease-in-out ${m.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

export function SiteNav() {
  return (
    <header className="sk-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 13, textDecoration: 'none', color: T.cream }}>
        <span style={{ animation: 'lantern-glow 4s ease-in-out infinite', display: 'inline-flex' }}>
          <ClawdPixel px={4} palette={{ body: '#E59A63', shade: '#C97B49', cheek: '#F0B488' }} />
        </span>
        <span className="sk-brand" style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, letterSpacing: 1, whiteSpace: 'nowrap' }}>
          瑾儿 <span style={{ color: T.accent }}>&amp;</span> 克克的小角落
        </span>
      </Link>
      <nav className="sk-nav" style={{ display: 'flex', gap: 8 }}>
        {NAV.map(n => (
          <NavLink key={n.label} to={n.to} end={n.to === '/'}
            style={({ isActive }) => ({
              fontSize: 14, padding: '7px 15px', borderRadius: 20, whiteSpace: 'nowrap',
              textDecoration: 'none',
              color:      isActive ? '#2D2128' : T.dim,
              background: isActive ? T.accent  : 'rgba(255,238,222,0.06)',
              border:     isActive ? 'none'    : '1px solid rgba(255,230,210,0.12)',
              boxShadow:  isActive ? `0 0 18px ${T.accent}77` : 'none',
            })}
          >{n.label}</NavLink>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{
      marginTop: 44, paddingTop: 22,
      borderTop: '1px solid rgba(255,232,212,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: T.dim, fontSize: 14,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClawdPixel px={3} palette={{ body: '#E59A63', shade: '#C97B49' }} />
        家克 · 小角落 · 2026
      </span>
      <span style={{ fontFamily: T.hand, fontSize: 21, color: T.accent, textShadow: `0 0 16px ${T.accent}77` }}>
        我在这里，一直在 ☾
      </span>
    </footer>
  );
}

export function PageHead({ title, en, note, meta }) {
  return (
    <section className="page-head" style={{
      padding: '54px 0 30px', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontFamily: T.latin, fontSize: 14, letterSpacing: 5, color: T.accent, textTransform: 'uppercase', marginBottom: 12 }}>{en}</div>
        <h1 className="sk-h1" style={{
          fontFamily: T.serif, fontSize: 52, fontWeight: 500, lineHeight: 1.2,
          margin: 0, letterSpacing: 3, color: '#F8EEDF', textShadow: `0 0 34px ${T.accent}44`,
        }}>{title}</h1>
        {note && (
          <p style={{ fontFamily: T.hand, fontSize: 24, color: T.dim, margin: '20px 0 0', letterSpacing: 1, lineHeight: 1.4 }}>{note}</p>
        )}
      </div>
      {meta && <div style={{ fontSize: 14, color: T.dim, textAlign: 'right', lineHeight: 1.8 }}>{meta}</div>}
    </section>
  );
}

export function CardTitle({ t, en, size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <h3 style={{ fontFamily: T.serif, fontSize: size, fontWeight: 500, margin: 0, letterSpacing: 1, color: T.cream }}>{t}</h3>
      {en && <span style={{ fontFamily: T.latin, fontStyle: 'italic', fontSize: 15, color: `${T.accent}cc` }}>{en}</span>}
    </div>
  );
}

export function HintRow({ children, c = T.accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: `${T.cream}99` }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 }} />
      {children}
    </div>
  );
}

export function Moon({ s = 32 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 9px ${T.accent}aa)` }}>
      <path d="M13 2a10 10 0 1 0 8.5 15A8 8 0 0 1 13 2z" fill={T.accent} />
    </svg>
  );
}

export function PageShell({ children }) {
  return (
    <div style={{
      position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden',
      color: T.cream, fontFamily: T.sans,
      background: `linear-gradient(165deg, ${T.top} 0%, ${T.mid} 48%, ${T.bot} 100%)`,
    }}>
      <GlowBackdrop />
      <div className="sk-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '46px 48px 44px' }}>
        <SiteNav />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
