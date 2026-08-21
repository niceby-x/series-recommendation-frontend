'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Loader2, CheckCircle2, XCircle, UploadCloud, Square, Ban, ArrowRight } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import { useAdminPageHeader } from '../../../components/admin/AdminPageHeaderContext';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

interface ImportStatus {
  running: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  limit: number | null;
  logTail: string[];
  error: string | null;
  // Only ever set on the DB-backed fallback the backend returns when
  // nothing's running in-process (see GET /admin/import/status) -- true
  // means the backend restarted mid-run and reconciled a stale 'running'
  // row rather than this run actually finishing on its own.
  interrupted?: boolean;
  // IMP1-04: false only when this run's initial import_runs insert
  // failed on the backend. The run itself still proceeds untracked in
  // that case, but with no DB row for it, a crash mid-run would leave no
  // trace for the backend's boot-time reconciliation to find -- worth
  // flagging live rather than letting it fail silently.
  persisted?: boolean;
  // IMP2-01: true once a run was ended via POST /admin/import/stop
  // (an admin action) rather than finishing or erroring on its own.
  // Only meaningful once running has flipped back to false -- while
  // running is still true this may already be true too (the backend
  // sets it before the signal actually lands), so StatusBadge checks
  // running first.
  cancelled?: boolean;
  // IMP2-03: true for the duration of, and after, a run started with
  // the dry-run flag set. Present in both the live and DB-fallback
  // branches of GET /admin/import/status.
  dryRun?: boolean;
  // IMP3-01: set once the script's discovery loop finishes and emits its
  // final summary line -- null while running, or if a run errored, was
  // stopped, or got interrupted before reaching that point. Present in
  // both the live and DB-fallback branches of GET /admin/import/status,
  // same shape either way.
  summary?: ImportRunSummary | null;
  // IMP3-02: the keyword this run searched TMDB for -- always a non-empty
  // string (the backend falls back to its own default when none is sent,
  // or when the request sends an empty/whitespace-only one). Present in
  // both the live and DB-fallback branches of GET /admin/import/status.
  keyword?: string;
}

interface ImportRunSummary {
  added: number;
  mediaTypeTally: Record<string, number>;
  countryTally: Record<string, number>;
}

const POLL_INTERVAL_MS = 3000;
// Keep in sync with the backend's server-side clamp in POST /admin/import/run
// (see IMP1-03 handoff) -- the backend is the source of truth, this just
// keeps the input from looking like it accepts more than it does.
const MAX_IMPORT_LIMIT = 500;
// IMP3-02: mirrors the backend's own MAX_KEYWORD_LENGTH/DEFAULT_KEYWORD
// (services/importRuns.ts) -- same reasoning as MAX_IMPORT_LIMIT above,
// just for the keyword input instead of the limit input. The backend
// falls back to this exact default whenever the field is left blank, so
// it doubles as the input's placeholder text.
const MAX_KEYWORD_LENGTH = 100;
const DEFAULT_KEYWORD_PLACEHOLDER = "boys' love (bl)";

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

