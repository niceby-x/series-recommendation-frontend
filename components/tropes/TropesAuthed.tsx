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
import { realTropeMatches } from '../../lib/moodMatch';
import type { SeriesCardData } from '../shared/SeriesCard';

// The logged-in Tropes page. Popular/New Tropes cards now carry real data
// two ways once a trope has real series_tags matches (see lib/moodMatch.ts):
// a poster collage/image sourced from the actual matching series, and a
// working link to /series?trope=key (read by DiscoverAuthed's filter,
// see components/discover/DiscoverAuthed.tsx) instead of the plain
// catalog link. A trope with zero real tags yet keeps its original
// editorial icon/count/link -- same real-if-available-else-curated
// convention as before, just extended from "just the count" to "the whole
// card's real-vs-mock presentation."
export default function TropesAuthed({ allSeries }: { allSeries: SeriesCardData[] }) {
  const [selectedTrope, setSelectedTrope] = useState('all');

  const popularTropes = useMemo(
    () =>
      POPULAR_TROPES.map((t) => {
        const matches = realTropeMatches(allSeries, t.key);
        if (matches.length === 0) return { trope: t, posterUrls: undefined as (string | null)[] | undefined };
        return {
          trope: { ...t, seriesCount: matches.length },
          posterUrls: matches.slice(0, 3).map((s) => s.backdrop_url ?? s.poster_url),
        };
      }),
    [allSeries]
  );

  const newTropes = useMemo(
    () =>
      NEW_TROPES.map((t) => {
        const matches = realTropeMatches(allSeries, t.key);
        if (matches.length === 0) return { trope: t, posterUrl: undefined as string | null | undefined };
        return {
          trope: { ...t, seriesCount: matches.length },
          posterUrl: matches[0].backdrop_url ?? matches[0].poster_url,
        };
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
                  {popularTropes.map(({ trope, posterUrls }) => (
                    <PopularTropeCard key={trope.key} trope={trope} posterUrls={posterUrls} />
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
                  {newTropes.map(({ trope, posterUrl }) => (
                    <NewTropeCard key={trope.key} trope={trope} posterUrl={posterUrl} />
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
