'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DiscoverScrollRow({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
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
  }, [children]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {!atStart && (
        <button
          type="button"
          onClick={() => scrollerRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}
          aria-label="Show previous"
          className="hidden md:flex absolute top-[42%] -left-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          onClick={() => scrollerRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
          aria-label="Show next"
          className="hidden md:flex absolute top-[42%] -right-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}