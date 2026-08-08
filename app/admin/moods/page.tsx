'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import TagBrowser from '../../../components/admin/TagBrowser';
import type { SeriesCardData } from '../../../components/shared/SeriesCard';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

export default function AdminMoodsPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [pendingCount, setPendingCount] = useState(0);
  const [allSeries, setAllSeries] = useState<SeriesCardData[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAccess('signed_out');
        return;
      }
      const authHeader = { Authorization: 'Bearer ' + session.access_token };

      const countsRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader });

      if (countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!countsRes.ok) {
        setAccess('error');
        return;
      }

      const countsJson = await countsRes.json();
      setPendingCount(countsJson.pending || 0);

      const seriesRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series', { cache: 'no-store' });
      if (seriesRes.ok) {
        const seriesJson = await seriesRes.json();
        setAllSeries(seriesJson.data || []);
      }

      setAccess('ok');
    }

    load();
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
        <p className="text-rose-500">Could not load this page. Try refreshing.</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={pendingCount} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1000px] mx-auto">
          <div className="mb-6">
            <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground">Moods</h1>
            <p className="text-muted-foreground text-[14px] mt-1">
              Pick a mood, then add or remove which series carry it. To create, rename, or deactivate a mood tag itself,
              use the Tags page.
            </p>
          </div>

          <TagBrowser dimension="mood" allSeries={allSeries} onSignedOut={() => setAccess('signed_out')} />
        </div>
      </div>
    </div>
  );
}
