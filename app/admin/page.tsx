import StatCard from '../../components/admin/StatCard';
import EditorialQueueTable, { type QueueRow } from '../../components/admin/EditorialQueueTable';
import RecentlyPublishedCard from '../../components/admin/RecentlyPublishedCard';
import RecentActivityCard, { type RealActivityItem } from '../../components/admin/RecentActivityCard';
import TopMoodsCard, { type RealTopMood } from '../../components/admin/TopMoodsCard';
import QuickActionsCard from '../../components/admin/QuickActionsCard';
import SignInPrompt from '../../components/shared/SignInPrompt';
import { STAT_CARDS } from '../../lib/adminContent';
import type { SeriesCardData } from '../../components/shared/SeriesCard';
import { getServerSession } from '../../lib/getServerSession';

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
}

interface PendingCandidate {
  id: number;
  title: string;
  country: string;
  year: number | null;
  poster_url: string | null;
  media_type: string;
  episode_count: number;
  is_animated: boolean;
  synopsis: string;
  genre_names: string[] | null;
  cast_json: unknown[] | null;
  created_at: string;
  source_keyword: string | null;
}

const LONG_RUNNING_THRESHOLD = 60;
const QUEUE_PREVIEW_SIZE = 6;
// D3-03: RecentlyPublishedCard only ever showed 6 series, but the fetch
// below used to pull the entire catalog to get there. Separate constant
// from QUEUE_PREVIEW_SIZE (both happen to be 6 today) since they're
// unrelated previews that could diverge later.
//
// D3-04: dropped from 6 to 5 -- RecentlyPublishedCard's poster grid is a
// fixed 5-column single row now, so 6 would leave one card dangling
// with nothing to its right on the next row.
const RECENT_SERIES_PREVIEW_SIZE = 5;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return hours + 'h ago';
  return Math.round(hours / 24) + 'd ago';
}

// Same missing-data / long-running heuristic app/admin/candidates/page.tsx
// uses for its left-accent color, repurposed as a priority label here --
// a real signal from real fields, not a random assignment.
function priorityFor(c: PendingCandidate): QueueRow['priority'] {
  const missingData = !c.synopsis || !c.genre_names?.length || !c.cast_json?.length;
  if (missingData) return 'High';
  if (c.episode_count >= LONG_RUNNING_THRESHOLD || c.is_animated) return 'Medium';
  return 'Low';
}

type AdminData =
  | { access: 'forbidden' }
  | { access: 'error' }
  | {
      access: 'ok';
      counts: Counts;
      queue: PendingCandidate[];
      recentSeries: SeriesCardData[];
      seriesTotal: number;
      userCount: number;
      activity: RealActivityItem[];
      topMoods: RealTopMood[];
    };

async function loadAdminData(accessToken: string): Promise<AdminData> {
  const authHeader = { Authorization: 'Bearer ' + accessToken };

  const [countsRes, queueRes, seriesRes, usersRes, activityRes, topMoodsRes] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader, cache: 'no-store' }),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates?status=pending', { headers: authHeader, cache: 'no-store' }),
    // D3-03: this used to be a plain GET /series -- with no page/limit,
    // that returns the *entire* catalog, just to read .length for two
    // stat cards and slice(0, 6) for RecentlyPublishedCard below. GET
    // /series already supports opt-in pagination (see series.ts) and
    // returns an exact total in the response envelope whenever it's
    // used, so requesting exactly the 6 rows this page actually renders
    // gets both the preview rows *and* the real total in one lightweight
    // query -- no separate count-only endpoint needed.
    //
    // Ad hoc fix: this used to stop there, with no sort param -- which
    // meant id-ascending, the backend's stable default for pagination
    // (D2-04 in series.ts), not a recency signal. That made "Recently
    // Published" actually show the 6 *oldest* series in the whole
    // catalog, forever, never reflecting what had just been approved
    // through the Editorial Queue. sort=recently_added orders by id
    // descending instead -- a fresh approval is a fresh INSERT into
    // series, so newest id really is most-recently-published here.
    fetch(process.env.NEXT_PUBLIC_API_URL + '/series?page=1&limit=' + RECENT_SERIES_PREVIEW_SIZE + '&sort=recently_added', { cache: 'no-store' }),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/users', { headers: authHeader, cache: 'no-store' }),
    // D2-01: RecentActivityCard/TopMoodsCard's real data, fetched
    // alongside everything else this page already needs rather than as
    // separate client-side requests -- see the backend handoff on this
    // item for the response shapes.
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/activity?limit=5', { headers: authHeader, cache: 'no-store' }),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/top-moods', { headers: authHeader, cache: 'no-store' }),
  ]);

  // A 401 here would mean the backend independently rejected the token
  // this route already validated server-side (see lib/getServerSession.ts)
  // -- defensive, not expected in normal operation, but kept as a real
  // check rather than assumed away now that the initial auth gate moved
  // server-side.
  if (countsRes.status === 401 || queueRes.status === 401 || usersRes.status === 401) {
    return { access: 'forbidden' };
  }
  if (countsRes.status === 403 || queueRes.status === 403 || usersRes.status === 403) {
    return { access: 'forbidden' };
  }
  if (!countsRes.ok || !queueRes.ok) {
    return { access: 'error' };
  }

  const countsJson = await countsRes.json();
  const queueJson = await queueRes.json();
  const seriesJson = seriesRes.ok ? await seriesRes.json() : { data: [], pagination: { total: 0 } };
  const usersJson = usersRes.ok ? await usersRes.json() : { count: 0 };
  // Sidebar widgets, not the primary page content -- a failure here
  // degrades to an empty state (each card already renders one when given
  // []) rather than failing the whole dashboard the way a queue/counts
  // failure does above.
  const activityJson = activityRes.ok ? await activityRes.json() : { data: [] };
  const topMoodsJson = topMoodsRes.ok ? await topMoodsRes.json() : { data: [] };

  return {
    access: 'ok',
    counts: { pending: countsJson.pending, approved: countsJson.approved, rejected: countsJson.rejected },
    queue: (queueJson.data || []).slice(0, QUEUE_PREVIEW_SIZE),
    recentSeries: seriesJson.data || [],
    seriesTotal: seriesJson.pagination?.total ?? 0,
    userCount: usersJson.count || 0,
    activity: activityJson.data || [],
    topMoods: topMoodsJson.data || [],
  };
}

