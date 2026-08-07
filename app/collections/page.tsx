import HomeGate from '../../components/shared/HomeGate';
import CollectionsAuthed from '../../components/collections/CollectionsAuthed';
import CollectionsLanding from '../../components/collections/CollectionsLanding';

// Same HomeGate split as app/moods/page.tsx and app/tropes/page.tsx.
// CollectionsAuthed fetches real personal + curated collections client-side
// once signed in; CollectionsLanding stays on static mock data for the
// logged-out preview (see lib/collectionsContent.ts).
export default function CollectionsPage() {
  return <HomeGate landing={<CollectionsLanding />} authed={<CollectionsAuthed />} />;
}
