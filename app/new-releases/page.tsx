import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import NewReleasesAuthed from '../../components/new-releases/NewReleasesAuthed';
import NewReleasesLanding from '../../components/new-releases/NewReleasesLanding';

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
