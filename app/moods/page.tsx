import { Suspense } from 'react';
import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import MoodsAuthed from '../../components/moods/MoodsAuthed';
import MoodsLanding from '../../components/moods/MoodsLanding';
import { MOOD_SECTIONS } from '../../lib/moodsContent';

const REAL_ITEMS_PER_SECTION = 4;

// G1-01: previously fetched the entire unpaginated catalog and matched it
// against each mood client-side (see lib/moodMatch.ts -- that matching
// logic now lives server-side, see the backend's tag_dimension/tag_key
// support on GET /series). MOOD_SECTIONS is a short, fixed editorial list
// (3 sections today), so this is a handful of small, capped parallel
// requests -- one per section, each asking for only as many real matches
// as that section can show -- instead of one request for the whole
// catalog.
async function getRealMatchesBySection(): Promise<Record<string, SeriesCardData[]>> {
  const entries = await Promise.all(
    MOOD_SECTIONS.map(async (section) => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL +
            '/series?tag_dimension=mood&tag_key=' +
            encodeURIComponent(section.moodFilterKey) +
            '&page=1&limit=' +
            REAL_ITEMS_PER_SECTION,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          console.error('Mood matches fetch failed with status ' + res.status);
          return [section.key, []] as const;
        }

        const json = await res.json();
        return [section.key, (json.data || []) as SeriesCardData[]] as const;
      } catch (err) {
        console.error('Mood matches fetch threw an error:', err);
        return [section.key, []] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}

// Same split as app/page.tsx and app/series/page.tsx: logged-out visitors
// get a lightweight preview + sign-up nudge, logged-in users get the full
// sidebar-dashboard Moods page. MoodsAuthed now reads useSearchParams (for
// the ?mood= filter coming from Home's mood cards, see H1-01), so it's
// wrapped in Suspense per Next's requirement for that hook -- same pattern
// as app/series/page.tsx's DiscoverAuthed.
export default async function MoodsPage() {
  const realMatchesBySection = await getRealMatchesBySection();

  return (
    <HomeGate
      landing={<MoodsLanding />}
      authed={
        <Suspense fallback={null}>
          <MoodsAuthed realMatchesBySection={realMatchesBySection} />
        </Suspense>
      }
    />
  );
}
