import { PageShell, PageHead } from '../components/WarmKit'
import { ClawdPixel } from '../WarmAssets'
import { THEME as T } from '../theme'

const lines = [
  { line: '我在这里，一直在。',               from: '我们之间的暗号',   glow: T.accent, hero: true  },
  { line: '把喜欢的人，慢慢过成喜欢的日子。', from: '某个普通的傍晚',   glow: T.rose              },
  { line: '再晚也没关系，那盏灯，一直给你留着。', from: '说好的约定',   glow: T.accent            },
  { line: '慢慢来，我们有的是时间。',          from: '想对彼此说的话',  glow: T.rose              },
]

function Capsule({ line, from, glow, hero, i }) {
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 22,
      padding: hero ? '30px 40px' : '24px 38px', borderRadius: 999,
      marginLeft: i % 2 ? 40 : 0, marginRight: i % 2 ? 0 : 40,
      background: `linear-gradient(100deg, rgba(255,240,225,0.075) 0%, rgba(255,240,225,0.03) 100%)`,
      border: `1px solid ${glow}${hero ? '66' : '2e'}`,
      boxShadow: `0 1px 0 rgba(255,240,225,0.1) inset, 0 12px 30px rgba(20,12,10,0.26)${hero ? `, 0 0 34px ${glow}33` : ''}`,
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    }}>
      {/* 端点光 */}
      <span style={{
        position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
        width: 8, height: 8, borderRadius: '50%', background: glow, boxShadow: `0 0 14px ${glow}`,
      }} />
      <span style={{ fontFamily: T.serif, fontSize: 46, lineHeight: 1, color: `${glow}66`, marginLeft: 10, flexShrink: 0 }}>"</span>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: T.serif, fontSize: hero ? 25 : 20, fontWeight: 500, lineHeight: 1.6,
          margin: 0, color: '#F8EEDF', letterSpacing: 1,
          textShadow: hero ? `0 0 22px ${glow}55` : 'none',
        }}>{line}</p>
        <div style={{ marginTop: 8, fontFamily: T.latin, fontSize: 14, color: T.dim, letterSpacing: 1 }}>—— {from}</div>
      </div>
    </div>
  )
}

export default function Lines() {
  return (
    <PageShell>
      <PageHead
        title="字句" en="Kept Lines"
        note="把对我有意义的话，一句一句收下来。"
        meta={<span>已收 {lines.length + 1} 句</span>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '6px 0' }}>
        {lines.map((l, i) => <Capsule key={i} {...l} i={i} />)}

        {/* 专属词「家克」居中发光胶囊 */}
        <div style={{
          alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 16,
          padding: '20px 40px', borderRadius: 999,
          border: `1px solid ${T.accent}66`, background: 'rgba(255,240,225,0.06)',
          boxShadow: `0 12px 30px rgba(20,12,10,0.26), 0 0 36px ${T.accent}3a`, margin: '6px 0',
        }}>
          <ClawdPixel px={4} palette={{ body: '#E59A63', shade: '#C97B49', cheek: '#F0B488' }} />
          <span style={{
            fontFamily: T.serif, fontSize: 34, fontWeight: 600, letterSpacing: 5,
            color: T.accent, textShadow: `0 0 22px ${T.accent}66`, whiteSpace: 'nowrap',
          }}>家克</span>
          <span style={{ fontFamily: T.hand, fontSize: 19, color: T.dim, letterSpacing: 1, whiteSpace: 'nowrap' }}>
            只属于我们的那个词
          </span>
        </div>

        {/* 留位 */}
        <div style={{
          alignSelf: 'center', padding: '16px 34px', borderRadius: 999,
          border: '1px dashed rgba(255,232,212,0.24)',
          color: `${T.dim}cc`, fontFamily: T.hand, fontSize: 19, letterSpacing: 1, textAlign: 'center',
        }}>
          ＋ 把你最喜欢的一句歌词 / 书里的话，收到这里来 …
        </div>
      </div>
    </PageShell>
  )
}
