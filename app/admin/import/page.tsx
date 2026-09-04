'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Square,
  Ban,
  ArrowRight,
  AlertTriangle,
  Copy,
  Check,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  History,
  CalendarClock,
  Plus,
  BookOpen,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import { useAdminPageHeader } from '../../../components/admin/AdminPageHeaderContext';
import ImportHistoryTable from '../../../components/admin/ImportHistoryTable';
import ImportScheduleSettings from '../../../components/admin/ImportScheduleSettings';
import ImportAddByTitle from '../../../components/admin/ImportAddByTitle';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';
// IMP3-03: a separate tab rather than appending the history list below
// the existing log panel -- keeps "start/monitor a run" and "audit past
// runs" as two distinct, uncluttered views instead of one long scrolling
// page once history grows past a handful of rows.
// IMP4-01: same reasoning extends to a third 'schedule' tab -- the
// schedule settings form has nothing to do with monitoring a live run or
// browsing history, so it gets its own uncluttered view too.
// IMP5-01: and a fourth 'add' tab -- manually searching/adding a single
// title by name is a different task from any of the above (not
// monitoring a run, not auditing history, not configuring the
// scheduler), so it gets its own uncluttered view for the same reason.
type PageTab = 'run' | 'history' | 'schedule' | 'add';

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
  // Optional: only present on runs completed after the backend started
  // emitting it -- a persisted summary from an older run predates this
  // field and won't have it.
  titles?: ImportRunSummaryTitle[];
}

interface ImportRunSummaryTitle {
  title: string;
  mediaType: 'tv' | 'movie';
  country: string;
  year: number | null;
  tmdbId: number;
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

// Icon + label per tab, driving the redesigned tab bar below. Order
// matches the working tab order used throughout this file.
const TABS: { id: PageTab; label: string; icon: typeof Play }[] = [
  { id: 'run', label: 'Run Import', icon: Play },
  { id: 'history', label: 'History', icon: History },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'add', label: 'Add by Title', icon: Plus },
];

