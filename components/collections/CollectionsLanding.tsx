'use client';

import { useAuthModal } from '../../lib/AuthModalContext';
import { MY_COLLECTIONS } from '../../lib/collectionsContent';
import CollectionCard from './CollectionCard';

// Logged-out visitors get a preview of what collections look like plus a
// sign-up nudge -- progress/overview stats don't mean anything without an
// account, same split as MoodsLanding/TropesLanding.
export default function CollectionsLanding() {
  const { open: openAuthModal } = useAuthModal();

  return (
    <main className="min-h-screen bg-background px-4 md:px-6 lg:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-[32px] md:text-[40px] font-normal text-foreground mb-2">Collections</h1>
          <p className="text-muted-foreground text-[15px] max-w-md mx-auto mb-5">
            Sign up to organize series into your own collections and track your progress through each one.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="bg-brand-gradient text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Sign up free
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {MY_COLLECTIONS.map((collection) => (
            <CollectionCard key={collection.key} collection={collection} />
          ))}
        </div>
      </div>
    </main>
  );
}
