import { Suspense } from 'react';
import SeriesFilter from './SeriesFilter';
import type { SeriesCardData } from '../../components/shared/SeriesCard';

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

export default async function SeriesPage() {
  const seriesList = await getSeries();

  return (
    <main className="min-h-screen bg-background px-4 md:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* SeriesFilter reads the URL via useSearchParams(), which requires a
            Suspense boundary in the App Router — without this, Next.js can't
            prerender this page and the build fails outright. */}
        <Suspense fallback={null}>
          <SeriesFilter seriesList={seriesList} />
        </Suspense>
      </div>
    </main>
  );
}