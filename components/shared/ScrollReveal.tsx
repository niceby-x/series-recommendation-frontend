'use client';

// Fades + rises content into place as it scrolls into view -- the same
// "content arrives as you scroll" feel as joyofreact.com's module cards
// and illustrations. Deliberately generic (no BLumi-specific styling) so it
// can wrap any section, card, or grid of children across the landing page.
//
// `once: false` on the viewport means the animation re-triggers every time
// each element enters or leaves the viewport -- content fades/rises in on
// the way down the page, and fades/drops back out on the way back up (or
// past it going further down), rather than only playing once.
//
// Respects prefers-reduced-motion via useReducedMotion: reduced-motion
// users get an instant, non-animated appearance instead of the rise/fade.

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Stagger index -- each increment adds `staggerStep` seconds of delay. Use this on siblings you want to cascade in one after another (e.g. a row of cards). */
  index?: number;
  /** Seconds of delay added per `index` step. */
  staggerStep?: number;
  /** Pixels the content rises from on the way in. */
  distance?: number;
  /** Direction content rises from. */
  from?: 'bottom' | 'top' | 'left' | 'right';
  /** How far into the viewport the element must be before revealing (0 = edge, 1 = center). Lower = reveals earlier. */
  amount?: number;
  className?: string;
}

const AXIS: Record<NonNullable<ScrollRevealProps['from']>, { key: 'y' | 'x'; sign: 1 | -1 }> = {
  bottom: { key: 'y', sign: 1 },
  top: { key: 'y', sign: -1 },
  left: { key: 'x', sign: -1 },
  right: { key: 'x', sign: 1 },
};

export default function ScrollReveal({
  children,
  index = 0,
  staggerStep = 0.12,
  distance = 28,
  from = 'bottom',
  amount = 0.2,
  className,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const { key, sign } = AXIS[from];

  const variants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, [key]: sign * distance },
        visible: { opacity: 1, [key]: 0 },
      };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount }}
      variants={variants}
      transition={{
        duration: 0.6,
        delay: index * staggerStep,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}