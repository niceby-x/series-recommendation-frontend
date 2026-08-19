'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import GenreManager, { type AdminGenre } from '../../../components/admin/GenreManager';
import { useAdminPageHeader } from '../../../components/admin/AdminPageHeaderContext';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

export default function AdminGenresPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [genres, setGenres] = useState<AdminGenre[]>([]);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  // Called unconditionally, before the access-state early returns below
  // (checking/signed_out/forbidden/error all `return` before reaching the
  // real page) -- same Rules of Hooks reason any hook has to run in every
  // render, not just the "happy path" one.
  useAdminPageHeader({
    title: 'Genres',
    subtitle:
      'Genres are created automatically when a candidate with genre data is approved. Rename, merge, or delete them here.',
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

      const [genresRes, countsRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader }),
      ]);

      if (genresRes.status === 401 || countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (genresRes.status === 403 || countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!genresRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const genresJson = await genresRes.json();
      setGenres(genresJson.data || []);

      setAccess('ok');
    }

    load();
  }, [user]);

  async function withAdminAuth<T>(run: (authHeader: Record<string, string>) => Promise<T>): Promise<T | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return null;
    }
    return run({ Authorization: 'Bearer ' + session.access_token });
  }

  async function handleRename(genre: AdminGenre, name: string): Promise<boolean> {
    setBusyIds((prev) => new Set(prev).add(genre.id));

    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres/' + genre.id, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
    );

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(genre.id);
      return next;
    });

    if (!result?.ok) return false;

    const json = await result.json();
    setGenres((prev) => prev.map((g) => (g.id === genre.id ? { ...g, name: json.data.name } : g)));
    return true;
  }

  async function handleDelete(genre: AdminGenre) {
    const confirmed = window.confirm(
      'Permanently delete "' + genre.name + '"? This un-tags it from ' + genre.series_count + ' series. This cannot be undone.'
    );
    if (!confirmed) return;

    setBusyIds((prev) => new Set(prev).add(genre.id));

    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres/' + genre.id, {
        method: 'DELETE',
        headers: authHeader,
      })
    );

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(genre.id);
      return next;
    });

    if (result?.ok) {
      setGenres((prev) => prev.filter((g) => g.id !== genre.id));
    }
  }

  async function handleMerge(sourceIds: number[], targetId: number): Promise<boolean> {
    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres/merge', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_ids: sourceIds, target_id: targetId }),
      })
    );

    if (!result?.ok) return false;

    // Merged series counts move onto the target -- refetch rather than
    // trying to reconcile the dedup logic (skip-if-already-linked) client
    // side, since the true post-merge count depends on overlap the client
    // doesn't know about.
    const genresRes = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres', { headers: authHeader })
    );
    if (genresRes?.ok) {
      const json = await genresRes.json();
      setGenres(json.data || []);
    } else {
      setGenres((prev) => prev.filter((g) => !sourceIds.includes(g.id)));
    }
    return true;
  }

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
        <p className="text-rose-500">Could not load genres. Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[820px] mx-auto">
          <GenreManager genres={genres} busyIds={busyIds} onRename={handleRename} onDelete={handleDelete} onMerge={handleMerge} />
        </div>
      </div>
  );
}
