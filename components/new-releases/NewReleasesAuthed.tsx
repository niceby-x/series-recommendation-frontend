'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import SeriesCard, { type SeriesCardData } from '../shared/SeriesCard';
import ScrollRow from '../dashboard/ScrollRow';
import TrendingSidebarCard, { type TrendingSidebarItem } from '../dashboard/TrendingSidebarCard';
import ReleaseFilterChips from './ReleaseFilterChips';
import NewReleaseHero from './NewReleaseHero';
import JustReleasedCard from './JustReleasedCard';
import UpcomingReleaseCard from './UpcomingReleaseCard';
import NewReleaseHighlightsCard from './NewReleaseHighlightsCard';
import ReleaseCalendarCard, { type CalendarDay, type TodayRelease } from './ReleaseCalendarCard';
import { mockDaysAgoFor, formatMockReleaseDate, MOCK_UPCOMING } from '../../lib/newReleasesContent';
import { mockRatingFor } from '../../lib/exploreMock';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function NewReleasesAuthed({ allSeries }: { allSeries: SeriesCardData[] }) {
  const [filter, setFilter] = useState('all');

  // Real series, each given a deterministic mock release date -- see
  // lib/newReleasesContent.ts header for why this isn't a real column yet.
  const withDates = useMemo(
    () =>
      allSeries
        .map((s) => ({
          series: s,
          daysAgo: mockDaysAgoFor(s.id),
          rating: mockRatingFor(s.id),
        }))
        .sort((a, b) => a.daysAgo - b.daysAgo),
    [allSeries]
  );

  const justReleased = withDates.slice(0, 4);

  const heroSlides = useMemo(
    () =>
      justReleased.map(({ series, rating }) => ({
        id: series.id,
        title: series.title,
        country: series.country,
        year: series.year,
        rating,
        synopsis: series.synopsis?.trim() || 'A new story worth discovering.',
        imageUrl: series.backdrop_url ?? series.poster_url,
      })),
    [justReleased]
  );

  const newThisMonthCount = withDates.filter((w) => w.daysAgo <= 30).length;
  const comingThisWeekCount = MOCK_UPCOMING.filter((u) => u.daysUntil <= 7).length;
  const mostAnticipated = MOCK_UPCOMING[0]?.title ?? '';

  const trendingItems: TrendingSidebarItem[] = useMemo(() => {
    const TRENDS: TrendingSidebarItem['trend'][] = ['up', 'up', 'down', 'up', 'flat'];
    return [...allSeries]
      .sort((a, b) => mockRatingFor(b.id) - mockRatingFor(a.id))
      .slice(0, 5)
      .map((s, i) => ({
        id: s.id,
        title: s.title,
        country: s.country,
        mediaType: 'Series',
        rating: mockRatingFor(s.id),
        imageUrl: s.backdrop_url ?? s.poster_url,
        trend: TRENDS[i],
        isReal: true,
      }));
  }, [allSeries]);

  // Real week (Mon-Sun) built from the actual current date -- a release
  // "dot" lands on a day if any real series' mock release date or any
  // MOCK_UPCOMING item's target date falls on it.
  const { calendarDays, todayReleases, todayLabel } = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);

    const realDates = withDates.map((w) => {
      const d = new Date(today);
      d.setDate(today.getDate() - w.daysAgo);
      return { date: d, series: w.series };
    });
    const upcomingDates = MOCK_UPCOMING.map((u) => {
      const d = new Date(today);
      d.setDate(today.getDate() + u.daysUntil);
      return { date: d, upcoming: u };
    });

    const days: CalendarDay[] = WEEKDAY_LABELS.map((label, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const hasRelease =
        realDates.some((r) => isSameDay(r.date, d)) || upcomingDates.some((u) => isSameDay(u.date, d));
      return { label, date: d.getDate(), hasRelease, isToday: isSameDay(d, today) };
    });

    let releases: TodayRelease[] = realDates
      .filter((r) => isSameDay(r.date, today))
      .map((r) => ({ id: r.series.id, title: r.series.title, country: r.series.country, imageUrl: r.series.backdrop_url ?? r.series.poster_url }));

    // No real release lands on today -- show the most recent one instead
    // of an empty widget (same reasoning as DiscoverAuthed's Recommended row).
    if (releases.length === 0 && withDates.length > 0) {
      const latest = withDates[0].series;
      releases = [{ id: latest.id, title: latest.title, country: latest.country, imageUrl: latest.backdrop_url ?? latest.poster_url }];
    }

    return {
      calendarDays: days,
      todayReleases: releases.slice(0, 3),
      todayLabel: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [withDates]);

  const filteredGrid = useMemo(() => {
    if (filter === 'week') return withDates.filter((w) => w.daysAgo <= 7).map((w) => w.series);
    if (filter === 'month') return withDates.filter((w) => w.daysAgo <= 30).map((w) => w.series);
    return [];
  }, [withDates, filter]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1400px]">
          <DashboardHeader title="New Releases" subtitle="Stay updated with the latest series and never miss a new story." />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <ReleaseFilterChips selected={filter} onSelect={setFilter} />

              {filter === 'all' && (
                <>
                  <div className="mb-10">
                    <NewReleaseHero slides={heroSlides} />
                  </div>

                  <section className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="font-heading text-[22px] font-normal text-foreground">Just Released</h2>
                      <button
                        type="button"
                        onClick={() => setFilter('week')}
                        className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
                      >
                        View all
                      </button>
                    </div>
                    <ScrollRow>
                      {justReleased.map(({ series, rating, daysAgo }) => (
                        <JustReleasedCard
                          key={series.id}
                          item={{
                            id: series.id,
                            title: series.title,
                            country: series.country,
                            rating,
                            imageUrl: series.backdrop_url ?? series.poster_url,
                            releaseDateLabel: formatMockReleaseDate(daysAgo),
                          }}
                        />
                      ))}
                    </ScrollRow>
                  </section>

                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="font-heading text-[22px] font-normal text-foreground">Upcoming Releases</h2>
                      <button
                        type="button"
                        onClick={() => setFilter('upcoming')}
                        className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
                      >
                        View all
                      </button>
                    </div>
                    <ScrollRow>
                      {MOCK_UPCOMING.map((item) => (
                        <UpcomingReleaseCard key={item.key} item={item} />
                      ))}
                    </ScrollRow>
                  </section>
                </>
              )}

              {(filter === 'week' || filter === 'month') && (
                <section>
                  <p className="text-muted-foreground text-sm mb-6">{filteredGrid.length} series</p>
                  {filteredGrid.length === 0 ? (
                    <p className="text-muted-foreground">
                      Nothing released {filter === 'week' ? 'this week' : 'this month'} yet.{' '}
                      <Link href="/series" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                        Browse the full catalog
                      </Link>
                      .
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredGrid.map((series) => (
                        <SeriesCard key={series.id} series={series} rating={mockRatingFor(series.id)} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {filter === 'upcoming' && (
                <section>
                  <p className="text-muted-foreground text-sm mb-6">{MOCK_UPCOMING.length} upcoming</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MOCK_UPCOMING.map((item) => (
                      <UpcomingReleaseCard key={item.key} item={item} />
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <NewReleaseHighlightsCard
                newThisMonth={newThisMonthCount}
                comingThisWeek={comingThisWeekCount}
                mostAnticipated={mostAnticipated}
                onSelectMonth={() => setFilter('month')}
                onSelectUpcoming={() => setFilter('upcoming')}
              />
              <TrendingSidebarCard items={trendingItems} />
              <ReleaseCalendarCard days={calendarDays} todayLabel={todayLabel} releases={todayReleases} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
