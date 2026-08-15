import HomeGate from '../../components/shared/HomeGate';
import TropesAuthed, { type TropeMatches } from '../../components/tropes/TropesAuthed';
import TropesLanding from '../../components/tropes/TropesLanding';
import { POPULAR_TROPES, NEW_TROPES } from '../../lib/tropesContent';

const POSTERS_PER_TROPE = 3;

// G1-01: one small, capped GET /series call per trope key (tag_dimension=
// trope&tag_key=..., see the backend's ported lib/moodMatch.ts logic)
// instead of fetching the whole catalog and matching client-side (see the
// old realTropeMatches in lib/moodMatch.ts). POPULAR_TROPES + NEW_TROPES
// is a short, fixed editorial list (10 keys today), so this is 10 small
// parallel requests, each asking for only as many posters as a card can
// show -- pagination.total gives the real seriesCount without needing the
// full matching set back.
async function fetchTropeMatches(key: string): Promise<TropeMatches> {
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL +
        '/series?tag_dimension=trope&tag_key=' +
        encodeURIComponent(key) +
        '&page=1&limit=' +
        POSTERS_PER_TROPE,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      console.error('Trope matches fetch failed with status ' + res.status);
      return { count: 0, posterUrls: [] };
    }

    const json = await res.json();
    const data = (json.data || []) as { backdrop_url: string | null; poster_url: string | null }[];
    return {
      count: json.pagination?.total ?? data.length,
      posterUrls: data.map((s) => s.backdrop_url ?? s.poster_url),
    };
  } catch (err) {
    console.error('Trope matches fetch threw an error:', err);
    return { count: 0, posterUrls: [] };
  }
}

async function getTropeMatches(): Promise<Record<string, TropeMatches>> {
  const keys = [...POPULAR_TROPES, ...NEW_TROPES].map((t) => t.key);
  const entries = await Promise.all(keys.map(async (key) => [key, await fetchTropeMatches(key)] as const));
  return Object.fromEntries(entries);
}

// Same HomeGate split as app/moods/page.tsx.
export default async function TropesPage() {
  const tropeMatches = await getTropeMatches();

  return <HomeGate landing={<TropesLanding />} authed={<TropesAuthed tropeMatches={tropeMatches} />} />;
}
