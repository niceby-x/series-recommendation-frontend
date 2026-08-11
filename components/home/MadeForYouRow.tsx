'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Real personalized recommendations (see H3-01 -- backed by
// GET /me/recommendations). Fetched client-side, same auth-header pattern
// as BloomJourneyCard/RecentActivityCard, since it needs the signed-in
// user's session token and isn't available at the server-render pass that
// fetches allSeries in app/page.tsx.
//
// has_enough_signal is the backend's own call on whether it had anything
// to work with (ratings, watchlist) -- when false, this deliberately
// shows a "rate a few shows" prompt instead of an empty/hidden section,
// same "don't fabricate, be honest about the gap" convention
// RecentActivityCard established for H2-04.
interface RecommendationItem {
  id: number;
  title: string;
  poster_url: string | null;
  year: number;
  country: string;
  score: number;
  match_reasons: string[];
}

interface RecommendationsResponse {
  has_enough_signal: boolean;
  count: number;
  data: RecommendationItem[];
}

function Card({ item }: { item: RecommendationItem }) {
  const topReason = item.match_reasons[0];

  return (
    <Link href={'/series/' + item.id} className="group relative shrink-0 w-[228px] snap-start block">
      <div className="relative aspect-[16/10] w-full rounded-[18px] overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {item.poster_url ? (
          <Image
            src={item.poster_url}
            alt={item.title}
            fill
            sizes="228px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{item.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <span className="absolute bottom-2.5 right-2.5 flex items-center justify-center size-8 rounded-full bg-white/90 text-primary shadow-sm transition-transform group-hover:scale-110">
          <Play className="size-3.5 fill-current ml-0.5" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-white text-[14px] font-semibold leading-snug line-clamp-1 mb-0.5">{item.title}</h3>
          <p className="text-white/75 text-[11px]">
            {item.country} · {item.year}
          </p>
        </div>
      </div>

      {/* match_reasons is ordered strongest-first -- the top reason is the
          "Because you liked X" copy the design review specifically asked
          for. Rest of the list is available (item.match_reasons) but not
          shown here to keep the card scannable at a glance. */}
      {topReason && (
        <p className="text-muted-foreground text-[11px] mt-1.5 line-clamp-1">
          Because you liked <span className="text-foreground font-medium">{topReason}</span>
        </p>
      )}
    </Link>
  );
}

export default function MadeForYouRow() {
  const [result, setResult] = useState<RecommendationsResponse | null>(null);
  const [error, setError] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/me/recommendations', {
          headers: { Authorization: 'Bearer ' + session.access_token },
        });

        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }

        const json = await res.json();
        if (!cancelled) setResult(json as RecommendationsResponse);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [result]);

  // Nothing to fetch yet, and nothing worth rendering if it failed --
  // Made For You is a nice-to-have discovery row, not something worth a
  // prominent error state taking up space in the main content column.
  if (error || result === null) return null;

  // Real "not enough signal" state, not a fabricated row -- same honesty
  // convention as RecentActivityCard's empty state.
  if (!result.has_enough_signal || result.data.length === 0) {
    return (
      <section className="mb-10">
        <h2 className="font-heading text-[22px] font-normal text-foreground mb-4">Made For You</h2>
        <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
          <p className="text-foreground font-semibold mb-1">Unlock your personalized picks</p>
          <p className="text-muted-foreground text-sm">
            Rate a few shows or add them to your watchlist, and we&apos;ll start matching you to stories you&apos;ll
            love. In the meantime,{' '}
            <Link href="/series" className="text-primary font-semibold hover:opacity-80 transition-opacity">
              browse the full catalog
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-heading text-[22px] font-normal text-foreground">Made For You</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Matched to what you rate and watch</p>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {result.data.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>

        {!atStart && (
          <button
            type="button"
            onClick={() => scrollerRef.current?.scrollBy({ left: -472, behavior: 'smooth' })}
            aria-label="Show previous"
            className="hidden md:flex absolute top-[42%] -left-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
        {!atEnd && (
          <button
            type="button"
            onClick={() => scrollerRef.current?.scrollBy({ left: 472, behavior: 'smooth' })}
            aria-label="Show next"
            className="hidden md:flex absolute top-[42%] -right-4 -translate-y-1/2 items-center justify-center size-9 rounded-full bg-card border border-border shadow-md text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}