export default function AdminImportPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [limitInput, setLimitInput] = useState('150');
  const [dryRunInput, setDryRunInput] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useAdminPageHeader({
    title: 'Import & Sync',
    subtitle: 'Run the TMDB discovery script to queue new titles into the Editorial Queue for review.',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  async function fetchStatus() {
    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/import/status', { headers: header });
    if (res.status === 401) {
      setAccess('signed_out');
      return;
    }
    if (res.status === 403) {
      setAccess('forbidden');
      return;
    }
    if (!res.ok) {
      setAccess('error');
      return;
    }

    const json = await res.json();
    setStatus(json);
    setAccess('ok');
  }

  useEffect(() => {
    if (!user) return;

    async function load() {
      await fetchStatus();
    }

    load();
  }, [user]);

  // Poll while a run is in progress -- the whole point of the
  // spawn-and-poll pattern on the backend is that a real run takes minutes,
  // so status has to be pulled rather than delivered in the original
  // response.
  useEffect(() => {
    if (!status?.running) return;
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status?.running]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [status?.logTail]);

  async function handleStart() {
    setStartError(null);
    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const parsedLimit = parseInt(limitInput);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_IMPORT_LIMIT)
        : 150;

    setStarting(true);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/import/run', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit, dryRun: dryRunInput, keyword: keywordInput.trim() }),
    });
    setStarting(false);

    if (res.status === 409) {
      setStartError('An import is already running.');
      fetchStatus();
      return;
    }
    if (!res.ok) {
      setStartError('Could not start the import. Try again.');
      return;
    }

    fetchStatus();
  }

  // IMP2-01: fire-and-forget on the backend too -- POST /admin/import/stop
  // just confirms the SIGTERM was sent, not that the process has actually
  // exited. The existing poll loop (still running while status.running is
  // true) picks up running: false and cancelled: true the same way it
  // already detects any other run ending, no separate handling needed.
  async function handleStop() {
    setStopError(null);
    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    setStopping(true);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/import/stop', {
      method: 'POST',
      headers: header,
    });
    setStopping(false);

    if (res.status === 409) {
      // Nothing running anymore -- e.g. it finished right as this was
      // clicked. Just resync instead of showing a stale error.
      fetchStatus();
      return;
    }
    if (!res.ok) {
      setStopError('Could not stop the import. Try again.');
      return;
    }

    fetchStatus();
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
        <p className="text-rose-500">Could not load import status. Try refreshing the page.</p>
      </div>
    );
  }

  const running = status?.running ?? false;

  return (
    <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[900px] mx-auto">

          <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5 mb-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-3">
                <div>
                  <label htmlFor="import-limit" className="block text-[12.5px] font-semibold text-foreground mb-1.5">
                    Limit per media type
                  </label>
                  <input
                    id="import-limit"
                    type="number"
                    min={1}
                    max={MAX_IMPORT_LIMIT}
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    disabled={running}
                    className="w-28 bg-background text-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="import-keyword" className="block text-[12.5px] font-semibold text-foreground mb-1.5">
                    Discovery keyword
                  </label>
                  <input
                    id="import-keyword"
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    disabled={running}
                    maxLength={MAX_KEYWORD_LENGTH}
                    placeholder={DEFAULT_KEYWORD_PLACEHOLDER}
                    className="w-56 bg-background text-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors disabled:opacity-50"
                  />
                </div>

                <label
                  htmlFor="import-dry-run"
                  className="flex items-center gap-2 pb-2.5 text-[13px] font-medium text-foreground select-none cursor-pointer disabled:cursor-default"
                >
                  <input
                    id="import-dry-run"
                    type="checkbox"
                    checked={dryRunInput}
                    onChange={(e) => setDryRunInput(e.target.checked)}
                    disabled={running}
                    className="size-4 rounded border-border accent-current disabled:opacity-50"
                  />
                  Dry run
                </label>

                <button
                  type="button"
                  onClick={handleStart}
                  disabled={running || starting}
                  className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                >
                  {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                  {running ? 'Running…' : 'Start Import'}
                </button>

                {running && (
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={stopping}
                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {stopping ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                    {stopping ? 'Stopping…' : 'Stop'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {status?.dryRun && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 bg-violet-100 rounded-full px-2 py-1">
                    Dry run
                  </span>
                )}
                <StatusBadge status={status} />
              </div>
            </div>

            {startError && <p className="text-rose-500 text-[13px] mt-3">{startError}</p>}
            {stopError && <p className="text-rose-500 text-[13px] mt-3">{stopError}</p>}
            {status?.error && <p className="text-rose-500 text-[13px] mt-3">Process error: {status.error}</p>}
            {status?.persisted === false && (
              <p className="text-amber-600 text-[13px] mt-3">
                This run&apos;s state couldn&apos;t be saved to the database, so it isn&apos;t being tracked. It will
                still complete normally, but a server restart mid-run wouldn&apos;t be recoverable or show up in history.
              </p>
            )}

            {status?.startedAt && (
              <p className="text-muted-foreground text-[12.5px] mt-3">
                Started {new Date(status.startedAt).toLocaleString()}
                {status.limit != null ? ' · limit ' + status.limit + ' per media type' : ''}
                {status.keyword ? ' · keyword "' + status.keyword + '"' : ''}
                {status.finishedAt ? ' · finished ' + new Date(status.finishedAt).toLocaleString() : ''}
                {status.dryRun ? ' · dry run' : ''}
              </p>
            )}

            {/* IMP3-01: the script already computed these tallies for its
                own human-readable log, but there was previously no
                structured way to show them without scrolling raw log
                output. Only rendered once status.summary is actually set
                -- null while running, or for a run that errored, was
                stopped, or got interrupted before the script reached its
                final summary line, same as a run with no output yet. */}
            {status?.summary && <StatBreakdown summary={status.summary} dryRun={status.dryRun} />}

            {/* IMP2-02: previously the only path from a finished run to
                what it queued was manual -- navigate to the Editorial
                Queue and re-filter to pending yourself. The candidates
                page already defaults its tab to 'pending' on load, so a
                plain link there is enough; no query param or change to
                that page is needed. Shown only once a run has actually
                finished successfully -- not while running, and not for
                an interrupted/cancelled/errored run, since none of
                those reliably queued anything worth jumping to. */}
            {!running && status?.exitCode === 0 && !status?.cancelled && !status?.dryRun && (
              <Link
                href="/admin/candidates"
                className="flex items-center gap-1.5 text-primary text-[13px] font-semibold mt-3 hover:opacity-80 transition-opacity w-fit"
              >
                View pending candidates in the Editorial Queue
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>

          <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border/60">
              <p className="font-heading text-[15px] font-normal text-foreground">Log Output</p>
            </div>
            <div ref={logRef} className="bg-[#161022] text-[#d8d0e6] font-mono text-[12px] leading-relaxed p-4 h-[380px] overflow-y-auto">
              {status?.logTail && status.logTail.length > 0 ? (
                status.logTail.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap break-words">
                    {line}
                  </div>
                ))
              ) : (
                <p className="text-[#8a7fa3]">No output yet. Start an import to see live logs here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

function StatusBadge({ status }: { status: ImportStatus | null }) {
  if (!status || (!status.running && !status.finishedAt)) {
    return (
      <span className="flex items-center gap-1.5 text-muted-foreground text-[13px] font-semibold">
        <UploadCloud className="size-4" />
        Idle
      </span>
    );
  }

  if (status.running) {
    return (
      <span className="flex items-center gap-1.5 text-amber-600 text-[13px] font-semibold">
        <Loader2 className="size-4 animate-spin" />
        Running
      </span>
    );
  }

  if (status.interrupted) {
    return (
      <span className="flex items-center gap-1.5 text-amber-600 text-[13px] font-semibold">
        <XCircle className="size-4" />
        Interrupted by a server restart
      </span>
    );
  }

  if (status.cancelled) {
    return (
      <span className="flex items-center gap-1.5 text-amber-600 text-[13px] font-semibold">
        <Ban className="size-4" />
        Stopped
      </span>
    );
  }

  if (status.exitCode === 0) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 text-[13px] font-semibold">
        <CheckCircle2 className="size-4" />
        Finished successfully
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-rose-600 text-[13px] font-semibold">
      <XCircle className="size-4" />
      Finished with errors (exit {status.exitCode})
    </span>
  );
}

// IMP3-01: renders the same countryTally/mediaTypeTally numbers the
// script already logs as plain text (e.g. "12 TV, 8 Movies · Thailand: 9,
// Korea: 11"), as a small stat breakdown instead of something you'd have
// to find by scrolling the log panel. Country order follows whatever
// order the backend's countryTally object has -- the script only ever
// builds it by encountering countries as it goes, so this isn't sorted
// by count, just left as the backend reports it.
function StatBreakdown({ summary, dryRun }: { summary: ImportRunSummary; dryRun?: boolean }) {
  const tv = summary.mediaTypeTally.tv ?? 0;
  const movie = summary.mediaTypeTally.movie ?? 0;
  const countries = Object.entries(summary.countryTally);

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-3 text-[12.5px]">
      <span className="font-semibold text-foreground">
        {summary.added} {dryRun ? 'would be queued' : 'queued'}:
      </span>
      <span className="text-muted-foreground">
        {tv} TV, {movie} Movies
        {countries.length > 0 && (
          <>
            {' · '}
            {countries.map(([country, count], i) => (
              <span key={country}>
                {country}: {count}
                {i < countries.length - 1 ? ', ' : ''}
              </span>
            ))}
          </>
        )}
      </span>
    </div>
  );
}
