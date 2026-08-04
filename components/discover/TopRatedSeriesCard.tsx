import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, ArrowDown, Minus, Star } from 'lucide-react';

export interface TopRatedItem {
  id: number | string;
  title: string;
  country: string;
  mediaType: string;
  rating: number;
  imageUrl: string | null;
  trend: 'up' | 'down' | 'flat';
  isReal: boolean;
}

const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus };
const TREND_CLASS = { up: 'text-emerald-500', down: 'text-destructive', flat: 'text-muted-foreground' };

function Row({ item, rank }: { item: TopRatedItem; rank: number }) {
  const TrendIcon = TREND_ICON[item.trend];

  const inner = (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-[15px] font-bold text-muted-foreground w-4 shrink-0">{rank}</span>
      <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill sizes="44px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-[13.5px] font-semibold truncate">{item.title}</p>
        <p className="text-muted-foreground text-[11.5px] truncate flex items-center gap-1">
          {item.country} · {item.mediaType}
          <span className="inline-flex items-center gap-0.5 text-brand-gold ml-0.5">
            <Star className="size-2.5" fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
        </p>
      </div>
      <TrendIcon className={'size-3.5 shrink-0 ' + TREND_CLASS[item.trend]} />
    </div>
  );

  return item.isReal ? (
    <Link href={'/series/' + item.id} className="block hover:bg-muted/60 rounded-[12px] -mx-2 px-2 transition-colors">
      {inner}
    </Link>
  ) : (
    <div className="-mx-2 px-2">{inner}</div>
  );
}

export default function TopRatedSeriesCard({ items }: { items: TopRatedItem[] }) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Top Rated Series</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {items.map((item, i) => (
          <Row key={item.id} item={item} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}