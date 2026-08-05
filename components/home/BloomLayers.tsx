'use client';

// The BLumi take on joyofreact.com's signature moments: illustrations that
// rise into place as you scroll (their stacked toaster-machine PNGs), plus
// a click-to-toggle visual effect (their "Toggle turquoise/yellow/purple
// light" buttons in the hero). Here that's three flowers behind "How
// BLumi Works" -- they rise and settle via scroll-linked parallax, and
// each one is independently clickable/tappable to burst open, scattering
// little sparkle petals outward. Thematically it's the site's own name
// (Bloom + Lumi) literally blooming and glinting on interaction.
//
// Mechanism: useScroll tracks this section's position in the viewport as a
// 0->1 progress value (section enters from the bottom, finishes as it
// reaches the top). Each layer maps that same progress through its own
// useTransform curve -- different y travel distance, different rotate and
// scale range -- so the layers move at different rates ("parallax": same
// scroll input, different output per layer). Independently, each bloom
// holds its own open/closed click state and a burst counter that respawns
// the sparkle particles on every click, even if you click the same bloom
// repeatedly.
//
// Skipped/simplified for prefers-reduced-motion: layers render statically
// (no scroll parallax) and clicking swaps petal state instantly with no
// spring/particle animation, same convention as PetalDecoration.tsx.

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

function Sparkle({ angle, delay }: { angle: number; delay: number }) {
  const rad = (angle * Math.PI) / 180;
  const distance = 46;
  return (
    <motion.circle
      cx="50"
      cy="50"
      r="2.5"
      fill="var(--color-brand-gold)"
      initial={{ opacity: 1, cx: 50, cy: 50 }}
      animate={{
        opacity: 0,
        cx: 50 + Math.sin(rad) * distance,
        cy: 50 - Math.cos(rad) * distance,
      }}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
    />
  );
}

function Bloom({
  fill,
  size,
  label,
}: {
  fill: string;
  size: number;
  label: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  function toggle() {
    setIsOpen((v) => !v);
    setBurstKey((k) => k + 1);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Toggle ${label} bloom`}
      aria-pressed={isOpen}
      className="pointer-events-auto cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      style={{ width: size, height: size }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
      >
        {PETAL_ANGLES.map((angle) => (
          <motion.ellipse
            key={angle}
            cx="50"
            cy="28"
            rx="14"
            fill={fill}
            transform={`rotate(${angle} 50 50)`}
            animate={{ ry: isOpen ? 30 : 24, opacity: isOpen ? 0.85 : 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 260, damping: 14 }
            }
          />
        ))}
        <motion.circle
          cx="50"
          cy="50"
          r="10"
          fill="var(--color-brand-gold)"
          animate={{ scale: isOpen ? 1.25 : 1 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 14 }
          }
        />

        {!prefersReducedMotion && (
          <AnimatePresence>
            {isOpen && (
              <g key={burstKey}>
                {PETAL_ANGLES.map((angle, i) => (
                  <Sparkle key={angle} angle={angle} delay={i * 0.03} />
                ))}
              </g>
            )}
          </AnimatePresence>
        )}
      </motion.svg>
    </button>
  );
}

export default function BloomLayers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Progress is 0 when the section's top hits the bottom of the
    // viewport, 1 when its top hits the viewport's vertical center --
    // i.e. it finishes rising well before the section scrolls past.
    offset: ['start end', 'start center'],
  });

  // Back layer: travels furthest and lags most, so it reads as "farthest away".
  const backY = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const backRotate = useTransform(scrollYProgress, [0, 1], [-18, -6]);
  const backOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.55]);

  // Mid layer: moderate travel, opposite rotation direction for variety.
  const midY = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const midRotate = useTransform(scrollYProgress, [0, 1], [14, 4]);
  const midOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.7]);

  // Front layer: shortest travel, arrives first and "blooms" via scale.
  const frontY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const frontScale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const frontOpacity = useTransform(scrollYProgress, [0, 0.45], [0, 0.85]);

  if (prefersReducedMotion) {
    // Static fallback -- same three blooms, no scroll-linked motion, but
    // still clickable. Positioned above/below the card row (not overlapping
    // it) for the same reason as the animated version below.
    return (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-2 -top-6"><Bloom fill="var(--color-brand-lilac)" size={80} label="lilac" /></div>
        <div className="absolute right-2 -top-5"><Bloom fill="var(--color-brand-blush)" size={68} label="blush" /></div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-9"><Bloom fill="var(--color-brand-blush)" size={64} label="rose" /></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Each bloom sits above or below the card row itself -- not
          overlapping it -- so the cards (painted on top in DOM order) never
          sit between the cursor and a bloom's click target. An earlier
          version had these bleeding in *behind* the cards for a purely
          decorative peek-through effect; once blooms became clickable,
          "mostly hidden behind opaque cards" stopped being a viable spot
          for them to live. Offsets are kept small (well under the
          section's own vertical spacing) so they land in existing
          whitespace instead of overlapping the heading above or the next
          section below. */}
      <motion.div
        className="absolute -left-2 -top-6"
        style={{ y: backY, rotate: backRotate, opacity: backOpacity }}
      >
        <Bloom fill="var(--color-brand-lilac)" size={80} label="lilac" />
      </motion.div>

      <motion.div
        className="absolute right-2 -top-5"
        style={{ y: midY, rotate: midRotate, opacity: midOpacity }}
      >
        <Bloom fill="var(--color-brand-blush)" size={68} label="blush" />
      </motion.div>

      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -bottom-9"
        style={{ y: frontY, scale: frontScale, opacity: frontOpacity }}
      >
        <Bloom fill="var(--color-brand-blush)" size={64} label="rose" />
      </motion.div>
    </div>
  );
}