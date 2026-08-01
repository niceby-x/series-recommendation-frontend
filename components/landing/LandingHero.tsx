'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ListFilter,
  Star,
  ChevronRight,
  ChevronLeft,
  Plus,
  Heart,
  Sparkles,
  ShieldCheck,
  Leaf,
  Flame,
  GraduationCap,
} from 'lucide-react';
import type { HeroFeature } from '../../lib/landingContent';
import PetalDecoration from '../home/PetalDecoration';

const AUTO_ADVANCE_MS = 6000;
const WORD_ROTATE_MS = 2400;

// The rotating final word of the headline. Colors pair a brand base tone
// with brand-gold for the text-shine sweep (see globals.css).
const ROTATING_WORDS = [
  { text: 'B L O O M', c1: 'var(--color-brand-purple-vivid)' },
  { text: 'U N F O L D', c1: 'var(--color-brand-pink-vivid)' },
  { text: 'C O N N E C T', c1: 'var(--color-brand-mauve)' },
  { text: 'S H I N E', c1: 'var(--color-brand-pink-vivid)' },
] as const;

// Fixed positions/delays for the sparkle points beside the rotating word —
// deterministic (not Math.random on render) to avoid SSR/hydration mismatch.
// More points, smaller and irregular, with quick staggered timing — reads
// like sunlight glinting off water rather than slow fairy-dust flicker.
const SPARKLES = [
  { left: '2%', top: '15%', size: 3, delay: 0, duration: 1.1 },
  { left: '14%', top: '55%', size: 2, delay: 0.35, duration: 0.9 },
  { left: '24%', top: '25%', size: 4, delay: 0.15, duration: 1.3 },
  { left: '30%', top: '75%', size: 2, delay: 0.7, duration: 1 },
  { left: '42%', top: '10%', size: 3, delay: 0.5, duration: 1.05 },
  { left: '50%', top: '60%', size: 5, delay: 0.9, duration: 1.2 },
  { left: '62%', top: '30%', size: 2, delay: 0.2, duration: 0.85 },
  { left: '70%', top: '65%', size: 3, delay: 1.1, duration: 1.15 },
  { left: '78%', top: '20%', size: 4, delay: 0.45, duration: 1 },
  { left: '88%', top: '50%', size: 2, delay: 0.8, duration: 0.95 },
  { left: '92%', top: '15%', size: 3, delay: 1.3, duration: 1.1 },
] as const;

const TRUST_BADGES = [
  { icon: Heart, label: 'Curated with love' },
  { icon: Sparkles, label: 'Stories that stay with you' },
  { icon: ShieldCheck, label: 'Safe Space for everyone' },
] as const;

