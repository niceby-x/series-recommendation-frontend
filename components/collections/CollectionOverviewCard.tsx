import { FolderOpen, Users, Star, Clock } from 'lucide-react';
import { COLLECTION_OVERVIEW } from '../../lib/collectionsContent';

const STATS = [
  { key: 'total', icon: FolderOpen, iconClass: 'bg-brand-blush/30 text-primary', value: COLLECTION_OVERVIEW.totalCollections, label: 'Total Collections' },
  { key: 'series', icon: Users, iconClass: 'bg-brand-lilac/25 text-secondary', value: COLLECTION_OVERVIEW.seriesInCollections, label: 'Series in Collections' },
  { key: 'completion', icon: Star, iconClass: 'bg-brand-gold/25 text-amber-600', value: COLLECTION_OVERVIEW.completionRatePct + '%', label: 'Completion Rate' },
  { key: 'watchtime', icon: Clock, iconClass: 'bg-emerald-100 text-emerald-600', value: COLLECTION_OVERVIEW.totalWatchHours + 'h', label: 'Total Watch Time' },
];

// Placeholder aggregate stats -- no `collections` table or watch-time
// tracking exists yet, same pending-backend-data pattern as
// lib/dashboardContent.ts's MOCK_BLOOM_JOURNEY.
export default function CollectionOverviewCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <p className="font-heading text-[16px] font-normal text-foreground mb-4">Collection Overview</p>

      <div className="grid grid-cols-2 gap-3">
        {STATS.map(({ key, icon: Icon, iconClass, value, label }) => (
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
