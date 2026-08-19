'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import TagBrowser from '../../../components/admin/TagBrowser';
import type { SeriesCardData } from '../../../components/shared/SeriesCard';
import { useAdminPageHeader } from '../../../components/admin/AdminPageHeaderContext';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

export default function AdminTropesPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [allSeries, setAllSeries] = useState<SeriesCardData[]>([]);

  useAdminPageHeader({
    title: 'Tropes',
    subtitle:
      'Pick a trope, then add or remove which series carry it. To create, rename, or deactivate a trope tag itself, use the Tags page.',
  });

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
      <div className="p-8">
        <p className="text-muted-foreground">
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-semibold hover:opacity-80">
            Sign in
          </button>{' '}
          to access the admin dashboard.
        </p>
      </div>
    );
  }

  if (access === 'forbidden') {
    return (
      <div className="p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  if (access === 'error') {
    return (
      <div className="p-8">
        <p className="text-rose-500">Could not load this page. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1000px] mx-auto">
          <TagBrowser dimension="trope" allSeries={allSeries} onSignedOut={() => setAccess('signed_out')} />
        </div>
      </div>
  );
}
