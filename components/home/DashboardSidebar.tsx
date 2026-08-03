'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Compass,
  Smile,
  Star,
  FolderOpen,
  Sparkles,
  Users,
  Bookmark,
  Heart,
  History,
  NotebookPen,
  ChevronRight,
  Moon,
} from 'lucide-react';
import Logo from '../shared/Logo';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { MOCK_BLOOM_JOURNEY } from '../../lib/dashboardContent';

// Every link here honestly points at what's real today -- Moods/Tropes/
// Collections/New Releases aren't wired filters yet, so (same convention
// as Navbar's LOGGED_OUT_LINKS / BrowseByMoodGrid) they land on the plain
// catalog rather than a query param nothing reads.
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/series', label: 'Discover', icon: Compass },
  { href: '/series', label: 'Moods', icon: Smile },
  { href: '/series', label: 'Tropes', icon: Star },
  { href: '/series', label: 'Collections', icon: FolderOpen },
  { href: '/series?section=new-releases', label: 'New Releases', icon: Sparkles },
  { href: '/community', label: 'Community', icon: Users },
];

const LIBRARY_ITEMS = [
  { href: '/my-list', label: 'Watchlist', icon: Bookmark },
  { href: '/my-list', label: 'Favorites', icon: Heart },
  { href: '/my-list', label: 'History', icon: History },
  { href: '/my-list', label: 'Notes', icon: NotebookPen },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  // Real toggle -- app/globals.css already ships a full .dark palette, this
  // just flips the class the same way a theme provider would. Lazy
  // initializer (not an effect) so it reads the real class on first client
  // render without a synchronous setState-in-effect.
  const [darkMode, setDarkMode] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  }

  function isActive(href: string) {
    const path = href.split('?')[0];
    return path === '/' ? pathname === '/' : pathname.startsWith(path) && path !== '/series';
  }

  const displayName = user?.email ? user.email.split('@')[0] : 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-[232px] shrink-0 h-screen sticky top-0 border-r border-border bg-card/60 px-4 py-6">
      <Link href="/" className="px-2 mb-8">
        <Logo variant="full" theme="brand" size={30} />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={
                'flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-semibold transition-colors ' +
                (active
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground')
              }
            >
              <Icon className="size-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="px-3 mt-8 mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        My Library
      </p>
      <nav className="flex flex-col gap-1">
        {LIBRARY_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-semibold text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon className="size-4.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push('/my-list')}
          className="flex items-center gap-2.5 px-2 py-2 rounded-full hover:bg-muted transition-colors text-left"
        >
          <span className="flex items-center justify-center size-9 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading shrink-0">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground truncate">{displayName}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
              {MOCK_BLOOM_JOURNEY.label}
              <Sparkles className="size-2.5 text-brand-gold shrink-0" />
            </span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </button>

        <button
          type="button"
          onClick={toggleDarkMode}
          aria-pressed={darkMode}
          className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-muted transition-colors"
        >
          <Moon className="size-4 text-foreground/70 shrink-0" />
          <span className="text-sm font-medium text-foreground/80 flex-1 text-left">Dark Mode</span>
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
      </div>
    </aside>
  );
}
