'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Aceternity-style cursor-follow spotlight: a soft radial highlight that
// tracks the pointer inside its container. mouseX/mouseY are motion values
// fed straight into a template that framer-motion writes to the DOM on
// every pointer move without triggering a React re-render.
//
// Parent needs `group` in its className for the opacity fade-in on hover
// to work (Tailwind's group-hover). Disabled entirely under
// prefers-reduced-motion, same convention as PetalDecoration/ScrollReveal
// elsewhere in this app -- it's a purely decorative layer either way.
export default function Spotlight({
  children,
  className,
  color = 'rgba(245, 138, 181, 0.18)',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 70%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={cn('relative', className)}>
      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background }}
          aria-hidden
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
