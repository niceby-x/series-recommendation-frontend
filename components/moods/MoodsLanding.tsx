'use client';

import BrowseByMoodGrid from '../landing/BrowseByMoodGrid';
import { MOCK_MOODS } from '../../lib/landingContent';
import { useAuthModal } from '../../lib/AuthModalContext';

// Logged-out visitors get a preview of the mood grid (same tiles/gradients
// as the landing page's BrowseByMoodGrid, so nothing drifts out of sync)
// plus a sign-up nudge, rather than the full personalized dashboard --
// "Your Top Mood" and "Popular in Your Mood" don't mean anything without
// an account.
export default function MoodsLanding() {
  const { open: openAuthModal } = useAuthModal();

  return (
    <main className="min-h-screen bg-background px-4 md:px-6 lg:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-[32px] md:text-[40px] font-normal text-foreground mb-2">Moods</h1>
          <p className="text-muted-foreground text-[15px] max-w-md mx-auto mb-5">
            Sign up to get mood-matched recommendations, track your favorite vibe, and pick up where you left off.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="bg-brand-gradient text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Sign up free
          </button>
        </div>

        <BrowseByMoodGrid moods={MOCK_MOODS} />
      </div>
    </main>
  );
}
