import type { SeriesCardData } from '../components/shared/SeriesCard';
import HomeGate from '../components/shared/HomeGate';
import HomeAuthed from '../components/home/HomeAuthed';
import LandingPage from '../components/landing/LandingPage';

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

// Fetched once here and handed to both branches -- logged-out visitors get
// LandingPage (convert-a-stranger), logged-in users get HomeAuthed (today's
// homepage, with personalized-feeling rows). HomeGate is the client-side
// switch between them; see that file for why this isn't done server-side.
export default async function Home() {
  const allSeries = await getSeries();

  return (
    <HomeGate
      landing={<LandingPage allSeries={allSeries} />}
      authed={<HomeAuthed allSeries={allSeries} />}
    />
  );
}
