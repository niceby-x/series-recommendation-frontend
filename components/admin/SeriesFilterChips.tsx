'use client';

import { X } from 'lucide-react';
import type { SeriesFilterValue } from './SeriesFiltersButton';

// S1-03: the removable "Country: Thailand ×" / "Genre: Drama ×" chips row
// under the tabs, plus "Clear all" -- a second, always-visible way to see/
// undo what SeriesFiltersButton's popover currently has set. Renders
// nothing when no filter is active, same as the mockup (no empty chip
// row).
export default function SeriesFilterChips({
  value,
  onChange,
}: {
  value: SeriesFilterValue;
  onChange: (next: SeriesFilterValue) => void;
}) {
  const chips: { key: keyof SeriesFilterValue; label: string }[] = [];
  if (value.country) chips.push({ key: 'country', label: 'Country: ' + value.country });
  if (value.genre) chips.push({ key: 'genre', label: 'Genre: ' + value.genre });

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange({ ...value, [chip.key]: null })}
          className="flex items-center gap-1.5 rounded-full pl-3 pr-2 py-1.5 text-[12.5px] font-semibold bg-brand-blush/25 text-primary hover:bg-brand-blush/40 transition-colors"
        >
          {chip.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ country: null, genre: null })}
        className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
