import Link from 'next/link';
import { YOUR_TOP_TROPES } from '../../lib/tropesContent';

// Placeholder per-user trope affinity, same pending-backend-data pattern as
// TopMoodCard -- see lib/tropesContent.ts header.
export default function TopTropesCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[16px] font-normal text-foreground">Your Top Tropes</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      <div className="flex flex-col gap-3.5">
        {YOUR_TOP_TROPES.map(({ key, icon: Icon, label, pct }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="flex items-center justify-center size-8 rounded-full bg-brand-blush/30 text-primary shrink-0">
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-[13px] font-semibold truncate mb-1">{label}</p>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-brand-gradient rounded-full" style={{ width: pct + '%' }} />
              </div>
            </div>
            <span className="text-muted-foreground text-[12px] font-semibold shrink-0">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
