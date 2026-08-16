import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import EditorialQueueTable, { type QueueRow } from '../../components/admin/EditorialQueueTable';
import RecentlyPublishedCard from '../../components/admin/RecentlyPublishedCard';
import RecentActivityCard from '../../components/admin/RecentActivityCard';
import TopMoodsCard from '../../components/admin/TopMoodsCard';
import QuickActionsCard from '../../components/admin/QuickActionsCard';
import SignInPrompt from '../../components/shared/SignInPrompt';
import { STAT_CARDS, MOCK_CURATORS } from '../../lib/adminContent';
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
}

const LONG_RUNNING_THRESHOLD = 60;
const QUEUE_PREVIEW_SIZE = 6;

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
      allSeries: SeriesCardData[];
      userCount: number;
    };

async function loadAdminData(accessToken: string): Promise<AdminData> {
  const authHeader = { Authorization: 'Bearer ' + accessToken };

  const [countsRes, queueRes, seriesRes, usersRes] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader, cache: 'no-store' }),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates?status=pending', { headers: authHeader, cache: 'no-store' }),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/series', { cache: 'no-store' }),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/users', { headers: authHeader, cache: 'no-store' }),
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
  const seriesJson = seriesRes.ok ? await seriesRes.json() : { data: [] };
  const usersJson = usersRes.ok ? await usersRes.json() : { count: 0 };

  return {
    access: 'ok',
    counts: { pending: countsJson.pending, approved: countsJson.approved, rejected: countsJson.rejected },
    queue: (queueJson.data || []).slice(0, QUEUE_PREVIEW_SIZE),
    allSeries: seriesJson.data || [],
    userCount: usersJson.count || 0,
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
      <main className="min-h-screen bg-background p-8">
        <SignInPrompt message="to access the admin dashboard." />
      </main>
    );
  }

  const data = await loadAdminData(accessToken);

  if (data.access === 'forbidden') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </main>
    );
  }

  if (data.access === 'error') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500">Could not load the admin dashboard. Try refreshing the page.</p>
      </main>
    );
  }

  const { counts, queue, allSeries, userCount } = data;

  const queueRows: QueueRow[] = queue.map((c, i) => ({
    id: c.id,
    posterUrl: c.poster_url,
    title: c.title,
    country: c.country,
    year: c.year,
    typeLabel: c.media_type === 'movie' ? 'Movie' : 'Series',
    submittedBy: MOCK_CURATORS[i % MOCK_CURATORS.length],
    submittedAgo: relativeTime(c.created_at),
    priority: priorityFor(c),
  }));

  // Real: total/pending/published/users (Comments is still a placeholder --
  // see lib/adminContent.ts header for exactly why). Total = published
  // series + still-pending candidates -- not + counts.approved, since an
  // approved candidate becomes a series row, so that's already inside
  // allSeries.
  const statValues: Record<string, { value: string; subtitle: string }> = {
    total: { value: (allSeries.length + counts.pending).toLocaleString(), subtitle: 'Live + in review' },
    pending: { value: String(counts.pending), subtitle: 'Requires your review' },
    published: { value: allSeries.length.toLocaleString(), subtitle: 'Live on site' },
    users: { value: userCount.toLocaleString(), subtitle: 'Registered accounts' },
    comments: { value: '2,340', subtitle: '↑ 71 this week (est.)' },
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={counts.pending} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1500px] mx-auto">
          <AdminHeader user={user} />

          <div className="flex flex-wrap gap-4 mb-8">
            {STAT_CARDS.map((card, i) => (
              <StatCard
                key={card.key}
                label={card.label}
                icon={card.icon}
                color={card.color}
                value={statValues[card.key].value}
                subtitle={statValues[card.key].subtitle}
                seed={i + 1}
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

              <RecentlyPublishedCard series={allSeries.slice(0, 6)} />
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <RecentActivityCard />
              <TopMoodsCard />
              <QuickActionsCard />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
