'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ListFilter, Star, ChevronRight, Plus } from 'lucide-react';
import type { HeroFeature } from '../../lib/landingContent';
import PetalDecoration from '../home/PetalDecoration';

const AUTO_ADVANCE_MS = 6000;

// Per-position styling for the card stack. Index 0 is always the front,
// visible card; 1 and 2 sit behind it, peeking out to the sides.
const STACK_STYLES = [
  { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', zIndex: 30, opacity: 1 },
  { transform: 'translate(10px, -8px) rotate(6deg) scale(0.96)', zIndex: 20, opacity: 0.92 },
  { transform: 'translate(-8px, -12px) rotate(-4deg) scale(0.92)', zIndex: 10, opacity: 0.85 },
];

export default function LandingHero({ deck }: { deck: HeroFeature[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (deck.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % deck.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [deck.length]);

  function advance() {
    if (deck.length < 2) return;
    setActiveIndex((i) => (i + 1) % deck.length);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/40 via-background to-brand-lilac/40" />
      <PetalDecoration />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-14 py-10 md:py-14 grid md:grid-cols-[1fr_1fr] gap-8 md:gap-10 items-start">
        <div className="pt-2 md:pt-4">
          <p className="flex items-center gap-1.5 text-primary text-[13px] font-bold tracking-wide mb-3">
            <span aria-hidden>🌸</span> CURATED WITH LOVE
          </p>
          <h1 className="font-heading text-[44px] md:text-[60px] leading-[1.05] font-normal mb-4">
            <span className="text-foreground">Where</span>
            <br />
            <span className="text-foreground">Stories</span>
            <br />
            <span className="text-primary">Bloom</span>
          </h1>
          <p className="text-muted-foreground text-[17px] leading-relaxed mb-6 max-w-md">
            Discover thoughtfully curated BL series, movies, and anime through moods, tropes,
            emotional journeys, and trusted recommendations.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/series"
              className="inline-flex items-center gap-2 bg-brand-gradient text-white text-[15px] font-semibold px-7 py-3.5 rounded-full shadow-sm hover:opacity-90 transition-opacity"
            >
              Discover Stories
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/series"
              className="inline-flex items-center gap-2 border border-border bg-card text-[15px] font-semibold px-7 py-3.5 rounded-full text-foreground hover:bg-muted transition-colors"
            >
              Browse by Mood
              <ListFilter className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[310px] lg:max-w-[370px] aspect-[3/4]">
          {/* purely decorative -- peeks out behind the real card stack, no data/interaction */}
          <div className="absolute inset-0 rounded-[28px] bg-brand-blush/45 backdrop-blur-md border-2 border-white/60 -rotate-6 -translate-x-4 translate-y-2 z-[2] pointer-events-none" />
          <div className="absolute inset-0 rounded-[28px] bg-brand-lilac/45 backdrop-blur-md border-2 border-white/50 rotate-9 translate-x-5 translate-y-3 z-[1] pointer-events-none" />

          {deck.map((card, i) => {
            const offset = (i - activeIndex + deck.length) % deck.length;
            const style = STACK_STYLES[offset] ?? STACK_STYLES[STACK_STYLES.length - 1];
            const isFront = offset === 0;

            return (
              <div
                key={card.id}
                className="absolute inset-0 rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(88,54,99,0.18)] bg-card border-2 border-white/70 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                style={style}
                aria-hidden={!isFront}
              >
                <div className="relative w-full h-full bg-muted">
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      sizes="370px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30 px-6 text-center">
                      <span className="text-muted-foreground text-sm">{card.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/20 to-transparent" />

                  <span className="absolute top-4 left-4 flex items-center gap-1 bg-brand-gradient text-white text-[12px] font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                    <Star className="size-3" fill="currentColor" />
                    CURATOR&apos;S PICK
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-white text-[21px] font-semibold leading-tight mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-white/75 text-[13px] mb-3">
                      {card.country} · Series · {card.year}{' '}
                      <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
                        <Star className="size-3" fill="currentColor" /> {card.rating}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={'/series/' + card.id}
                        tabIndex={isFront ? 0 : -1}
                        className="flex-1 text-center bg-brand-gradient text-white text-[14px] font-semibold py-3 rounded-full hover:opacity-90 transition-opacity"
                      >
                        View Story
                      </Link>
                      <span className="flex items-center justify-center size-10 rounded-full bg-white/15 backdrop-blur-sm text-white shrink-0">
                        <Plus className="size-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {deck.length > 1 && (
            <button
              type="button"
              onClick={advance}
              aria-label="Show next pick"
              className="absolute -top-4 -right-4 z-40 flex items-center justify-center size-11 rounded-full bg-white shadow-md text-primary hover:bg-muted transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}