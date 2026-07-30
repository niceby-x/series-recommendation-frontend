'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight } from 'lucide-react';
import type { DiscoverCard } from '../../lib/landingContent';

function Card({ card }: { card: DiscoverCard }) {
  const inner = (
    <div className="group relative shrink-0 w-[170px] rounded-2xl overflow-hidden bg-card border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[2/3] w-full bg-muted">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="170px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{card.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        <span className="absolute top-2.5 left-2.5 bg-white/90 text-[#4A2F3F] text-[10px] font-bold px-2 py-1 rounded-full">
          {card.badge}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-foreground text-[13px] font-semibold leading-snug line-clamp-1">{card.title}</h3>
        <p className="text-muted-foreground text-[11px] mt-0.5 flex items-center gap-1">
          {card.country} · {card.mediaType}
          <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
            <Star className="size-3" fill="currentColor" /> {card.rating.toFixed(1)}
          </span>
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {card.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-muted text-foreground/70 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
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

  function scrollNext() {
    scrollerRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Show more"
        className="hidden md:flex absolute top-1/3 -right-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