// Same honest-link note as BrowseByMoodGrid.tsx -- mood filtering isn't a
// real Explore filter yet, so these point at the plain catalog for now.
const TRENDING_MOODS = [
  { icon: Leaf, label: 'Healing' },
  { icon: Flame, label: 'Slow Burn' },
  { icon: GraduationCap, label: 'School Life' },
  { icon: Heart, label: 'Friends to Lovers' },
] as const;
// visible card; 1 and 2 sit behind it, peeking out to the sides.
const STACK_STYLES = [
  { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', zIndex: 30, opacity: 1 },
  { transform: 'translate(10px, -8px) rotate(6deg) scale(0.96)', zIndex: 20, opacity: 0.92 },
  { transform: 'translate(-8px, -12px) rotate(-4deg) scale(0.92)', zIndex: 10, opacity: 0.85 },
];

export default function LandingHero({ deck }: { deck: HeroFeature[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (deck.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % deck.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [deck.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, WORD_ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  function advance() {
    if (deck.length < 2) return;
    setActiveIndex((i) => (i + 1) % deck.length);
  }

  function goBack() {
    if (deck.length < 2) return;
    setActiveIndex((i) => (i - 1 + deck.length) % deck.length);
  }

  return (
    <div className="relative overflow-hidden h-full">
      <style>{`
        @keyframes chevron-nudge-left {
          0%, 100% { transform: translateX(0); opacity: 0.55; }
          50% { transform: translateX(-5px); opacity: 1; }
        }
        @keyframes chevron-nudge-right {
          0%, 100% { transform: translateX(0); opacity: 0.55; }
          50% { transform: translateX(5px); opacity: 1; }
        }
      `}</style>
      <Image
        src="/hero-bg-v3.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover pointer-events-none"
      />
      {/* Wash on the left so the headline stays legible over the photo
          regardless of viewport width/crop -- the photo itself is soft
          enough on the right that the card doesn't need this. */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/35 to-transparent pointer-events-none" />

      <PetalDecoration />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-14 pt-[104px] md:pt-[120px] pb-[104px] md:pb-[120px] grid md:grid-cols-[1fr_1fr] gap-8 md:gap-10 items-start">
        <div className="pt-2 md:pt-4 min-w-0">
          <p className="flex items-center gap-1.5 text-primary text-[13px] font-bold tracking-wide mb-3">
            <span aria-hidden>🌸</span> CURATED WITH LOVE
          </p>
          <h1 className="font-heading text-[44px] md:text-[60px] leading-[1.05] font-normal mb-4">
            <span className="text-foreground">Where Stories</span>
            <br />
            <span className="relative inline-block text-[52px] md:text-[72px] leading-none mt-1">
              <span
                key={wordIndex}
                className="text-shine animate-word-in inline-block"
                style={{
                  ['--shine-c1' as string]: ROTATING_WORDS[wordIndex].c1,
                  ['--shine-c2' as string]: 'var(--color-brand-gold)',
                }}
              >
                {ROTATING_WORDS[wordIndex].text}
              </span>
              <span className="absolute inset-0 pointer-events-none" aria-hidden>
                {SPARKLES.map((s, i) => (
                  <span
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: s.left,
                      top: s.top,
                      width: s.size,
                      height: s.size,
                      background: '#fffbea',
                      boxShadow: '0 0 5px 1.5px var(--color-brand-gold)',
                      animation:
                        'sparkle-flicker ' + s.duration + 's ease-in-out ' + s.delay + 's infinite',
                    }}
                  />
                ))}
              </span>
            </span>
          </h1>
          <p className="text-muted-foreground text-[17px] leading-relaxed mb-6 max-w-md">
            Discover thoughtfully curated BL series, movies, and anime through moods, tropes,
            emotional journeys, and trusted recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-7">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex items-center justify-center size-8 rounded-full bg-white/70 backdrop-blur-sm text-primary shrink-0">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="text-foreground/80 text-[13.5px] font-medium leading-tight max-w-[110px]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/series"
              className="inline-flex items-center gap-2 bg-brand-gradient text-white text-[15px] font-semibold px-7 py-3.5 rounded-[10px] shadow-sm hover:opacity-90 transition-opacity"
            >
              Discover Stories
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/series"
              className="inline-flex items-center gap-2 border border-border bg-card text-[15px] font-semibold px-7 py-3.5 rounded-[10px] text-foreground hover:bg-muted transition-colors"
            >
              Browse by Mood
              <ListFilter className="size-4" />
            </Link>
          </div>

          <div className="mt-7">
            <p className="text-muted-foreground text-[12px] font-bold uppercase tracking-wide mb-2.5">
              Trending Moods
            </p>
            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              {/* Track is rendered twice back-to-back; animate-marquee slides
                  exactly -50% (one copy's width) so the loop is seamless.
                  Pauses on hover/focus so the pills stay tappable. */}
              <div className="flex w-max flex-nowrap gap-1.5 animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
                {[...TRENDING_MOODS, ...TRENDING_MOODS].map(({ icon: Icon, label }, i) => (
                  <Link
                    key={`${label}-${i}`}
                    href="/series"
                    aria-hidden={i >= TRENDING_MOODS.length}
                    tabIndex={i >= TRENDING_MOODS.length ? -1 : undefined}
                    className="inline-flex items-center gap-1 shrink-0 bg-card/80 backdrop-blur-sm border border-border text-foreground text-[12px] font-medium px-2.5 py-1.5 rounded-full hover:bg-card hover:border-ring transition-colors"
                  >
                    <Icon className="size-3 text-primary" strokeWidth={1.75} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[300px] lg:max-w-[360px] aspect-[3/4]">
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

                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-brand-blush/40 backdrop-blur-md border border-white/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <Star className="size-2 text-brand-gold" fill="currentColor" />
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
            <>
              <button
                type="button"
                onClick={goBack}
                aria-label="Show previous pick"
                className="absolute top-1/2 -translate-y-1/2 -left-14 md:-left-16 z-40 flex items-center justify-center size-11 text-brand-mauve drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] hover:scale-110 hover:text-brand-blush transition-all"
              >
                <ChevronLeft
                  className="size-5 -mr-2.5"
                  strokeWidth={2.5}
                  style={{ animation: 'chevron-nudge-left 1.3s ease-in-out infinite' }}
                />
                <ChevronLeft
                  className="size-5"
                  strokeWidth={2.5}
                  style={{ animation: 'chevron-nudge-left 1.3s ease-in-out 0.15s infinite' }}
                />
              </button>
              <button
                type="button"
                onClick={advance}
                aria-label="Show next pick"
                className="absolute top-1/2 -translate-y-1/2 -right-14 md:-right-16 z-40 flex items-center justify-center size-11 text-brand-mauve drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] hover:scale-110 hover:text-brand-blush transition-all"
              >
                <ChevronRight
                  className="size-5"
                  strokeWidth={2.5}
                  style={{ animation: 'chevron-nudge-right 1.3s ease-in-out infinite' }}
                />
                <ChevronRight
                  className="size-5 -ml-2.5"
                  strokeWidth={2.5}
                  style={{ animation: 'chevron-nudge-right 1.3s ease-in-out 0.15s infinite' }}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}