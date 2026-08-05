import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';

export interface JustReleasedItem {
  id: number | string;
  title: string;
  country: string;
  rating: number;
  imageUrl: string | null;
  releaseDateLabel: string;
}

export default function JustReleasedCard({ item }: { item: JustReleasedItem }) {
  return (
    <Link href={'/series/' + item.id} className="group block shrink-0 w-[220px] snap-start">
      <div className="relative aspect-[4/3] w-full rounded-[16px] overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{item.title}</span>
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 bg-rose-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          NEW
        </span>

        <span className="absolute bottom-2.5 right-2.5 flex items-center justify-center size-8 rounded-full bg-brand-gradient text-white shadow-sm transition-transform group-hover:scale-110">
          <Play className="size-3.5 fill-current ml-0.5" />
        </span>
      </div>

      <div className="pt-3">
        <h3 className="text-card-foreground text-[15px] font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-muted-foreground text-[13px] mt-0.5 flex items-center gap-1">
          {item.country} · Series
          <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
            <Star className="size-3" fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
        </p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
          <span className="bg-muted px-1.5 py-0.5 rounded text-foreground/70">EP 1</span>
          {item.releaseDateLabel}
        </p>
      </div>
    </Link>
  );
}
