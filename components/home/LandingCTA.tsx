'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import FlowerIcon from '../shared/FlowerIcon';
import { useAuthModal } from '../../lib/AuthModalContext';

// Closing conversion moment -- the page previously went straight from
// How It Works into the footer with no final ask. Keeps the section itself
// simple (no carousel, no content row) so it reads as a deliberate closing
// beat rather than another row competing for attention -- the two effects
// here (drifting blobs, moving-border button) are spent entirely on making
// that one beat land, not spread across new content.
//
// Opens the real register modal (same one Navbar's "Sign up" button uses)
// rather than linking to /series -- this section's whole job is the signup
// conversion, so it should trigger signup directly instead of one more hop
// through the catalog.
export default function LandingCTA() {
  const { open: openAuthModal } = useAuthModal();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-tl-[40px] rounded-tr-[16px] rounded-br-[40px] rounded-bl-[16px] bg-brand-gradient px-6 md:px-10 py-12 md:py-16 text-center">
      {/* Ambient drifting light blobs -- ombient, not scroll-linked (this
          section is too short for scroll parallax to read), continuous slow
          float via framer-motion. Static (no animate prop) under
          prefers-reduced-motion, same convention as this app's other motion
          components. */}
      <motion.div
        className="absolute -top-10 -left-10 size-56 rounded-full bg-white/20 blur-3xl pointer-events-none"
        animate={prefersReducedMotion ? undefined : { x: [0, 24, 0], y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-16 -right-10 size-64 rounded-full bg-brand-gold/25 blur-3xl pointer-events-none"
        animate={prefersReducedMotion ? undefined : { x: [0, -20, 0], y: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto">
        <span className="inline-flex items-center justify-center size-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 mb-4">
          <FlowerIcon className="size-6 text-white" />
        </span>
        <h2 className="font-display italic text-[28px] md:text-[38px] leading-tight font-normal text-white mb-2.5">
          Your next favorite story is waiting to bloom
        </h2>
        <p className="text-white/85 text-[15px] md:text-[16px] leading-relaxed mb-7 max-w-lg mx-auto">
          Join BLumi to save your favorites, get recommendations built around your taste, and
          never lose track of a story again.
        </p>

        {/* Moving-border button: the rotating conic-gradient layer is
            oversized and sits behind the button's solid white fill, so only
            a thin ring peeks out and travels around the edge -- see the
            .moving-border-spin keyframe in globals.css. */}
        <div className="relative inline-block rounded-tl-[20px] rounded-tr-[8px] rounded-br-[20px] rounded-bl-[8px] p-[2px] overflow-hidden">
          <div
            className="absolute inset-[-50%] moving-border-spin"
            style={{
              backgroundImage:
                'conic-gradient(from 0deg, var(--color-brand-gold), var(--color-brand-pink-vivid), var(--color-brand-lilac), var(--color-brand-gold))',
            }}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="group relative z-10 inline-flex items-center gap-2 bg-white text-primary text-[15px] font-semibold px-7 py-3 rounded-tl-[18px] rounded-tr-[6px] rounded-br-[18px] rounded-bl-[6px] hover:opacity-90 transition-opacity"
          >
            <span className="relative">Join BLumi</span>
            <ArrowRight className="relative size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

