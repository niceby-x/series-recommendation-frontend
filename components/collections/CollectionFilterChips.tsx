'use client';

import { LayoutGrid, Heart, Sparkles, type LucideIcon } from 'lucide-react';

export interface CollectionFilterOption {
  key: 'all' | 'mine' | 'curated';
  label: string;
  icon: LucideIcon;
}

// Simplified to the two real data sources this page actually has (personal
// vs admin-curated) -- the old status filters (completed/ongoing/plan to
// watch/dropped) described an individual series' watch state, not a
// collection as a whole, so they didn't correspond to anything once this
// page moved off mock data.
export const COLLECTION_FILTERS: CollectionFilterOption[] = [
  { key: 'all', label: 'All Collections', icon: LayoutGrid },
  { key: 'mine', label: 'My Collections', icon: Heart },
  { key: 'curated', label: 'Curated', icon: Sparkles },
];

// Same controlled-from-parent pattern as MoodFilterChips/TropeFilterChips.
export default function CollectionFilterChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-8">
      {COLLECTION_FILTERS.map(({ key, label, icon: Icon }) => {
        const active = key === selected;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={active}
            className={
              'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold border transition-colors shrink-0 ' +
              (active
                ? 'bg-brand-gradient text-white border-transparent shadow-sm'
                : 'bg-card text-foreground/70 border-border hover:border-ring hover:text-foreground')
            }
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
