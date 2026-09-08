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
  List as ListIcon,
  LayoutGrid,
  Check,
  BadgeCheck,
  Clock,
  Archive,
} from 'lucide-react';
import type { AdminSeries } from './adminSeriesTypes';
import { FloatingMenu } from '../shared/FloatingMenu';

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

// Glass-chip variant of the status badge for the grid card (matches
// RecentlyPublishedCard's "Published" chip) -- draft/archived need their
// own tone since that card only ever shows one state (published, by
// definition of what "recently published" means), but the grid shows all
// three.
const STATUS_GLASS_TONE: Record<PublishStatus, string> = {
  draft: 'bg-amber-500/30 ring-amber-200/40',
  published: 'bg-emerald-500/30 ring-emerald-200/40',
  archived: 'bg-rose-500/30 ring-rose-200/40',
};

const STATUS_GLASS_ICON: Record<PublishStatus, typeof BadgeCheck> = {
  draft: Clock,
  published: BadgeCheck,
  archived: Archive,
};

// Shared box styling for all three admin dropdowns (status, row actions,
// bulk actions) -- a tighter radius and softer shadow than the old
// rounded-xl/shadow-xl read as more "designed" at this small a size, and
// keeping it in one place means the three stay visually identical rather
// than drifting apart over time.
const MENU_BOX = 'w-40 bg-popover border border-border/70 rounded-lg shadow-lg shadow-black/[0.06] overflow-hidden py-1';

// Same light-pink identity as the bulk-select bar, but mixed lighter with
// white (rather than just dialing brand-blush's own alpha up) so it stays
// fully opaque -- Edit/Delete stay legible regardless of what's behind the
// portaled menu -- without reading as a saturated, "loud" pink block.
// color-mix (already used the same way in components/ui/button.tsx) keeps
// this a plain utility class rather than a one-off hex value.
const MENU_BOX_GLASS =
  'w-40 bg-[color-mix(in_oklch,var(--color-brand-blush),white_65%)] border border-primary/20 rounded-lg shadow-lg overflow-hidden py-1';
const MENU_ARROW_GLASS = 'bg-[color-mix(in_oklch,var(--color-brand-blush),white_65%)] border-primary/20';

