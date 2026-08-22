'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimationFrame, useMotionValue, useTransform, useMotionTemplate, useReducedMotion, MotionValue } from 'framer-motion';
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

  const rotateY = useTransform(wrappedX, domain, rotYRange);
  const z = useTransform(wrappedX, domain, zRange);
  const localX = useTransform(wrappedX, domain, localXRange);
  const opacity = useTransform(wrappedX, domain, opacRange);

  const zIndex = useTransform(wrappedX, (x) => Math.round(20 - Math.abs(x) / 50));

  const transform = useMotionTemplate`translateX(${wrappedX}px) rotateY(${rotateY}deg) translateZ(${z}px) translateX(${localX}px)`;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-[150px] sm:w-[175px] md:w-[200px] aspect-[2/3] -mt-[112px] sm:-mt-[131px] md:-mt-[150px] -ml-[75px] sm:-ml-[87px] md:-ml-[100px]"
      style={{
        transform,
        zIndex,
        opacity,
      }}
    >
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
    </motion.div>
  );
}

export default function LandingPosterStage({ deck }: { deck: HeroFeature[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  
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
  );
}