'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  Pencil,
  MoreVertical,
  List as ListIcon,
  LayoutGrid,
  Check,
} from 'lucide-react';
import type { AdminSeries } from './adminSeriesTypes';
import { countryFlagUrl } from '../../lib/countryFlags';

export type SeriesSortKey = 'updated_desc' | 'updated_asc' | 'title_asc' | 'title_desc' | 'year_desc' | 'year_asc';
export type PublishStatus = 'draft' | 'published' | 'archived';
export type BulkAction = 'publish' | 'unpublish' | 'archive' | 'delete';
export type ViewMode = 'list' | 'grid';

export interface SeriesPagination {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

const SORT_LABELS: Record<SeriesSortKey, string> = {
  updated_desc: 'Newest updated',
  updated_asc: 'Oldest updated',
  title_asc: 'Title A–Z',
  title_desc: 'Title Z–A',
  year_desc: 'Year (newest)',
  year_asc: 'Year (oldest)',
};

const STATUS_TONE: Record<PublishStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-rose-100 text-rose-700',
};

const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

// Deterministic name -> palette-slot hash, so a given genre name always
// renders the same chip color across rows/pages without needing a real
// genre->color mapping maintained anywhere (genres are admin-defined free
// text, see admin/genres.ts -- there's no fixed enum to map colors onto).
const GENRE_PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-fuchsia-100 text-fuchsia-700',
];

function genreTone(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return GENRE_PALETTE[hash % GENRE_PALETTE.length];
}

function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function GenreChips({ names }: { names?: string[] }) {
  if (!names || names.length === 0) return <span className="text-muted-foreground text-[12.5px]">—</span>;
  const shown = names.slice(0, 2);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {shown.map((n) => (
        <span key={n} className={'text-[11.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ' + genreTone(n)}>
          {n}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          +{rest}
        </span>
      )}
    </div>
  );
}

function useOutsideClick(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onOutside]);
  return ref;
}

