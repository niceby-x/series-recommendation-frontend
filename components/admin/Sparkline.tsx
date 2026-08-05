// Deterministic wave line (seeded by `seed`, not random per render) with a
// soft gradient fill underneath -- purely decorative, there's no real
// historical time-series behind it yet (see lib/adminContent.ts header).
// Kept as plain SVG rather than a charting lib since it's one static path.

const COLOR_HEX: Record<string, string> = {
  rose: '#F58AB5',
  orange: '#FB923C',
  emerald: '#34D399',
  violet: '#A78BFA',
  sky: '#38BDF8',
};

function seededFraction(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
}

function buildPath(seed: number, width: number, height: number, points: number): string {
  const step = width / (points - 1);
  const coords = Array.from({ length: points }, (_, i) => {
    const noise = seededFraction(seed + i * 7.13);
    const y = height * (0.85 - noise * 0.6);
    return [i * step, y] as const;
  });

  return coords.reduce((path, [x, y], i) => {
    if (i === 0) return 'M ' + x + ' ' + y;
    return path + ' L ' + x + ' ' + y;
  }, '');
}

export default function Sparkline({ seed, color = 'rose' }: { seed: number; color?: keyof typeof COLOR_HEX }) {
  const width = 220;
  const height = 56;
  const hex = COLOR_HEX[color] ?? COLOR_HEX.rose;
  const linePath = buildPath(seed, width, height, 8);
  const fillPath = linePath + ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z';
  const gradientId = 'sparkline-' + color + '-' + seed;

  return (
    <svg viewBox={'0 0 ' + width + ' ' + height} className="w-full h-14" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hex} stopOpacity="0.35" />
          <stop offset="100%" stopColor={hex} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={'url(#' + gradientId + ')'} />
      <path d={linePath} fill="none" stroke={hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
