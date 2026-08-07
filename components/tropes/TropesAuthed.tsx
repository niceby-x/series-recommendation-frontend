'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import ScrollRow from '../dashboard/ScrollRow';
import TropeFilterChips from './TropeFilterChips';
import PopularTropeCard from './PopularTropeCard';
import CategoryCard from './CategoryCard';
import NewTropeCard from './NewTropeCard';
import WhatAreTropesCard from './WhatAreTropesCard';
import TopTropesCard from './TopTropesCard';
import TrendingTropesCard from './TrendingTropesCard';
import TropeSuggestCard from './TropeSuggestCard';
import { POPULAR_TROPES, BROWSE_CATEGORIES, NEW_TROPES } from '../../lib/tropesContent';
import { realTropeCount } from '../../lib/moodMatch';
import type { SeriesCardData } from '../shared/SeriesCard';

// The logged-in Tropes page. Unlike Moods, these rows are editorial cards
// (title/description + a series-count chip), not swappable series
// thumbnails -- so "real data" here means replacing each card's
// hardcoded seriesCount with a real count of series carrying a matching
// `trope`-dimension tag (see lib/moodMatch.ts), while keeping the curated
// title/description copy. A trope with zero real tags yet keeps its
// original editorial count rather than dropping to a bare 0, so the row
// doesn't look broken while tagging is still in progress -- same
// real-if-available-else-curated convention as Moods' real-first-then-mock
// cards, just applied to a number instead of a whole card.
export default function TropesAuthed({ allSeries }: { allSeries: SeriesCardData[] }) {
  const [selectedTrope, setSelectedTrope] = useState('all');

  const popularTropes = useMemo(
    () =>
      POPULAR_TROPES.map((t) => {
        const real = realTropeCount(allSeries, t.key);
        return real > 0 ? { ...t, seriesCount: real } : t;
      }),
    [allSeries]
  );

  const newTropes = useMemo(
    () =>
      NEW_TROPES.map((t) => {
        const real = realTropeCount(allSeries, t.key);
        return real > 0 ? { ...t, seriesCount: real } : t;
      }),
    [allSeries]
  );

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1400px]">
          <DashboardHeader title="Tropes" subtitle="Find stories you love by your favorite tropes." />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <TropeFilterChips selected={selectedTrope} onSelect={setSelectedTrope} />

              <section className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="font-heading text-[22px] font-normal text-foreground">Popular Tropes</h2>
                  <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
                    View all
                  </Link>
                </div>
                <ScrollRow>
                  {popularTropes.map((trope) => (
                    <PopularTropeCard key={trope.key} trope={trope} />
                  ))}
                </ScrollRow>
              </section>

              <section className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="font-heading text-[22px] font-normal text-foreground">Browse by Category</h2>
                  <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {BROWSE_CATEGORIES.map((category) => (
                    <CategoryCard key={category.key} category={category} />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="font-heading text-[22px] font-normal text-foreground">New Tropes</h2>
                  <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
                    View all
                  </Link>
                </div>
                <ScrollRow>
                  {newTropes.map((trope) => (
                    <NewTropeCard key={trope.key} trope={trope} />
                  ))}
                </ScrollRow>
              </section>
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <WhatAreTropesCard />
              <TopTropesCard />
              <TrendingTropesCard />
              <TropeSuggestCard />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
