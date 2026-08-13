import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';

// Q2-02: "more like this" for the series detail page, backed by
// GET /series/:id/related (see backend src/routes/series.ts). Same
// tag/genre overlap engine as Made For You (services/recommendations.ts's
// getRelatedSeries), just seeded from this series instead of a user's
// taste history -- so the response shape matches RecommendationItem in
// components/home/MadeForYouRow.tsx, and this reuses that same card
// visual pattern (poster, gradient, play affordance, top match reason)
// rather than inventing a new one. Public data, no auth -- fetched
// server-side in app/series/[id]/page.tsx and passed in as a prop, so
// this component itself does no fetching.
export interface RelatedSeriesItem {
  id: number;
  title: string;
  poster_url: string | null;
  year: number;
  country: string;
  score: number;
  match_reasons: string[];
}

function Card({ item }: { item: RelatedSeriesItem }) {
  const topReason = item.match_reasons[0];

  return (
    <Link href={'/series/' + item.id} className="group relative shrink-0 w-[200px] snap-start block">
      <div className="relative aspect-[16/10] w-full rounded-[18px] overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {item.poster_url ? (
          <Image
            src={item.poster_url}
            alt={item.title}
            fill
            sizes="200px"
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

      {/* Same "Because you liked X" convention as MadeForYouRow -- here
          it reads as "why this matched the series you're looking at"
          rather than "why this matched you" */}
      {topReason && (
        <p className="text-muted-foreground text-[11px] mt-1.5 line-clamp-1">
          Because it&apos;s <span className="text-foreground font-medium">{topReason}</span>
        </p>
      )}
    </Link>
  );
}

export default function RelatedSeriesRow({ items }: { items: RelatedSeriesItem[] }) {
  // Nothing worth rendering if this series has no matches yet -- same
  // "don't show a hollow section" convention as the rest of the app.
  if (items.length === 0) return null;

  return (
    <section className="max-w-4xl mt-10">
      <h2 className="font-heading text-[18px] font-normal text-foreground mb-3">More Like This</h2>
      <div className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}