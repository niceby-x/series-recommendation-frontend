'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useAuthModal } from '../../lib/AuthModalContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import EditorialQueueTable, { type QueueRow } from '../../components/admin/EditorialQueueTable';
import RecentlyPublishedCard from '../../components/admin/RecentlyPublishedCard';
import RecentActivityCard from '../../components/admin/RecentActivityCard';
import TopMoodsCard from '../../components/admin/TopMoodsCard';
import QuickActionsCard from '../../components/admin/QuickActionsCard';
import { STAT_CARDS, MOCK_CURATORS } from '../../lib/adminContent';
import type { SeriesCardData } from '../../components/shared/SeriesCard';

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

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

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

export default function AdminDashboardPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 });
  const [queue, setQueue] = useState<PendingCandidate[]>([]);
  const [allSeries, setAllSeries] = useState<SeriesCardData[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadAll() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAccess('signed_out');
        return;
      }
      const authHeader = { Authorization: 'Bearer ' + session.access_token };

      const [countsRes, queueRes, seriesRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates?status=pending', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/series', { cache: 'no-store' }),
      ]);

      if (countsRes.status === 401 || queueRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (countsRes.status === 403 || queueRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!countsRes.ok || !queueRes.ok) {
        setAccess('error');
        return;
      }

      const countsJson = await countsRes.json();
      setCounts({ pending: countsJson.pending, approved: countsJson.approved, rejected: countsJson.rejected });

      const queueJson = await queueRes.json();
      setQueue((queueJson.data || []).slice(0, QUEUE_PREVIEW_SIZE));

      if (seriesRes.ok) {
        const seriesJson = await seriesRes.json();
        setAllSeries(seriesJson.data || []);
      }

      setAccess('ok');
    }

    loadAll();
  }, [user]);

  if (access === 'checking') return null;

  if (access === 'signed_out') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-semibold hover:opacity-80">
            Sign in
          </button>{' '}
          to access the admin dashboard.
        </p>
      </main>
    );
  }

  if (access === 'forbidden') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </main>
    );
  }

  if (access === 'error') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500">Could not load the admin dashboard. Try refreshing the page.</p>
      </main>
    );
  }

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

  // Real: total/pending/published (Users/Comments are placeholders -- see
  // lib/adminContent.ts header for exactly why). Total = published series
  // + still-pending candidates -- not + counts.approved, since an approved
  // candidate becomes a series row, so that's already inside allSeries.
  const statValues: Record<string, { value: string; subtitle: string }> = {
    total: { value: (allSeries.length + counts.pending).toLocaleString(), subtitle: 'Live + in review' },
    pending: { value: String(counts.pending), subtitle: 'Requires your review' },
    published: { value: allSeries.length.toLocaleString(), subtitle: 'Live on site' },
    users: { value: '8,532', subtitle: '↑ 156 this week (est.)' },
    comments: { value: '2,340', subtitle: '↑ 71 this week (est.)' },
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={counts.pending} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1500px] mx-auto">
          <AdminHeader user={user} notifCount={counts.pending} />

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
