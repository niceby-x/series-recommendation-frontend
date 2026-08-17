'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '../dashboard/DashboardShell';
import DashboardHeader from '../dashboard/DashboardHeader';
import SeriesCard, { type SeriesCardData } from '../shared/SeriesCard';
import ScrollRow from '../dashboard/ScrollRow';
import LoadMoreSeriesButton from '../shared/LoadMoreSeriesButton';
import TrendingSidebarCard, { type TrendingSidebarItem } from '../dashboard/TrendingSidebarCard';
import ReleaseFilterChips from './ReleaseFilterChips';
import NewReleaseHero from './NewReleaseHero';
import JustReleasedCard from './JustReleasedCard';
import UpcomingReleaseCard from './UpcomingReleaseCard';
import NewReleaseHighlightsCard from './NewReleaseHighlightsCard';
import ReleaseCalendarCard, { type CalendarDay, type TodayRelease } from './ReleaseCalendarCard';
import { isoDateDaysAgo, formatReleaseDate, MOCK_UPCOMING } from '../../lib/newReleasesContent';
import { usePaginatedSeries, type SeriesQueryFilters } from '../../lib/usePaginatedSeries';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface NewReleasesInitialData {
  justReleased: SeriesCardData[];
  trending: SeriesCardData[];
  newThisMonthCount: number;
  thisWeekReleases: SeriesCardData[];
}

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

// release_date is a plain YYYY-MM-DD column -- parsed at UTC midnight,
// same convention as lib/newReleasesContent.ts's formatReleaseDate, so a
// series' release day never shifts based on the viewer's local offset.
function parseReleaseDate(releaseDate: string | null | undefined): Date | null {
  if (!releaseDate) return null;
  return new Date(releaseDate + 'T00:00:00Z');
}

// G1-01: release_date is now a real column (see the backend's migrations/
// 010_series_release_date.sql), replacing the old client-side
// mockDaysAgoFor hash that ran over the full unpaginated catalog.
// `initialData` arrives pre-fetched, per-purpose, from app/new-releases/
// page.tsx (justReleased via sort=newest_release, trending via
// sort=top_rated, newThisMonthCount and thisWeekReleases via
// release_date_min) -- this component no longer holds or scans the whole
// catalog itself. The week/month grid (`filter !== 'all'`) fetches its own
// page via usePaginatedSeries + release_date_min, same Load More pattern
// Series/Discover already uses.
export default function NewReleasesAuthed({ initialData }: { initialData: NewReleasesInitialData }) {
  const [filter, setFilter] = useState('all');

  const heroSlides = useMemo(
    () =>
      initialData.justReleased.map((s) => ({
        id: s.id,
        title: s.title,
        country: s.country,
        year: s.year,
        rating: s.average_rating ?? null,
        synopsis: s.synopsis?.trim() || 'A new story worth discovering.',
        imageUrl: s.backdrop_url ?? s.poster_url,
      })),
    [initialData.justReleased]
  );

  const newThisMonthCount = initialData.newThisMonthCount;
  const comingThisWeekCount = MOCK_UPCOMING.filter((u) => u.daysUntil <= 7).length;
  const mostAnticipated = MOCK_UPCOMING[0]?.title ?? '';

  // Real week-over-week trend direction isn't tracked for this sidebar
  // specifically (see H2-01's rank_trend for the one that is) -- same
  // placeholder cycle as before, just applied to a server-sorted top 5
  // instead of a client-sorted one.
  const trendingItems: TrendingSidebarItem[] = useMemo(() => {
    const TRENDS: TrendingSidebarItem['trend'][] = ['up', 'up', 'down', 'up', 'flat'];
    return initialData.trending.map((s, i) => ({
      id: s.id,
      title: s.title,
      country: s.country,
      mediaType: 'Series',
      rating: s.average_rating ?? null,
      imageUrl: s.backdrop_url ?? s.poster_url,
      trend: TRENDS[i],
      isReal: true,
    }));
  }, [initialData.trending]);

  // Real week (Mon-Sun) built from the actual current date -- a release
  // "dot" lands on a day if any real series' real release_date or any
  // MOCK_UPCOMING item's target date falls on it.
  const { calendarDays, todayReleases, todayLabel } = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);

    const realDates = initialData.thisWeekReleases
      .map((s) => ({ date: parseReleaseDate(s.release_date), series: s }))
      .filter((r): r is { date: Date; series: SeriesCardData } => r.date !== null);
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
    // of an empty widget (same reasoning as DiscoverAuthed's Recommended
    // row). thisWeekReleases already arrives sorted newest-first
    // (sort=newest_release), so [0] is the most recent.
    if (releases.length === 0 && initialData.thisWeekReleases.length > 0) {
      const latest = initialData.thisWeekReleases[0];
      releases = [{ id: latest.id, title: latest.title, country: latest.country, imageUrl: latest.backdrop_url ?? latest.poster_url }];
    }

    return {
      calendarDays: days,
      todayReleases: releases.slice(0, 3),
      todayLabel: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [initialData.thisWeekReleases]);

  // G1-01: the week/month grid is its own paginated fetch (release_date_min
  // pushed into GET /series's SQL query, see the backend handoff), grown
  // via Load More -- same pattern Series/Discover already uses for its
  // own filtered results, rather than slicing an already-fetched full
  // catalog client-side.
  const filters: SeriesQueryFilters | undefined =
    filter === 'week'
      ? { release_date_min: isoDateDaysAgo(7), sort: 'newest_release' }
      : filter === 'month'
        ? { release_date_min: isoDateDaysAgo(30), sort: 'newest_release' }
        : undefined;
  const { series: filteredSeries, hasMore: filteredHasMore, loading: filteredLoading, loadingMore: filteredLoadingMore, loadMore: loadMoreFiltered } =
    usePaginatedSeries([], null, filters);

  return (
    <DashboardShell>
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
                      {initialData.justReleased.map((series) => (
                        <JustReleasedCard
                          key={series.id}
                          item={{
                            id: series.id,
                            title: series.title,
                            country: series.country,
                            rating: series.average_rating ?? null,
                            imageUrl: series.backdrop_url ?? series.poster_url,
                            releaseDateLabel: formatReleaseDate(series.release_date),
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
                  <p className="text-muted-foreground text-sm mb-6">
                    {filteredLoading ? 'Loading…' : filteredSeries.length + ' series'}
                  </p>
                  {!filteredLoading && filteredSeries.length === 0 ? (
                    <p className="text-muted-foreground">
                      Nothing released {filter === 'week' ? 'this week' : 'this month'} yet.{' '}
                      <Link href="/series" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                        Browse the full catalog
                      </Link>
                      .
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSeries.map((series) => (
                          <SeriesCard key={series.id} series={series} rating={series.average_rating ?? null} />
                        ))}
                      </div>
                      <LoadMoreSeriesButton hasMore={filteredHasMore} loading={filteredLoadingMore} onClick={loadMoreFiltered} />
                    </>
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
    </DashboardShell>
  );
}
