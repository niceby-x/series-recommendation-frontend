'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '../dashboard/DashboardShell';
import DashboardHeader from '../dashboard/DashboardHeader';
import type { SeriesCardData } from '../shared/SeriesCard';
import MoodFilterChips from './MoodFilterChips';
import MoodCard from './MoodCard';
import MoodPickerCard from './MoodPickerCard';
import TopMoodCard from './TopMoodCard';
import PopularInMoodCard from './PopularInMoodCard';
import MoodFeedbackCard from './MoodFeedbackCard';
import { MOOD_FILTERS, MOOD_SECTIONS, MOCK_POPULAR_IN_MOOD, type MoodCardItem } from '../../lib/moodsContent';

const CARDS_PER_SECTION = 4;

// The logged-in Moods page. Each section's real items now come pre-matched
// from the backend (see app/moods/page.tsx's per-section GET /series?
// tag_dimension=mood&tag_key=... calls, and the backend's ported
// lib/moodMatch.ts logic) rather than this component filtering the full
// catalog client-side (see G1-01) -- a series only fills a "Romantic &
// Heartfelt" slot if it's actually tagged romantic, same as before, just
// computed server-side now. Real matches fill each row first (in whatever
// order GET /series already returns them), and curated mock cards fill
// whatever's left -- so a mood with zero tagged series yet still renders
// its full editorial row instead of going empty, and one with plenty of
// real tags gradually pushes the mock cards out as tagging catches up.
// Same real-first-then-mock convention as HomeAuthed/DiscoverAuthed, just
// driven by a server-side filter instead of a client-side one.
export default function MoodsAuthed({
  realMatchesBySection,
}: {
  realMatchesBySection: Record<string, SeriesCardData[]>;
}) {
  // Seeded from ?mood= (see H1-01 -- Home's mood cards link here with a
  // real key now). Falls back to 'all' for a missing/unrecognized param
  // rather than trusting an arbitrary URL value as a filter key.
  const searchParams = useSearchParams();
  const requestedMood = searchParams.get('mood');
  const initialMood =
    requestedMood && MOOD_FILTERS.some((f) => f.key === requestedMood) ? requestedMood : 'all';
  const [selectedMood, setSelectedMood] = useState(initialMood);

  const sections = useMemo(() => {
    return MOOD_SECTIONS.map((section) => {
      const realMatches = realMatchesBySection[section.key] ?? [];
      const realItems: MoodCardItem[] = realMatches
        .slice(0, CARDS_PER_SECTION)
        .map((s) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          rating: s.average_rating ?? null,
          imageUrl: s.backdrop_url ?? s.poster_url,
          isReal: true,
        }));
      const mockFill = section.mockItems.slice(0, CARDS_PER_SECTION - realItems.length);
      return { ...section, items: [...realItems, ...mockFill] };
    });
  }, [realMatchesBySection]);

  const visibleSections =
    selectedMood === 'all' ? sections : sections.filter((s) => s.moodFilterKey === selectedMood);

  return (
    <DashboardShell header={<DashboardHeader title="Moods" subtitle="How are you feeling today?" />}>
      <div className="w-full max-w-[1400px]">

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
    </DashboardShell>
  );
}
