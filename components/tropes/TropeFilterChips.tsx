'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TROPE_FILTERS, MORE_TROPE_FILTERS } from '../../lib/tropesContent';

// Same controlled-from-parent pattern as MoodFilterChips. The "More" menu
// covers the overflow tropes (Action/Mystery/Slice of Life) without
// growing the always-visible row -- selecting one from the menu closes it
// and behaves exactly like clicking a regular chip.
export default function TropeFilterChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moreActive = MORE_TROPE_FILTERS.some((m) => m.key === selected);

  return (
    <div className="flex flex-wrap gap-2.5 mb-8">
      {TROPE_FILTERS.map(({ key, label, icon: Icon }) => {
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

      <div className="relative shrink-0" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          className={
            'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold border transition-colors ' +
            (moreActive
              ? 'bg-brand-gradient text-white border-transparent shadow-sm'
              : 'bg-card text-foreground/70 border-border hover:border-ring hover:text-foreground')
          }
        >
          {moreActive ? MORE_TROPE_FILTERS.find((m) => m.key === selected)?.label : 'More'}
          <ChevronDown className={'size-3.5 transition-transform ' + (moreOpen ? 'rotate-180' : '')} />
        </button>

        {moreOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden py-1.5 z-20">
            {MORE_TROPE_FILTERS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onSelect(key);
                  setMoreOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors text-left"
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
