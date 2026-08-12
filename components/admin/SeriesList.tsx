'use client';

import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';

export interface AdminSeries {
  id: number;
  title: string;
  original_title: string | null;
  synopsis: string | null;
  country: string;
  year: number | null;
  episode_count: number;
  status: string;
  poster_url: string | null;
  backdrop_url: string | null;
  genre_names?: string[];
  romance_pace?: string | null;
  emotional_intensity?: string | null;
  ending_type?: string | null;
  content_level?: string | null;
  tag_ids?: number[];
  collection_ids?: number[];
}

const STATUS_TONE: Record<string, string> = {
  airing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-sky-100 text-sky-700',
  upcoming: 'bg-amber-100 text-amber-700',
};

export default function SeriesList({
  series,
  busyIds,
  onEdit,
  onDelete,
}: {
  series: AdminSeries[];
  busyIds: Set<number>;
  onEdit: (s: AdminSeries) => void;
  onDelete: (s: AdminSeries) => void;
}) {
  if (series.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
        <p className="text-foreground font-semibold mb-1">No series found</p>
        <p className="text-muted-foreground text-sm">Try a different search, or approve some candidates first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {series.map((s) => {
        const busy = busyIds.has(s.id);
        return (
          <div
            key={s.id}
            className="rounded-2xl bg-card border border-border/60 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0 size-14 rounded-[10px] overflow-hidden bg-muted">
                {s.poster_url ? (
                  <Image src={s.poster_url} alt={s.title} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-[14.5px] font-semibold truncate">{s.title}</p>
                <p className="text-muted-foreground text-[12.5px] mt-0.5">
                  {s.country} · {s.year ?? '—'} · {s.episode_count} ep
                  <span className={'ml-2 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ' + (STATUS_TONE[s.status] || 'bg-muted text-muted-foreground')}>
                    {s.status}
                  </span>
                </p>
                {s.genre_names && s.genre_names.length > 0 && (
                  <p className="text-muted-foreground text-[11.5px] mt-1 truncate">{s.genre_names.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => onEdit(s)}
                disabled={busy}
                aria-label={'Edit ' + s.title}
                className="flex items-center justify-center size-8 rounded-full text-foreground/50 hover:text-primary hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(s)}
                disabled={busy}
                aria-label={'Delete ' + s.title}
                className="flex items-center justify-center size-8 rounded-full text-foreground/50 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
