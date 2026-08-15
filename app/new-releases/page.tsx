import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import NewReleasesAuthed, { type NewReleasesInitialData } from '../../components/new-releases/NewReleasesAuthed';
import NewReleasesLanding from '../../components/new-releases/NewReleasesLanding';
import { isoDateDaysAgo } from '../../lib/newReleasesContent';

const JUST_RELEASED_LIMIT = 4;
const TRENDING_LIMIT = 5;
// This week's calendar strip only needs releases from the last 7 days
// (any Mon-Sun window containing today is at most 6 days back) -- 100 is
// a generous cap for that narrow a window, not a full-catalog fetch.
const THIS_WEEK_LIMIT = 100;

async function fetchSeries(query: string): Promise<{ data: SeriesCardData[]; total: number }> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series?' + query, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Series fetch failed with status ' + res.status);
      return { data: [], total: 0 };
    }

    const json = await res.json();
    return {
      data: (json.data || []) as SeriesCardData[],
      total: (json.pagination?.total ?? json.data?.length ?? 0) as number,
    };
  } catch (err) {
    console.error('Series fetch threw an error:', err);
    return { data: [], total: 0 };
  }
}

// G1-01: previously fetched the entire unpaginated catalog and derived
// everything below from a client-side mock release-date hash (see
// lib/newReleasesContent.ts's old mockDaysAgoFor). release_date is now a
// real column (see the backend's migrations/010_series_release_date.sql),
// so each of these is its own small, targeted GET /series call instead of
// one fetch of everything:
//   - justReleased: sort=newest_release, capped to the hero/strip size
//   - trending: sort=top_rated, capped to the sidebar size (same
//     average_rating-desc computation the old client-side sort did)
//   - newThisMonthCount: release_date_min 30 days back, just the count
//     (limit=1 -- only pagination.total is used)
//   - thisWeekReleases: release_date_min 7 days back, capped generously
//     -- covers any Mon-Sun window containing today for the calendar
//     strip and today's-releases fallback
async function getInitialData(): Promise<NewReleasesInitialData> {
  const [justReleased, trending, newThisMonth, thisWeek] = await Promise.all([
    fetchSeries('sort=newest_release&page=1&limit=' + JUST_RELEASED_LIMIT),
    fetchSeries('sort=top_rated&page=1&limit=' + TRENDING_LIMIT),
    fetchSeries('release_date_min=' + isoDateDaysAgo(30) + '&page=1&limit=1'),
    fetchSeries('sort=newest_release&release_date_min=' + isoDateDaysAgo(7) + '&page=1&limit=' + THIS_WEEK_LIMIT),
  ]);

  return {
    justReleased: justReleased.data,
    trending: trending.data,
    newThisMonthCount: newThisMonth.total,
    thisWeekReleases: thisWeek.data,
  };
}

// Same HomeGate split as app/moods/page.tsx and app/tropes/page.tsx.
export default async function NewReleasesPage() {
  const initialData = await getInitialData();

  return <HomeGate landing={<NewReleasesLanding />} authed={<NewReleasesAuthed initialData={initialData} />} />;
}
