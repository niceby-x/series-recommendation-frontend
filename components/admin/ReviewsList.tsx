'use client';

import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';

export interface ReviewRow {
  id: number;
  score: number;
  review_text: string | null;
  users: { username: string; email: string } | null;
  series: { id: number; title: string; poster_url: string | null } | null;
}

function UserAvatar({ name }: { name: string }) {
  return (
    <span className="flex items-center justify-center size-7 rounded-full bg-brand-lilac/40 text-[#5E4B6B] text-[11px] font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function ReviewsList({
  reviews,
  removingIds,
  onRemove,
}: {
  reviews: ReviewRow[];
  removingIds: Set<number>;
  onRemove: (review: ReviewRow) => void;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
        <p className="text-foreground font-semibold mb-1">No reviews yet</p>
        <p className="text-muted-foreground text-sm">Ratings and written reviews submitted by users will show up here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => {
        const removing = removingIds.has(review.id);
        return (
          <div
            key={review.id}
            className="rounded-2xl bg-card border border-border/60 shadow-sm p-4 flex flex-col sm:flex-row sm:items-start gap-4"
          >
            <div className="flex items-center gap-3 shrink-0 sm:w-[220px] min-w-0">
              <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-muted">
                {review.series?.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.series.poster_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                )}
              </div>
              <div className="min-w-0">
                {review.series ? (
                  <Link
                    href={'/series/' + review.series.id}
                    className="text-foreground text-[13.5px] font-semibold truncate hover:text-primary transition-colors block"
                  >
                    {review.series.title}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-[13.5px] italic">Deleted series</p>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="size-3 text-brand-gold" fill="currentColor" />
                  <span className="text-[12.5px] text-foreground font-semibold">{review.score}/10</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <UserAvatar name={review.users?.username ?? '?'} />
                <span className="text-[13px] font-semibold text-foreground">{review.users?.username ?? 'Unknown user'}</span>
              </div>
              {review.review_text ? (
                <p className="text-foreground/80 text-[13.5px] leading-relaxed">{review.review_text}</p>
              ) : (
                <p className="text-muted-foreground text-[13px] italic">No written review, rating only.</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRemove(review)}
              disabled={removing}
              aria-label={'Remove review from ' + (review.users?.username ?? 'user')}
              className="shrink-0 flex items-center justify-center size-8 rounded-full text-foreground/50 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:pointer-events-none self-start"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
