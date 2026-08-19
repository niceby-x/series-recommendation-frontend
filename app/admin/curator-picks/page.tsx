'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Star, Trash2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import type { SeriesCardData } from '../../../components/shared/SeriesCard';
import { useAdminPageHeader } from '../../../components/admin/AdminPageHeaderContext';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

interface CuratorPickRow {
  id: number; // series id
  pick_id: number; // curator_picks row id
  title: string;
  country: string;
  year: number;
  rating: number | null;
  tags: string[];
  imageUrl: string | null;
  isFeature: boolean;
  blurb: string | null;
}

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

export default function AdminCuratorPicksPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [picks, setPicks] = useState<CuratorPickRow[]>([]);
  const [allSeries, setAllSeries] = useState<SeriesCardData[]>([]);
  const [search, setSearch] = useState('');
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  // No search in the top bar here either -- same reason as Collections:
  // `search` filters the catalog-lookup dropdown for adding a new pick,
  // not the list of existing picks below it.
  useAdminPageHeader({
    title: 'Curator Picks',
    subtitle:
      "What shows on the homepage's Curator's Picks section. One pick can be the featured card (with a quote); the rest fill the supporting list.",
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
      const header = await authHeader();
      if (!header) {
        setAccess('signed_out');
        return;
      }

      const [picksRes, countsRes, seriesRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/curator-picks', { headers: header }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: header }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/series', { cache: 'no-store' }),
      ]);

      if (picksRes.status === 401 || countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (picksRes.status === 403 || countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!picksRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const picksJson = await picksRes.json();
      setPicks(picksJson.data || []);

      if (seriesRes.ok) {
        const seriesJson = await seriesRes.json();
        setAllSeries(seriesJson.data || []);
      }

      setAccess('ok');
    }

    load();
  }, [user]);

  const pickedIds = useMemo(() => new Set(picks.map((p) => p.id)), [picks]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return allSeries.filter((s) => !pickedIds.has(s.id) && s.title.toLowerCase().includes(query)).slice(0, 6);
  }, [search, allSeries, pickedIds]);

  async function handleAdd(series: SeriesCardData) {
    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/curator-picks', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: series.id }),
    });

    if (!res.ok) return;
    const json = await res.json();

    setPicks((prev) => [
      ...prev,
      {
        id: series.id,
        pick_id: json.data.id,
        title: series.title,
        country: series.country,
        year: series.year,
        rating: null,
        tags: [],
        imageUrl: series.backdrop_url ?? series.poster_url,
        isFeature: false,
        blurb: null,
      },
    ]);
    setSearch('');
  }

  async function handleSetFeature(pick: CuratorPickRow) {
    setBusyIds((prev) => new Set(prev).add(pick.pick_id));

    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/curator-picks/' + pick.pick_id, {
      method: 'PATCH',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_feature: true }),
    });

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(pick.pick_id);
      return next;
    });

    if (!res.ok) return;

    setPicks((prev) => prev.map((p) => ({ ...p, isFeature: p.pick_id === pick.pick_id })));
  }

  async function handleSaveBlurb(pick: CuratorPickRow) {
    const blurb = drafts[pick.pick_id];
    if (blurb === undefined || blurb === pick.blurb) return;

    setBusyIds((prev) => new Set(prev).add(pick.pick_id));

    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/curator-picks/' + pick.pick_id, {
      method: 'PATCH',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ blurb }),
    });

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(pick.pick_id);
      return next;
    });

    if (!res.ok) return;

    setPicks((prev) => prev.map((p) => (p.pick_id === pick.pick_id ? { ...p, blurb } : p)));
  }

  async function handleRemove(pick: CuratorPickRow) {
    const confirmed = window.confirm('Remove "' + pick.title + '" from Curator Picks?');
    if (!confirmed) return;

    setBusyIds((prev) => new Set(prev).add(pick.pick_id));

    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/curator-picks/' + pick.pick_id, {
      method: 'DELETE',
      headers: header,
    });

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(pick.pick_id);
      return next;
    });

    if (res.ok) {
      setPicks((prev) => prev.filter((p) => p.pick_id !== pick.pick_id));
    }
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
        <p className="text-rose-500">Could not load curator picks. Try refreshing the page.</p>
      </div>
    );
  }

  const sortedPicks = [...picks].sort((a, b) => (a.isFeature === b.isFeature ? 0 : a.isFeature ? -1 : 1));

  return (
    <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[820px] mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the catalog to add a series..."
              className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
            />

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden py-1.5 z-20">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAdd(s)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors text-left"
                  >
                    <span className="truncate">
                      {s.title} <span className="text-muted-foreground">· {s.country} · {s.year}</span>
                    </span>
                    <span className="text-primary font-semibold text-[12.5px] shrink-0">Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {sortedPicks.length === 0 ? (
            <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
              <p className="text-foreground font-semibold mb-1">No curator picks yet</p>
              <p className="text-muted-foreground text-sm">
                Search above to add one. Until then, the homepage falls back to its placeholder picks.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedPicks.map((pick) => {
                const busy = busyIds.has(pick.pick_id);
                const draft = drafts[pick.pick_id] ?? pick.blurb ?? '';
                return (
                  <div key={pick.pick_id} className="rounded-2xl bg-card border border-border/60 shadow-sm p-4">
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-muted">
                        {pick.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pick.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <p className="text-foreground font-semibold text-[14.5px] truncate">{pick.title}</p>
                            <p className="text-muted-foreground text-[12.5px]">
                              {pick.country} · {pick.year}
                              {pick.rating !== null && ' · ' + pick.rating.toFixed(1) + '★'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSetFeature(pick)}
                              disabled={busy || pick.isFeature}
                              title={pick.isFeature ? 'This is the featured pick' : 'Make this the featured pick'}
                              className={
                                'flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors disabled:pointer-events-none ' +
                                (pick.isFeature
                                  ? 'bg-brand-gradient text-white'
                                  : 'bg-muted text-muted-foreground hover:text-foreground')
                              }
                            >
                              <Star className="size-3" fill={pick.isFeature ? 'currentColor' : 'none'} />
                              {pick.isFeature ? 'Featured' : 'Feature'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(pick)}
                              disabled={busy}
                              aria-label={'Remove ' + pick.title}
                              className="flex items-center justify-center size-7 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={draft}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [pick.pick_id]: e.target.value }))}
                            placeholder={pick.isFeature ? 'Curator quote for the feature card...' : 'Optional note...'}
                            className="flex-1 bg-background text-foreground placeholder:text-muted-foreground rounded-full px-3.5 py-2 text-[13px] border border-border focus:outline-none focus:border-ring transition-colors"
                          />
                          {draft !== (pick.blurb ?? '') && (
                            <button
                              type="button"
                              onClick={() => handleSaveBlurb(pick)}
                              disabled={busy}
                              className="text-primary text-[12.5px] font-semibold shrink-0 disabled:opacity-50"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
