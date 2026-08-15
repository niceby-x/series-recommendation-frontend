'use client';

import { useAuthModal } from '../../lib/AuthModalContext';

// G2-02: app/my-list/page.tsx and app/admin/page.tsx are now Server
// Components that decide server-side whether the visitor is signed in
// (see lib/getServerSession.ts) -- this is the one piece of that decision
// that still has to be a client component, since opening AuthModal needs
// the useAuthModal() context + an onClick handler, neither of which a
// Server Component can do itself.
export default function SignInPrompt({ message }: { message: string }) {
  const { open: openAuthModal } = useAuthModal();

  return (
    <p className="text-muted-foreground">
      <button
        type="button"
        onClick={() => openAuthModal('login')}
        className="text-primary font-semibold hover:opacity-80 transition-opacity"
      >
        Sign in
      </button>{' '}
      {message}
    </p>
  );
}
