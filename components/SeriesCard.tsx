'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Star } from 'lucide-react';

export interface SeriesCardData {
  id: number;
  title: string;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
  poster_url: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  airing: 'On Air',
  completed: 'Completed',
  upcoming: 'Coming Soon',
};

const STATUS_CLASSES: Record<string, string> = {
  airing: 'bg-brand-blush text-[#4A2F3F]',
  completed: 'bg-brand-lilac text-[#3D2E52]',
  upcoming: 'bg-white/90 text-foreground',
};

const RANK_CLASSES: Record<number, string> = {
  1: 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-2 ring-amber-200',
  2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 ring-2 ring-slate-200',
  3: 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 ring-2 ring-orange-200',
};

interface SeriesCardProps {
  series: SeriesCardData;
  rank?: number; // renders a numbered badge, top-left — used on the Trending row
  rating?: number | null; // renders a star badge, bottom-right of the poster. Real
  // rating data isn't populated yet (the `ratings` table is currently empty) — see
  // app/page.tsx for how mock ratings are used to fill this in until that changes.
}

export default function SeriesCard({ series, rank, rating }: SeriesCardProps) {
  const statusLabel = STATUS_LABELS[series.status] ?? series.status;
  const statusClass = STATUS_CLASSES[series.status] ?? 'bg-white/90 text-foreground';
  const [bookmarked, setBookmarked] = useState(false); // visual only — not persisted yet

  return (
    <Link
      href={'/series/' + series.id}
      className="group relative block overflow-hidden rounded-lg bg-card border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-primary/30"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {series.poster_url ? (
          <Image
            src={series.poster_url}
            alt={series.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 p-4">
            <span className="text-[14px] font-semibold text-center text-muted-foreground">
              {series.title}
            </span>
          </div>
        )}

        {rank !== undefined ? (
          <span
            className={
              'absolute top-3 left-3 flex items-center justify-center size-7 rounded-full text-[13px] font-bold shadow-sm transition-transform group-hover:scale-110 ' +
              (RANK_CLASSES[rank] ?? 'bg-brand-gradient text-white')
            }
          >
            {rank}
          </span>
        ) : (
          <span className={'absolute top-3 left-3 text-[13px] font-semibold px-2.5 py-1 rounded-full shadow-sm ' + statusClass}>
            {statusLabel}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setBookmarked((b) => !b);
          }}
          aria-label={bookmarked ? 'Remove from list' : 'Add to list'}
          className="absolute top-3 right-3 flex items-center justify-center size-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
        >
          <Bookmark className={'size-3.5 ' + (bookmarked ? 'fill-white text-white' : 'text-white')} />
        </button>

        {rating != null && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[13px] font-semibold px-2 py-1 rounded-full">
            <Star className="size-3 fill-brand-blush text-brand-blush" />
            {rating.toFixed(1)}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-[14px] text-white/90 line-clamp-5">
            {series.synopsis || 'No synopsis available yet.'}
          </p>
        </div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center mb-1 text-[14px] text-muted-foreground">
          <span>{series.country}</span>
          <span>{series.year}</span>
        </div>
        <h3 className="text-[20px] font-semibold leading-snug line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
          {series.title}
        </h3>
        <p className="text-[14px] text-muted-foreground mt-1">{series.episode_count} episodes</p>
      </div>
    </Link>
  );
}