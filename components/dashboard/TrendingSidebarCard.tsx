import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, ArrowDown, Minus, Sparkles, Star } from 'lucide-react';
import ScrollRow from './ScrollRow';

export interface TrendingSidebarItem {
  id: number | string;
  title: string;
  country: string;
  mediaType: string;
  rating: number | null;
  imageUrl: string | null;
  // 'new' = ranked today but wasn't in the prior snapshot. null/undefined
  // = no trend data at all -- render as unknown, not as 'flat' (flat
  // means a real comparison found no change).
  trend: 'up' | 'down' | 'flat' | 'new' | null | undefined;
  isReal: boolean;
}

const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus, new: Sparkles };
const TREND_CLASS = {
  up: 'text-emerald-500',
  down: 'text-destructive',
  flat: 'text-muted-foreground',
  new: 'text-brand-gold',
};

function Row({ item, rank }: { item: TrendingSidebarItem; rank: number }) {
  const TrendIcon = item.trend ? TREND_ICON[item.trend] : null;

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
          {item.rating != null && (
            <span className="inline-flex items-center gap-0.5 text-brand-gold ml-0.5">
              <Star className="size-2.5" fill="currentColor" /> {item.rating.toFixed(1)}
            </span>
          )}
        </p>
      </div>
      {TrendIcon && item.trend && (
        <TrendIcon className={'size-3.5 shrink-0 ' + TREND_CLASS[item.trend]} />
      )}
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

// Horizontal poster-card variant -- visual language matches
// DashboardDiscoverRow's cards (228px, 16/10 poster, gradient overlay,
// title/rating pinned to the bottom) so Trending reads as part of the
// same main-content flow instead of the compact sidebar-list style.
function RowCard({ item, rank }: { item: TrendingSidebarItem; rank: number }) {
  const TrendIcon = item.trend ? TREND_ICON[item.trend] : null;

  const inner = (
    <div className="group relative shrink-0 w-[228px] snap-start">
      <div className="relative aspect-[16/10] w-full rounded-[18px] overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="228px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-3 text-center">
            <span className="text-muted-foreground text-xs">{item.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <span className="absolute top-2.5 left-2.5 flex items-center justify-center size-6 rounded-full bg-white/90 text-foreground text-[11px] font-bold shadow-sm">
          {rank}
        </span>

        {TrendIcon && item.trend && (
          <span
            className={
              'absolute top-2.5 right-2.5 flex items-center justify-center size-6 rounded-full bg-black/45 backdrop-blur-sm ' +
              TREND_CLASS[item.trend]
            }
          >
            <TrendIcon className="size-3.5" />
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-white text-[14px] font-semibold leading-snug line-clamp-1 mb-0.5">{item.title}</h3>
          <p className="text-white/75 text-[11px] flex items-center gap-1">
            {item.country} · {item.mediaType}
            {item.rating != null && (
              <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
                <Star className="size-3" fill="currentColor" /> {item.rating.toFixed(1)}
              </span>
            )}
          </p>
        </div>
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

export default function TrendingSidebarCard({
  items,
  variant = 'sidebar',
}: {
  items: TrendingSidebarItem[];
  variant?: 'sidebar' | 'row';
}) {
  // 'row' -- horizontal poster-card layout matching the rest of the main
  // content flow (Continue Watching, Curator's Picks), used now that
  // Trending lives in main rather than the right rail (see H4-03). The
  // section heading + 'See full ranking' link move to the parent, same
  // convention as DashboardDiscoverRow not owning its own header.
  if (variant === 'row') {
    return (
      <ScrollRow>
        {items.map((item, i) => (
          <RowCard key={item.id} item={item} rank={i + 1} />
        ))}
      </ScrollRow>
    );
  }

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Trending This Week</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          See full ranking
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
