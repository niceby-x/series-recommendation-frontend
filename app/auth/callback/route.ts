import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseServer';

// G2-02: Google sign-in (AuthModal.tsx's signInWithOAuth) now redirects
// here with a `code` query param (PKCE flow) instead of landing back on
// the app with tokens already in the URL. Exchanging it server-side means
// the resulting session cookie is set via a real Set-Cookie header on
// this route's redirect response -- Route Handlers can write cookies
// (see lib/supabaseServer.ts), unlike the plain Server Component renders
// (HomeGate, app/my-list/page.tsx, app/admin/page.tsx) that only read
// them -- so the very next request already sees a valid, cookie-visible
// session instead of depending on the browser client to catch and store
// it client-side after the fact.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(origin + next);
}
