'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Check,
  BadgeCheck,
  Clock,
  Archive,
  LayoutGrid,
  List,
  Loader2,
} from 'lucide-react';
import type { AdminSeries } from './adminSeriesTypes';
import { FloatingMenu } from '../shared/FloatingMenu';

export type SeriesSortKey = 'updated_desc' | 'updated_asc' | 'title_asc' | 'title_desc' | 'year_desc' | 'year_asc';
export type PublishStatus = 'draft' | 'published' | 'archived';
export type BulkAction = 'publish' | 'unpublish' | 'archive' | 'delete';

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

const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_GLASS_TONE: Record<PublishStatus, string> = {
  draft: 'bg-amber-500/30 ring-amber-200/40 text-amber-700 dark:text-amber-400',
  published: 'bg-emerald-500/30 ring-emerald-200/40 text-emerald-700 dark:text-emerald-400',
  archived: 'bg-rose-500/30 ring-rose-200/40 text-rose-700 dark:text-rose-400',
};

const STATUS_GLASS_ICON: Record<PublishStatus, typeof BadgeCheck> = {
  draft: Clock,
  published: BadgeCheck,
  archived: Archive,
};

const MENU_BOX = 'w-40 bg-popover border border-border/70 rounded-lg shadow-lg shadow-black/[0.06] overflow-hidden py-1';
const MENU_BOX_GLASS =
  'w-40 bg-[color-mix(in_oklch,var(--color-brand-blush),white_65%)] border border-primary/20 rounded-lg shadow-lg overflow-hidden py-1';
const MENU_ARROW_GLASS = 'bg-[color-mix(in_oklch,var(--color-brand-blush),white_65%)] border-primary/20';

function useOutsideClick(
  triggerRef: React.RefObject<HTMLElement | null>,
  menuRef: React.RefObject<HTMLElement | null>,
  onOutside: () => void
) {
  useEffect(() => {
    function handle(event: MouseEvent) {
      const target = event.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [triggerRef, menuRef, onOutside]);
}

function RowActionsMenu({
  row,
  busy,
  onEdit,
  onDelete,
  variant = 'light',
}: {
  row: AdminSeries;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  variant?: 'light' | 'dark';
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(triggerRef, menuRef, () => setOpen(false));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={'More actions for ' + row.title}
        className={
          'flex items-center justify-center size-8 rounded-full transition-colors disabled:opacity-40 ' +
          (variant === 'dark'
            ? 'text-white/85 hover:text-white hover:bg-white/15'
            : 'text-foreground/60 hover:text-primary hover:bg-muted')
        }
      >
        <MoreVertical className="size-4" />
      </button>

      <FloatingMenu
        open={open}
        anchorRef={triggerRef}
        menuRef={menuRef}
        align="end"
        className={MENU_BOX_GLASS}
        arrowClassName={MENU_ARROW_GLASS}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            setOpen(false);
            onEdit();
          }}
          className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13px] font-medium text-foreground hover:bg-white/40 transition-colors"
        >
          <Pencil className="size-3.5 text-muted-foreground" />
          Edit
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            setOpen(false);
            onDelete();
          }}
          className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50/70 transition-colors"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </FloatingMenu>
    </>
  );
}

function BulkActionsMenu({ disabled, onAction }: { disabled: boolean; onAction: (action: BulkAction) => void }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(triggerRef, menuRef, () => setOpen(false));

  const options: { action: BulkAction; label: string; tone?: string; icon: typeof Eye }[] = [
    { action: 'publish', label: 'Publish', icon: Eye },
    { action: 'unpublish', label: 'Unpublish', icon: EyeOff },
    { action: 'archive', label: 'Archive', icon: Archive },
    { action: 'delete', label: 'Delete', tone: 'text-rose-600', icon: Trash2 },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[13px] font-semibold text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-primary transition-colors"
      >
        Bulk actions
        <ChevronDown className="size-3.5" />
      </button>

      <FloatingMenu open={open && !disabled} anchorRef={triggerRef} menuRef={menuRef} align="start" className={MENU_BOX}>
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.action}
              type="button"
              onMouseDown={() => {
                setOpen(false);
                onAction(opt.action);
              }}
              className={'w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13px] font-medium hover:bg-muted transition-colors ' + (opt.tone || 'text-foreground')}
            >
              <Icon className="size-3.5" />
              {opt.label}
            </button>
          );
        })}
      </FloatingMenu>
    </>
  );
}

