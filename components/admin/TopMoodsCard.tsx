import Link from 'next/link';
import { Smile, Heart, Droplet, Zap, Frown, Leaf, Sparkles, type LucideIcon } from 'lucide-react';

// D2-01: real data now (GET /admin/top-moods, see the backend handoff),
// fetched server-side in app/admin/page.tsx and passed down as a plain
// prop -- same pattern as RecentActivityCard.
export interface RealTopMood {
  value_key: string;
  display_label: string;
  count: number;
  pct: number;
}

// Same icons lib/moodsContent.ts's MOOD_FILTERS uses for these value_keys
// elsewhere in the app, so a mood never looks different on the admin
// dashboard than it does on /moods. Sparkles is the fallback for any
// mood tag an admin has created via the Tags page that isn't one of
// these six -- the backend aggregates whatever mood tags actually exist,
// not just this known set.
const MOOD_ICON: Record<string, LucideIcon> = {
  happy: Smile,
  romantic: Heart,
  emotional: Droplet,
  excited: Zap,
  sad: Frown,
  relaxed: Leaf,
};

const BAR_COLORS = ['bg-violet-400', 'bg-rose-400', 'bg-amber-400', 'bg-orange-300', 'bg-slate-400'];

export default function TopMoodsCard({ moods }: { moods: RealTopMood[] }) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[16px] font-normal text-foreground">Top Moods</p>
        <Link href="/moods" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      {moods.length === 0 ? (
        <p className="text-muted-foreground text-[13px] py-3">No mood tags on any series yet.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {moods.map((mood, i) => {
            const Icon = MOOD_ICON[mood.value_key] ?? Sparkles;
            return (
              <div key={mood.value_key} className="flex items-center gap-3">
                <Icon className="size-4 text-foreground/60 shrink-0" />
                <span className="text-[13px] text-foreground w-[92px] shrink-0 truncate">{mood.display_label}</span>
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className={'h-full rounded-full ' + BAR_COLORS[i % BAR_COLORS.length]} style={{ width: mood.pct + '%' }} />
                </div>
                <span className="text-[12.5px] font-semibold text-muted-foreground w-9 text-right shrink-0">{mood.pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
