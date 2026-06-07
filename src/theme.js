// 暖夜微光 — 硬编码主题 tokens（accent #E7B27E, night 52）
function mix(a, b, t) {
  const p = h => { const x = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)); };
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const m = (u, v) => Math.round(u + (v - u) * t).toString(16).padStart(2, '0');
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}

const accent = '#E7B27E';
const d = 0.52; // night = 52

export const THEME = {
  accent,
  rose: '#D89C8E',
  cream: '#F1E5D4',
  dim: '#C9B5A0',
  top: mix('#4C362F', '#241A20', d),
  mid: mix('#5A3E33', '#3A2A29', d),
  bot: mix('#6E4A38', '#4E3528', d),
  orbA: 0.18 + 0.32 * d,
  glass: {
    background: 'rgba(255,240,225,0.055)',
    border: '1px solid rgba(255,232,212,0.14)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    boxShadow: '0 1px 0 rgba(255,240,225,0.1) inset, 0 12px 34px rgba(20,12,10,0.28)',
  },
  serif: '"Noto Serif SC", serif',
  sans: '"Noto Sans SC", sans-serif',
  hand: '"Long Cang", cursive',
  latin: '"Cormorant Garamond", serif',
};
