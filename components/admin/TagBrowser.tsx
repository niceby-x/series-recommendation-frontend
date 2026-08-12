'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AdminTag } from './TagDimensionSection';
import type { SeriesCardData } from '../shared/SeriesCard';
import type { TagDimension } from '../../lib/taxonomy';

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

interface TaggedSeries {
  id: number;
  title: string;
  country: string;
  year: number;
  poster_url: string | null;
  backdrop_url: string | null;
}

// Browsing-by-tag for one dimension (Moods = 'mood', Tropes = 'trope').
// Complements the Tags page (which manages the tag vocabulary itself --
// create/rename/merge/deactivate) with the reverse direction: pick a tag,
// see and edit which series carry it, without opening each series
// individually. Shared by app/admin/moods/page.tsx and
// app/admin/tropes/page.tsx since they're the same screen parameterized by
// dimension.
export default function TagBrowser({
  dimension,
  allSeries,
  onSignedOut,
}: {
  dimension: TagDimension;
  allSeries: SeriesCardData[];
  onSignedOut: () => void;
}) {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [taggedSeries, setTaggedSeries] = useState<TaggedSeries[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadTags() {
      const header = await authHeader();
      if (!header) {
        onSignedOut();
        return;
      }
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags?all=true', { headers: header });
      if (!res.ok) return;
      const json = await res.json();
      const dimensionTags: AdminTag[] = (json.data?.[dimension] || []).filter((t: AdminTag) => t.is_active);
      setTags(dimensionTags);
      if (dimensionTags.length > 0) setSelectedTagId(dimensionTags[0].id);
    }
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension]);

  useEffect(() => {
    if (selectedTagId === null) return;

    async function loadSeries() {
      setLoadingSeries(true);
      const header = await authHeader();
      if (!header) {
        onSignedOut();
        return;
      }
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags/' + selectedTagId + '/series', {
        headers: header,
      });
      setLoadingSeries(false);
      if (!res.ok) return;
      const json = await res.json();
      setTaggedSeries(json.data || []);
    }
    loadSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTagId]);

  const taggedIds = useMemo(() => new Set(taggedSeries.map((s) => s.id)), [taggedSeries]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return allSeries.filter((s) => !taggedIds.has(s.id) && s.title.toLowerCase().includes(query)).slice(0, 6);
  }, [search, allSeries, taggedIds]);

  async function handleAdd(series: SeriesCardData) {
    if (selectedTagId === null) return;
    setBusy(true);

    const header = await authHeader();
    if (!header) {
      onSignedOut();
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags/' + selectedTagId + '/series', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: series.id }),
    });

    setBusy(false);
    if (!res.ok) return;

    setTaggedSeries((prev) => [
      ...prev,
      {
        id: series.id,
        title: series.title,
        country: series.country,
        year: series.year,
        poster_url: series.poster_url,
        backdrop_url: series.backdrop_url,
      },
    ]);
    setSearch('');
  }

  async function handleRemove(series: TaggedSeries) {
    if (selectedTagId === null) return;
    setBusy(true);

    const header = await authHeader();
    if (!header) {
      onSignedOut();
      return;
    }

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/admin/tags/' + selectedTagId + '/series/' + series.id,
      { method: 'DELETE', headers: header }
    );

    setBusy(false);
    if (!res.ok) return;

    setTaggedSeries((prev) => prev.filter((s) => s.id !== series.id));
  }

  if (tags.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
        <p className="text-foreground font-semibold mb-1">No tags in this dimension yet</p>
        <p className="text-muted-foreground text-sm">Add some on the Tags page first, then come back here to assign them.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {tags.map((tag) => {
          const active = tag.id === selectedTagId;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTagId(tag.id)}
              className={
                'flex items-center gap-1.5 rounded-full md:rounded-xl px-3.5 py-2 text-sm font-semibold text-left shrink-0 transition-colors ' +
                (active ? 'bg-brand-gradient text-white' : 'bg-card border border-border text-foreground/70 hover:text-foreground')
              }
            >
              {tag.display_emoji && <span aria-hidden>{tag.display_emoji}</span>}
              {tag.display_label}
            </button>
          );
        })}
      </div>

      <div>
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the catalog to add a series to this tag..."
            className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden py-1.5 z-20">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleAdd(s)}
                  disabled={busy}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors text-left disabled:opacity-50"
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

        {loadingSeries ? null : taggedSeries.length === 0 ? (
          <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
            <p className="text-foreground font-semibold mb-1">No series tagged yet</p>
            <p className="text-muted-foreground text-sm">Search above to add one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {taggedSeries.map((s) => (
              <div key={s.id} className="group relative rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                <div className="relative aspect-[2/3] w-full bg-muted">
                  {s.poster_url || s.backdrop_url ? (
                    <Image
                      src={s.poster_url ?? s.backdrop_url ?? ''}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(s)}
                    disabled={busy}
                    aria-label={'Remove ' + s.title}
                    className="absolute top-1.5 right-1.5 flex items-center justify-center size-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-foreground text-[12.5px] font-semibold truncate">{s.title}</p>
                  <p className="text-muted-foreground text-[11px]">{s.country} · {s.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
