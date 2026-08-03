import FlowerIcon from '../shared/FlowerIcon';
import { MOCK_BLOOM_JOURNEY } from '../../lib/dashboardContent';

// Level/XP gamification -- placeholder pending a real XP system (see
// lib/dashboardContent.ts header note).
export default function BloomJourneyCard() {
  const { level, label, xp, xpToNext } = MOCK_BLOOM_JOURNEY;
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));

  return (
    <div className="rounded-[20px] bg-gradient-to-br from-brand-blush/25 via-card to-brand-lilac/20 border border-border/60 shadow-sm p-5">
      <div className="flex items-center gap-3.5">
        <span className="flex items-center justify-center size-12 rounded-full bg-brand-gradient text-white shadow-sm shrink-0">
          <FlowerIcon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-[16px] font-normal text-foreground leading-tight">Your Bloom Journey</p>
          <p className="text-muted-foreground text-[13px]">Level {level}</p>
        </div>
      </div>

      <p className="text-foreground text-[14px] font-semibold mt-4 flex items-center gap-1">
        {label} <span aria-hidden>·</span>
      </p>

      <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-brand-gradient rounded-full" style={{ width: pct + '%' }} />
      </div>
      <p className="text-muted-foreground text-[12px] mt-1.5">
        {xp} / {xpToNext} XP
      </p>
    </div>
  );
}
