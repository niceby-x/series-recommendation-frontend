'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MOCK_MOODS } from '../../lib/landingContent';

// Mood filtering isn't wired into Explore yet -- same honest fallback as
// BrowseByMoodGrid.tsx: link to the plain catalog rather than a ?mood=
// param nothing reads. Uses the same MOCK_MOODS list as the landing
// page's BrowseByMoodGrid so the two never drift out of sync.
export default function MoodFeelingRow() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
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
  }, []);

  return (
    <section className="mb-10">
      <h2 className="font-heading text-[22px] font-normal text-foreground mb-4">How are you feeling?</h2>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MOCK_MOODS.map((mood) => {
            return (
              <Link
                key={mood.name}
                href="/series"
                className={
                  'group relative shrink-0 w-[152px] aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ' +
                  mood.gradient
                }
              >
                {mood.image && (
                  <img
                    src={mood.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    aria-hidden
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent" aria-hidden />
                <div className="absolute bottom-0 left-0 px-4 pb-4">
                  <p className="font-heading text-lg font-normal text-[#4A2F3F]">{mood.name}</p>
                  <p className="text-[#4A2F3F]/60 text-[12px] mt-0.5">{mood.count} stories</p>
                </div>
              </Link>
            );
          })}
        </div>

        {!atEnd && (
          <button
            type="button"
            onClick={() => scrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            aria-label="Show more moods"
            className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}