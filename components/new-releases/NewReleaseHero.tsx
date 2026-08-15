'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Play, Plus, Star } from 'lucide-react';

export interface NewReleaseHeroSlide {
  id: number | string;
  title: string;
  country: string;
  year: number;
  rating: number | null;
  synopsis: string;
  imageUrl: string | null;
}

const AUTOPLAY_MS = 7000;

// A distinct visual from HeroCarousel on purpose (see mockup): text stays
// left-aligned over a horizontal gradient rather than bottom-aligned over
// a vertical one, single next-arrow rather than a prev/next pair, and a
// "NEW RELEASE" pill instead of a star/editor's-pick badge.
export default function NewReleaseHero({ slides }: { slides: NewReleaseHeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[active];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(88,54,99,0.12)] aspect-[16/9] md:aspect-[21/9] bg-muted">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              sizes="(max-width: 768px) 100vw, 70vw"
              priority={active === 0}
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-mauve to-[#2E2438]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 max-w-xl">
            <span className="inline-flex w-fit bg-rose-500/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide mb-3">
              NEW RELEASE
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-normal text-white mb-2 leading-tight">{slide.title}</h2>
            <p className="text-white/75 text-[14px] flex items-center gap-1.5 mb-3">
              {slide.country} · Series · {slide.year}
              {slide.rating != null && (
                <span className="inline-flex items-center gap-1 text-brand-gold ml-1.5">
                  <Star className="size-3.5" fill="currentColor" /> {slide.rating.toFixed(1)}
                </span>
              )}
            </p>
            <p className="text-white/80 text-[14.5px] leading-relaxed line-clamp-3 mb-5">{slide.synopsis}</p>
            <div className="flex items-center gap-2.5">
              <Link
                href={'/series/' + slide.id}
                className="inline-flex items-center gap-1.5 bg-brand-gradient text-white text-[14px] font-semibold px-5 py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity"
              >
                <Play className="size-3.5 fill-current" />
                Watch Now
              </Link>
              <button
                type="button"
                aria-label="Add to watchlist"
                className="flex items-center justify-center size-10 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <button
          type="button"
          onClick={() => setActive((i) => (i + 1) % slides.length)}
          aria-label="Next release"
          className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center size-9 rounded-full bg-white/85 hover:bg-white text-brand-mauve shadow-sm transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={'Go to slide ' + (i + 1)}
              className={'h-1.5 rounded-full transition-all ' + (i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
