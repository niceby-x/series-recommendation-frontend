import HomeGate from '../../components/shared/HomeGate';
import TropesAuthed from '../../components/tropes/TropesAuthed';
import TropesLanding from '../../components/tropes/TropesLanding';

// Same HomeGate split as app/moods/page.tsx. Unlike Moods, this page has no
// real-catalog blending yet (Popular/Category/New Tropes rows are entirely
// curated mock content -- see lib/tropesContent.ts), so there's no series
// fetch to do server-side.
export default function TropesPage() {
  return <HomeGate landing={<TropesLanding />} authed={<TropesAuthed />} />;
}
