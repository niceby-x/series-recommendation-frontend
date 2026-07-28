'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export interface CarouselSlide {
  id: number | string;
  title: string;
  posterUrl: string | null;
  badge: string; // e.g. "Editor's Pick"
  statusLabel: string; // e.g. "On Air"
  meta: string; // e.g. "Episode 7 · Every Saturday"
  tags: string[];
  isReal: boolean; // false for mock/placeholder slides — see app/page.tsx
}

const AUTOPLAY_MS = 6000;

export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[active];

  function goTo(index: number) {
    setActive(((index % slides.length) + slides.length) % slides.length);
  }

  const CardInner = (
    <div className="group relative block rounded-lg overflow-hidden shadow-[0_20px_60px_rgba(88,54,99,0.12)] aspect-[16/10] bg-muted">
      {slide.posterUrl ? (
        <Image
          src={slide.posterUrl}
          alt={slide.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-blush/35 to-brand-lilac/35" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      <span className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 text-[13px] font-semibold px-3 py-1 rounded-full text-brand-mauve">
        ★ {slide.badge}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
        }}
        className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/95 text-brand-mauve text-[16px] font-semibold px-4 py-2.5 rounded-full hover:bg-white transition-colors"
      >
        <Play className="size-3.5 fill-current" />
        Watch Trailer
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-6 pr-32">
        <span className="inline-block bg-brand-blush text-[#4A2F3F] text-[13px] font-semibold px-2.5 py-1 rounded-full mb-2">
          {slide.statusLabel}
        </span>
        <h2 className="font-heading text-[20px] md:text-[28px] leading-[1.1] font-normal text-white mb-1">{slide.title}</h2>
        <p className="text-white/70 text-[14px] mb-3">{slide.meta}</p>
        {slide.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slide.tags.map((tag) => (
              <span key={tag} className="bg-white/15 text-white text-[13px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {slide.isReal ? <Link href={'/series/' + slide.id}>{CardInner}</Link> : CardInner}

      {slides.length > 1 && (
        <>
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous"
              className="flex items-center justify-center size-8 rounded-full bg-white/80 hover:bg-white text-brand-mauve transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next"
              className="flex items-center justify-center size-8 rounded-full bg-white/80 hover:bg-white text-brand-mauve transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={'Go to slide ' + (i + 1)}
                className={
                  'h-1.5 rounded-full transition-all ' +
                  (i === active ? 'w-6 bg-primary' : 'w-1.5 bg-border')
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}