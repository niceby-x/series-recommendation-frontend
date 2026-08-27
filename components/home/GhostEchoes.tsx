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
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.85, 1], [0, 0.5, 0.6, 0.22, 0]);

  if (!imageUrl) return null;

  return (
    <motion.div
      className="absolute top-0 rounded-2xl bg-cover bg-center grayscale"
      style={{
        left: layout.left,
        width: layout.width,
        height: layout.width * 1.5,
        backgroundImage: `url(${imageUrl})`,
        filter: `blur(${layout.blur}px)`,
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
      style={{ top: '52vh', height: '62vh' }}
      aria-hidden="true"
    >
      {ECHO_LAYOUT.map((layout, i) => (
        <Echo key={layout.left} imageUrl={imageUrls[i] ?? null} layout={layout} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}
