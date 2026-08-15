import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// G2-02: refreshes the Supabase auth cookie on every request. Server
// Components (HomeGate, app/my-list/page.tsx, app/admin/page.tsx -- see
// lib/getServerSession.ts) can READ cookies but can't WRITE them -- when
// the access token is close to expiring, only proxy.ts (or a Route
// Handler/Server Action, see app/auth/callback/route.ts) can write the
// refreshed token back. Without this file, sessions would silently stop
// refreshing and everyone would eventually get logged out once their
// token expired, regardless of activity.
//
// Named proxy.ts/proxy(), not middleware.ts/middleware() -- Next.js 16
// renamed the convention (same file role, same config/matcher shape,
// see https://nextjs.org/docs/messages/middleware-to-proxy). The old name
// still builds but only logs a deprecation warning and, per Next's own
// migration guidance, shouldn't be relied on going forward.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Cookies have to be re-set on both the request (so this same
        // proxy pass and anything downstream sees the fresh values) and a
        // freshly-created response (the only thing that actually reaches
        // the browser) -- reusing the original `response` after mutating
        // `request.cookies` wouldn't carry the update through.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // The refresh (if the token needs it) only happens once one of
  // getUser()/getSession()/getClaims() is actually called -- session
  // loading is lazy otherwise (see @supabase/ssr's own createServerClient
  // docs).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next's own static/image assets and common
    // static file extensions -- no auth cookie work needed for those.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
