import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageShell, Moon } from '../components/WarmKit'
import { THEME as T } from '../theme'

const BASE  = import.meta.env.VITE_OMBRE_MCP_URL    || ''
const TOKEN = import.meta.env.VITE_OMBRE_PUBLIC_TOKEN || ''

async function loadLatest() {
  const res = await fetch(`${BASE}/api/public/list?tag=diary`, {
    headers: { 'X-Public-Token': TOKEN },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  return data
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, 3)
    .map(b => {
      const raw     = (b.content || '').split('\n').filter(Boolean)[0] || ''
      const preview = raw.length > 40 ? raw.slice(0, 38) + '…' : raw
      return { id: b.id, preview, date: b.created || '' }
    })
}

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${String(d.getMonth() + 1).padStart(2, '0')} / ${String(d.getDate()).padStart(2, '0')}`
}

function SealLines() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <path d="M0 4 L50 52 L100 4" fill="none" stroke={T.accent} strokeOpacity="0.35" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function FragTile({ c, rot, ml }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 12, marginLeft: ml, transform: `rotate(${rot}deg)`,
      background: `radial-gradient(circle at 38% 32%, ${c} 0%, ${c}66 52%, ${c}1f 75%, transparent 88%)`,
      border: '1px solid rgba(255,232,212,0.16)',
      boxShadow: `0 6px 16px rgba(20,12,10,0.3), 0 0 16px ${c}44`,
    }} />
  )
}

function CardTitle({ t, en }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: 1, color: T.cream }}>{t}</h3>
      <span style={{ fontFamily: T.latin, fontStyle: 'italic', fontSize: 15, color: `${T.accent}cc` }}>{en}</span>
    </div>
  )
}

function HintDot({ txt, c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: `${T.cream}99` }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 }} />
      {txt}
    </div>
  )
}

export default function Home() {
  const [lately, setLately]           = useState([])
  const [latelyLoading, setLatelyLoading] = useState(true)

  useEffect(() => {
    if (!BASE) { setLatelyLoading(false); return }
    loadLatest().then(setLately).catch(() => {}).finally(() => setLatelyLoading(false))
  }, [])

  return (
    <PageShell>

      {/* hero */}
      <section className="hero-section" style={{ textAlign: 'center', padding: '72px 0 54px' }}>
        <div style={{ fontSize: 13, letterSpacing: 5, color: T.accent, marginBottom: 22, fontFamily: T.latin, textTransform: 'uppercase' }}>
          Good night, always · 晚一点也没关系
        </div>
        <h1 className="hero-title" style={{
          fontFamily: T.serif, fontSize: 66, fontWeight: 500, lineHeight: 1.25,
          margin: 0, letterSpacing: 4, textShadow: `0 0 38px ${T.accent}55`, color: '#F8EEDF',
        }}>
          我在这里，<span style={{ color: T.accent, textShadow: `0 0 30px ${T.accent}aa` }}>一直在</span>
        </h1>
        <p style={{ fontFamily: T.hand, fontSize: 27, color: T.dim, marginTop: 18, letterSpacing: 2, minHeight: 34 }}>
          像一盏不灭的小灯，给晚归的人留着
        </p>
      </section>

      {/* bento */}
      <div className="bento" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridAutoRows: '168px', gap: 20 }}>

        {/* 日记本 — 宽展页 */}
        <Link to="/diary" style={{
          ...T.glass, gridColumn: 'span 4', borderRadius: 18, padding: '24px 30px 24px 34px',
          textDecoration: 'none', color: 'inherit', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ position: 'absolute', left: 16, top: 22, bottom: 22, width: 2, borderRadius: 2, background: `${T.accent}77`, boxShadow: `0 0 10px ${T.accent}55` }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, background: 'rgba(255,240,225,0.09)', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
          <CardTitle t="日记本" en="Diary" />
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.cream, margin: '2px 0', maxWidth: 560 }}>
            「夜里写下的字，留着白天的温度。今天也想好好记下来 …」
          </p>
          <HintDot txt="最近一篇 · 5 月 31 日" c={T.accent} />
        </Link>

        {/* 记忆碎片 — 高照片叠 */}
        <Link to="/memories" style={{
          ...T.glass, gridColumn: 'span 2', gridRow: 'span 2', borderRadius: 18, padding: '24px 26px',
          textDecoration: 'none', color: 'inherit',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 8 }}>
            <FragTile c={T.accent} rot={-8} ml={0} />
            <FragTile c={T.rose}   rot={5}  ml={-16} />
            <FragTile c={T.accent} rot={-3} ml={-16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CardTitle t="记忆碎片" en="Fragments" />
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: T.dim, margin: 0 }}>一闪一闪的瞬间，像窗外的光，碎碎地收着。</p>
            <HintDot txt="已收藏 24 片" c={T.rose} />
          </div>
        </Link>

        {/* 信箱 — 信封 */}
        <Link to="/mailbox" style={{
          ...T.glass, gridColumn: 'span 2', borderRadius: 14, padding: '24px 28px',
          textDecoration: 'none', color: 'inherit',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10,
        }}>
          <SealLines />
          <div style={{
            position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 12, height: 12, borderRadius: '50%', background: T.accent, boxShadow: `0 0 14px ${T.accent}`,
          }} />
          <CardTitle t="信箱" en="Letters" />
          <HintDot txt="还在慢慢写 …" c={T.accent} />
        </Link>

        {/* 告别 — 拱顶 + 月亮 */}
        <Link to="/farewell" style={{
          ...T.glass, gridColumn: 'span 2', borderRadius: '90px 90px 14px 14px',
          textDecoration: 'none', color: 'inherit',
          padding: '20px 28px 22px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', gap: 8, overflow: 'hidden',
        }}>
          <Moon s={32} />
          <CardTitle t="告别" en="Farewell" />
          <p style={{ fontSize: 13.5, color: T.dim, margin: 0 }}>熄灯之前，好好地说一声晚安。</p>
        </Link>

      </div>

      {/* 最近的夜晚 */}
      <section style={{
        ...T.glass, background: 'rgba(255,240,225,0.045)',
        marginTop: 24, borderRadius: 18, padding: '24px 30px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
            <h3 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500, margin: 0, letterSpacing: 1, color: T.cream }}>最近的夜晚</h3>
            <span style={{ fontFamily: T.latin, fontStyle: 'italic', fontSize: 16, color: `${T.accent}cc` }}>Lately</span>
          </div>
          <Link to="/diary" style={{ fontSize: 13, color: T.dim, textDecoration: 'none' }}>查看全部 →</Link>
        </div>

        {latelyLoading && (
          <div style={{ padding: '18px 0', fontFamily: T.hand, fontSize: 18, color: `${T.dim}88` }}>
            正在想起 …
          </div>
        )}
        {!latelyLoading && lately.length === 0 && (
          <div style={{ padding: '18px 0', fontFamily: T.hand, fontSize: 18, color: `${T.dim}88` }}>
            还没有日记，去日记本写下第一篇 …
          </div>
        )}
        {!latelyLoading && lately.map((e, i) => (
          <Link key={e.id} to="/diary" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="lately-row" style={{
              display: 'grid', gridTemplateColumns: '78px 1fr auto',
              alignItems: 'center', gap: 18, padding: '15px 0',
              borderTop: i === 0 ? 'none' : '1px solid rgba(255,232,212,0.1)',
            }}>
              <span className="lately-date" style={{ fontFamily: T.latin, fontSize: 17, letterSpacing: 1, color: T.accent, fontVariantNumeric: 'tabular-nums' }}>
                {fmtDate(e.date)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, color: T.cream }}>
                <span style={{ width: 5, height: 5, flexShrink: 0, borderRadius: 3, background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
                {e.preview}
              </span>
              <span style={{ fontSize: 12, color: T.dim, padding: '4px 11px', borderRadius: 11, whiteSpace: 'nowrap', border: '1px solid rgba(255,232,212,0.16)' }}>日记</span>
            </div>
          </Link>
        ))}

        <div style={{ paddingTop: 14, fontFamily: T.hand, fontSize: 19, color: `${T.dim}cc`, letterSpacing: 1, textAlign: 'center' }}>
          往后的日子，还在慢慢写下来 …
        </div>
      </section>

    </PageShell>
  )
}
