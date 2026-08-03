'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import FlowerIcon from '../shared/FlowerIcon';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Just the greeting now -- search/notifications/profile menu live in their
// own DashboardTopBar row above the grid, so this never has to compete
// with them for width (that competition is what crushed long names before).
export default function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const displayName = user?.email ? user.email.split('@')[0] : 'Guest';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="mb-8">
      <h1 className="font-heading text-[30px] md:text-[34px] leading-tight font-normal text-foreground flex items-center gap-2 min-w-0">
        <FlowerIcon className="size-6 text-primary shrink-0" />
        {/* min-w-0 + truncate is now just a safety net for extremely long
            single "words" (e.g. an email local-part) on narrow phones --
            this row no longer shares space with the search bar. */}
        <span className="min-w-0 truncate">
          {getGreeting()}, {capitalizedName}
        </span>
        <FlowerIcon className="size-6 text-primary shrink-0" />
      </h1>
      <p className="text-muted-foreground text-[15px] mt-1">What are we discovering tonight?</p>
    </div>
  );
}