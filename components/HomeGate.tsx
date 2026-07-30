'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Both branches are rendered server-side (in app/page.tsx) and passed in as
// already-built elements -- this component's only job is picking which one
// to show, using the same auth pattern Navbar.tsx already uses. That way
// there's no second data fetch and no duplicated auth logic.
export default function HomeGate({
  landing,
  authed,
}: {
  landing: React.ReactNode;
  authed: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // Brief, deliberately blank beat rather than flashing the wrong page --
    // matches how Navbar.tsx handles the same loading window.
    return <div className="min-h-screen bg-background" />;
  }

  return user ? <>{authed}</> : <>{landing}</>;
}
