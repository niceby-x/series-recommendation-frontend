import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 'Remember me' (see components/shared/AuthModal.tsx, Q1-02): the client
// below is created once at module load, so persistSession can't be
// toggled per sign-in. Instead, the session always persists, but through
// a storage adapter that picks sessionStorage over localStorage when the
// user unchecked 'Remember me' -- sessionStorage clears itself when the
// browser/tab closes, which is what an unchecked box should actually do.
// The flag itself always lives in localStorage (it has to survive the
// tab close it's describing), separate from the session data it controls.
const REMEMBER_ME_KEY = 'blumi-remember-me';

function activeStorage(): Storage {
  const remember = window.localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
  return remember ? window.localStorage : window.sessionStorage;
}

// AuthModal calls this immediately before signInWithPassword/signUp so the
// storage adapter below is pointed at the right backend before the new
// session lands.
export function setRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth:
    typeof window === 'undefined'
      ? undefined
      : {
          storage: {
            getItem: (key: string) => activeStorage().getItem(key),
            setItem: (key: string, value: string) => activeStorage().setItem(key, value),
            removeItem: (key: string) => activeStorage().removeItem(key),
          },
        },
});
