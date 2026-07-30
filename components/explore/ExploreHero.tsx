'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { SeriesCardData } from '../SeriesCard';

const AUTOPLAY_MS = 6000;

export default function ExploreHero({ backgrounds }: { backgrounds: SeriesCardData[] }) {
  const [active, setActive] = useState(0);
  const count = backgrounds.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count]);

  function goTo(i: number) {
    setActive(((i % count) + count) % count);
  }

  const current = backgrounds[active];
  const imageUrl = current ? (current.backdrop_url ?? current.poster_url) : null;

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[21/9] min-h-[280px] bg-muted shadow-sm">
      <AnimatePresence mode="sync">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="100vw"
              priority={active === 0}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-blush/40 to-brand-lilac/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full flex flex-col justify-center px-8 md:px-12 max-w-xl">
        <h1 className="font-heading text-[36px] md:text-[46px] leading-[1.05] font-normal text-white mb-3">
          Find Your
          <br />
          <span className="text-brand-blush">Next Favorite</span>{' '}
          <Sparkles className="inline size-7 text-brand-blush align-middle" />
        </h1>
        <p className="text-white/85 text-[16px] mb-6">
          Thousands of BL series. Endless stories to explore.
        </p>
        <a
          href="#popular-this-week"
          className="inline-flex items-center gap-2 w-fit bg-brand-gradient text-white text-[15px] font-semibold px-6 py-3 rounded-full shadow-sm hover:opacity-90 transition-opacity"
        >
          Start Exploring
          <ArrowRight className="size-4" />
        </a>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute bottom-5 right-6 flex items-center gap-1.5">
            {backgrounds.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
