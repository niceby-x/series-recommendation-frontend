// Bridges a SeriesCard click to the /series/[id] route: the grid already
// has poster_url/backdrop_url for the clicked series, but the detail page
// is a Server Component that re-fetches from scratch, so without this the
// shared layoutId hero would have nothing to render until that fetch
// resolves. sessionStorage (not React state/context) is used deliberately --
// it's the one thing that survives a full route's component tree
// unmounting/remounting without needing a persistent client provider
// wrapped around the whole app.
//
// Entries are self-expiring: read() deletes on read, and a stale entry
// (e.g. the back button lands here) is ignored past MAX_AGE_MS so a
// months-old cached poster never flashes in.

const KEY_PREFIX = 'blumi:series-transition:';
const MAX_AGE_MS = 15_000;

export interface SeriesTransitionPreview {
  posterUrl: string | null;
  backdropUrl: string | null;
  title: string;
}

interface StoredPreview extends SeriesTransitionPreview {
  storedAt: number;
}

export function writeSeriesTransitionPreview(id: number, preview: SeriesTransitionPreview): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredPreview = { ...preview, storedAt: Date.now() };
    window.sessionStorage.setItem(KEY_PREFIX + id, JSON.stringify(payload));
  } catch {
    // Storage can be full/disabled (private browsing) -- the transition
    // just degrades to a plain crossfade with no early preview.
  }
}

// Non-destructive: loading.tsx reads this while the real page is still in
// flight, but SeriesHero (the final destination) needs the same entry a
// moment later for its crossfade, so nothing here removes it from storage.
export function peekSeriesTransitionPreview(id: number | string): SeriesTransitionPreview | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY_PREFIX + id);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredPreview;
    if (Date.now() - parsed.storedAt > MAX_AGE_MS) return null;

    return { posterUrl: parsed.posterUrl, backdropUrl: parsed.backdropUrl, title: parsed.title };
  } catch {
    return null;
  }
}

// Destructive: SeriesHero is the last consumer in the flow, so it clears
// the entry once read -- otherwise a stale poster could flash in again on
// a later direct visit that happens to reuse the same sessionStorage tab.
export function readSeriesTransitionPreview(id: number | string): SeriesTransitionPreview | null {
  const preview = peekSeriesTransitionPreview(id);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(KEY_PREFIX + id);
    } catch {
      // Storage disabled -- nothing to clean up.
    }
  }
  return preview;
}

export function seriesPosterLayoutId(id: number | string): string {
  return 'series-poster-' + id;
}
