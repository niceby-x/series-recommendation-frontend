import { BookOpen, Tag, Heart, Sparkle } from 'lucide-react';
import { LANDING_STATS } from '../../lib/landingContent';

const ICONS = [BookOpen, Tag, Heart, Sparkle];

export default function LandingStatsBar() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 -mt-2 md:-mt-6 relative z-10">
      <div className="rounded-2xl border border-border bg-card shadow-[0_10px_30px_rgba(88,54,99,0.08)] px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
        {LANDING_STATS.map((stat, i) => {
          const Icon = ICONS[i];
          return (
            <div key={stat.label} className="flex items-start gap-3">
              <span className="flex items-center justify-center size-11 rounded-full bg-accent text-primary shrink-0">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-heading text-2xl font-normal text-foreground leading-tight">{stat.value}</p>
                <p className="text-foreground text-[13px] font-semibold mt-0.5">{stat.label}</p>
                <p className="text-muted-foreground text-[12px]">{stat.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
