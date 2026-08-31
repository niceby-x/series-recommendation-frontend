'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Loader2, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// IMP4-01: the "Schedule" tab on the Import & Sync page -- lets an admin
// turn on an unattended daily import instead of only ever triggering one
// by hand. Self-contained (owns its own fetch/save/auth) for the same
// reason ImportHistoryTable is -- see that component's own header comment
// -- it's only ever mounted while this tab is active, so mounting fresh
// each time means it always shows the current saved config rather than a
// stale one from whenever it was last visited.
//
// Talks to GET/PUT /admin/import/schedule on the backend (services/
// importSchedule.ts + routes/admin/importRuns.ts). The backend is the
// single source of truth for what an empty keyword/limit actually
// resolves to at trigger time (same "resolved where the run actually
// starts" reasoning as the Run Import tab's own inputs) -- this form just
// sends null for either field when left blank, rather than guessing or
// duplicating the backend's defaults here.

interface ScheduleConfig {
  enabled: boolean;
  runHourUtc: number;
  keyword: string | null;
  limitPerType: number | null;
  lastTriggeredAt: string | null;
  updatedAt: string;
  // IMP7-02: computed fresh by the backend on every GET/PUT, not stored --
  // true once the most recent scheduled slot has come and gone (server
  // downtime, a crash, etc.) without a fresh trigger since. See
  // computeMissedLastScheduled's own comment in services/importSchedule.ts
  // for the exact day-math.
  missedLastScheduled: boolean;
}

// Mirrors the backend's own MAX_IMPORT_LIMIT/MAX_KEYWORD_LENGTH
// (services/importRuns.ts) -- same reasoning as the Run Import tab's
// identically-named constants: the backend is the source of truth, this
// just keeps the inputs from looking like they accept more than they do.
const MAX_LIMIT = 500;
const MAX_KEYWORD_LENGTH = 100;
const DEFAULT_KEYWORD_PLACEHOLDER = "boys' love (bl)";
const DEFAULT_LIMIT_PLACEHOLDER = '150';

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

function scheduleUrl() {
  return process.env.NEXT_PUBLIC_API_URL + '/admin/import/schedule';
}

function formatHourUtc(hour: number): string {
  return String(hour).padStart(2, '0') + ':00 UTC';
}

export default function ImportScheduleSettings() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);

  const [enabledInput, setEnabledInput] = useState(false);
  const [runHourInput, setRunHourInput] = useState(3);
  const [keywordInput, setKeywordInput] = useState('');
  const [limitInput, setLimitInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      const header = await authHeader();
      if (!header) {
        if (!cancelled) {
          setLoadError('You must be signed in to view the import schedule.');
          setLoading(false);
        }
        return;
      }

      const res = await fetch(scheduleUrl(), { headers: header });
      if (cancelled) return;

      if (!res.ok) {
        setLoadError('Could not load the import schedule. Try refreshing the page.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (cancelled) return;

      const data: ScheduleConfig = json.data;
      setConfig(data);
      setEnabledInput(data.enabled);
      setRunHourInput(data.runHourUtc);
      setKeywordInput(data.keyword ?? '');
      setLimitInput(data.limitPerType != null ? String(data.limitPerType) : '');
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaveError(null);
    setSaveSuccess(false);
    const header = await authHeader();
    if (!header) {
      setSaveError('You must be signed in to save the import schedule.');
      return;
    }

    const trimmedKeyword = keywordInput.trim();
    const parsedLimit = parseInt(limitInput, 10);
    const limitPerType =
      limitInput.trim() !== '' && Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : null;

    setSaving(true);
    const res = await fetch(scheduleUrl(), {
      method: 'PUT',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: enabledInput,
        runHourUtc: runHourInput,
        keyword: trimmedKeyword === '' ? null : trimmedKeyword,
        limitPerType,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setSaveError(json?.message ?? 'Could not save the schedule. Try again.');
      return;
    }

    const json = await res.json();
    const data: ScheduleConfig = json.data;
    setConfig(data);
    setKeywordInput(data.keyword ?? '');
    setLimitInput(data.limitPerType != null ? String(data.limitPerType) : '');
    setSaveSuccess(true);
  }

  if (loading) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-8 flex items-center justify-center text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading schedule…
      </div>
    );
  }

  if (loadError || !config) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-8 text-center">
        <p className="text-rose-500 text-sm">{loadError ?? 'Could not load the import schedule.'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <p className="font-heading text-[15px] font-normal text-foreground mb-1">Scheduled import</p>
          <p className="text-muted-foreground text-[13px]">
            Automatically run the discovery import once a day, without needing to click Start Import.
          </p>
        </div>
        <label
          htmlFor="schedule-enabled"
          className="flex items-center gap-2 text-[13px] font-semibold text-foreground select-none cursor-pointer"
        >
          <input
            id="schedule-enabled"
            type="checkbox"
            checked={enabledInput}
            onChange={(e) => setEnabledInput(e.target.checked)}
            className="size-4 rounded border-border accent-current"
          />
          Enabled
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div>
          <label htmlFor="schedule-hour" className="block text-[12.5px] font-semibold text-foreground mb-1.5">
            Run time
          </label>
          <select
            id="schedule-hour"
            value={runHourInput}
            onChange={(e) => setRunHourInput(parseInt(e.target.value, 10))}
            className="w-32 bg-background text-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {formatHourUtc(hour)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="schedule-keyword" className="block text-[12.5px] font-semibold text-foreground mb-1.5">
            Discovery keyword
          </label>
          <input
            id="schedule-keyword"
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            maxLength={MAX_KEYWORD_LENGTH}
            placeholder={DEFAULT_KEYWORD_PLACEHOLDER}
            className="w-56 bg-background text-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
          />
        </div>

        <div>
          <label htmlFor="schedule-limit" className="block text-[12.5px] font-semibold text-foreground mb-1.5">
            Limit per media type
          </label>
          <input
            id="schedule-limit"
            type="number"
            min={1}
            max={MAX_LIMIT}
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder={DEFAULT_LIMIT_PLACEHOLDER}
            className="w-32 bg-background text-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? 'Saving…' : 'Save schedule'}
        </button>
      </div>

      {saveError && <p className="text-rose-500 text-[13px] mb-2">{saveError}</p>}
      {saveSuccess && !saveError && <p className="text-emerald-600 text-[13px] mb-2">Schedule saved.</p>}

      {/* IMP7-02: config reflects the last fetch/save response, not the
          form's in-progress draft edits (enabledInput etc.) -- so toggling
          "Enabled" without saving can't make this banner flicker on/off
          before there's actually a new persisted state to reflect. */}
      {config.missedLastScheduled && (
        <div className="flex items-center gap-1.5 text-amber-600 text-[12.5px] mb-2">
          <AlertTriangle className="size-3.5" />
          The last scheduled run appears to have been missed (e.g. the server was down at the scheduled time).
          It will try again on the next check.
        </div>
      )}

      <div className="flex items-center gap-1.5 text-muted-foreground text-[12.5px]">
        <CalendarClock className="size-3.5" />
        {config.lastTriggeredAt
          ? 'Last triggered ' + new Date(config.lastTriggeredAt).toLocaleString()
          : 'Never triggered yet.'}
      </div>
    </div>
  );
}
