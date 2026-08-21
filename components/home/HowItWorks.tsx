'use client';

'use client';

import { Compass, BookOpen } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import FlowerIcon from '../shared/FlowerIcon';

const STEPS = [
  {
    number: '01',
    title: 'Discover',
    description: 'Find BL stories through moods, tropes, and curated collections.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Explore',
    description: 'Read trusted recommendations and emotional insights.',
    icon: BookOpen,
  },
  {
    number: '03',
    title: 'Bloom',
    description: 'Save your favorites and discover your next unforgettable story.',
    icon: FlowerIcon,
  },
];

export default function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div>
      <div className="relative">
        {/* Connecting line -- legitimate use of a sequence indicator here,
            since these 3 steps are a real ordered process, not a generic
            feature list. Desktop-only (md:) since it visually threads
            through the icon circles of the 3-column layout, which collapses
            to 1 column on mobile. Draws in left-to-right as it scrolls into
            view; explicitly skips the animation under prefers-reduced-motion
            (renders fully drawn immediately), same convention as
            ScrollReveal/PetalDecoration elsewhere in this app. */}
        <motion.div
          initial={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
          className="hidden md:block absolute left-[16.5%] right-[16.5%] top-[52px] h-[2px] bg-gradient-to-r from-brand-blush via-brand-lilac to-brand-gold -z-10"
          aria-hidden
        />
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl border border-border bg-gradient-to-br from-accent/60 to-transparent p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-display text-primary text-[15px] font-semibold mb-1">{step.number}</p>
                  <h3 className="font-display text-xl font-normal text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-muted-foreground text-[13px] leading-snug max-w-[190px]">{step.description}</p>
                </div>
                <span className="flex items-center justify-center size-16 rounded-full bg-card border border-border shrink-0">
                  <Icon className="size-6 text-primary" strokeWidth={1.75} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-muted-foreground text-[12px] text-center mt-5">
        BLumi is a recommendation guide, not a streaming service — we help you find where to
        watch, we don&apos;t host anything ourselves.
      </p>
    </div>
  );
}