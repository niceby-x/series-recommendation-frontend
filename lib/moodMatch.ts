// lib/moodMatch.ts
//
// Matches a series' real series_tags (see GET /series' `tags` field) against
// the hand-picked filter/section keys used by lib/moodsContent.ts and
// lib/tropesContent.ts (e.g. 'romantic', 'enemies-to-lovers'). The DB's
// governed tag vocabulary (tags.value_key, set by admins via the Tags page)
// isn't guaranteed to spell things identically to those curated keys, so
// this normalizes both sides (lowercase, strip anything that isn't a-z0-9)
// before comparing -- 'enemies_to_lovers' and 'enemies-to-lovers' and
// 'Enemies to Lovers' all normalize to the same string. A tag whose
// value_key/display_label doesn't normalize to an exact match against a
// curated key simply won't surface that series in that row -- there's no
// fuzzy/partial matching, so a real-but-differently-worded tag falls back
// to leaving the mock card in place rather than guessing a wrong match.

import type { SeriesTagData } from '../components/shared/SeriesCard';

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function tagMatchesKey(tag: SeriesTagData, key: string): boolean {
  const normalizedKey = normalize(key);
  return normalize(tag.value_key) === normalizedKey || normalize(tag.display_label) === normalizedKey;
}

export function seriesMatchesMoodKey(tags: SeriesTagData[] | undefined, moodKey: string): boolean {
  if (!tags || tags.length === 0) return false;
  return tags.some((t) => t.dimension === 'mood' && tagMatchesKey(t, moodKey));
}

export function seriesMatchesTropeKey(tags: SeriesTagData[] | undefined, tropeKey: string): boolean {
  if (!tags || tags.length === 0) return false;
  return tags.some((t) => t.dimension === 'trope' && tagMatchesKey(t, tropeKey));
}

/** Count of series in `allSeries` whose real trope tags match `tropeKey`. */
export function realTropeCount<T extends { tags?: SeriesTagData[] }>(allSeries: T[], tropeKey: string): number {
  return allSeries.filter((s) => seriesMatchesTropeKey(s.tags, tropeKey)).length;
}
