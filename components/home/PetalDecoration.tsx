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
  { left: '1%', size: 58, fallDuration: 17.9, swayDuration: 5, bobDuration: 3.35, delay: 0, sway: 20.7, opacity: 0.5, hue: 'blush' },
  { left: '6%', size: 20, fallDuration: 11.2, swayDuration: 3.24, bobDuration: 2.38, delay: 3.4, sway: 11.5, opacity: 0.3, hue: 'lilac' },
  { left: '12%', size: 35, fallDuration: 20.2, swayDuration: 5.83, bobDuration: 3.89, delay: 6.8, sway: 23, opacity: 0.4, hue: 'blush' },
  { left: '18%', size: 16, fallDuration: 10.1, swayDuration: 2.81, bobDuration: 2.16, delay: 1.2, sway: 10.35, opacity: 0.28, hue: 'lilac' },
  { left: '24%', size: 67, fallDuration: 23.5, swayDuration: 6.91, bobDuration: 4.54, delay: 9.6, sway: 27.6, opacity: 0.46, hue: 'lilac' },
  { left: '30%', size: 23, fallDuration: 12.3, swayDuration: 3.67, bobDuration: 2.59, delay: 2.4, sway: 13.8, opacity: 0.32, hue: 'blush' },
  { left: '36%', size: 41, fallDuration: 19, swayDuration: 5.4, bobDuration: 3.67, delay: 5.2, sway: 23, opacity: 0.42, hue: 'blush' },
  { left: '42%', size: 17, fallDuration: 9.5, swayDuration: 3.02, bobDuration: 2.27, delay: 8, sway: 11.5, opacity: 0.28, hue: 'lilac' },
  { left: '48%', size: 49, fallDuration: 21.3, swayDuration: 6.26, bobDuration: 4.1, delay: 0.8, sway: 25.3, opacity: 0.44, hue: 'blush' },
  { left: '54%', size: 22, fallDuration: 11.8, swayDuration: 3.46, bobDuration: 2.48, delay: 4.4, sway: 12.65, opacity: 0.3, hue: 'lilac' },
  { left: '60%', size: 61, fallDuration: 22.4, swayDuration: 6.48, bobDuration: 4.32, delay: 7.2, sway: 25.3, opacity: 0.48, hue: 'blush' },
  { left: '65%', size: 19, fallDuration: 10.6, swayDuration: 3.24, bobDuration: 2.38, delay: 2, sway: 11.5, opacity: 0.3, hue: 'lilac' },
  { left: '70%', size: 32, fallDuration: 16.8, swayDuration: 4.97, bobDuration: 3.24, delay: 10.4, sway: 20.7, opacity: 0.38, hue: 'blush' },
  { left: '75%', size: 26, fallDuration: 14, swayDuration: 4.1, bobDuration: 2.81, delay: 3.8, sway: 16.1, opacity: 0.34, hue: 'lilac' },
  { left: '80%', size: 52, fallDuration: 20.7, swayDuration: 6.05, bobDuration: 4, delay: 6.2, sway: 25.3, opacity: 0.44, hue: 'blush' },
  { left: '85%', size: 15, fallDuration: 9, swayDuration: 2.7, bobDuration: 2.05, delay: 11.2, sway: 10.35, opacity: 0.26, hue: 'lilac' },
  { left: '90%', size: 38, fallDuration: 18.5, swayDuration: 5.4, bobDuration: 3.56, delay: 1.6, sway: 20.7, opacity: 0.4, hue: 'blush' },
  { left: '95%', size: 29, fallDuration: 15.1, swayDuration: 4.54, bobDuration: 3.02, delay: 9, sway: 18.4, opacity: 0.36, hue: 'lilac' },
  { left: '9%', size: 46, fallDuration: 19.6, swayDuration: 5.62, bobDuration: 3.78, delay: 12.6, sway: 23, opacity: 0.42, hue: 'lilac' },
  { left: '39%', size: 20, fallDuration: 11.4, swayDuration: 3.35, bobDuration: 2.48, delay: 13.8, sway: 12.65, opacity: 0.3, hue: 'blush' },
  { left: '57%', size: 29, fallDuration: 14.6, swayDuration: 4.32, bobDuration: 2.92, delay: 5.6, sway: 17.25, opacity: 0.36, hue: 'lilac' },
  { left: '78%', size: 64, fallDuration: 24.6, swayDuration: 7.13, bobDuration: 4.64, delay: 14.4, sway: 27.6, opacity: 0.46, hue: 'blush' },
  { left: '3%', size: 49, fallDuration: 28.6, swayDuration: 5.3, bobDuration: 4, delay: 0.4, sway: 24, opacity: 0.44, hue: 'blush' },
  { left: '15%', size: 30, fallDuration: 20.6, swayDuration: 4.2, bobDuration: 3.1, delay: 3.3, sway: 18, opacity: 0.36, hue: 'lilac' },
  { left: '21%', size: 54, fallDuration: 26.7, swayDuration: 5.6, bobDuration: 4.2, delay: 10.2, sway: 25, opacity: 0.46, hue: 'blush' },
  { left: '27%', size: 62, fallDuration: 30, swayDuration: 6.1, bobDuration: 4.6, delay: 1.3, sway: 28, opacity: 0.5, hue: 'lilac' },
  { left: '33%', size: 38, fallDuration: 24, swayDuration: 4.7, bobDuration: 3.5, delay: 0.4, sway: 20, opacity: 0.4, hue: 'blush' },
  { left: '45%', size: 27, fallDuration: 19.3, swayDuration: 4, bobDuration: 3, delay: 7.6, sway: 17, opacity: 0.35, hue: 'lilac' },
  { left: '51%', size: 17, fallDuration: 15.1, swayDuration: 3.4, bobDuration: 2.6, delay: 3, sway: 13, opacity: 0.31, hue: 'blush' },
  { left: '63%', size: 50, fallDuration: 25, swayDuration: 5.4, bobDuration: 4, delay: 8.2, sway: 24, opacity: 0.45, hue: 'lilac' },
  { left: '67%', size: 27, fallDuration: 19.3, swayDuration: 4, bobDuration: 3, delay: 8.8, sway: 17, opacity: 0.35, hue: 'blush' },
  { left: '72%', size: 58, fallDuration: 28, swayDuration: 5.9, bobDuration: 4.4, delay: 0.1, sway: 27, opacity: 0.48, hue: 'lilac' },
  { left: '82%', size: 58, fallDuration: 28, swayDuration: 5.9, bobDuration: 4.4, delay: 10.5, sway: 27, opacity: 0.48, hue: 'blush' },
  { left: '87%', size: 34, fallDuration: 22.3, swayDuration: 4.4, bobDuration: 3.3, delay: 2.3, sway: 19, opacity: 0.38, hue: 'lilac' },
  { left: '92%', size: 66, fallDuration: 29.7, swayDuration: 6.4, bobDuration: 4.8, delay: 5, sway: 29, opacity: 0.51, hue: 'blush' },
  { left: '97%', size: 21, fallDuration: 16.8, swayDuration: 3.7, bobDuration: 2.7, delay: 1.5, sway: 15, opacity: 0.33, hue: 'lilac' },
  { left: '4.5%', size: 60, fallDuration: 27.2, swayDuration: 6, bobDuration: 4.5, delay: 9.1, sway: 27, opacity: 0.49, hue: 'blush' },
  { left: '16.5%', size: 58, fallDuration: 27, swayDuration: 5.9, bobDuration: 4.4, delay: 10.9, sway: 27, opacity: 0.48, hue: 'lilac' },
  { left: '28.5%', size: 44, fallDuration: 22, swayDuration: 5, bobDuration: 3.8, delay: 14.6, sway: 22, opacity: 0.42, hue: 'blush' },
  { left: '63.5%', size: 36, fallDuration: 19.5, swayDuration: 4.6, bobDuration: 3.4, delay: 8.3, sway: 20, opacity: 0.39, hue: 'lilac' },
] as const;

