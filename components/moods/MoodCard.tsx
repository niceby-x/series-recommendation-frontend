import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import type { MoodCardItem } from '../../lib/moodsContent';

// Grid card used by every mood section row. Unlike DiscoverMediaCard (title
// overlaid on the image), this mirrors the reference mockup: a plain poster
// tile with a small always-visible play button, then title/meta in a
// separate text block below -- so it reads as a photo-first grid, not a
// gradient-scrim card.
export default function MoodCard({ item }: { item: MoodCardItem }) {
  const inner = (
    <div className="group rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs font-medium">{item.title}</span>
          </div>
        )}

        <span className="absolute bottom-2.5 right-2.5 flex items-center justify-center size-8 rounded-full bg-brand-gradient text-white shadow-sm transition-transform group-hover:scale-110">
          <Play className="size-3.5 fill-current ml-0.5" />
        </span>
      </div>

      <div className="p-3">
        <h3 className="text-card-foreground text-[15px] font-semibold leading-snug line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-muted-foreground text-[13px] flex items-center gap-1">
          {item.country} · {item.mediaType}
          <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
            <Star className="size-3" fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
        </p>
      </div>
    </div>
  );

  return item.isReal ? (
    <Link href={'/series/' + item.id} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
