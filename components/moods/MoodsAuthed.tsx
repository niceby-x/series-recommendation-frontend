'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import type { SeriesCardData } from '../shared/SeriesCard';
import MoodFilterChips from './MoodFilterChips';
import MoodCard from './MoodCard';
import MoodPickerCard from './MoodPickerCard';
import TopMoodCard from './TopMoodCard';
import PopularInMoodCard from './PopularInMoodCard';
import MoodFeedbackCard from './MoodFeedbackCard';
import { MOOD_SECTIONS, MOCK_POPULAR_IN_MOOD, type MoodCardItem } from '../../lib/moodsContent';
import { mockRatingFor } from '../../lib/exploreMock';
import { seriesMatchesMoodKey } from '../../lib/moodMatch';

const CARDS_PER_SECTION = 4;

// The logged-in Moods page. Each section now matches series by their real
// `mood`-dimension series_tags (see lib/moodMatch.ts) rather than taking a
// positional slice of the catalog regardless of actual mood -- a series
// only fills a "Romantic & Heartfelt" slot if it's actually tagged
// romantic. Real matches fill each row first (most-recently-added first,
// via reverse()), and curated mock cards fill whatever's left -- so a mood
// with zero tagged series yet still renders its full editorial row instead
// of going empty, and one with plenty of real tags gradually pushes the
// mock cards out as tagging catches up. Same real-first-then-mock
// convention as HomeAuthed/DiscoverAuthed, just driven by a real filter
// instead of array position.
export default function MoodsAuthed({ allSeries }: { allSeries: SeriesCardData[] }) {
  const [selectedMood, setSelectedMood] = useState('all');

  const sections = useMemo(() => {
    return MOOD_SECTIONS.map((section) => {
      const realMatches = allSeries.filter((s) => seriesMatchesMoodKey(s.tags, section.moodFilterKey));
      const realItems: MoodCardItem[] = realMatches
        .slice(0, CARDS_PER_SECTION)
        .map((s) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          rating: mockRatingFor(s.id),
          imageUrl: s.backdrop_url ?? s.poster_url,
          isReal: true,
        }));
      const mockFill = section.mockItems.slice(0, CARDS_PER_SECTION - realItems.length);
      return { ...section, items: [...realItems, ...mockFill] };
    });
  }, [allSeries]);

  const visibleSections =
    selectedMood === 'all' ? sections : sections.filter((s) => s.moodFilterKey === selectedMood);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1400px]">
          <DashboardHeader title="Moods" subtitle="How are you feeling today?" />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <MoodFilterChips selected={selectedMood} onSelect={setSelectedMood} />

              {visibleSections.length === 0 ? (
                <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
                  <p className="text-foreground font-semibold mb-1">More moods are on the way</p>
                  <p className="text-muted-foreground text-sm">
                    We&apos;re still curating this one. In the meantime,{' '}
                    <Link href="/series" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                      browse the full catalog
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                visibleSections.map((section) => (
                  <section key={section.key} className="mb-10">
                    <div className="flex justify-between items-end mb-1">
                      <h2 className="font-heading text-[22px] font-normal text-foreground">{section.title}</h2>
                      <Link
                        href="/series"
                        className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
                      >
                        View all
                      </Link>
                    </div>
                    <p className="text-muted-foreground text-[13.5px] mb-4">{section.subtitle}</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                      {section.items.map((item) => (
                        <MoodCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <MoodPickerCard onPick={setSelectedMood} />
              <TopMoodCard />
              <PopularInMoodCard items={MOCK_POPULAR_IN_MOOD} />
              <MoodFeedbackCard />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
