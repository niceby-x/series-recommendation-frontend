'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, ChevronDown, LogOut, ShieldCheck, Moon, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import FlowerIcon from '../shared/FlowerIcon';
import { MOCK_BLOOM_JOURNEY } from '../../lib/dashboardContent';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Title block (greeting by default, or a custom title/subtitle) +
// search/notifications/profile menu, one row, spanning the full dashboard
// width (rendered above the main/aside grid, not inside the main column)
// -- so it has the full page width to work with rather than just the
// ~1fr column's share.
export default function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Real toggle -- app/globals.css already ships a full .dark palette, this
  // just flips the class the same way a theme provider would. Lazy
  // initializer (not an effect) so it reads the real class on first client
  // render without a synchronous setState-in-effect. Moved here from
  // DashboardSidebar along with the profile info below.
  const [darkMode, setDarkMode] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const [profileUsername, setProfileUsername] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (!session) return;

      // Real username for the greeting (see H4-02) -- falls back to the
      // email-prefix below if this fails, so a slow/failed /me call never
      // blocks the header from rendering.
      fetch(process.env.NEXT_PUBLIC_API_URL + '/me', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data?.username) {
            setProfileUsername(json.data.username);
          }
        })
        .catch(() => {
          // Greeting falls back to the email prefix below.
        });
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

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  }

  // Real users.username (via GET /me) takes priority over the Supabase Auth
  // email prefix -- see H4-02. The email-prefix fallback still covers the
  // brief window before /me resolves, and any account /me couldn't be
  // reached for.
  const displayName = profileUsername || (user?.email ? user.email.split('@')[0] : 'Guest');
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const initial = displayName.charAt(0).toUpperCase();
  const isAdmin = !!(user?.email && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

  return (
    <div className="flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between gap-x-5 gap-y-4 mb-8">
      {/* shrink-0: the greeting keeps its natural width instead of being
          squeezed by the search bar -- a name should never get crushed
          down to 1-2 letters. If the row is too tight for both, the
          search/bell/avatar group wraps onto its own line instead
          (flex-wrap on the parent). truncate/min-w-0 remain only as a
          last-resort safety net for pathologically long single "words"
          (e.g. an email local-part with no spaces) on very narrow screens. */}
      <div className="min-w-0 shrink-0 max-w-full">
        {title ? (
          <h1 className="font-heading text-[30px] md:text-[34px] leading-tight font-normal text-foreground min-w-0 truncate">
            {title}
          </h1>
        ) : (
          <h1 className="font-heading text-[30px] md:text-[34px] leading-tight font-normal text-foreground flex items-center gap-2 min-w-0">
            <FlowerIcon className="size-6 text-primary shrink-0" />
            <span className="min-w-0 truncate">
              {getGreeting()}, {capitalizedName}
            </span>
            <FlowerIcon className="size-6 text-primary shrink-0" />
          </h1>
        )}
        <p className="text-muted-foreground text-[15px] mt-1">{subtitle ?? 'What are we discovering tonight?'}</p>
      </div>

      <div className="flex items-center gap-3 min-w-0 ml-auto sm:ml-0">
        <form onSubmit={handleSearchSubmit} className="hidden md:block flex-1 min-w-[140px] max-w-[288px]">
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
            <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-20">
              <Link
                href="/my-list"
                className="flex items-center gap-2.5 px-4 py-3 border-b border-border hover:bg-muted transition-colors"
              >
                <span className="flex items-center justify-center size-9 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading shrink-0">
                  {initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-popover-foreground truncate">{capitalizedName}</span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    {MOCK_BLOOM_JOURNEY.label}
                    <Sparkles className="size-2.5 text-brand-gold shrink-0" />
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={toggleDarkMode}
                aria-pressed={darkMode}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted transition-colors border-b border-border"
              >
                <Moon className="size-4 text-foreground/70 shrink-0" />
                <span className="text-sm font-medium text-popover-foreground flex-1 text-left">Dark Mode</span>
                <span
                  className={
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ' +
                    (darkMode ? 'bg-brand-gradient' : 'bg-muted-foreground/30')
                  }
                >
                  <span
                    className={
                      'inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ' +
                      (darkMode ? 'translate-x-[18px]' : 'translate-x-1')
                    }
                  />
                </span>
              </button>

              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm text-popover-foreground truncate">{user?.email}</p>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
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
    </div>
  );
}