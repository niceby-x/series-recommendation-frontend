import Link from 'next/link';
import { MOCK_TOP_MOODS } from '../../lib/adminContent';

export default function TopMoodsCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[16px] font-normal text-foreground">Top Moods</p>
        <Link href="/moods" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-3.5">
        {MOCK_TOP_MOODS.map((mood) => {
          const Icon = mood.icon;
          return (
            <div key={mood.name} className="flex items-center gap-3">
              <Icon className="size-4 text-foreground/60 shrink-0" />
              <span className="text-[13px] text-foreground w-[92px] shrink-0 truncate">{mood.name}</span>
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div className={'h-full rounded-full ' + mood.colorClass} style={{ width: mood.pct + '%' }} />
              </div>
              <span className="text-[12.5px] font-semibold text-muted-foreground w-9 text-right shrink-0">
                {mood.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