const GLOWS = [
  { left: '8%', top: '10%', size: 220, duration: 9, delay: 0, hue: 'gold', driftDuration: 26, driftDelay: 0, dx1: '18vw', dy1: '14vh', dx2: '28vw', dy2: '-8vh', dx3: '10vw', dy3: '-20vh', dx4: '-8vw', dy4: '-4vh', dx5: '4vw', dy5: '10vh' },
  { left: '58%', top: '4%', size: 180, duration: 11, delay: 2.5, hue: 'gold', driftDuration: 31, driftDelay: 1.5, dx1: '-16vw', dy1: '16vh', dx2: '-24vw', dy2: '32vh', dx3: '-6vw', dy3: '46vh', dx4: '12vw', dy4: '30vh', dx5: '-4vw', dy5: '10vh' },
  { left: '82%', top: '38%', size: 260, duration: 8, delay: 1.2, hue: 'gold', driftDuration: 23, driftDelay: 3, dx1: '-14vw', dy1: '18vh', dx2: '-22vw', dy2: '-6vh', dx3: '-8vw', dy3: '-26vh', dx4: '6vw', dy4: '-14vh', dx5: '-4vw', dy5: '4vh' },
  { left: '30%', top: '55%', size: 160, duration: 10, delay: 4, hue: 'gold', driftDuration: 29, driftDelay: 2, dx1: '16vw', dy1: '-20vh', dx2: '26vw', dy2: '-4vh', dx3: '12vw', dy3: '18vh', dx4: '-10vw', dy4: '10vh', dx5: '2vw', dy5: '-8vh' },
  { left: '4%', top: '68%', size: 200, duration: 12, delay: 3, hue: 'gold', driftDuration: 24, driftDelay: 4.5, dx1: '20vw', dy1: '-12vh', dx2: '34vw', dy2: '2vh', dx3: '18vw', dy3: '20vh', dx4: '30vw', dy4: '-8vh', dx5: '6vw', dy5: '6vh' },
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
      {/* Lumi — soft glowing light orbs, drifting like fireflies while they
          pulse. Outer div handles the meandering path (firefly-drift);
          inner div keeps its own independent pulse (glow-pulse). */}
      {GLOWS.map((glow, i) => (
        <div
          key={`glow-${i}`}
          className="absolute will-change-transform"
          style={{
            left: glow.left,
            top: glow.top,
            animation: `firefly-drift ${glow.driftDuration}s ease-in-out ${glow.driftDelay}s infinite`,
            ['--drift-x1' as string]: glow.dx1,
            ['--drift-y1' as string]: glow.dy1,
            ['--drift-x2' as string]: glow.dx2,
            ['--drift-y2' as string]: glow.dy2,
            ['--drift-x3' as string]: glow.dx3,
            ['--drift-y3' as string]: glow.dy3,
            ['--drift-x4' as string]: glow.dx4,
            ['--drift-y4' as string]: glow.dy4,
            ['--drift-x5' as string]: glow.dx5,
            ['--drift-y5' as string]: glow.dy5,
          }}
        >
          <div
            className="rounded-full blur-2xl will-change-transform"
            style={{
              width: glow.size,
              height: glow.size,
              background: `radial-gradient(circle, var(--color-brand-${glow.hue}) 0%, transparent 70%)`,
              animation: `glow-pulse ${glow.duration}s ease-in-out ${glow.delay}s infinite alternate`,
            }}
          />
        </div>
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