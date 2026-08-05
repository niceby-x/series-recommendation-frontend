import { Suspense } from 'react';
import SeriesFilter from './SeriesFilter';
import type { SeriesCardData } from '../shared/SeriesCard';

// Discover's logged-out branch -- the existing real Explore experience
// (SeriesFilter + its sidebar of real filters), not a from-scratch
// rebuild, since that code already worked. Extracted out of
// app/series/page.tsx into its own file so this page follows the same
// XLanding.tsx convention as Moods/Tropes/Collections/New Releases,
// instead of being the one page with its logged-out markup inlined in
// the route file.
export default function DiscoverLanding({ seriesList }: { seriesList: SeriesCardData[] }) {
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
