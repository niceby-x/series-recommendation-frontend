'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

// Counts up from 0 to `value` once the element scrolls into view. Purely a
// numeric-formatting effect -- under prefers-reduced-motion it just renders
// the final number immediately, no animation to skip.
export default function AnimatedCounter({
  value,
  suffix = '',
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = Math.round(latest) + suffix;
    });
    return unsubscribe;
  }, [springValue, suffix]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {value}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
