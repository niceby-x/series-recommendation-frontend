'use client';

import { useState } from 'react';
import { Pencil, Check, X, Trash2, GitMerge } from 'lucide-react';

export interface AdminGenre {
  id: number;
  name: string;
  series_count: number;
}

function GenreRow({
  genre,
  busy,
  onRename,
  onDelete,
}: {
  genre: AdminGenre;
  busy: boolean;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(genre.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const ok = await onRename(name.trim());
    setSaving(false);
    if (ok) setEditing(false);
    else setError('That name is already used by another genre.');
  }

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="px-5 py-3">
        {editing ? (
          <form onSubmit={handleSave} className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-card text-foreground rounded-lg px-2.5 py-1.5 text-sm border border-border focus:outline-none focus:border-ring w-44"
            />
            <button type="submit" disabled={saving} aria-label="Save" className="text-emerald-600 hover:bg-emerald-50 rounded-full p-1.5">
              <Check className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(genre.name);
                setError(null);
              }}
              aria-label="Cancel"
              className="text-muted-foreground hover:text-foreground rounded-full p-1.5"
            >
              <X className="size-3.5" />
            </button>
            {error && <span className="text-rose-500 text-[11.5px]">{error}</span>}
          </form>
        ) : (
          <span className="text-foreground text-[14px] font-semibold">{genre.name}</span>
        )}
      </td>
      <td className="px-3 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
        {genre.series_count} {genre.series_count === 1 ? 'series' : 'series'}
      </td>
      <td className="px-5 py-3">
        {!editing && (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={busy}
              title="Rename"
              aria-label={'Rename ' + genre.name}
              className="flex items-center justify-center size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-muted transition-colors disabled:opacity-30"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              title="Delete"
              aria-label={'Delete ' + genre.name}
              className="flex items-center justify-center size-8 rounded-full text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function GenreManager({
  genres,
  busyIds,
  onRename,
  onDelete,
  onMerge,
}: {
  genres: AdminGenre[];
  busyIds: Set<number>;
  onRename: (genre: AdminGenre, name: string) => Promise<boolean>;
  onDelete: (genre: AdminGenre) => void;
  onMerge: (sourceIds: number[], targetId: number) => Promise<boolean>;
}) {
  const [merging, setMerging] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetId, setTargetId] = useState<number | null>(null);
  const [mergeSaving, setMergeSaving] = useState(false);

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (targetId != null && !next.has(targetId)) setTargetId(null);
      return next;
    });
  }

  function exitMergeMode() {
    setMerging(false);
    setSelected(new Set());
    setTargetId(null);
  }

  async function handleMergeSubmit() {
    if (!targetId || selected.size < 2) return;
    setMergeSaving(true);
    const sourceIds = [...selected].filter((id) => id !== targetId);
    const ok = await onMerge(sourceIds, targetId);
    setMergeSaving(false);
    if (ok) exitMergeMode();
  }

  const selectedGenres = genres.filter((g) => selected.has(g.id));

  if (genres.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
        <p className="text-foreground font-semibold mb-1">No genres yet</p>
        <p className="text-muted-foreground text-sm">Genres appear here once a candidate with genre data is approved.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => (merging ? exitMergeMode() : setMerging(true))}
          className={
            'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold border transition-colors ' +
            (merging ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-ring hover:text-foreground')
          }
        >
          <GitMerge className="size-3.5" />
          {merging ? 'Cancel merge' : 'Merge duplicates'}
        </button>
      </div>

      {merging ? (
        <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleSelected(g.id)}
                className={
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium border-2 transition-colors ' +
                  (selected.has(g.id)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted border-transparent text-muted-foreground hover:border-border')
                }
              >
                {g.name}
                <span className="text-[11px] opacity-70">({g.series_count})</span>
              </button>
            ))}
          </div>

          {selected.size >= 2 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 bg-muted/60 border border-border/60 rounded-xl px-3.5 py-2.5">
              <span className="text-[13px] text-foreground">Merge {selected.size} genres into:</span>
              <select
                value={targetId ?? ''}
                onChange={(e) => setTargetId(parseInt(e.target.value))}
                className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-foreground focus:outline-none focus:border-ring"
              >
                <option value="" disabled>
                  Choose the one to keep…
                </option>
                {selectedGenres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleMergeSubmit}
                disabled={!targetId || mergeSaving}
                className="bg-primary text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-full disabled:opacity-40"
              >
                {mergeSaving ? 'Merging…' : 'Merge'}
              </button>
            </div>
          )}
          {selected.size === 1 && (
            <p className="text-muted-foreground text-[12.5px] mt-2">Select at least one more genre to merge together.</p>
          )}
        </div>
      ) : (
        <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/60">
                  <th className="px-5 py-3 font-bold">Name</th>
                  <th className="px-3 py-3 font-bold">Series</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {genres.map((g) => (
                  <GenreRow
                    key={g.id}
                    genre={g}
                    busy={busyIds.has(g.id)}
                    onRename={(name) => onRename(g, name)}
                    onDelete={() => onDelete(g)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
