import { createServerSupabaseClient } from './supabaseServer';

// G2-02: the server-side equivalent of the old client-only
// supabase.auth.getSession() check HomeGate/app/my-list/page.tsx/
// app/admin/page.tsx used to each do themselves after mount. Uses
// getUser() rather than getSession() because getUser() re-validates the
// JWT against Supabase Auth's own server instead of just trusting
// whatever's sitting in the cookie -- worth the extra round trip here
// since the result decides what a Server Component renders (unlike a
// client-side convenience check). accessToken (from a follow-up
// getSession() read of the now-validated cookie) is what callers use to
// call the backend's Bearer-authenticated routes server-side, same token
// shape the browser client's session already provided client-side.
export async function getServerSession() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, accessToken: null };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { user, accessToken: session?.access_token ?? null };
}
