import { Suspense } from 'react';
import type { SeriesCardData } from '../../components/shared/SeriesCard';
import HomeGate from '../../components/shared/HomeGate';
import DiscoverAuthed from '../../components/discover/DiscoverAuthed';
import DiscoverLanding from '../../components/discover/DiscoverLanding';

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

// Same HomeGate split as app/page.tsx, app/moods/page.tsx, etc: logged-out
// visitors get DiscoverLanding (the existing real Explore page), logged-in
// users get the sidebar-dashboard DiscoverAuthed. DiscoverAuthed now reads
// useSearchParams (for the ?trope= filter coming from the Tropes page), so
// it's wrapped in Suspense per Next's requirement for that hook.
export default async function SeriesPage() {
  const seriesList = await getSeries();

  return (
    <HomeGate
      landing={<DiscoverLanding seriesList={seriesList} />}
      authed={
        <Suspense fallback={null}>
          <DiscoverAuthed allSeries={seriesList} />
        </Suspense>
      }
    />
  );
}
