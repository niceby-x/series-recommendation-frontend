import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import NewReleasesAuthed from '../../components/new-releases/NewReleasesAuthed';
import NewReleasesLanding from '../../components/new-releases/NewReleasesLanding';

// Deliberately NOT paginated (see P2-04 / lib/usePaginatedSeries.ts):
// NewReleasesAuthed sorts the whole catalog by mock release date and picks
// a top-5 Trending sidebar from it, so it needs every row up front --
// paginating this fetch would silently make "Just Released" and
// "Trending" incomplete/wrong as pages loaded in. Only Series/Discover
// (a real flat browse grid) paginates.
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

// Same HomeGate split as app/moods/page.tsx and app/tropes/page.tsx.
export default async function NewReleasesPage() {
  const allSeries = await getSeries();

  return <HomeGate landing={<NewReleasesLanding />} authed={<NewReleasesAuthed allSeries={allSeries} />} />;
}
