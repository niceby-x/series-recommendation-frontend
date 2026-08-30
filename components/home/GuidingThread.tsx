'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// A glowing curved line that "draws" itself downward as the visitor
// scrolls, starting roughly behind the center poster in
// LandingPosterStage and weaving down to the search pill in
// HomeLanding's search section -- a visual thread pulling the eye from
// the 3D hero into the one real, working entry point below it.
//
// Positioned absolutely against the shared wrapper HomeLanding renders
// around both sections (see HomeLanding.tsx), not against either section
// individually, since the thread needs to sit on top of both and doesn't
// belong to either one. top/height are viewport-relative rather than
// pixel-measured against LandingPosterStage's actual rendered height,
// since that height itself depends on the (already dynamically measured)
// header overlay -- close enough for a decorative accent, and avoids a
// second layout-measurement pass layered on top of LandingPosterStage's
// own.
//
// pathLength={1} + a matching strokeDasharray puts the dash math in
// normalized [0,1] path-length units instead of raw SVG units, so the
// scroll-driven strokeDashoffset transform below doesn't need to know
// the path's actual rendered length.
export default function GuidingThread() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.35'],
  });
  const dashOffset = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.15, 1], [0, 0.9, 0.9]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 z-10 hidden sm:block"
      style={{ top: '52vh', height: '70vh' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="guiding-thread-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D946EF" stopOpacity="0" />
            <stop offset="12%" stopColor="#D946EF" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#C8A0F9" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F7B6C8" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* Soft blurred duplicate painted first (underneath) for the glow --
            cheaper and more consistent across browsers than an SVG filter
            (feGaussianBlur) here, which can clip against the loose
            viewBox/overflow-visible combination this path relies on.
            No vector-effect here (or on the line below): the viewBox is
            intentionally stretched non-uniformly via
            preserveAspectRatio="none" to span the full container, and
            vector-effect="non-scaling-stroke" would opt this stroke OUT of
            that scaling entirely -- rendering strokeWidth 0.5/2.2 as
            literal near-invisible screen pixels instead of viewBox units.
            Letting the stroke scale with the viewBox (some width variance
            along the curve from the non-uniform stretch) is the tradeoff
            that keeps the line actually visible. */}
        <motion.path
          d="M50 0 C 40 12, 58 20, 48 34 S 34 54, 50 62 S 60 82, 50 100"
          fill="none"
          stroke="url(#guiding-thread-gradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={{
            strokeDashoffset: dashOffset,
            opacity: glowOpacity,
            filter: 'blur(6px)',
          }}
        />
        <motion.path
          d="M50 0 C 40 12, 58 20, 48 34 S 34 54, 50 62 S 60 82, 50 100"
          fill="none"
          stroke="url(#guiding-thread-gradient)"
          strokeWidth="0.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: dashOffset, opacity: glowOpacity }}
        />
      </svg>
    </div>
  );
}
