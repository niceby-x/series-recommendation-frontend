import { createBrowserClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// G2-02: the session now lives in cookies instead of localStorage/
// sessionStorage, so a server-side render (HomeGate, app/my-list/page.tsx,
// app/admin/page.tsx -- see lib/supabaseServer.ts) can read it too,
// removing the client-only auth-check flash those pages used to have.
// middleware.ts refreshes the cookie on every request (required --
// Server Components can read cookies but can't write them, so token
// refreshes have to happen somewhere that can).
//
// 'Remember me' (components/shared/AuthModal.tsx, Q1-02) still works the
// same way it always did, just via a different mechanism: a checked box
// keeps the library's own persistent cookie (survives closing the
// browser); an unchecked box strips the expiry off that same cookie so
// it behaves as a real browser session cookie instead (cleared when the
// browser fully closes). The flag itself (REMEMBER_ME_COOKIE) always gets
// a persistent cookie -- it has to survive the tab close it's describing
// -- same reasoning the old localStorage-only REMEMBER_ME_KEY used.
const REMEMBER_ME_COOKIE = 'blumi-remember-me';
const REMEMBER_ME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, seconds

function readAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  return Object.fromEntries(
    document.cookie
      .split('; ')
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf('=');
        return [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
      })
  );
}

function writeCookie(name: string, value: string, options: CookieOptions) {
  if (typeof document === 'undefined') return;
  let cookie = name + '=' + encodeURIComponent(value) + '; path=' + (options.path ?? '/');
  if (options.maxAge !== undefined) cookie += '; max-age=' + options.maxAge;
  if (options.expires) cookie += '; expires=' + new Date(options.expires).toUTCString();
  cookie += '; samesite=' + (typeof options.sameSite === 'string' ? options.sameSite : 'lax');
  // 'secure' can't be set over plain http (e.g. local dev) -- browsers
  // silently drop the whole cookie write if it is, so this only adds it
  // when the page is actually served over https.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') cookie += '; secure';
  document.cookie = cookie;
}

function rememberMeEnabled(): boolean {
  return readAllCookies()[REMEMBER_ME_COOKIE] !== 'false';
}

// AuthModal calls this immediately before signUp/signInWithPassword so
// the cookie writes below are pointed at the right lifetime before the
// new session lands.
export function setRememberMe(remember: boolean) {
  writeCookie(REMEMBER_ME_COOKIE, remember ? 'true' : 'false', { maxAge: REMEMBER_ME_COOKIE_MAX_AGE });
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      return Object.entries(readAllCookies()).map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      const remember = rememberMeEnabled();
      cookiesToSet.forEach(({ name, value, options }) => {
        // Session-cookie behavior for an unchecked 'Remember me': drop
        // whatever expiry the library asked for so the browser treats it
        // as a real session cookie instead of a persistent one.
        const finalOptions = remember ? options : { ...options, maxAge: undefined, expires: undefined };
        writeCookie(name, value, finalOptions);
      });
    },
  },
});
