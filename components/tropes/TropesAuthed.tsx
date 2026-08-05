'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../home/DashboardSidebar';
import DashboardHeader from '../home/DashboardHeader';
import DiscoverScrollRow from '../discover/DiscoverScrollRow';
import TropeFilterChips from './TropeFilterChips';
import PopularTropeCard from './PopularTropeCard';
import CategoryCard from './CategoryCard';
import NewTropeCard from './NewTropeCard';
import WhatAreTropesCard from './WhatAreTropesCard';
import TopTropesCard from './TopTropesCard';
import TrendingTropesCard from './TrendingTropesCard';
import TropeSuggestCard from './TropeSuggestCard';
import { POPULAR_TROPES, BROWSE_CATEGORIES, NEW_TROPES } from '../../lib/tropesContent';

// The logged-in Tropes page. Selecting a filter chip doesn't re-slice these
// rows (trope tagging isn't a real column yet, see lib/tropesContent.ts) --
// same honest scope as the chips themselves, which exist as real controls
// pending a real filter to drive.
export default function TropesAuthed() {
  const [selectedTrope, setSelectedTrope] = useState('all');

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
                <DiscoverScrollRow>
                  {POPULAR_TROPES.map((trope) => (
                    <PopularTropeCard key={trope.key} trope={trope} />
                  ))}
                </DiscoverScrollRow>
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
                <DiscoverScrollRow>
                  {NEW_TROPES.map((trope) => (
                    <NewTropeCard key={trope.key} trope={trope} />
                  ))}
                </DiscoverScrollRow>
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
