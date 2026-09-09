'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tv, Clapperboard, FileText, BadgeCheck, Archive, type LucideIcon } from 'lucide-react';

export type SeriesTabKey = 'all' | 'series' | 'movies' | 'drafts' | 'published' | 'archived';

export interface SeriesTabCounts {
  all: number;
  series: number;
  movies: number;
  drafts: number;
  published: number;
  archived: number;
}

const TABS: { key: SeriesTabKey; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All Titles', icon: Sparkles },
  { key: 'series', label: 'Series', icon: Tv },
  { key: 'movies', label: 'Movies', icon: Clapperboard },
  { key: 'drafts', label: 'Drafts', icon: FileText },
  { key: 'published', label: 'Published', icon: BadgeCheck },
  { key: 'archived', label: 'Archived', icon: Archive },
];

export default function SeriesTabs({
  active,
  counts,
  onChange,
}: {
  active: SeriesTabKey;
  counts: SeriesTabCounts | null;
  onChange: (tab: SeriesTabKey) => void;
}) {
  return (
    <div
      className="w-full flex items-center justify-between gap-1 overflow-x-auto rounded-full bg-white border border-border/50 shadow-md p-1.5"
      role="tablist"
      aria-label="Filter by type or publish status"
    >
      {TABS.map((tab, i) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        
        return (
          <Fragment key={tab.key}>
            {i > 0 && <span aria-hidden className="w-px h-5 bg-border/60 shrink-0" />}
            
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              // Note: Added `relative` here so the absolute background stays contained
              className={
                'relative flex items-center justify-center rounded-full px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors ' +
                (isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60')
              }
            >
              {/* --- THE ANIMATED BACKGROUND --- */}
              {isActive && (
                <motion.div
                  layoutId="active-tab-background"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-blush/35 to-brand-lilac/25 shadow-sm"
                  initial={false}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 35 
                  }}
                />
              )}

              {/* --- THE TAB CONTENT --- */}
              {/* Wrapped in relative z-10 so it sits ABOVE the animated background */}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={'size-4 shrink-0 transition-colors ' + (isActive ? 'text-primary' : 'text-muted-foreground/70')} />
                {tab.label}
                <span
                  className={
                    'text-[11.5px] font-bold px-1.5 py-0.5 rounded-full transition-colors ' +
                    (isActive ? 'bg-white/70 text-primary' : 'bg-muted text-muted-foreground')
                  }
                >
                  {counts ? counts[tab.key] : '—'}
                </span>
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}