// G2-02: this used to be a client component that spent its first render
// blank (access: 'checking') while supabase.auth.getSession() and then
// the admin API calls both resolved client-side -- a flash on every load,
// and nothing real for a crawler (moot here since /admin is already
// excluded from the sitemap/robots.txt, but the flash was real for actual
// admins too). Now a plain Server Component: the session (see
// lib/getServerSession.ts) is read from cookies and the dashboard data is
// fetched before anything is sent to the browser. The is_admin
// authorization check itself is unchanged -- it was always the backend's
// 401/403 responses that decided forbidden vs. ok, not anything client-
// side, so that part doesn't move, only the session lookup that gates it
// does.
export default async function AdminDashboardPage() {
  const { user, accessToken } = await getServerSession();

  if (!user || !accessToken) {
    return (
      <div className="p-8">
        <SignInPrompt message="to access the admin dashboard." />
      </div>
    );
  }

  const data = await loadAdminData(accessToken);

  if (data.access === 'forbidden') {
    return (
      <div className="p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  if (data.access === 'error') {
    return (
      <div className="p-8">
        <p className="text-rose-500">Could not load the admin dashboard. Try refreshing the page.</p>
      </div>
    );
  }

  const { counts, queue, recentSeries, seriesTotal, userCount, activity, topMoods } = data;

  const queueRows: QueueRow[] = queue.map((c) => ({
    id: c.id,
    posterUrl: c.poster_url,
    title: c.title,
    country: c.country,
    year: c.year,
    typeLabel: c.media_type === 'movie' ? 'Movie' : 'Series',
    // D2-02: real discovery keyword from series_candidates.source_keyword
    // (already returned by GET /admin/candidates), not a fabricated
    // curator name. Older rows backfilled before this column existed
    // fall back to an em dash in the table itself.
    sourceKeyword: c.source_keyword || '',
    submittedAgo: relativeTime(c.created_at),
    priority: priorityFor(c),
  }));

  // Real: total/pending/published/users (Comments is still a placeholder --
  // see lib/adminContent.ts header for exactly why). Total = published
  // series + still-pending candidates -- not + counts.approved, since an
  // approved candidate becomes a series row, so that's already inside
  // seriesTotal. D3-03: seriesTotal comes from GET /series's own
  // pagination.total (an exact DB count), not allSeries.length off a
  // full-catalog fetch.
  const statValues: Record<string, { value: string; subtitle: string }> = {
    total: { value: (seriesTotal + counts.pending).toLocaleString(), subtitle: 'Live + in review' },
    pending: { value: String(counts.pending), subtitle: 'Requires your review' },
    published: { value: seriesTotal.toLocaleString(), subtitle: 'Live on site' },
    users: { value: userCount.toLocaleString(), subtitle: 'Registered accounts' },
  };

  return (
    <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1500px] mx-auto">
          {/* The greeting/search/account row used to render here as
              <AdminHeader />, but that meant it scrolled away with the
              rest of the page content -- every other admin page's
              equivalent top bar lives in AdminShell, above the scrollable
              area, and stays put. AdminHeader is now mounted there instead
              (see AdminShell's isDashboard branch) so this page is exactly
              the stat cards down. */}

          <div className="flex flex-wrap gap-4 mb-8">
            {STAT_CARDS.map((card) => (
              <StatCard
                key={card.key}
                label={card.label}
                icon={card.icon}
                color={card.color}
                value={statValues[card.key].value}
                subtitle={statValues[card.key].subtitle}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0 flex flex-col gap-10">
              <section>
                <div className="flex justify-between items-end mb-1">
                  <h2 className="font-heading text-[20px] font-normal text-foreground">
                    Editorial Queue{' '}
                    <span className="text-muted-foreground font-sans text-[15px] font-normal">({counts.pending})</span>
                  </h2>
                  <a
                    href="/admin/candidates"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold bg-card border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors shrink-0"
                  >
                    View All Queue →
                  </a>
                </div>
                <p className="text-muted-foreground text-[13.5px] mb-4">Titles waiting for your review and curation.</p>
                <EditorialQueueTable rows={queueRows} />
              </section>

              <RecentlyPublishedCard series={recentSeries} />
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <RecentActivityCard items={activity} />
              <TopMoodsCard moods={topMoods} />
              <QuickActionsCard />
            </aside>
          </div>
        </div>
      </div>
  );
}
