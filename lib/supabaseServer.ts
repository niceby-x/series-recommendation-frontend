import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// G2-02: a fresh server-side client per call, reading the session cookies
// lib/supabase.ts's browser client writes. Per @supabase/ssr's own
// guidance this must be created new for every render/request -- never
// cached/reused as a module-level singleton like the browser client is.
//
// setAll is included (not omitted) so this same helper also works from
// Route Handlers/Server Actions (see app/auth/callback/route.ts, which
// needs to persist a session after exchanging an OAuth code) -- but
// cookies().set() throws when called from a plain Server Component render
// (e.g. HomeGate, app/my-list/page.tsx, app/admin/page.tsx), where cookies
// are read-only. The try/catch below is deliberate: it no-ops in that
// case rather than crashing the render. That's safe because
// middleware.ts is what actually refreshes/persists the token cookie on
// the next request either way -- this client's own setAll is only load-
// bearing in a Route Handler/Server Action context.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Read-only cookies() context (a plain Server Component render) --
          // see the note above.
        }
      },
    },
  });
}
