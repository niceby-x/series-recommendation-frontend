'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bookmark, Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import Logo from './Logo';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/series', label: 'Explore' },
  { href: '/my-list', label: 'Lists' },
  { href: '/community', label: 'Community' },
  { href: '/about', label: 'About' },
];

// Logged-out nav is intentionally different, not just re-skinned: it drops
// "Lists" (nothing to list before you have an account) and adds a Discover
// menu. Every item in it is a REAL, working destination -- the trending/
// new-releases/top-rated links use Explore's actual ?section= filters (see
// components/explore/ExploreClient.tsx), not placeholder query params
// nothing reads.
const DISCOVER_MENU = [
  { href: '/series', label: 'Browse All' },
  { href: '/series?section=trending', label: 'Trending' },
  { href: '/series?section=new-releases', label: 'New Releases' },
  { href: '/series?section=top-rated', label: 'Top Rated' },
];

// Moods, Tropes, and Collections aren't real filters/pages yet (see the
// note on BrowseByMoodGrid/PopularTropesRow in the landing page) -- these
// honestly point at the plain catalog rather than a param Explore can't
// read, same convention used everywhere else in the app for not-yet-real
// features.
const LOGGED_OUT_LINKS = [
  { href: '/series', label: 'Moods' },
  { href: '/series', label: 'Tropes' },
  { href: '/series', label: 'Collections' },
  { href: '/community', label: 'Community' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setNotifOpen(false);
    setDiscoverOpen(false);
  }

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (discoverRef.current && !discoverRef.current.contains(event.target as Node)) {
        setDiscoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = search.trim();
    router.push(trimmed ? '/series?q=' + encodeURIComponent(trimmed) : '/series');
  }

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  function navLinkClass(href: string) {
    return (
      'text-sm font-semibold transition-colors ' +
      (isActive(href) ? 'text-primary' : 'text-foreground/60 hover:text-foreground')
    );
  }

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const isAdmin = !!(user?.email && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 py-3 flex items-center gap-6">
      <Link href="/" className="shrink-0">
        <Logo variant="full" theme="brand" size={30} />
      </Link>

      <div className="hidden md:flex items-center gap-6 shrink-0">
        {user ? (
          NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)}>
              {label}
            </Link>
          ))
        ) : (
          <>
            <div className="relative" ref={discoverRef}>
              <button
                type="button"
                onClick={() => setDiscoverOpen((open) => !open)}
                className="flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
              >
                Discover
                <ChevronDown className="size-3.5" />
              </button>
              {discoverOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden py-1.5">
                  {DISCOVER_MENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {LOGGED_OUT_LINKS.map(({ href, label }) => (
              <Link key={label} href={href} className={navLinkClass(href)}>
                {label}
              </Link>
            ))}
          </>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series, movies, people..."
            className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-4 pr-10 py-2 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center size-7 rounded-full text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-1 shrink-0">
        {user && (
          <>
            <Link
              href="/my-list"
              aria-label="My List"
              className="hidden sm:flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors"
            >
              <Bookmark className="size-4.5" />
            </Link>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((open) => !open)}
                aria-label="Notifications"
                className="hidden sm:flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors"
              >
                <Bell className="size-4.5" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden p-4 text-center">
                  <p className="text-sm text-popover-foreground">You&apos;re all caught up! 🌸</p>
                  <p className="text-xs text-muted-foreground mt-1">New episode alerts will show up here.</p>
                </div>
              )}
            </div>
          </>
        )}

        {loading ? null : user ? (
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-1 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading">
                {initial}
              </span>
              <ChevronDown className="size-3.5 text-foreground/60" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm text-popover-foreground truncate">{user.email}</p>
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
        ) : (
          <div className="flex items-center gap-2 ml-1">
            <Link
              href="/login"
              className="border border-border bg-card text-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-muted transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login?mode=register"
              className="bg-brand-gradient text-white px-5 py-2 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
