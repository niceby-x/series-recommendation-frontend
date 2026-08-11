'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, ChevronLeft, ChevronRight, Sparkle, Flame, Award, PlusCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface DashboardDiscoverCard {
  id: number | string;
  title: string;
  country: string;
  mediaType: string;
  rating: number | null;
  badge: string;
  imageUrl: string | null;
  isReal: boolean;
}

// Real per-episode progress from GET /watchlist (see H2-02). Keyed by
// series id -- only ever populated for isReal cards, since mock cards
// have no backing watchlist row to match against.
interface WatchProgress {
  current_episode: number;
  total_episodes: number;
  minutes_remaining: number | null;
}

const BADGE_STYLES: Record<string, string> = {
  Continue: 'bg-rose-500/90',
  'New Episode': 'bg-sky-500/90',
  Trending: 'bg-orange-500/90',
  'Top Rated': 'bg-violet-500/90',
  'Just Added': 'bg-emerald-500/90',
};
const BADGE_ICONS: Record<string, typeof Play> = {
  Continue: Play,
  'New Episode': Sparkle,
  Trending: Flame,
  'Top Rated': Award,
  'Just Added': PlusCircle,
};

function Card({ card, progress }: { card: DashboardDiscoverCard; progress?: WatchProgress }) {
  const BadgeIcon = BADGE_ICONS[card.badge] ?? Sparkle;
  const badgeClass = BADGE_STYLES[card.badge] ?? 'bg-black/70';

  // Fraction only makes sense with a positive episode count -- guard
  // against a 0/0 or missing total_episodes producing NaN or Infinity.
  const fraction =
    progress && progress.total_episodes > 0
      ? Math.min(1, Math.max(0, progress.current_episode / progress.total_episodes))
      : null;

  const inner = (
    <div className="group relative shrink-0 w-[228px] snap-start">
      <div className="relative aspect-[16/10] w-full rounded-[18px] overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="228px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{card.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <span className={'absolute top-2.5 left-2.5 flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm ' + badgeClass}>
          <BadgeIcon className="size-2.5" />
          {card.badge}
        </span>

        <span className="absolute bottom-2.5 right-2.5 flex items-center justify-center size-8 rounded-full bg-white/90 text-primary shadow-sm transition-transform group-hover:scale-110">
          <Play className="size-3.5 fill-current ml-0.5" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-white text-[14px] font-semibold leading-snug line-clamp-1 mb-0.5">{card.title}</h3>
          <p className="text-white/75 text-[11px] flex items-center gap-1">
            {card.country} · {card.mediaType}
            {card.rating != null && (
              <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
                <Star className="size-3" fill="currentColor" /> {card.rating.toFixed(1)}
              </span>
            )}
          </p>
        </div>
      </div>

      {progress && fraction != null && (
        <>
          <div className="h-1 w-full bg-muted rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-brand-gradient rounded-full" style={{ width: (fraction * 100) + '%' }} />
          </div>
          <p className="text-muted-foreground text-[11px] mt-1">
            Episode {progress.current_episode} of {progress.total_episodes}
            {progress.minutes_remaining != null && ' · ' + progress.minutes_remaining + ' min left'}
          </p>
        </>
      )}
    </div>
  );

  if (!card.isReal) return inner;

  return (
    <Link href={'/series/' + card.id} className="block">
      {inner}
    </Link>
  );
}

export default function DashboardDiscoverRow({ cards }: { cards: DashboardDiscoverCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progressById, setProgressById] = useState<Record<number, WatchProgress>>({});

  // Per-episode progress is per-user data behind the Supabase session, so
  // it's fetched here rather than passed down from HomeAuthed (a server
  // component with no session access) -- see H2-02. A signed-out visitor
  // never reaches this authed dashboard at all, but a failed/slow fetch
  // just leaves cards without a progress bar rather than blocking the row.
  useEffect(() => {
    async function fetchProgress() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      });
      if (!res.ok) return;

      const json = await res.json();
      const entries: Array<{ series: { id: number }; progress: WatchProgress | null }> = json.data ?? [];

      const map: Record<number, WatchProgress> = {};
      for (const entry of entries) {
        if (entry.progress) {
          map[entry.series.id] = entry.progress;
        }
      }
      setProgressById(map);
    }

    fetchProgress().catch(() => {
      // Cards just render without progress bars below.
    });
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
  }, [cards]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            progress={card.isReal ? progressById[card.id as number] : undefined}
          />
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
  );
}
