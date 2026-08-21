'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight, ChevronLeft, Flame, Award, Heart, Sparkle, Clapperboard, Tv } from 'lucide-react';
import type { DiscoverCard } from '../../lib/landingContent';
import TiltCard from '../shared/TiltCard';

// Badge icon + color per label, matching the mockup's varied pill styles.
// Falls back to a plain star/dark pill for any label not in this list (e.g.
// the real-catalog cards' 'Editor's Pick').
const BADGE_STYLES: Record<string, { icon: typeof Flame; bg: string }> = {
  'Trending': { icon: Flame, bg: 'bg-orange-500/90' },
  'Top Rated': { icon: Award, bg: 'bg-violet-500/90' },
  'Must Watch': { icon: Heart, bg: 'bg-pink-500/90' },
  'New Episode': { icon: Sparkle, bg: 'bg-sky-500/90' },
  'Movie': { icon: Clapperboard, bg: 'bg-rose-900/90' },
  'Anime': { icon: Tv, bg: 'bg-teal-500/90' },
};
const DEFAULT_BADGE = { icon: Star, bg: 'bg-black/70' };

function Card({ card }: { card: DiscoverCard }) {
  const badgeStyle = BADGE_STYLES[card.badge] ?? DEFAULT_BADGE;
  const BadgeIcon = badgeStyle.icon;

  const inner = (
    <TiltCard maxTilt={10} className="group relative shrink-0 w-[180px] snap-start rounded-[22px] overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative aspect-[2/3] w-full bg-muted">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="180px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{card.title}</span>
          </div>
        )}

        {/* Text sits directly on the poster now (mockup), so the gradient
            needs to be strong enough at the bottom to keep it legible over
            any image. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <span className={`absolute top-2.5 left-2.5 flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm ${badgeStyle.bg}`}>
          <BadgeIcon className="size-2.5" />
          {card.badge}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-white text-[14px] font-semibold leading-snug line-clamp-2 mb-1">{card.title}</h3>
          <p className="text-white/75 text-[11px] flex items-center gap-1">
            {card.country} · {card.mediaType}
            <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
              <Star className="size-3" fill="currentColor" /> {card.rating.toFixed(1)}
            </span>
          </p>
        </div>
      </div>
    </TiltCard>
  );

  if (!card.isReal) {
    // Mock cards render identically but never link out — same pattern as
    // HeroCarousel's isReal gate on the homepage.
    return inner;
  }

  return (
    <Link href={'/series/' + card.id} className="block">
      {inner}
    </Link>
  );
}

export default function ContinueDiscoveringRow({ cards }: { cards: DiscoverCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    // -4px tolerance for sub-pixel rounding at the scroll boundary.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [cards]);

  function scrollByAmount(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 372, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      {!atStart && (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="Show previous"
          className="hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="Show next"
          className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}