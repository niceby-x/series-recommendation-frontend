import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import MoodsAuthed from '../../components/moods/MoodsAuthed';
import MoodsLanding from '../../components/moods/MoodsLanding';

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

// Same split as app/page.tsx and app/series/page.tsx: logged-out visitors
// get a lightweight preview + sign-up nudge, logged-in users get the full
// sidebar-dashboard Moods page.
export default async function MoodsPage() {
  const allSeries = await getSeries();

  return <HomeGate landing={<MoodsLanding />} authed={<MoodsAuthed allSeries={allSeries} />} />;
}
