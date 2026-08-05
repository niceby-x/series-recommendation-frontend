import type { LucideIcon } from 'lucide-react';
import Sparkline from './Sparkline';

const ICON_BG: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-600',
  orange: 'bg-orange-100 text-orange-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-violet-100 text-violet-600',
  sky: 'bg-sky-100 text-sky-600',
};

export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  seed,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'rose' | 'orange' | 'emerald' | 'violet' | 'sky';
  seed: number;
}) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5 flex flex-col min-w-[200px] flex-1">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[13px] font-medium">{label}</p>
          <p className="font-heading text-[26px] font-normal text-foreground mt-1">{value}</p>
        </div>
        <span className={'flex items-center justify-center size-10 rounded-full shrink-0 ' + ICON_BG[color]}>
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
      <p className="text-muted-foreground text-[12.5px] mb-1">{subtitle}</p>
      <div className="-mx-1 mt-auto">
        <Sparkline seed={seed} color={color} />
      </div>
    </div>
  );
}