function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(triggerRef, menuRef, () => setOpen(false));

  return (
    <>
      <button
        ref={triggerRef}
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

      <FloatingMenu open={open} anchorRef={triggerRef} menuRef={menuRef} align="start" className={MENU_BOX}>
        {(Object.keys(STATUS_LABEL) as PublishStatus[]).map((s) => {
          const OptionIcon = STATUS_GLASS_ICON[s];
          return (
            <button
              key={s}
              type="button"
              onMouseDown={() => {
                setOpen(false);
                if (s !== status) onChange(s);
              }}
              className="w-full flex items-center justify-between gap-2 text-left px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <OptionIcon className="size-3.5 text-muted-foreground" />
                {STATUS_LABEL[s]}
              </span>
              {s === status && <Check className="size-3.5 text-primary" />}
            </button>
          );
        })}
      </FloatingMenu>
    </>
  );
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
  // 'dark' is for placement over the poster art (grid card's bottom
  // scrim) -- same trigger button, just light-on-dark icon color instead
  // of the default dark-on-light used everywhere else (list view rows).
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
        onClick={() => setOpen((o) => !o)}
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
          onMouseDown={() => {
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
          onMouseDown={() => {
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

// Custom checkbox matching the grid card's -- same rounded-[4px] square and
// white checkmark -- rather than the browser's own native checkbox
// rendering, which varies its corner radius and checkmark glyph by OS/
// browser and doesn't stay visually consistent between the two views (the
// native `accent-primary` fix got the color right, but not the shape).
function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel: string }) {
  return (
    <label className="inline-flex items-center justify-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={ariaLabel} className="peer sr-only" />
      <span className="flex items-center justify-center size-4 rounded-[4px] border border-border bg-white transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
        {checked && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
    </label>
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
        <div className="rounded-[10px] bg-card border border-border/60 p-8 text-center">
          <p className="text-foreground font-semibold mb-1">No titles match these filters</p>
          <p className="text-muted-foreground text-sm">Try a different search, tab, or filter combination.</p>
        </div>
      ) : view === 'grid' ? (
        // D3-XX: matches RecentlyPublishedCard's visual language on the
        // admin dashboard -- full-bleed poster, diagonal shine sweep on
        // hover, a glassy status chip that expands to its label on hover,
        // and title/meta living on a bottom scrim instead of a separate
        // white panel below the art (no spare height for one at a fixed
        // 180x270 tile). Unlike that card this one isn't a whole-tile
        // <Link> -- it needs a real checkbox plus edit/actions controls,
        // and nesting those inside an anchor isn't valid HTML -- so
        // selection/edit/actions are layered on as their own controls
        // instead. Status chip is a static display here (not the list
        // view's editable dropdown) -- unchanged behavior from before this
        // pass, just restyled; changing it to published/draft/archived
        // still happens via the Edit modal or the list view's StatusMenu.
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {rows.map((row) => {
            const status = row.publish_status ?? 'published';
            const busy = busyIds.has(row.id);
            const isMovie = row.media_type === 'movie';
            const StatusIcon = STATUS_GLASS_ICON[status];
            return (
              <div
                key={row.id}
                className="group relative w-full max-w-[180px] aspect-[2/3] mx-auto rounded-[10px] bg-muted shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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

                {/* Diagonal shine sweep on hover, same treatment as
                    RecentlyPublishedCard -- pointer-events-none so it
                    never blocks the checkbox/badge/scrim controls above it. */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                {/* Tap-target sized up on narrow viewports (size-7/size-4)
                    and stepped back down at sm+ (size-6/size-3.5) where the
                    grid packs more columns and the original tighter density
                    fits -- touch targets on mobile stay close to the ~44px
                    guideline without ballooning the desktop 5-up layout.
                    The label itself has no visible background: the
                    checkbox square carries its own shadow for contrast
                    against light or dark poster art, instead of sitting in
                    a solid circular chip. */}
                <label className="absolute top-2 left-2 flex items-center justify-center size-7 sm:size-6 cursor-pointer">
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
                    <div className="-mr-1 shrink-0">
                      <RowActionsMenu row={row} busy={busy} onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} variant="dark" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[10px] bg-card border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/60">
                  <th className="px-5 py-3 font-bold w-10 text-center">
                    <Checkbox checked={allOnPageSelected} onChange={onToggleAllOnPage} ariaLabel="Select all titles on this page" />
                  </th>
                  <th className="px-3 py-3 font-bold">Title</th>
                  <th className="px-3 py-3 font-bold">Type</th>
                  <th className="px-3 py-3 font-bold">Year</th>
                  <th className="px-3 py-3 font-bold">Episodes</th>
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
                      <td className="px-5 py-3 text-center align-middle">
                        <Checkbox checked={selectedIds.has(row.id)} onChange={() => onToggleRow(row.id)} ariaLabel={'Select ' + row.title} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <Poster url={row.poster_url} title={row.title} />
                          <div className="min-w-0">
                            <p className="text-foreground text-[14px] font-semibold truncate">{row.title}</p>
                            {row.genre_names && row.genre_names.length > 0 && (
                              <p className="text-muted-foreground text-[12px] truncate">{row.genre_names.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">{isMovie ? 'Movie' : 'Series'}</td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">{row.year ?? '—'}</td>
                      <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">
                        {isMovie ? '—' : row.episode_count ?? '—'}
                      </td>
                      <td className="px-3 py-3">
                        <StatusMenu status={status} busy={busy} onChange={(next) => onStatusChange(row, next)} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="text-[12.5px] text-foreground">{formatUpdated(row.updated_at)}</p>
                        {row.updated_by && <p className="text-[11px] text-muted-foreground">by {row.updated_by}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end">
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
