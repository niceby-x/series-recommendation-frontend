import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import TropesAuthed from '../../components/tropes/TropesAuthed';
import TropesLanding from '../../components/tropes/TropesLanding';

// Same series fetch as app/moods/page.tsx, added so TropesAuthed can back
// its seriesCount figures with real trope-tag matches (see lib/moodMatch.ts)
// instead of the fully-hardcoded numbers in lib/tropesContent.ts.
async function getSeries(): Promise<SeriesCardData[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Series fetch failed with status ' + res.status);
      return [];
    }

    const json = await res.json();
    return (json.data || []) as SeriesCardData[];
  } catch (err) {
    console.error('Series fetch threw an error:', err);
    return [];
  }
}

// Same HomeGate split as app/moods/page.tsx.
export default async function TropesPage() {
  const allSeries = await getSeries();

  return <HomeGate landing={<TropesLanding />} authed={<TropesAuthed allSeries={allSeries} />} />;
}
