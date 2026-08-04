import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';

export interface DiscoverMediaCardData {
  id: number | string;
  title: string;
  country: string;
  mediaType: string;
  rating: number | null;
  imageUrl: string | null;
  isReal: boolean;
}

function Badge({ rank, isNew }: { rank?: number; isNew?: boolean }) {
  if (rank != null) {
    return (
      <span className="absolute top-2.5 left-2.5 flex items-center justify-center bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
        #{rank}
      </span>
    );
  }
  if (isNew) {
    return (
      <span className="absolute top-2.5 left-2.5 bg-rose-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
        NEW
      </span>
    );
  }
  return null;
}

// Landscape media card shared by Discover's "Trending Now" (rank badge)
// and "New Releases" (NEW badge) rows -- same visual language as
// DashboardDiscoverRow's card on the Home dashboard, just with a
// rank/NEW badge instead of a named one.
export default function DiscoverMediaCard({
  card,
  rank,
  isNew,
}: {
  card: DiscoverMediaCardData;
  rank?: number;
  isNew?: boolean;
}) {
  const inner = (
    <div className="group relative shrink-0 w-[240px] snap-start">
      <div className="relative aspect-[16/10] w-full rounded-[16px] overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="240px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{card.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <Badge rank={rank} isNew={isNew} />

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
    </div>
  );

  return card.isReal ? (
    <Link href={'/series/' + card.id} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}