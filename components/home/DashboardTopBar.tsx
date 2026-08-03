'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import FlowerIcon from '../shared/FlowerIcon';

// Search / notifications / profile menu, as their own top-of-page row.
// Kept separate from DashboardHeader's greeting on purpose: the greeting's
// width depends on the user's name, and having it share a row with these
// controls is what previously caused the name to get crushed at typical
// laptop widths. Living in its own row (right-aligned above the right
// rail) means neither one competes with the other for space.
export default function DashboardTopBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = search.trim();
    router.push(trimmed ? '/series?q=' + encodeURIComponent(trimmed) : '/series');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const displayName = user?.email ? user.email.split('@')[0] : 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const isAdmin = !!(user?.email && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

  return (
    <div className="flex items-center justify-end gap-3 mb-3">
      <form onSubmit={handleSearchSubmit} className="hidden md:block w-full max-w-[288px]">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series, movies, moods..."
            className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-5 pr-11 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      <div className="relative shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((open) => !open)}
          aria-label="Notifications"
          className="relative flex items-center justify-center size-10 rounded-full bg-card border border-border text-foreground/70 hover:text-primary hover:bg-muted transition-colors"
        >
          <Bell className="size-4.5" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-destructive" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden p-4 text-center z-20">
            <p className="text-sm text-popover-foreground flex items-center justify-center gap-1">
              You&apos;re all caught up! <FlowerIcon className="size-3.5 text-primary" />
            </p>
            <p className="text-xs text-muted-foreground mt-1">New episode alerts will show up here.</p>
          </div>
        )}
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 bg-card border border-border hover:bg-muted transition-colors"
        >
          <span className="flex items-center justify-center size-8 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading">
            {initial}
          </span>
          <ChevronDown className="size-3.5 text-foreground/60" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-20">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm text-popover-foreground truncate">{user?.email}</p>
            </div>
            {isAdmin && (
              <Link
                href="/admin/candidates"
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
              >
                <ShieldCheck className="size-4" />
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}