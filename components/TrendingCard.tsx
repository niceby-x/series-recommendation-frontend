'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Crown, Heart, Star } from 'lucide-react';
import type { SeriesCardData } from './SeriesCard';

// Rank-based pill styling for the "N Trending" badge. Rank 1 gets a warm
// gold-to-pink gradient with a crown instead of a number; 2 and 3 get their
// own gradient + number so the podium still reads as a ranking at a glance.
const RANK_BADGE_CLASSES: Record<number, string> = {
  1: 'bg-gradient-to-r from-amber-400 to-pink-400',
  2: 'bg-gradient-to-r from-purple-400 to-indigo-400',
  3: 'bg-gradient-to-r from-orange-400 to-pink-400',
};

// Small circular rank badge used on compact (4-7) cards.
const RANK_DOT_CLASSES: Record<number, string> = {
  4: 'bg-gradient-to-br from-brand-lilac to-purple-400',
  5: 'bg-gradient-to-br from-brand-blush to-pink-400',
  6: 'bg-gradient-to-br from-brand-lilac to-indigo-400',
  7: 'bg-gradient-to-br from-brand-blush to-rose-400',
};

interface TrendingCardProps {
  series: SeriesCardData;
  rank: number;
  rating: number | null;
  genres: string[];
  variant: 'featured' | 'compact';
}

export default function TrendingCard({ series, rank, rating, genres, variant }: TrendingCardProps) {
  // Visual only — not persisted yet, same as the bookmark toggle on SeriesCard.
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const isFeatured = variant === 'featured';
  const isTopRank = rank === 1;

  return (
    <Link
      href={'/series/' + series.id}
      className={
        'group relative block overflow-hidden rounded-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ' +
        (isFeatured ? 'aspect-[4/3]' : 'aspect-[16/10]') +
        (isTopRank ? ' shadow-[0_0_45px_-12px_rgba(247,182,200,0.75)] ring-1 ring-brand-blush/40' : '')
      }
    >
      {series.poster_url ? (
        <Image
          src={series.poster_url}
          alt={series.title}
          fill
          sizes={isFeatured ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 50vw, 25vw'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-mauve to-[#2E2438]" />
      )}

      {/* Bottom-heavy scrim so title/meta stay legible over any poster */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />

      {/* Rank badge */}
      {isFeatured ? (
        <span
          className={
            'absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm ' +
            (RANK_BADGE_CLASSES[rank] ?? RANK_BADGE_CLASSES[3])
          }
        >
          {isTopRank && <Crown className="size-3.5" fill="currentColor" />}
          {isTopRank ? 'Trending' : `${rank} Trending`}
        </span>
      ) : (
        <span
          className={
            'absolute top-3 left-3 flex items-center justify-center size-7 rounded-full text-[13px] font-bold text-white shadow-sm ' +
            (RANK_DOT_CLASSES[rank] ?? 'bg-brand-gradient')
          }
        >
          {rank}
        </span>
      )}

      {/* Heart + bookmark (featured) / bookmark only (compact) */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isFeatured && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLiked((v) => !v);
            }}
            aria-label={liked ? 'Remove like' : 'Like this series'}
            className="flex items-center justify-center size-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
          >
            <Heart className={'size-4 ' + (liked ? 'fill-brand-blush text-brand-blush' : 'text-white')} />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setBookmarked((v) => !v);
          }}
          aria-label={bookmarked ? 'Remove from list' : 'Add to list'}
          className={
            'flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors ' +
            (isFeatured ? 'size-8' : 'size-7')
          }
        >
          <Bookmark className={(isFeatured ? 'size-4 ' : 'size-3.5 ') + (bookmarked ? 'fill-white text-white' : 'text-white')} />
        </button>
      </div>

      {/* Title, meta, tags */}
      <div className={'absolute inset-x-0 bottom-0 ' + (isFeatured ? 'p-4 md:p-5' : 'p-3')}>
        <h3
          className={
            'font-semibold text-white drop-shadow-sm leading-snug line-clamp-2 ' +
            (isFeatured ? 'text-xl md:text-2xl mb-1.5' : 'text-[15px] mb-1')
          }
        >
          {series.title}
        </h3>
        <div className={'flex items-center gap-1.5 text-white/90 ' + (isFeatured ? 'text-[14px] mb-2.5' : 'text-[12px] mb-1.5')}>
          {rating != null && (
            <>
              <Star className={(isFeatured ? 'size-3.5 ' : 'size-3 ') + 'fill-yellow-400 text-yellow-400'} />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-white/50">|</span>
            </>
          )}
          <span>{series.episode_count} Episodes</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((genre) => (
            <span
              key={genre}
              className={
                'rounded-full bg-white/15 backdrop-blur-sm text-white font-medium ' +
                (isFeatured ? 'text-[12px] px-2.5 py-1' : 'text-[11px] px-2 py-0.5')
              }
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}