'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Ban, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadMoreSeriesButton from '../shared/LoadMoreSeriesButton';

// IMP3-03: the audit trail behind the Import & Sync page's "History" tab
// -- GET /admin/import/status (the page's own polling loop) only ever
// exposes the current/most-recent run, so this is the only place trends
// or recurring failures across many runs are actually visible. A
// self-contained component (owns its own fetch/pagination/auth) rather
// than lifting that state into the page, since it's only ever mounted
// while the History tab is active -- mounting fresh each time the tab is
// switched to also means it always shows a current page 1 rather than a
// stale list from whenever it was last visited.
//
// Uses the same `page`/`limit`/`has_more` pagination envelope GET
// /collections and GET /series already return (see
// lib/usePaginatedSeries.ts's own header comment) -- LoadMoreSeriesButton
// is reused as-is despite the name; it's a plain hasMore/loading/onClick
// button with nothing series-specific in it (Collections already reuses
// it the same way for its own non-series lists).

interface ImportRunSummary {
  added: number;
  mediaTypeTally: Record<string, number>;
  countryTally: Record<string, number>;
}

interface ImportHistoryRow {
  id: number;
  status: string; // 'running' | 'success' | 'error' | 'interrupted' | 'cancelled'
  startedAt: string;
  finishedAt: string | null;
  exitCode: number | null;
  limit: number | null;
  keyword: string;
  dryRun: boolean;
  summary: ImportRunSummary | null;
}

interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

const PAGE_SIZE = 20;

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

function buildHistoryUrl(page: number, limit: number) {
  return process.env.NEXT_PUBLIC_API_URL + '/admin/import/history?page=' + page + '&limit=' + limit;
}

export default function ImportHistoryTable() {
  const [rows, setRows] = useState<ImportHistoryRow[]>([]);
  const [pagination, setPagination] = useState<HistoryPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const header = await authHeader();
      if (!header) {
        if (!cancelled) {
          setError('You must be signed in to view import history.');
          setLoading(false);
        }
        return;
      }

      const res = await fetch(buildHistoryUrl(1, PAGE_SIZE), { headers: header });
      if (cancelled) return;

      if (!res.ok) {
        setError('Could not load import history. Try refreshing the page.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (cancelled) return;
      setRows(json.data || []);
      setPagination(json.pagination ?? null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore() {
    if (!pagination || !pagination.has_more || loadingMore) return;

    setLoadingMore(true);
    const header = await authHeader();
    if (!header) {
      setError('You must be signed in to view import history.');
      setLoadingMore(false);
      return;
    }

    const res = await fetch(buildHistoryUrl(pagination.page + 1, pagination.limit), { headers: header });
    if (!res.ok) {
      setLoadingMore(false);
      return;
    }

    const json = await res.json();
    setRows((prev) => [...prev, ...(json.data || [])]);
    setPagination(json.pagination ?? null);
    setLoadingMore(false);
  }

  if (loading) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-8 flex items-center justify-center text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-8 text-center">
        <p className="text-rose-500 text-sm">{error}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-8 text-center">
        <p className="text-foreground font-semibold mb-1">No import runs yet</p>
        <p className="text-muted-foreground text-sm">Runs you start from the Run Import tab will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/60">
                <th className="px-5 py-3 font-bold">Started</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-3 py-3 font-bold">Keyword</th>
                <th className="px-3 py-3 font-bold">Limit</th>
                <th className="px-3 py-3 font-bold">Queued</th>
                <th className="px-5 py-3 font-bold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => (
                <ImportHistoryRowView key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <p className="text-muted-foreground text-[12.5px] mt-3 text-center">
          Showing {rows.length} of {pagination.total} runs
        </p>
      )}

      <LoadMoreSeriesButton hasMore={pagination?.has_more ?? false} loading={loadingMore} onClick={loadMore} />
    </div>
  );
}

function ImportHistoryRowView({ row }: { row: ImportHistoryRow }) {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="px-5 py-3 text-[13px] text-foreground whitespace-nowrap">
        {new Date(row.startedAt).toLocaleString()}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <HistoryStatusBadge row={row} />
          {row.dryRun && (
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-violet-600 bg-violet-100 rounded-full px-1.5 py-0.5">
              Dry run
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-[13px] text-muted-foreground max-w-[200px] truncate">{row.keyword}</td>
      <td className="px-3 py-3 text-[13px] text-muted-foreground">{row.limit ?? '—'}</td>
      <td className="px-3 py-3 text-[13px] text-muted-foreground">
        {row.summary ? row.summary.added + (row.dryRun ? ' (dry run)' : '') : '—'}
      </td>
      <td className="px-5 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
        {formatDuration(row.startedAt, row.finishedAt)}
      </td>
    </tr>
  );
}

// Mirrors the running/interrupted/cancelled/success/error precedence the
// page's own StatusBadge already uses for the live run -- same outcomes,
// just reading a DB row's `status` string instead of importRunState's
// separate booleans, since that's all this endpoint returns. Dry run is
// rendered as its own small pill next to this badge (see the row above),
// not as a replacement status, so a dry run that errored still shows as
// an error rather than being hidden behind a generic "Dry run" label.
function HistoryStatusBadge({ row }: { row: ImportHistoryRow }) {
  if (row.status === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-600 text-[12.5px] font-semibold">
        <Loader2 className="size-3.5 animate-spin" />
        Running
      </span>
    );
  }
  if (row.status === 'interrupted') {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-600 text-[12.5px] font-semibold">
        <AlertTriangle className="size-3.5" />
        Interrupted
      </span>
    );
  }
  if (row.status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-600 text-[12.5px] font-semibold">
        <Ban className="size-3.5" />
        Stopped
      </span>
    );
  }
  if (row.status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[12.5px] font-semibold">
        <CheckCircle2 className="size-3.5" />
        Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-rose-600 text-[12.5px] font-semibold">
      <XCircle className="size-3.5" />
      Error{row.exitCode != null ? ' (exit ' + row.exitCode + ')' : ''}
    </span>
  );
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '—';
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? minutes + 'm ' + seconds + 's' : seconds + 's';
}
