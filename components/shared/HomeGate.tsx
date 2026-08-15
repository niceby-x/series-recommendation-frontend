import { getServerSession } from '../../lib/getServerSession';

// G2-02: this used to be a client component -- a brief blank beat while
// supabase.auth.getSession() resolved client-side, then a flip to
// landing/authed once it did (a visible flash, and nothing real for a
// logged-out crawler to see in the meantime). Now a plain Server
// Component: the session is read from cookies (see
// lib/getServerSession.ts) before anything is sent to the browser, so
// there's no loading state left to have, and a crawler sees the actual
// landing or authed markup instead of a blank div.
//
// Both branches are still built server-side by the caller and passed in
// as already-constructed elements (see app/page.tsx, app/moods/page.tsx,
// etc.) -- this component's only job is picking which one to render, same
// division of responsibility as before, just without a client boundary
// in the way.
export default async function HomeGate({
  landing,
  authed,
}: {
  landing: React.ReactNode;
  authed: React.ReactNode;
}) {
  const { user } = await getServerSession();

  return user ? <>{authed}</> : <>{landing}</>;
}
