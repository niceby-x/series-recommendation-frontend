import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Flame, Star, CalendarClock, MoreHorizontal } from 'lucide-react';

// New Releases / Trending / Top Rated link to the plain catalog for now — there's
// no sort-by-date, trending-score, or rating column wired up yet (ratings table is
// currently empty), so these are honest "browse everything" links until those
// features exist, not broken links. Coming Soon and the country links map onto
// SeriesFilter's real `status`/`country` query params, so those actually filter.
const CATEGORIES = [
  { label: 'New Releases', href: '/series', icon: Sparkles, badge: 'NEW' },
  { label: 'Trending', href: '/series', icon: Flame },
  { label: 'Top Rated', href: '/series', icon: Star },
  { label: 'Coming Soon', href: '/series?status=upcoming', icon: CalendarClock },
  { label: 'Thai BL', href: '/series?country=Thailand', flagCode: 'th' },
  { label: 'Korean BL', href: '/series?country=Korea', flagCode: 'kr' },
  { label: 'Japanese BL', href: '/series?country=Japan', flagCode: 'jp' },
  { label: 'Chinese BL', href: '/series?country=China', flagCode: 'cn' },
  { label: 'More', href: '/series', icon: MoreHorizontal },
];

export default function CategoryNav() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm px-4 py-3.5 flex flex-wrap justify-between gap-y-3">
      {CATEGORIES.map((category) => (
        <Link
          key={category.label}
          href={category.href}
          className="flex flex-col items-center gap-1 flex-1 min-w-[80px] text-center group"
        >
          <span className="relative flex items-center justify-center size-9 rounded-full bg-muted text-primary group-hover:bg-accent transition-colors">
            {category.flagCode ? (
              <Image
                src={`https://flagcdn.com/w40/${category.flagCode}.png`}
                alt=""
                width={20}
                height={20}
                className="size-5 rounded-full object-cover"
              />
            ) : category.icon ? (
              <category.icon className="size-[18px]" strokeWidth={1.75} />
            ) : null}
            {category.badge && (
              <span className="absolute -top-1 -right-1 bg-brand-blush text-[9px] font-bold text-[#4A2F3F] px-1.5 py-0.5 rounded-full">
                {category.badge}
              </span>
            )}
          </span>
          <span className="text-[14px] font-semibold text-foreground/80 group-hover:text-primary transition-colors">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  );
}