// Placeholder -- no import/sync documentation page exists yet. Point this
// at wherever that ends up living (a README section, an internal wiki
// page, etc.) once it does.
const IMPORT_DOCS_URL = 'https://github.com/niceby-x/series-recommendation-backend#readme';

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
  const [activeTab, setActiveTab] = useState<PageTab>('run');
  const [limitInput, setLimitInput] = useState('150');
  const [dryRunInput, setDryRunInput] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);
  const [logCopied, setLogCopied] = useState(false);
  const [logExpanded, setLogExpanded] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  useAdminPageHeader({
    title: 'Import & Sync',
    subtitle: 'Run the TMDB discovery script to queue new titles into the Editorial Queue for review.',
    actions: (
      <a
        href={IMPORT_DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full bg-card border border-border shadow-sm px-3.5 py-2 text-[13px] font-semibold text-foreground hover:border-ring transition-colors whitespace-nowrap"
      >
        <BookOpen className="size-3.5" />
        View Documentation
      </a>
    ),
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

  function bumpLimit(delta: number) {
    const current = parseInt(limitInput, 10);
    const base = Number.isFinite(current) ? current : 0;
    const next = Math.min(MAX_IMPORT_LIMIT, Math.max(1, base + delta));
    setLimitInput(String(next));
  }

  async function handleCopyLog() {
    if (!status?.logTail || status.logTail.length === 0) return;
    try {
      await navigator.clipboard.writeText(status.logTail.join('\n'));
      setLogCopied(true);
      setTimeout(() => setLogCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) -- not
      // worth its own error banner for a convenience action, the text is
      // still fully visible and selectable in the panel either way.
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
        <p className="text-rose-500">Could not load import status. Try refreshing the page.</p>
      </div>
    );
  }

  const running = status?.running ?? false;

  return (
    <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[900px] mx-auto">

          {/* IMP3-03/IMP4-01/IMP5-01: same reasoning as before for keeping
              each section on its own tab (see git history for the original
              per-tab notes) -- now with an icon per tab and the tab row
              itself living inside a bordered card rather than floating
              directly on the page background. */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm px-2 mb-6" role="tablist" aria-label="Import page sections">
            <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden pb-px">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      'flex items-center gap-1.5 px-3.5 py-3.5 text-[13.5px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ' +
                      (active
                        ? 'text-primary border-primary'
                        : 'text-muted-foreground border-transparent hover:text-foreground')
                    }
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'history' ? (
            <ImportHistoryTable />
          ) : activeTab === 'schedule' ? (
            <ImportScheduleSettings />
          ) : activeTab === 'add' ? (
            <ImportAddByTitle />
          ) : (
          <>

          <div className="rounded-[28px] border border-border/60 shadow-sm bg-card overflow-hidden mb-6">
            <div className="px-6 pt-6 pb-5 border-b border-border/60">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <h2 className="text-[15px] font-semibold text-foreground">Import Configuration</h2>
              </div>
              <p className="text-muted-foreground text-[12.5px] mt-1">
                Configure your import preferences and run the discovery script.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex flex-wrap items-start gap-6">
                  <div>
                    <label htmlFor="import-limit" className="block text-[12.5px] font-semibold text-foreground mb-2">
                      Limit per media type
                    </label>
                    <div className="relative">
                      <input
                        id="import-limit"
                        type="number"
                        min={1}
                        max={MAX_IMPORT_LIMIT}
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        disabled={running}
                        className="w-28 bg-background text-foreground rounded-xl pl-3.5 pr-7 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                        <button
                          type="button"
                          onClick={() => bumpLimit(1)}
                          disabled={running}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                          aria-label="Increase limit"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => bumpLimit(-1)}
                          disabled={running}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                          aria-label="Decrease limit"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="import-keyword" className="block text-[12.5px] font-semibold text-foreground mb-2">
                      Discovery keyword
                    </label>
                    <div className="relative">
                      <input
                        id="import-keyword"
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        disabled={running}
                        maxLength={MAX_KEYWORD_LENGTH}
                        placeholder={DEFAULT_KEYWORD_PLACEHOLDER}
                        className="w-56 bg-background text-foreground rounded-xl pl-3.5 pr-8 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors disabled:opacity-50"
                      />
                      {keywordInput && !running && (
                        <button
                          type="button"
                          onClick={() => setKeywordInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label="Clear keyword"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="import-dry-run"
                      className="flex items-center gap-2 text-[13px] font-medium text-foreground select-none cursor-pointer disabled:cursor-default"
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
                    <p className="text-muted-foreground text-[11.5px] mt-1.5 pl-6">Preview only, do not queue</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5">
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={running || starting}
                    className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    {running ? 'Running…' : 'Start Import'}
                  </button>

                  {running ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      disabled={stopping}
                      className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {stopping ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                      {stopping ? 'Stopping…' : 'Stop'}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-[12.5px] font-medium">
                      <CheckCircle2 className="size-3.5" />
                      Ready to run
                    </span>
                  )}
                </div>
              </div>

              {/* One notice at a time, ranked by what the admin needs to
                  act on first (a failed action beats a stale process error
                  beats an informational persistence warning) -- replaces
                  four separately-styled paragraphs that each admin
                  previously had to scan past individually. */}
              {(() => {
                const notice = resolveNotice(startError, stopError, status);
                return notice ? <Notice notice={notice} /> : null;
              })()}

              {status?.startedAt && <RunMeta status={status} />}

              {status?.summary && status.dryRun && <DryRunPreview summary={status.summary} />}

              {/* IMP3-01/IMP2-02: queued-summary and the jump to the
                  Editorial Queue share one row -- what happened, and where
                  to go look at it, read together rather than as two
                  separately-positioned blocks. */}
              {((status?.summary && !status.dryRun) ||
                (!running && status?.exitCode === 0 && !status?.cancelled && !status?.dryRun)) && (
                <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                  {status?.summary && !status.dryRun ? (
                    <StatBreakdown summary={status.summary} />
                  ) : (
                    <span />
                  )}
                  {!running && status?.exitCode === 0 && !status?.cancelled && !status?.dryRun && (
                    <Link
                      href="/admin/candidates"
                      className="flex items-center gap-1.5 text-primary text-[13px] font-semibold hover:opacity-80 transition-opacity w-fit"
                    >
                      View pending candidates in the Editorial Queue
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/60 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setLogExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card"
            >
              <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-foreground">
                <ChevronRight className={'size-4 text-muted-foreground transition-transform ' + (logExpanded ? 'rotate-90' : '')} />
                Log Output
              </span>
              {status?.logTail && status.logTail.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLog();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      handleCopyLog();
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-semibold text-foreground hover:border-ring transition-colors"
                >
                  {logCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {logCopied ? 'Copied' : 'Copy log'}
                </span>
              )}
            </button>
            {logExpanded && (
              <div
                ref={logRef}
                className="bg-[var(--color-console-ink)] text-[var(--color-console-ink-text)] font-mono text-[12px] leading-relaxed p-4 h-[380px] overflow-y-auto"
              >
                {status?.logTail && status.logTail.length > 0 ? (
                  status.logTail.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">
                      {line}
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--color-console-ink-muted)]">No output yet. Start an import to see live logs here.</p>
                )}
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>
  );
}

// Picks the single most actionable notice rather than rendering every
// possible one at once -- a failed start/stop action is what the admin
// needs to see first, a stale process error from a past run comes next,
// and an informational persistence warning is lowest priority since the
// run is still proceeding normally despite it.
function resolveNotice(
  startError: string | null,
  stopError: string | null,
  status: ImportStatus | null
): { tone: 'error' | 'warning'; message: string } | null {
  if (startError) return { tone: 'error', message: startError };
  if (stopError) return { tone: 'error', message: stopError };
  if (status?.error) return { tone: 'error', message: 'Process error: ' + status.error };
  if (status?.persisted === false) {
    return {
      tone: 'warning',
      message:
        "This run's state couldn't be saved to the database, so it isn't being tracked. It will still complete " +
        "normally, but a server restart mid-run wouldn't be recoverable or show up in history.",
    };
  }
  return null;
}

function Notice({ notice }: { notice: { tone: 'error' | 'warning'; message: string } }) {
  const isError = notice.tone === 'error';
  const Icon = isError ? XCircle : AlertTriangle;
  return (
    <div
      className={
        'flex items-start gap-2 rounded-2xl px-3.5 py-3 text-[13px] mt-4 ' +
        (isError ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700')
      }
    >
      <Icon className="size-4 shrink-0 mt-0.5" />
      <p>{notice.message}</p>
    </div>
  );
}

// A quiet divided stat strip instead of a bordered icon-grid box -- small
// tracked labels over larger values, thin dividers between items rather
// than boxing the whole thing in its own panel. Reads as one continuous
// card with the form above it, not a card nested inside a card. Status
// is always included, rendered as StatusPill.
function RunMeta({ status }: { status: ImportStatus }) {
  const items: { label: string; value: ReactNode }[] = [];
  if (status.startedAt) {
    items.push({ label: 'Started', value: new Date(status.startedAt).toLocaleString() });
  }
  if (status.finishedAt) {
    items.push({ label: 'Finished', value: new Date(status.finishedAt).toLocaleString() });
  }
  if (status.limit != null) {
    items.push({ label: 'Limit', value: status.limit + ' per media type' });
  }
  if (status.keyword) {
    items.push({ label: 'Keyword', value: status.keyword });
  }
  items.push({ label: 'Status', value: <StatusPill status={status} /> });

  return (
    <div className="flex flex-wrap gap-y-4 mt-5 pt-5 border-t border-border/60">
      {items.map((item, i) => (
        <div key={item.label} className={'pr-8 ' + (i > 0 ? 'pl-8 border-l border-border/60' : '')}>
          <p className="text-muted-foreground text-[10.5px] font-medium uppercase tracking-wide">{item.label}</p>
          <div className="text-foreground text-[13px] font-medium mt-1.5">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// Pill-styled version of the run's outcome, used as the Status field in
// RunMeta's fact grid above. Same running/interrupted/cancelled/success/
// error precedence the rest of the page already uses.
function StatusPill({ status }: { status: ImportStatus }) {
  if (status.running) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap">
        <Loader2 className="size-3.5 animate-spin" />
        Running
      </span>
    );
  }
  if (status.interrupted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap">
        <XCircle className="size-3.5" />
        Interrupted
      </span>
    );
  }
  if (status.cancelled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap">
        <Ban className="size-3.5" />
        Stopped
      </span>
    );
  }
  if (status.exitCode === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap">
        <CheckCircle2 className="size-3.5" />
        Finished successfully
        {status.dryRun && <span className="text-emerald-700/70 font-normal">(dry run)</span>}
      </span>
    );
  }
  if (status.exitCode != null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap">
        <XCircle className="size-3.5" />
        Finished with errors (exit {status.exitCode})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap">
      <UploadCloud className="size-3.5" />
      Idle
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
//
// The real (non-dry-run) queued-summary row: a quiet inline line, since a
// completed real run is routine after-the-fact reporting.
function StatBreakdown({ summary }: { summary: ImportRunSummary }) {
  const tv = summary.mediaTypeTally.tv ?? 0;
  const movie = summary.mediaTypeTally.movie ?? 0;
  const countries = Object.entries(summary.countryTally);

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px]">
      <span className="font-semibold text-primary">{summary.added} queued</span>
      <span className="text-muted-foreground">·</span>
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

// A dry run's whole purpose is answering "how many would this add" --
// that number shouldn't blend into the page as the same quiet inline
// text a completed real run gets. A distinct callout, with the count set
// large, makes it the thing your eye lands on for a dry run specifically.
// The title list itself stays collapsed by default (it can run to
// hundreds of rows for a large limit) and is only offered at all once
// summary.titles is actually present -- a persisted run from before the
// backend started emitting it just shows the counts, same as before.
function DryRunPreview({ summary }: { summary: ImportRunSummary }) {
  const [expanded, setExpanded] = useState(false);
  const tv = summary.mediaTypeTally.tv ?? 0;
  const movie = summary.mediaTypeTally.movie ?? 0;
  const countries = Object.entries(summary.countryTally);
  const titles = summary.titles ?? [];

  return (
    <div className="rounded-2xl bg-violet-50 mt-5 overflow-hidden">
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <span className="flex items-center justify-center size-10 rounded-full bg-violet-100 text-violet-700 font-bold text-[17px] shrink-0">
          {summary.added}
        </span>
        <div className="text-[12.5px] min-w-0 flex-1">
          <p className="font-semibold text-violet-700">
            Would queue {summary.added} title{summary.added === 1 ? '' : 's'}
            <span className="font-normal text-violet-700/70"> — preview only, nothing was added</span>
          </p>
          <p className="text-violet-700/70 mt-0.5">
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
          </p>
        </div>
        {titles.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-violet-700 text-[12.5px] font-semibold shrink-0 hover:opacity-80 transition-opacity"
          >
            {expanded ? 'Hide titles' : 'Show titles'}
            <ChevronDown className={'size-3.5 transition-transform ' + (expanded ? 'rotate-180' : '')} />
          </button>
        )}
      </div>
      {expanded && titles.length > 0 && (
        <div className="border-t border-violet-200/70 max-h-64 overflow-y-auto">
          {titles.map((t, i) => (
            <div
              key={t.tmdbId + '-' + i}
              className="flex items-center justify-between gap-3 px-4 py-2 text-[12.5px] border-b border-violet-200/40 last:border-b-0"
            >
              <span className="text-violet-900 font-medium truncate">{t.title}</span>
              <span className="text-violet-700/70 shrink-0">
                {t.mediaType === 'tv' ? 'TV' : 'Movie'} · {t.country}
                {t.year ? ' · ' + t.year : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
