import { Award, Flame, Heart, TrendingUp } from 'lucide-react';

const STATS = [
  { icon: Flame, label: 'Hot Right Now', sub: 'Most watched this week' },
  { icon: TrendingUp, label: 'Updated Daily', sub: 'New rankings every day' },
  { icon: Heart, label: 'Loved by Fans', sub: 'Based on real watch data' },
  { icon: Award, label: 'Top Rated', sub: 'Highly rated by viewers' },
];

export default function TrendingStatsBar() {
  return (
    <div className="mt-8 rounded-xl border border-brand-blush/30 bg-brand-blush/10 px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
      {STATS.map(({ icon: Icon, label, sub }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon className="size-5 text-primary shrink-0" strokeWidth={2} />
          <div>
            <p className="text-[15px] font-semibold text-foreground leading-tight">{label}</p>
            <p className="text-[13px] text-muted-foreground leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}