function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel: string }) {
  return (
    <label className="inline-flex items-center justify-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={ariaLabel} className="peer sr-only" />
      <span className="flex items-center justify-center size-4 rounded-[4px] border border-border bg-white transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
        {checked && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
    </label>
  );
}

export default function AdminSeriesTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAllOnPage,
  sort,
  onSortChange,
  busyIds,
  onEdit,
  onDelete,
  onBulkAction,
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
}: {
  rows: AdminSeries[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAllOnPage: () => void;
  sort: SeriesSortKey;
  onSortChange: (sort: SeriesSortKey) => void;
  busyIds: Set<number>;
  onEdit: (row: AdminSeries) => void;
  onDelete: (row: AdminSeries) => void;
  onBulkAction: (action: BulkAction) => void;
  pagination: SeriesPagination | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const selectedCount = selectedIds.size;

  const renderPagination = (inCard: boolean) => {
    if (!pagination || pagination.total === 0) return null;
    return (
      <div className={`flex flex-wrap items-center justify-between gap-3 ${inCard ? 'px-4 py-3 border-t border-border/60 bg-card rounded-b-[10px]' : 'pt-1'}`}>
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
              className="appearance-none bg-card border border-border/80 rounded-full pl-3 pr-8 py-1.5 text-[12.5px] font-medium text-foreground hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
            >
              {[12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  };

  return (
    // Removed the flex-1 and min-h-0 stretching classes so the layout naturally fits its content
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Checkbox checked={allOnPageSelected} onChange={onToggleAllOnPage} ariaLabel="Select all titles on this page" />
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

          <div className="flex items-center bg-card border border-border rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: pagination?.limit ?? 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full max-w-[180px] aspect-[2/3] mx-auto rounded-[10px] bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-card border border-border/60 rounded-[10px] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap text-[13px]">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    <th className="px-4 py-3.5 w-12 text-center"></th>
                    <th className="px-2 py-3.5">Title</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5 hidden md:table-cell">Genres</th>
                    <th className="px-4 py-3.5 hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3.5 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Array.from({ length: pagination?.limit ?? 12 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-center align-middle">
                        <div className="size-4 bg-muted rounded mx-auto animate-pulse" />
                      </td>
                      <td className="px-2 py-3 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className="size-10 bg-muted rounded-[6px] shrink-0 animate-pulse" />
                          <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                            <div className="h-3.5 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-2.5 bg-muted rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="w-14 h-6 bg-muted rounded-full animate-pulse" />
                      </td>
                      <td className="px-4 py-3 align-middle hidden md:table-cell">
                        <div className="w-32 h-3 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3 align-middle hidden sm:table-cell">
                        <div className="w-20 h-6 bg-muted rounded-full animate-pulse" />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="size-8 bg-muted rounded-full ml-auto animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : rows.length === 0 ? (
        <div className="rounded-[10px] bg-card border border-border/60 p-8 text-center shadow-sm">
          <p className="text-foreground font-semibold mb-1">No titles match these filters</p>
          <p className="text-muted-foreground text-sm">Try a different search, tab, or filter combination.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {rows.map((row) => {
              const status = row.publish_status ?? 'published';
              const busy = busyIds.has(row.id);
              const isMovie = row.media_type === 'movie';
              const StatusIcon = STATUS_GLASS_ICON[status];
              return (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => !busy && onEdit(row)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !busy) {
                      e.preventDefault();
                      onEdit(row);
                    }
                  }}
                  aria-label={'Edit ' + row.title}
                  className="group relative w-full max-w-[180px] aspect-[2/3] mx-auto rounded-[10px] bg-muted shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {row.poster_url ? (
                    <Image
                      src={row.poster_url}
                      alt={row.title}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 180px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-2 text-center">
                      <span className="text-muted-foreground text-[11px] font-medium">{row.title}</span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                  <label
                    className="absolute top-2 left-2 flex items-center justify-center size-7 sm:size-6 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => onToggleRow(row.id)}
                      aria-label={'Select ' + row.title}
                      className="peer sr-only"
                    />
                    <span className="flex items-center justify-center size-4 sm:size-3.5 rounded-[4px] border border-white/85 bg-black/25 shadow-[0_1px_4px_rgba(0,0,0,0.55)] backdrop-blur-[1px] transition-colors peer-checked:bg-primary peer-checked:border-primary peer-checked:shadow-[0_1px_4px_rgba(0,0,0,0.35)] peer-focus-visible:ring-2 peer-focus-visible:ring-white/70">
                      {selectedIds.has(row.id) && <Check className="size-3 sm:size-2.5 text-white" strokeWidth={3} />}
                    </span>
                  </label>

                  <div className={'absolute top-2 right-2 flex items-center h-6 max-w-6 hover:max-w-24 overflow-hidden rounded-full backdrop-blur-md ring-1 ring-inset text-white shadow-sm transition-[max-width] duration-300 ease-out ' + STATUS_GLASS_TONE[status]}>
                    <span className="flex items-center justify-center size-6 shrink-0">
                      <StatusIcon className="size-3.5" />
                    </span>
                    <span className="pr-2.5 text-[11px] font-semibold whitespace-nowrap">{STATUS_LABEL[status]}</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 pt-8 px-2.5 pb-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
                    <h3 className="text-white text-[12.5px] font-semibold leading-snug line-clamp-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
                      {row.title}
                    </h3>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-white/75 text-[10.5px] leading-snug line-clamp-1">
                        {isMovie ? 'Movie' : 'Series'} · {row.year ?? '—'}
                      </p>
                      <div className="-mr-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <RowActionsMenu row={row} busy={busy} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} variant="dark" />
                      </div>
                    </div>
                  </div>

                  {busy && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2.5px]">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30 animate-pulse opacity-80" />
                      <div className="relative flex items-center justify-center drop-shadow-md">
                        <div className="absolute size-10 rounded-full border-2 border-white/30 animate-ping" />
                        <div
                          aria-hidden="true"
                          className="relative z-10 size-10 rounded-full border-[3px] border-white/10 border-t-white border-l-white/70 animate-spin"
                        />
                        <div className="absolute z-10 size-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Grid pagination renders externally at the bottom */}
          {renderPagination(false)}
        </>
      ) : (
        <div className="w-full bg-card border border-border/60 rounded-[10px] shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                  <th className="px-4 py-3.5 w-12 text-center" aria-label="Select row"></th>
                  <th className="px-2 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Genres</th>
                  <th className="px-4 py-3.5 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row) => {
                  const status = row.publish_status ?? 'published';
                  const busy = busyIds.has(row.id);
                  const isMovie = row.media_type === 'movie';
                  const StatusIcon = STATUS_GLASS_ICON[status];
                  
                  return (
                    <tr
                      key={row.id}
                      onClick={() => !busy && onEdit(row)}
                      className={`group transition-colors ${
                        busy ? 'opacity-60 pointer-events-none bg-muted/30' : 'hover:bg-muted/40 cursor-pointer'
                      }`}
                    >
                      <td className="px-4 py-3 text-center align-middle">
                        <Checkbox 
                          checked={selectedIds.has(row.id)} 
                          onChange={() => onToggleRow(row.id)} 
                          ariaLabel={'Select ' + row.title} 
                        />
                      </td>
                      
                      <td className="px-2 py-3 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-10 rounded-[6px] shrink-0 bg-muted overflow-hidden shadow-sm">
                            {row.poster_url ? (
                              <Image
                                src={row.poster_url}
                                alt={row.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13.5px] font-semibold text-foreground truncate max-w-[200px] lg:max-w-[320px]">
                              {row.title}
                            </span>
                            <span className="text-[12px] text-muted-foreground truncate">
                              {row.country ?? 'Unknown'} · {row.year ?? '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                          {isMovie ? 'Movie' : 'Series'}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle hidden md:table-cell text-muted-foreground text-[12.5px]">
                        <div className="max-w-[180px] truncate" title={row.genre_names?.join(', ')}>
                          {row.genre_names?.length ? row.genre_names.join(', ') : <span className="opacity-50">—</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle hidden sm:table-cell">
                        <div className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ' + STATUS_GLASS_TONE[status]}>
                          <StatusIcon className="size-3.5" />
                          <span className="text-[11px] font-semibold">{STATUS_LABEL[status]}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right align-middle pr-4 relative">
                        {busy ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground ml-auto mr-2" />
                        ) : (
                          <RowActionsMenu row={row} busy={busy} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} variant="light" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* List pagination renders internally to seal the bottom of the card */}
          {renderPagination(true)}
        </div>
      )}

      {/* Bulk Action Sticky Bar */}
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