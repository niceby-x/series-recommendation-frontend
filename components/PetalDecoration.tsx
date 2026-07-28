// Purely decorative ambient layer behind the homepage — the "Bloom" half
// (falling petals) and the "Lumi" half (soft glowing light orbs) of the
// BLumi name, in one layer.
//
// `fixed inset-0` (not `absolute`) is deliberate: it lets the petals fall the
// full height of the viewport — all the way to the bottom of the screen —
// instead of being boxed into the hero section's own height. It escapes the
// hero wrapper's `overflow-hidden` because a fixed-position element's
// containing block is the viewport, not its nearest ancestor, as long as no
// ancestor sets a transform/filter (none here do).
//
// Respects prefers-reduced-motion by simply not rendering, since this
// component carries zero content meaning (aria-hidden either way).

const PETALS = [
  { left: '1%', size: 40, fallDuration: 16, swayDuration: 4.6, bobDuration: 3.1, delay: 0, sway: 18, opacity: 0.5, hue: 'blush' },
  { left: '6%', size: 14, fallDuration: 10, swayDuration: 3, bobDuration: 2.2, delay: 3.4, sway: 10, opacity: 0.3, hue: 'lilac' },
  { left: '12%', size: 24, fallDuration: 18, swayDuration: 5.4, bobDuration: 3.6, delay: 6.8, sway: 20, opacity: 0.4, hue: 'blush' },
  { left: '18%', size: 11, fallDuration: 9, swayDuration: 2.6, bobDuration: 2, delay: 1.2, sway: 9, opacity: 0.28, hue: 'lilac' },
  { left: '24%', size: 46, fallDuration: 21, swayDuration: 6.4, bobDuration: 4.2, delay: 9.6, sway: 24, opacity: 0.46, hue: 'lilac' },
  { left: '30%', size: 16, fallDuration: 11, swayDuration: 3.4, bobDuration: 2.4, delay: 2.4, sway: 12, opacity: 0.32, hue: 'blush' },
  { left: '36%', size: 28, fallDuration: 17, swayDuration: 5, bobDuration: 3.4, delay: 5.2, sway: 20, opacity: 0.42, hue: 'blush' },
  { left: '42%', size: 12, fallDuration: 8.5, swayDuration: 2.8, bobDuration: 2.1, delay: 8, sway: 10, opacity: 0.28, hue: 'lilac' },
  { left: '48%', size: 34, fallDuration: 19, swayDuration: 5.8, bobDuration: 3.8, delay: 0.8, sway: 22, opacity: 0.44, hue: 'blush' },
  { left: '54%', size: 15, fallDuration: 10.5, swayDuration: 3.2, bobDuration: 2.3, delay: 4.4, sway: 11, opacity: 0.3, hue: 'lilac' },
  { left: '60%', size: 42, fallDuration: 20, swayDuration: 6, bobDuration: 4, delay: 7.2, sway: 22, opacity: 0.48, hue: 'blush' },
  { left: '65%', size: 13, fallDuration: 9.5, swayDuration: 3, bobDuration: 2.2, delay: 2, sway: 10, opacity: 0.3, hue: 'lilac' },
  { left: '70%', size: 22, fallDuration: 15, swayDuration: 4.6, bobDuration: 3, delay: 10.4, sway: 18, opacity: 0.38, hue: 'blush' },
  { left: '75%', size: 18, fallDuration: 12.5, swayDuration: 3.8, bobDuration: 2.6, delay: 3.8, sway: 14, opacity: 0.34, hue: 'lilac' },
  { left: '80%', size: 36, fallDuration: 18.5, swayDuration: 5.6, bobDuration: 3.7, delay: 6.2, sway: 22, opacity: 0.44, hue: 'blush' },
  { left: '85%', size: 10, fallDuration: 8, swayDuration: 2.5, bobDuration: 1.9, delay: 11.2, sway: 9, opacity: 0.26, hue: 'lilac' },
  { left: '90%', size: 26, fallDuration: 16.5, swayDuration: 5, bobDuration: 3.3, delay: 1.6, sway: 18, opacity: 0.4, hue: 'blush' },
  { left: '95%', size: 20, fallDuration: 13.5, swayDuration: 4.2, bobDuration: 2.8, delay: 9, sway: 16, opacity: 0.36, hue: 'lilac' },
  { left: '9%', size: 32, fallDuration: 17.5, swayDuration: 5.2, bobDuration: 3.5, delay: 12.6, sway: 20, opacity: 0.42, hue: 'lilac' },
  { left: '39%', size: 14, fallDuration: 10.2, swayDuration: 3.1, bobDuration: 2.3, delay: 13.8, sway: 11, opacity: 0.3, hue: 'blush' },
  { left: '57%', size: 20, fallDuration: 13, swayDuration: 4, bobDuration: 2.7, delay: 5.6, sway: 15, opacity: 0.36, hue: 'lilac' },
  { left: '78%', size: 44, fallDuration: 22, swayDuration: 6.6, bobDuration: 4.3, delay: 14.4, sway: 24, opacity: 0.46, hue: 'blush' },
] as const;

const GLOWS = [
  { left: '8%', top: '10%', size: 220, duration: 9, delay: 0, hue: 'blush' },
  { left: '58%', top: '4%', size: 180, duration: 11, delay: 2.5, hue: 'lilac' },
  { left: '82%', top: '38%', size: 260, duration: 8, delay: 1.2, hue: 'blush' },
  { left: '30%', top: '55%', size: 160, duration: 10, delay: 4, hue: 'lilac' },
  { left: '4%', top: '68%', size: 200, duration: 12, delay: 3, hue: 'blush' },
] as const;

function PetalShape({ size, hue }: { size: number; hue: 'blush' | 'lilac' }) {
  const fill = hue === 'lilac' ? 'var(--color-brand-lilac)' : 'var(--color-brand-blush)';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 16 6 16 11C16 14.3 14.2 16 12 16C9.8 16 8 14.3 8 11C8 6 12 2 12 2Z"
        fill={fill}
      />
    </svg>
  );
}

export default function PetalDecoration() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden motion-reduce:hidden"
      aria-hidden="true"
    >
      {/* Lumi — soft glowing light orbs */}
      {GLOWS.map((glow, i) => (
        <div
          key={`glow-${i}`}
          className="absolute rounded-full blur-3xl will-change-transform"
          style={{
            left: glow.left,
            top: glow.top,
            width: glow.size,
            height: glow.size,
            background: `radial-gradient(circle, var(--color-brand-${glow.hue}) 0%, transparent 70%)`,
            animation: `glow-pulse ${glow.duration}s ease-in-out ${glow.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* Bloom — falling petals */}
      {PETALS.map((petal, i) => (
        <div
          key={`petal-${i}`}
          className="absolute top-0 will-change-transform"
          style={{
            left: petal.left,
            opacity: 0,
            animation: `petal-fall ${petal.fallDuration}s linear ${petal.delay}s infinite`,
            ['--petal-opacity' as string]: petal.opacity,
          }}
        >
          <div
            className="will-change-transform"
            style={{
              animation: `petal-sway ${petal.swayDuration}s ease-in-out ${petal.delay * 0.5}s infinite alternate`,
              ['--petal-sway' as string]: `${petal.sway}px`,
            }}
          >
            <div
              className="will-change-transform"
              style={{
                animation: `petal-bob ${petal.bobDuration}s ease-in-out ${petal.delay * 0.3}s infinite alternate`,
              }}
            >
              <PetalShape size={petal.size} hue={petal.hue} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}