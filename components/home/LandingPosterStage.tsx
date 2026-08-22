'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimationFrame, useMotionValue, useTransform, useMotionTemplate, useReducedMotion, useSpring, MotionValue } from 'framer-motion';
import FlowerIcon from '../shared/FlowerIcon';
import type { HeroFeature } from '../../lib/landingContent';

// ==========================================
// CONFIGURATION
// ==========================================
const STRIDE = 220;              
const AUTOPLAY_SPEED = 0.035;    
const DRAG_SENSITIVITY = 1.0;    
const SLIPPERINESS = 0.98;       // Closer to 1 = slides longer. Closer to 0 = stops quickly.

function StageCard({
  card,
  index,
  totalCards,
  scrollX,
  isDragging,
}: {
  card: HeroFeature;
  index: number;
  totalCards: number;
  scrollX: MotionValue<number>;
  isDragging: boolean;
}) {
  const TRACK_WIDTH = totalCards * STRIDE;

  const wrappedX = useTransform(scrollX, (s) => {
    const rawX = index * STRIDE - s;
    return ((((rawX + TRACK_WIDTH / 2) % TRACK_WIDTH) + TRACK_WIDTH) % TRACK_WIDTH) - TRACK_WIDTH / 2;
  });

  const domain =      [-880, -660, -440, -220,    0,  220,  440,  660,  880];
  const rotYRange =   [  40,   40,   30,   15,    0,  -15,  -30,  -40,  -40];
  const zRange =      [  15,   15, -140, -260, -300, -260, -140,   15,   15];
  const localXRange = [  85,   85,  110,   70,    0,  -70, -110,  -85,  -85];
  const opacRange =   [   0,  0.3,    1,    1,    1,    1,    1,  0.3,    0];
  // Center-card emphasis -- how "in the spotlight" a card is right now, 0
  // at rest to 1 exactly at center. Piggybacks on the same wrappedX/domain
  // used above rather than a separate offset check, since cards no longer
  // sit at fixed discrete positions -- this crossfades continuously as the
  // autoplay/drag sweeps each card through the middle of the stage.
  const spotlightRange = [ 0,    0,    0,  0.25,   1,  0.25,    0,    0,    0];
  const scaleRange =    [ 1,    1,    1,  1.03,  1.1,  1.03,    1,    1,    1];

  const rotateY = useTransform(wrappedX, domain, rotYRange);
  const z = useTransform(wrappedX, domain, zRange);
  const localX = useTransform(wrappedX, domain, localXRange);
  const opacity = useTransform(wrappedX, domain, opacRange);
  const spotlight = useTransform(wrappedX, domain, spotlightRange);
  const cardScale = useTransform(wrappedX, domain, scaleRange);
  const labelOpacity = useTransform(spotlight, [0.6, 1], [0, 1]);

  const zIndex = useTransform(wrappedX, (x) => Math.round(20 - Math.abs(x) / 50));

  const transform = useMotionTemplate`translateX(${wrappedX}px) rotateY(${rotateY}deg) translateZ(${z}px) translateX(${localX}px) scale(${cardScale})`;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-[150px] sm:w-[175px] md:w-[200px] aspect-[2/3] -mt-[112px] sm:-mt-[131px] md:-mt-[150px] -ml-[75px] sm:-ml-[87px] md:-ml-[100px]"
      style={{
        transform,
        zIndex,
        opacity,
      }}
    >
      {/* Spotlight glow -- fades in as the card sweeps through center, so
          the eye always knows which card is "featured" right now even
          though nothing sits at a fixed center position anymore. */}
      <motion.div
        aria-hidden
        className="absolute -inset-4 sm:-inset-5 rounded-2xl blur-xl pointer-events-none"
        style={{
          opacity: spotlight,
          background:
            'radial-gradient(circle, rgba(255,217,122,0.55), rgba(245,138,181,0.35) 55%, transparent 75%)',
        }}
      />
      <div 
        className="relative w-full h-full rounded-sm overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <Link
          href={String(card.id).startsWith('hero-fallback') ? '/series' : `/series/${card.id}`}
          className="block relative w-full h-full"
          draggable={false} 
        >
          {card.imageUrl ? (
            <Image 
              src={card.imageUrl} 
              alt={card.title} 
              fill 
              sizes="200px" 
              className="object-cover" 
              draggable={false} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple-vivid/50 to-brand-mauve/60 px-2 text-center">
              <span className="text-white/80 text-[11px] leading-snug">{card.title}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Floor reflection -- the mock this stage was built from calls for
          a "white floor" the cards sit on; this is what actually sells
          that instead of just a drop shadow. Same mirrored-image + fading
          mask-image technique LandingHero's FanCard uses below, kept short
          (fades out by ~45% of the card's own height) so it reads as a
          quick glossy-floor reflection rather than a full duplicate card,
          and stays clear of the title chip beneath it. Painted before the
          chip so the chip always renders on top where they'd overlap. */}
      {card.imageUrl && (
        <div
          className="absolute top-full left-0 w-full aspect-[2/3] opacity-[0.22] pointer-events-none"
          style={{
            transform: 'scaleY(-1)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 45%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 45%)',
          }}
          aria-hidden
        >
          <Image src={card.imageUrl} alt="" fill sizes="200px" className="object-cover rounded-sm" />
        </div>
      )}

      {/* Title chip -- only readable while its card holds the spotlight,
          crossfading to the next card's title as the deck keeps moving. */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 -bottom-7 sm:-bottom-8 whitespace-nowrap pointer-events-none"
        style={{ opacity: labelOpacity }}
      >
        <span className="inline-flex items-center gap-1 bg-white/95 text-brand-mauve text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          <FlowerIcon className="size-2.5 text-brand-pink-vivid" /> {card.title}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPosterStage({ deck }: { deck: HeroFeature[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  // Cursor parallax is desktop-only -- gated on a fine pointer rather than
  // viewport width, since the signal we actually care about is "has a
  // mouse to move", not screen size. Lazy initializer (not an effect)
  // since this value is only read inside an event handler, never branched
  // on in JSX, so there's no SSR/hydration mismatch to guard against.
  const [hasFinePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  // Raw cursor position (-0.5..0.5 across the stage), eased through a
  // spring so the tilt settles smoothly instead of snapping to the mouse.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [4, -4]), { stiffness: 60, damping: 20 });
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-4, 4]), { stiffness: 60, damping: 20 });
  const sceneTransform = useMotionTemplate`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!hasFinePointer || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  const minItemsRequired = 14; 
  const loopMultiplier = Math.ceil(minItemsRequired / Math.max(1, deck.length));
  const endlessDeck = Array(loopMultiplier).fill(deck).flat();
  
  const scrollX = useMotionValue(0); 
  
  // Track the current velocity so we can apply momentum when you let go
  const velocity = useRef(AUTOPLAY_SPEED); 

  useAnimationFrame((t, delta) => {
    if (prefersReducedMotion || isDragging) return;
    
    // Apply the current velocity
    scrollX.set(scrollX.get() + delta * velocity.current);
    
    // Smoothly decay the velocity back down to the normal AUTOPLAY_SPEED
    // This creates the frictionless, slippery glide!
    velocity.current = velocity.current * SLIPPERINESS + AUTOPLAY_SPEED * (1 - SLIPPERINESS);
  });

  return (
    <motion.div
      className="relative overflow-hidden min-h-[calc(100vh-57px)] flex items-center justify-center w-full select-none !cursor-grab active:!cursor-grabbing"
      style={{
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #FBDCE6 62%, #241528 100%)',
        perspective: 1000, 
      }}
      onPanStart={() => {
        setIsDragging(true);
      }}
      onPanEnd={(e, info) => {
        setIsDragging(false);
        // Capture how fast the user was swiping (info.velocity.x is in pixels per second)
        // Divide by 1000 to convert to pixels per millisecond, and invert it because dragging left moves the track right.
        velocity.current = -info.velocity.x / 1000; 
      }}
      onPan={(e, info) => {
        scrollX.set(scrollX.get() - info.delta.x * DRAG_SENSITIVITY);
      }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {/* Headline -- sits in the empty space above the deck. Deliberately
          light: LandingHero right below already carries the full pitch
          ("Where Stories BLOOM") + CTAs, so this only needs to announce
          what's on stage, not repeat the sell. pointer-events-none keeps
          it out of the way of the onPan handlers covering this section. */}
      <div className="absolute inset-x-0 top-0 pt-14 sm:pt-16 md:pt-20 px-6 text-center z-20 pointer-events-none">
        <p className="inline-flex items-center gap-1.5 text-brand-mauve/70 text-[11px] font-bold tracking-[0.18em] mb-2">
          <FlowerIcon className="size-3 text-brand-pink-vivid" /> A BLUMI SELECTION
        </p>
        <h2 className="font-display italic text-[26px] sm:text-[32px] md:text-[38px] leading-tight text-brand-mauve">
          Seven stories to fall into
        </h2>
      </div>

      {/* Scene wrapper -- carries the cursor-tilt (desktop, fine-pointer
          only) as a single small rotateX/rotateY on the whole deck, so it
          reads as the camera shifting rather than each card twitching
          independently. Needs its own transformStyle: preserve-3d so the
          cards' individual translateZ depth still composes correctly
          nested inside this rotated group instead of being flattened. */}
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transform: sceneTransform }}
      >
        {endlessDeck.map((card, i) => (
          <StageCard
            key={`track-${card.id}-${i}`}
            card={card}
            index={i}
            totalCards={endlessDeck.length}
            scrollX={scrollX}
            isDragging={isDragging}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
