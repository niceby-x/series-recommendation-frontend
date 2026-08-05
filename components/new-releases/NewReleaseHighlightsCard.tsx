import Link from 'next/link';
import { Star, Calendar, Flame, ChevronRight } from 'lucide-react';

// The two counts are real arithmetic over the page's data (real catalog
// filtered by mockDaysAgoFor, mock upcoming list filtered by daysUntil) --
// not hardcoded -- "Most anticipated" is just the first curated upcoming
// title, there's no real anticipation signal to rank by yet.
export default function NewReleaseHighlightsCard({
  newThisMonth,
  comingThisWeek,
  mostAnticipated,
  onSelectMonth,
  onSelectUpcoming,
}: {
  newThisMonth: number;
  comingThisWeek: number;
  mostAnticipated: string;
  onSelectMonth: () => void;
  onSelectUpcoming: () => void;
}) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">New Release Highlights</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        <button type="button" onClick={onSelectMonth} className="w-full flex items-center gap-3 py-3 text-left hover:opacity-80 transition-opacity">
          <span className="flex items-center justify-center size-10 rounded-full bg-brand-blush/35 text-primary shrink-0">
            <Star className="size-4.5" fill="currentColor" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-foreground text-[17px] font-bold leading-none">{newThisMonth}</span>
            <span className="block text-muted-foreground text-[12.5px] mt-1">New series this month</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </button>

        <button type="button" onClick={onSelectUpcoming} className="w-full flex items-center gap-3 py-3 text-left hover:opacity-80 transition-opacity">
          <span className="flex items-center justify-center size-10 rounded-full bg-brand-lilac/30 text-secondary shrink-0">
            <Calendar className="size-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-foreground text-[17px] font-bold leading-none">{comingThisWeek}</span>
            <span className="block text-muted-foreground text-[12.5px] mt-1">Coming this week</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </button>

        <button type="button" onClick={onSelectUpcoming} className="w-full flex items-center gap-3 py-3 text-left hover:opacity-80 transition-opacity">
          <span className="flex items-center justify-center size-10 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
            <Flame className="size-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-muted-foreground text-[12.5px]">Most anticipated:</span>
            <span className="block text-foreground text-[13.5px] font-semibold truncate">{mostAnticipated}</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </button>
      </div>
    </div>
  );
}
