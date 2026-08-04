import { Heart } from 'lucide-react';
import { MOCK_TOP_MOOD } from '../../lib/moodsContent';

// Placeholder until real watch-time-by-mood tracking exists (no mood column
// on series yet -- see lib/moodsContent.ts header). Same progress-bar
// pattern as BloomJourneyCard on the home dashboard.
export default function TopMoodCard() {
  const { name, description, watchTimePct } = MOCK_TOP_MOOD;

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <p className="font-heading text-[16px] font-normal text-foreground mb-3">Your Top Mood</p>

      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center size-9 rounded-full bg-brand-blush/40 text-primary shrink-0">
          <Heart className="size-4" fill="currentColor" />
        </span>
        <div className="min-w-0">
          <p className="text-foreground text-[14px] font-semibold">{name}</p>
          <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">{description}</p>
        </div>
      </div>

      <div className="h-2 w-full bg-muted rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-brand-gradient rounded-full" style={{ width: watchTimePct + '%' }} />
      </div>
      <p className="text-muted-foreground text-[12px] mt-1.5">{watchTimePct}% of your watch time</p>
    </div>
  );
}
