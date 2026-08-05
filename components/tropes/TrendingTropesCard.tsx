import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { TRENDING_TROPES } from '../../lib/tropesContent';

// Placeholder trend figures, same caveat as HomeAuthed's TRENDS array --
// no historical ranking snapshots exist yet to compute a real change.
export default function TrendingTropesCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Trending Tropes</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      <div className="divide-y divide-border/60">
        {TRENDING_TROPES.map(({ key, icon: Icon, label, changePct }, i) => (
          <div key={key} className="flex items-center gap-3 py-2.5">
            <span className="text-[15px] font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
            <span className="flex items-center justify-center size-8 rounded-full bg-brand-lilac/25 text-secondary shrink-0">
              <Icon className="size-3.5" />
            </span>
            <p className="text-foreground text-[13.5px] font-semibold truncate flex-1 min-w-0">{label}</p>
            <span className="flex items-center gap-0.5 text-emerald-500 text-[12.5px] font-semibold shrink-0">
              <ArrowUp className="size-3" />
              {changePct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
