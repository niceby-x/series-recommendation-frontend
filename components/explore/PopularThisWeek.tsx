'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, ChevronRight, Flame, Star } from 'lucide-react';
import type { SeriesCardData } from '../SeriesCard';
import { mockGenreLabelsFor, mockRatingFor } from '../../lib/exploreMock';

const TOP_BADGE_CLASSES: Record<number, string> = {
  1: 'bg-gradient-to-r from-amber-400 to-pink-400',
  2: 'bg-gradient-to-r from-purple-400 to-indigo-400',
  3: 'bg-gradient-to-r from-orange-400 to-pink-400',
};

function PopularCard({ series, rank }: { series: SeriesCardData; rank: number }) {
  const [bookmarked, setBookmarked] = useState(false);
  const rating = mockRatingFor(series.id);
  const genres = mockGenreLabelsFor(series.id).slice(0, 2);

  return (
    <Link
      href={`/series/${series.id}`}
      className="group relative shrink-0 w-[190px] snap-start rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[2/3] w-full bg-muted">
        {series.poster_url ? (
          <Image
            src={series.poster_url}
            alt={series.title}
            fill
            sizes="190px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 p-3">
            <span className="font-heading text-xs text-center text-muted-foreground">{series.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {rank <= 3 ? (
          <span
            className={
              'absolute top-2 left-2 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-sm ' +
              TOP_BADGE_CLASSES[rank]
            }
          >
            TOP {rank}
          </span>
        ) : (
          <span className="absolute top-2 left-2 flex items-center justify-center size-6 rounded-full bg-brand-gradient text-white text-[11px] font-bold shadow-sm">
            {rank}
          </span>
        )}

        <button
          type="button"
          aria-label={bookmarked ? 'Remove from list' : 'Save to my list'}
          onClick={(e) => {
            e.preventDefault();
            setBookmarked((v) => !v);
          }}
          className="absolute top-2 right-2 flex items-center justify-center size-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
        >
          <Bookmark className={'size-3.5 ' + (bookmarked ? 'fill-white text-white' : 'text-white')} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-white text-[14px] font-semibold leading-snug line-clamp-1 mb-1 drop-shadow-sm">
            {series.title}
          </h3>
          <div className="flex items-center gap-1 text-white/90 text-[12px] mb-1.5">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-white/50">·</span>
            <span>{series.year}</span>
            <span className="text-white/50">·</span>
            <span className="truncate">{series.country}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PopularThisWeek({ items }: { items: SeriesCardData[] }) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <section id="popular-this-week">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-heading text-[24px] font-normal text-foreground">
          <span className="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-orange-100 to-brand-blush/40 text-orange-500 shrink-0">
            <Flame className="size-4.5" fill="currentColor" />
          </span>
          Popular This Week
        </h2>
        <Link
          href="/series?sort=popular"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
        >
          View All
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="relative">
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
        >
          {items.map((series, i) => (
            <PopularCard key={series.id} series={series} rank={i + 1} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => rowRef.current?.scrollBy({ left: 380, behavior: 'smooth' })}
          aria-label="Scroll popular row"
          className="hidden md:flex absolute top-1/3 -right-4 items-center justify-center size-9 rounded-full bg-white shadow-md border border-border text-brand-mauve hover:bg-accent transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
