'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HeroFeature } from '../../lib/landingContent';

// The very first thing visible when BLumi loads -- a static 3D coverflow
// of the same 7-card deck LandingHero uses below it, adapted from a
// reference mock (rotateY + translateZ "stage" cards, deep drop shadow,
// white floor). Deliberately its own section rather than folded into
// LandingHero: LandingHero already owns the fanned reflective gallery
// further down the page, and stacking two different 3D card treatments
// inside one component would make neither read as intentional.
//
// TRANSFORM MATH, so this is easy to retune in npm run dev:
// Each card's offset is its distance from the center card (0 = center,
// negative = toward the right edge, positive = toward the left edge --
// matches the source mock's tilt-right-outer..tilt-left-outer naming).
// STAGE_DEPTH below is indexed by |offset| (0..3) and holds:
//   rotate -- how far the card turns to "face" the center (deg)
//   z      -- how far back the card sits (px, more negative = further away)
//   x      -- how far the card slides toward the edge (px)
// The sign of rotate/x flips depending on which side of center a card is
// on (see getStageTransform) -- that's what makes the two wings mirror
// each other instead of both leaning the same way.
const STAGE_DEPTH: { rotate: number; z: number; x: number }[] = [
  { rotate: 0, z: -300, x: 0 }, // center card -- straight on, furthest back
  { rotate: 15, z: -260, x: 70 }, // immediate neighbors
  { rotate: 30, z: -140, x: 110 }, // next ring out -- swings back toward camera
  { rotate: 40, z: 15, x: 85 }, // outer wing -- nearly edge-on, closest to camera
];

function getStageTransform(offset: number): string {
  const depth = STAGE_DEPTH[Math.min(Math.abs(offset), STAGE_DEPTH.length - 1)];
  const dir = offset < 0 ? 1 : offset > 0 ? -1 : 0; // right side vs. left side of center
  return `rotateY(${dir * depth.rotate}deg) translateZ(${depth.z}px) translateX(${dir * depth.x}px)`;
}

function StageCard({ card, offset }: { card: HeroFeature; offset: number }) {
  return (
    <div
      className="shrink-0 w-[150px] sm:w-[175px] md:w-[200px] aspect-[2/3]"
      style={{ transform: getStageTransform(offset), zIndex: 10 - Math.abs(offset) }}
    >
      <Link
        href={String(card.id).startsWith('hero-fallback') ? '/series' : `/series/${card.id}`}
        className="block relative w-full h-full rounded-sm overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_18px_36px_rgba(0,0,0,0.45)]"
      >
        {card.imageUrl ? (
          <Image src={card.imageUrl} alt={card.title} fill sizes="200px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple-vivid/50 to-brand-mauve/60 px-2 text-center">
            <span className="text-white/80 text-[11px] leading-snug">{card.title}</span>
          </div>
        )}
      </Link>
    </div>
  );
}

export default function LandingPosterStage({ deck }: { deck: HeroFeature[] }) {
  const centerIndex = (deck.length - 1) / 2;
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Why this needs JS: `translateX`/`rotateY` are transforms, so they shift
  // cards visually without changing the layout box the browser measures.
  // On top of that, `mx-auto` can't center something wider than a
  // scrollable container -- when content overflows an `overflow-x-auto`
  // box, the browser just shows scroll position 0 (the left edge) instead
  // of centering it, which is why the row was reading as left-anchored
  // with the right side clipped. Centering the scroll position on mount
  // fixes both: it puts the true midpoint of the fanned deck in view, and
  // still lets wide/narrow screens scroll to see the wings that don't fit.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    // min-h-[calc(100vh-57px)] fills the screen down to exactly where the
    // navbar leaves off -- 57px matches the navbar's own rendered height
    // (see the mobile menu's `top-[57px]` in Navbar.tsx, the existing
    // source of truth for that number in this codebase) -- so the last
    // thing visible before scrolling is this stage, and the violet
    // LandingHero gradient only appears once the visitor scrolls past it.
    //
    // Background eases white -> a soft brand-blush glow -> #241528, which
    // is the exact color LandingHero's own gradient starts at (see its
    // `from-[#241528]`) -- ending on that value rather than a plain white
    // means the two sections meet with no visible seam between them.
    <div
      ref={scrollerRef}
      className="relative overflow-x-auto no-scrollbar min-h-[calc(100vh-57px)] flex items-center"
      style={{ background: 'linear-gradient(to bottom, #FFFFFF 0%, #FBDCE6 62%, #241528 100%)' }}
    >
      <div
        className="flex items-center justify-center gap-3 md:gap-4 w-max mx-auto px-[130px] py-16"
        style={{ perspective: 1000 }}
      >
        {/* px-[130px] above reserves room for the widest translateX offset
            (110px, at |offset|=2) plus a little slack for the hover scale --
            without it the outer wing cards' transformed position falls
            outside the row's measured (untransformed) width and gets cut
            off by the scroll container instead of being scrollable into view. */}
        {deck.map((card, i) => (
          <StageCard key={card.id} card={card} offset={i - centerIndex} />
        ))}
      </div>
    </div>
  );
}