function StatusMenu({
  status,
  busy,
  onChange,
}: {
  status: PublishStatus;
  busy: boolean;
  onChange: (next: PublishStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        className={
          'flex items-center gap-1 text-[12px] font-semibold pl-2.5 pr-2 py-1 rounded-full whitespace-nowrap transition-colors disabled:opacity-50 ' +
          STATUS_TONE[status]
        }
      >
        {STATUS_LABEL[status]}
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-36 bg-popover border border-border rounded-xl shadow-xl overflow-hidden py-1">
          {(Object.keys(STATUS_LABEL) as PublishStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => {
                setOpen(false);
                if (s !== status) onChange(s);
              }}
              className="w-full flex items-center justify-between gap-2 text-left px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-muted transition-colors"
            >
              {STATUS_LABEL[s]}
              {s === status && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RowActionsMenu({
  row,
  busy,
  onEdit,
  onDelete,
}: {
  row: AdminSeries;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        aria-label={'More actions for ' + row.title}
        className="flex items-center justify-center size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-muted transition-colors disabled:opacity-40"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-36 bg-popover border border-border rounded-xl shadow-xl overflow-hidden py-1">
          <button
            type="button"
            onMouseDown={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onMouseDown={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function BulkActionsMenu({ disabled, onAction }: { disabled: boolean; onAction: (action: BulkAction) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));

  const options: { action: BulkAction; label: string; tone?: string }[] = [
    { action: 'publish', label: 'Publish' },
    { action: 'unpublish', label: 'Unpublish' },
    { action: 'archive', label: 'Archive' },
    { action: 'delete', label: 'Delete', tone: 'text-rose-600' },
  ];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[13px] font-semibold text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-primary transition-colors"
      >
        Bulk actions
        <ChevronDown className="size-3.5" />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-36 bg-popover border border-border rounded-xl shadow-xl overflow-hidden py-1">
          {options.map((opt) => (
            <button
              key={opt.action}
              type="button"
              onMouseDown={() => {
                setOpen(false);
                onAction(opt.action);
              }}
              className={'w-full text-left px-3.5 py-2 text-[13px] font-medium hover:bg-muted transition-colors ' + (opt.tone || 'text-foreground')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Poster({ url, title }: { url: string | null; title: string }) {
  return (
    <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-muted">
      {url ? (
        <Image src={url} alt={title} fill sizes="44px" className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
      )}
    </div>
  );
}

function CountryCell({ country }: { country: string }) {
  const flagUrl = countryFlagUrl(country);
  return (
    <span className="flex items-center gap-1.5">
      {flagUrl && <Image src={flagUrl} alt="" width={16} height={16} className="size-4 rounded-[3px] object-cover shrink-0" />}
      {country}
    </span>
  );
}

export default function AdminSeriesTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAllOnPage,
  sort,
  onSortChange,
  view,
  onViewChange,
  busyIds,
  onEdit,
  onStatusChange,
  onDelete,
  onBulkAction,
  pagination,
  onPageChange,
  onLimitChange,
}: {
  rows: AdminSeries[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAllOnPage: () => void;
  sort: SeriesSortKey;
  onSortChange: (sort: SeriesSortKey) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  busyIds: Set<number>;
  onEdit: (row: AdminSeries) => void;
  onStatusChange: (row: AdminSeries, next: PublishStatus) => void;
  onDelete: (row: AdminSeries) => void;
  onBulkAction: (action: BulkAction) => void;
  pagination: SeriesPagination | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const selectedCount = selectedIds.size;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar: select-all + bulk actions (left), sort + view toggle (right) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            onChange={onToggleAllOnPage}
            aria-label="Select all titles on this page"
            className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
          />
          <span className="text-[13px] text-muted-foreground">{selectedCount} selected</span>
          <BulkActionsMenu disabled={selectedCount === 0} onAction={onBulkAction} />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SeriesSortKey)}
              className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2 text-[13px] font-medium text-foreground shadow-sm hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SeriesSortKey[]).map((key) => (
                <option key={key} value={key}>
                  Sort: {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onViewChange('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={'flex items-center justify-center size-7 rounded-full transition-colors ' + (view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}
            >
              <ListIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={'flex items-center justify-center size-7 rounded-full transition-colors ' + (view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
          <p className="text-foreground font-semibold mb-1">No titles match these filters</p>
          <p className="text-muted-foreground text-sm">Try a different search, tab, or filter combination.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map((row) => {
            const status = row.publish_status ?? 'published';
            const busy = busyIds.has(row.id);
            return (
              <div key={row.id} className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden flex flex-col">
                <div className="relative w-full aspect-[2/3] bg-muted">
                  {row.poster_url ? (
                    <Image src={row.poster_url} alt={row.title} fill sizes="220px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                  )}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => onToggleRow(row.id)}
                    aria-label={'Select ' + row.title}
                    className="absolute top-2 left-2 size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                  <span className={'absolute top-2 right-2 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ' + STATUS_TONE[status]}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <p className="text-foreground text-[13.5px] font-semibold truncate">{row.title}</p>
                  <p className="text-muted-foreground text-[12px] flex items-center gap-1">
                    <CountryCell country={row.country} /> · {row.year ?? '—'}
                  </p>
                  <GenreChips names={row.genre_names} />
                  <div className="mt-auto flex items-center justify-end gap-1 pt-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(row)}
                      aria-label={'Edit ' + row.title}
                      className="flex items-center justify-center size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <RowActionsMenu row={row} busy={busy} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/60">
                  <th className="px-5 py-3 font-bold w-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={onToggleAllOnPage}
                      aria-label="Select all titles on this page"
                      className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3 font-bold">Title</th>
                  <th className="px-3 py-3 font-bold">Type</th>
                  <th className="px-3 py-3 font-bold">Country</th>
                  <th className="px-3 py-3 font-bold">Year</th>
                  <th className="px-3 py-3 font-bold">Episodes</th>
                  <th className="px-3 py-3 font-bold">Genre</th>
                  <th className="px-3 py-3 font-bold">Status</th>
                  <th className="px-3 py-3 font-bold">Updated</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row) => {
                  const status = row.publish_status ?? 'published';
                  const busy = busyIds.has(row.id);
                  const isMovie = row.media_type === 'movie';
                  return (
                    <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => onToggleRow(row.id)}
                          aria-label={'Select ' + row.title}
                          className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <Poster url={row.poster_url} title={row.title} />
                          <div className="min-w-0">
                            <p className="text-foreground text-[14px] font-semibold truncate">{row.title}</p>
                            {row.genre_names && row.genre_names.length > 0 && (
                              <p className="text-muted-foreground text-[12px] truncate">{row.genre_names.join(', ')}</p>
                            )}
                            <span className="inline-block mt-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-brand-lilac/25 text-[#5E4B6B]">
                              {isMovie ? 'Movie' : 'Series'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">{isMovie ? 'Movie' : 'Series'}</td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">
                        <CountryCell country={row.country} />
                      </td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">{row.year ?? '—'}</td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">
                        {isMovie ? '—' : row.episode_count ?? '—'}
                      </td>
                      <td className="px-3 py-3">
                        <GenreChips names={row.genre_names} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusMenu status={status} busy={busy} onChange={(next) => onStatusChange(row, next)} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="text-[12.5px] text-foreground">{formatUpdated(row.updated_at)}</p>
                        {row.updated_by && <p className="text-[11px] text-muted-foreground">by {row.updated_by}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onEdit(row)}
                            aria-label={'Edit ' + row.title}
                            className="flex items-center justify-center size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-muted transition-colors disabled:opacity-40"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <RowActionsMenu row={row} busy={busy} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-[13px] text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="flex items-center justify-center size-8 rounded-full text-foreground/70 hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                ‹
              </button>
              <span className="text-[13px] font-semibold text-foreground px-2">
                {pagination.page} / {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
              </span>
              <button
                type="button"
                disabled={!pagination.has_more}
                onClick={() => onPageChange(pagination.page + 1)}
                className="flex items-center justify-center size-8 rounded-full text-foreground/70 hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                ›
              </button>
            </div>

            <div className="relative">
              <select
                aria-label="Results per page"
                value={pagination.limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="appearance-none bg-card border border-border rounded-full pl-3 pr-8 py-1.5 text-[12.5px] font-medium text-foreground hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-blush/20 border border-primary/20 shadow-lg px-5 py-3.5 backdrop-blur">
          <p className="text-[13.5px] font-semibold text-foreground">
            {selectedCount} title{selectedCount === 1 ? '' : 's'} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkAction('publish')}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-card border border-border shadow-sm hover:border-ring transition-colors"
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => onBulkAction('unpublish')}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-card border border-border shadow-sm hover:border-ring transition-colors"
            >
              Unpublish
            </button>
            <button
              type="button"
              onClick={() => onBulkAction('archive')}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-card border border-border shadow-sm hover:border-ring transition-colors"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => onBulkAction('delete')}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
