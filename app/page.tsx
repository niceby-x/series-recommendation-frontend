import type { SeriesCardData } from '../components/shared/SeriesCard';
import HomeGate from '../components/shared/HomeGate';
import HomeAuthed from '../components/home/HomeAuthed';
import HomeLanding from '../components/home/HomeLanding';
import type { RealCuratorPick } from '../lib/curatorPicks';

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

async function getCuratorPicks(): Promise<RealCuratorPick[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/curator-picks', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Curator picks fetch failed with status ' + res.status);
      return [];
    }

    const json = await res.json();
    return (json.data || []) as RealCuratorPick[];
  } catch (err) {
    console.error('Curator picks fetch threw an error:', err);
    return [];
  }
}

// Fetched once here and handed to both branches -- logged-out visitors get
// HomeLanding (convert-a-stranger), logged-in users get HomeAuthed (today's
// homepage, with personalized-feeling rows). HomeGate is the client-side
// switch between them; see that file for why this isn't done server-side.
//
// curatorPicks comes from the real /curator-picks endpoint (admin-curated,
// see app/admin/curator-picks/page.tsx) now, instead of both branches
// deriving a fake "curated" set from allSeries.slice(6, 10) themselves.
// Empty until an admin actually picks something -- both branches still
// fall back to lib/landingContent.ts's mock CURATOR_FEATURE/CURATOR_LIST
// when this comes back empty.
export default async function Home() {
  const [allSeries, curatorPicks] = await Promise.all([getSeries(), getCuratorPicks()]);

  return (
    <HomeGate
      landing={<HomeLanding allSeries={allSeries} curatorPicks={curatorPicks} />}
      authed={<HomeAuthed allSeries={allSeries} curatorPicks={curatorPicks} />}
    />
  );
}
