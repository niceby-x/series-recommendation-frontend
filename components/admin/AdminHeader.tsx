'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import FlowerIcon from '../shared/FlowerIcon';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminHeader({ user, notifCount }: { user: User | null; notifCount: number }) {
  const [search, setSearch] = useState('');
  const displayName = user?.email ? user.email.split('@')[0] : 'Admin';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between gap-x-5 gap-y-4 mb-8">
      <div className="min-w-0 shrink-0 max-w-full">
        <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground flex items-center gap-2 min-w-0">
          <span className="min-w-0 truncate">
            {getGreeting()}, {capitalizedName}
          </span>
          <FlowerIcon className="size-5 text-primary shrink-0" />
        </h1>
        <p className="text-muted-foreground text-[14px] mt-1">Here&apos;s what&apos;s happening with BLumi today.</p>
      </div>

      <div className="flex items-center gap-3 min-w-0 ml-auto sm:ml-0">
        {/* Visual-only for now -- there's no search index across series/users/
            moods yet, so this doesn't submit anywhere real (same honest-
            placeholder convention as the disabled sidebar rows). */}
        <div className="hidden md:block relative flex-1 min-w-[220px] max-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series, users, moods..."
            className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-10 pr-14 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground/70 border border-border rounded-md px-1.5 py-0.5">
            ⌘K
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center size-10 rounded-full bg-card border border-border text-foreground/70 hover:text-primary hover:bg-muted transition-colors shrink-0"
        >
          <Bell className="size-4.5" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {notifCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center justify-center size-10 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading">
            {initial}
          </span>
          <span className="hidden sm:block text-left">
            <span className="block text-[13.5px] font-semibold text-foreground leading-tight">{capitalizedName}</span>
            <span className="block text-[11.5px] text-muted-foreground leading-tight">Super Admin</span>
          </span>
        </div>
      </div>
    </div>
  );
}
