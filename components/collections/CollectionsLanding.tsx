'use client';

import { useAuthModal } from '../../lib/AuthModalContext';
import { MY_COLLECTIONS } from '../../lib/collectionsContent';

// Non-interactive preview card, distinct from the real (clickable,
// real-data) CollectionCard used once signed in -- a logged-out visitor
// has no real collections to link to yet, so this stays purely visual.
function PreviewCard({ collection }: { collection: (typeof MY_COLLECTIONS)[number] }) {
  const Icon = collection.icon;
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 flex items-center justify-center px-3 text-center">
        <span className="text-muted-foreground text-xs font-medium">{collection.title}</span>
      </div>
      <div className="p-4">
        <p className="flex items-center gap-1.5 text-foreground font-semibold text-[15px] mb-1.5">
          <Icon className="size-4 text-primary shrink-0" />
          <span className="truncate">{collection.title}</span>
        </p>
        <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2">{collection.description}</p>
      </div>
    </div>
  );
}

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
            <PreviewCard key={collection.key} collection={collection} />
          ))}
        </div>
      </div>
    </main>
  );
}
