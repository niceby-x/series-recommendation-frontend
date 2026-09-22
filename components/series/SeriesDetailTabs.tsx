'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface SeriesTab {
  id: string;
  label: string;
  content: ReactNode;
}

// Tabbed section under the hero on /series/[id] (Overview / Episodes).
// The panel contents are built server-side in SeriesDetailView and passed
// in as ReactNode slots, so this component owns only "which tab is
// showing" -- no data fetching. Every panel stays mounted and inactive
// ones are just `hidden`, so switching tabs never remounts (and
// re-fetches) ProgressTracker or RatingForm, which each load the user's
// own data on mount.
export default function SeriesDetailTabs({ tabs }: { tabs: SeriesTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = -1;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex === -1) return;
    e.preventDefault();
    const next = tabs[nextIndex];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Series sections" className="flex gap-1 border-b border-border">
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={'series-tab-' + tab.id}
              aria-selected={selected}
              aria-controls={'series-panel-' + tab.id}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={
                'relative px-4 py-3 text-sm font-medium transition-colors rounded-t-lg focus-visible:outline-2 focus-visible:outline-ring ' +
                (selected
                  ? 'text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={'series-panel-' + tab.id}
          aria-labelledby={'series-tab-' + tab.id}
          hidden={tab.id !== activeId}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
