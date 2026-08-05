'use client';

import Link from 'next/link';
import { useAuthModal } from '../../lib/AuthModalContext';
import UpcomingReleaseCard from './UpcomingReleaseCard';
import { MOCK_UPCOMING } from '../../lib/newReleasesContent';

// Logged-out visitors get a preview of what's coming up plus a sign-up
// nudge -- "New Release Highlights", "Trending This Week", and the
// personalized Release Calendar don't mean much without an account, same
// split as MoodsLanding/TropesLanding.
export default function NewReleasesLanding() {
  const { open: openAuthModal } = useAuthModal();

  return (
    <main className="min-h-screen bg-background px-4 md:px-6 lg:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-[32px] md:text-[40px] font-normal text-foreground mb-2">New Releases</h1>
          <p className="text-muted-foreground text-[15px] max-w-md mx-auto mb-5">
            Sign up to get personalized release reminders and never miss a new story.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="bg-brand-gradient text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Sign up free
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {MOCK_UPCOMING.map((item) => (
            <UpcomingReleaseCard key={item.key} item={item} />
          ))}
        </div>

        <p className="text-center mt-8">
          <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
            Browse the full catalog
          </Link>
        </p>
      </div>
    </main>
  );
}
