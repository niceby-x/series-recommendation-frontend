'use client';

import { MOOD_FILTERS } from '../../lib/moodsContent';

// Selection is lifted to MoodsAuthed (drives which sections render below,
// and doubles as the "Surprise Me" target) -- this component is purely
// presentational, same controlled-from-parent pattern DiscoverFiltersBar uses.
export default function MoodFilterChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-8">
      {MOOD_FILTERS.map(({ key, label, icon: Icon }) => {
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
