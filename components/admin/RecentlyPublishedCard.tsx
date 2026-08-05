import Link from 'next/link';
import { Star } from 'lucide-react';
import type { SeriesCardData } from '../shared/SeriesCard';
import { mockRatingFor } from '../../lib/exploreMock';

// Real catalog data (the /series list is, by definition, everything
// that's live) -- unlike most of this dashboard's right rail, this section
// isn't a placeholder. Rating still borrows the same mockRatingFor helper
// Discover uses, since the `ratings` table itself is still empty.
export default function RecentlyPublishedCard({ series }: { series: SeriesCardData[] }) {
  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="font-heading text-[20px] font-normal text-foreground">Recently Published</h2>
        <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      {series.length === 0 ? (
        <p className="text-muted-foreground text-sm">No published titles yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {series.map((s) => (
            <Link
              key={s.id}
              href={'/series/' + s.id}
              className="group rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {s.backdrop_url || s.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.backdrop_url ?? s.poster_url ?? ''}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-2 text-center">
                    <span className="text-muted-foreground text-xs font-medium">{s.title}</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <h3 className="text-card-foreground text-[13px] font-semibold leading-snug line-clamp-1 mb-0.5">
                  {s.title}
                </h3>
                <p className="text-muted-foreground text-[11.5px] mb-1.5">
                  {s.country} · {s.year}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Published
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-brand-gold">
                    <Star className="size-3" fill="currentColor" /> {mockRatingFor(s.id).toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
