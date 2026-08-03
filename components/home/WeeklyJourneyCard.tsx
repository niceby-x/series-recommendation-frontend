import { Gift } from 'lucide-react';
import { MOCK_WEEKLY_JOURNEY } from '../../lib/dashboardContent';

// Weekly discovery streak -- placeholder pending a real activity/streak
// table (see lib/dashboardContent.ts header note).
export default function WeeklyJourneyCard() {
  const { completedCount, goal, days } = MOCK_WEEKLY_JOURNEY;

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">This Week&apos;s Journey</p>
        <span className="text-muted-foreground text-[13px] font-semibold shrink-0">
          {completedCount}/{goal}
        </span>
      </div>
      <p className="text-muted-foreground text-[13px]">Discover {goal} new stories this week</p>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5">
          {days.map((day, i) => (
            <span
              key={i}
              className={
                'flex items-center justify-center size-7 rounded-full text-[11px] font-bold transition-colors ' +
                (day.completed
                  ? 'bg-brand-gradient text-white'
                  : 'bg-muted text-muted-foreground') +
                (day.isToday && !day.completed ? ' ring-2 ring-primary ring-offset-1 ring-offset-card' : '')
              }
            >
              {day.label}
            </span>
          ))}
        </div>
        <span className="flex items-center justify-center size-9 rounded-full bg-brand-blush/30 text-primary shrink-0 ml-2">
          <Gift className="size-4" />
        </span>
      </div>
    </div>
  );
}
