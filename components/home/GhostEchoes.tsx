'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';

// Fixed layout for up to 5 echo silhouettes -- staggered left-to-right
// across the seam between LandingPosterStage and the search section, with
// varied size/drift/blur so they don't read as a mechanical repeat of the
// same card. Matches PetalDecoration's convention of a hand-tuned fixed
// array instead of Math.random() (impure during render).
const ECHO_LAYOUT = [
  { left: '10%', width: 110, driftPx: 180, blur: 20, delay: 0 },
  { left: '29%', width: 78, driftPx: 240, blur: 26, delay: 0.06 },
  { left: '50%', width: 130, driftPx: 150, blur: 16, delay: 0 },
  { left: '69%', width: 82, driftPx: 220, blur: 24, delay: 0.05 },
  { left: '87%', width: 104, driftPx: 190, blur: 20, delay: 0.02 },
] as const;

function Echo({
  imageUrl,
  layout,
  scrollYProgress,
}: {
  imageUrl: string | null;
  layout: (typeof ECHO_LAYOUT)[number];
  scrollYProgress: MotionValue<number>;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -layout.driftPx]);
  // Rises in, holds briefly, fades out -- a "brief" echo rather than
  // something that tracks the whole scroll range at constant opacity.
  // Peak opacity cut from 0.6/0.5 -- fine for the old CSS grayscale filter
  // on a sometimes-null image, too heavy now that every slot always
  // renders a real (often dark) poster (see 913ea06).
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.85, 1], [0, 0.28, 0.34, 0.12, 0]);

  // Was: `if (!imageUrl) return null`, which silently dropped an echo
  // whenever this deck slot fell back to HERO_DECK_FALLBACK (imageUrl is
  // intentionally null there -- see landingContent.ts). With a thin
  // catalog that's most/all of the 5 slots, which made the whole effect
  // read as "nothing renders." A soft brand-gradient blob keeps the echo
  // count and drift/fade timing consistent regardless of catalog depth,
  // without fabricating a poster image that doesn't exist.
  const background = imageUrl
    ? `url(${imageUrl})`
    : 'radial-gradient(circle, var(--color-brand-lilac), var(--color-brand-blush))';

  return (
    <motion.div
      className="absolute top-0 rounded-2xl bg-cover bg-center"
      style={{
        left: layout.left,
        width: layout.width,
        height: layout.width * 1.5,
        backgroundImage: background,
        // grayscale composed directly into the filter string here --
        // Tailwind's `grayscale` class and this inline `filter` would
        // otherwise fight over the same CSS property, with the inline
        // style winning and silently discarding the class entirely.
        filter: `grayscale(1) blur(${layout.blur}px)`,
        y,
        opacity,
      }}
    />
  );
}

// Bleeds the poster carousel's visual identity down past the hero stage:
// as the visitor scrolls from LandingPosterStage into the search section,
// semi-transparent blurred silhouettes of a few deck posters drift upward
// and fade, in the 2D DOM layer (not the WebGL scene -- these sit above
// both sections, see the shared wrapper in HomeLanding.tsx).
export default function GhostEchoes({ imageUrls }: { imageUrls: (string | null)[] }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'end 0.2'],
  });

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 overflow-hidden hidden md:block"
      // Was top: 52vh -- with canvasTop defaulting to ~320px, that landed
      // inside the card zone itself rather than past it, so once 913ea06
      // made every echo render a real (often dark) grayscaled poster
      // instead of sometimes returning null, it read as a band across the
      // card tops instead of a trailing haze in the seam below the stage.
      // Pushed down so the effect starts after the cards.
      style={{ top: '80vh', height: '55vh' }}
      aria-hidden="true"
    >
      {ECHO_LAYOUT.map((layout, i) => (
        <Echo key={layout.left} imageUrl={imageUrls[i] ?? null} layout={layout} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}
