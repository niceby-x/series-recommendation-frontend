'use client';

import { FolderOpen, Film, Star, Sparkles } from 'lucide-react';
import type { RealCollection } from './CollectionCard';

// Real numbers computed from the caller's already-fetched collections
// (both fetched once in CollectionsAuthed, no separate request here).
// "Total Watch Time" from the old mock version is gone -- there's no
// episode-duration/watch-time tracking anywhere in this app to compute a
// real number from, so this shows Curated Collections (real, meaningful)
// instead rather than keeping a fabricated stat.
export default function CollectionOverviewCard({
  mine,
  curated,
}: {
  mine: RealCollection[];
  curated: RealCollection[];
}) {
  const seriesInCollections = mine.reduce((sum, c) => sum + c.series_count, 0);
  const withProgress = mine.filter((c) => c.progress_pct !== null && c.series_count > 0);
  const completionRatePct =
    withProgress.length > 0
      ? Math.round(withProgress.reduce((sum, c) => sum + (c.progress_pct || 0), 0) / withProgress.length)
      : 0;

  const stats = [
    { key: 'total', icon: FolderOpen, iconClass: 'bg-brand-blush/30 text-primary', value: mine.length, label: 'My Collections' },
    { key: 'series', icon: Film, iconClass: 'bg-brand-lilac/25 text-secondary', value: seriesInCollections, label: 'Series in Collections' },
    { key: 'completion', icon: Star, iconClass: 'bg-brand-gold/25 text-amber-600', value: completionRatePct + '%', label: 'Avg. Completion' },
    { key: 'curated', icon: Sparkles, iconClass: 'bg-emerald-100 text-emerald-600', value: curated.length, label: 'Curated Collections' },
  ];

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <p className="font-heading text-[16px] font-normal text-foreground mb-4">Collection Overview</p>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ key, icon: Icon, iconClass, value, label }) => (
          <div key={key} className="rounded-2xl border border-border/60 p-3.5">
            <span className={'flex items-center justify-center size-8 rounded-full mb-2.5 ' + iconClass}>
              <Icon className="size-4" />
            </span>
            <p className="font-heading text-[20px] font-normal text-foreground leading-tight">{value}</p>
            <p className="text-muted-foreground text-[11.5px] mt-0.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
