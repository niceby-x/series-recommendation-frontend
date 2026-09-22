import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

export interface RelatedSeriesItem {
  id: number;
  title: string;
  poster_url: string | null;
  year: number;
  country: string;
  score: number;
  match_reasons: string[];
  average_rating?: number | null;
  episode_count?: number;
}

function Card({ item }: { item: RelatedSeriesItem }) {
  const topReason = item.match_reasons[0];

  return (
    <Link
      href={'/series/' + item.id}
      className="group shrink-0 w-[200px] snap-start block transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-muted overflow-hidden shadow-sm border border-border mb-3">
        {item.poster_url ? (
          <Image
            src={item.poster_url}
            alt={item.title}
            fill
            sizes="200px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{item.title}</span>
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-1 mb-1">
          {item.title}
        </h3>
        
        <div className="flex items-center text-[11px] text-muted-foreground">
          <span>{item.year}</span>
          {item.episode_count && (
            <>
              <span className="mx-1.5">•</span>
              <span>{item.episode_count} episodes</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <Star className="size-3.5 fill-brand-purple-vivid text-brand-purple-vivid" />
          <span className="text-xs font-semibold text-foreground">
            {item.average_rating ? item.average_rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function RelatedSeriesRow({ items }: { items: RelatedSeriesItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-foreground">More Like This</h2>
        <Link href="#" className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
          View all <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}