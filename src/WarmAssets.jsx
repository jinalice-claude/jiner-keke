// 暖夜微光 — 装饰性 SVG 元素和像素章鱼 ClawdPixel

export function ClawdPixel({ px = 6, palette = {}, style = {}, className = '' }) {
  const C = {
    o: palette.body   || '#CC7C4E',
    d: palette.shade  || '#B5683E',
    w: palette.eye    || '#FBF3E8',
    p: palette.pupil  || '#473227',
    c: palette.cheek  || '#E0A07A',
  };
  const grid = [
    '...ooooo...',
    '..ooooooo..',
    '.ooooooooo.',
    '.ooooooooo.',
    '.owwooowwo.',
    '.owpooowpo.',
    '.cooooooco.',
    '.ooooooooo.',
    '.dd.dd.dd.d',
    '.d..d..d..d',
  ];
  const rects = [];
  grid.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      if (ch === '.') return;
      rects.push(<rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={C[ch] || C.o} />);
    });
  });
  return (
    <svg className={className} width={11 * px} height={10 * px}
      viewBox={`0 0 ${11 * px} ${10 * px}`} shapeRendering="crispEdges" style={style}>
      {rects}
    </svg>
  );
}

export function LeafSprig({ w = 60, color = 'currentColor', stroke = 1.4, style = {}, flip = false }) {
  return (
    <svg viewBox="0 0 60 90" width={w} height={w * 1.5} fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
      <path d="M30 88 C30 70 30 40 30 6" />
      <path d="M30 70 C20 66 14 58 13 48 C24 49 30 58 30 68" />
      <path d="M30 58 C40 54 47 46 48 36 C37 37 30 46 30 56" />
      <path d="M30 44 C21 41 15 34 14 25 C24 26 30 34 30 43" />
      <path d="M30 32 C39 29 45 22 46 14 C36 15 30 23 30 31" />
      <path d="M30 20 C24 17 20 12 19 6 C26 7 30 12 30 19" />
    </svg>
  );
}

export function FlowerDoodle({ w = 40, color = 'currentColor', stroke = 1.4, fill = 'none', style = {} }) {
  return (
    <svg viewBox="0 0 60 60" width={w} height={w} fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="30" cy="16" rx="7.5" ry="12" fill={fill} transform={`rotate(${a} 30 30)`} />
      ))}
      <circle cx="30" cy="30" r="5" fill={color} stroke="none" opacity="0.85" />
    </svg>
  );
}

export function Underline({ w = 160, color = 'currentColor', stroke = 2, style = {} }) {
  return (
    <svg viewBox="0 0 200 16" width={w} height={w * 0.08} fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" style={style}>
      <path d="M4 9 C40 3 70 13 100 8 C130 3 160 12 196 6" />
    </svg>
  );
}

export function PaperGrain({ opacity = 0.5, style = {} }) {
  const svg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, backgroundImage: svg, backgroundSize: '160px 160px',
      mixBlendMode: 'multiply', opacity, pointerEvents: 'none', zIndex: 0, ...style,
    }} />
  );
}
