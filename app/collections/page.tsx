import HomeGate from '../../components/shared/HomeGate';
import CollectionsAuthed from '../../components/collections/CollectionsAuthed';
import CollectionsLanding from '../../components/collections/CollectionsLanding';

// Same HomeGate split as app/moods/page.tsx and app/tropes/page.tsx. No
// `collections` table exists yet, so there's no server-side fetch here --
// see lib/collectionsContent.ts for the mock data this page runs on.
export default function CollectionsPage() {
  return <HomeGate landing={<CollectionsLanding />} authed={<CollectionsAuthed />} />;
}
