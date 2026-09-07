'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Shared horizontal-scroll wrapper with edge arrows -- used by Discover,
// Tropes, and New Releases (originally lived in components/discover/ as
// DiscoverScrollRow, renamed+moved here once a third page started using
// it and the old name/location stopped being accurate).
export default function ScrollRow({ children }: { children: React.ReactNode }) {
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
        // pt-2 gives headroom for cards that lift on hover (group-hover:-translate-y-1)
        // -- without it, the scroller's overflow-x-auto forces overflow-y to clip too
        // (a well-known CSS quirk: an element with one overflow axis set to a value
        // other than 'visible' can't leave the other axis truly 'visible'), so a
        // hovered card's top edge gets cut off instead of lifting cleanly.
        className="flex gap-4 overflow-x-auto pt-2 pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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