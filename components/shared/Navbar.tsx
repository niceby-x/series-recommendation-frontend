'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bookmark, Bell, ChevronDown, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import FlowerIcon from './FlowerIcon';
import SeriesSearchResults from './SeriesSearchResults';
import { useSeriesSearch, SEARCH_MIN_QUERY_LENGTH } from '../../lib/useSeriesSearch';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import Logo from './Logo';
import { useAuthModal } from '../../lib/AuthModalContext';

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
// top-rated links use Explore's actual ?section= filters (see
// components/discover/SeriesFilter.tsx, which reads ?section= into its
// navCategory state -- see Q1-05), not placeholder query params nothing
// reads.
const DISCOVER_MENU = [
  { href: '/series', label: 'Browse All' },
  { href: '/series?section=trending', label: 'Trending' },
  { href: '/series?section=top-rated', label: 'Top Rated' },
];

// Moods, Tropes, Collections, and New Releases are now real pages
// (app/moods/page.tsx, app/tropes/page.tsx, app/collections/page.tsx,
// app/new-releases/page.tsx) with their own logged-out previews.
const LOGGED_OUT_LINKS = [
  { href: '/moods', label: 'Moods' },
  { href: '/tropes', label: 'Tropes' },
  { href: '/collections', label: 'Collections' },
  { href: '/new-releases', label: 'New Releases' },
  { href: '/community', label: 'Community' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  // Live search results, matching the admin panel's search (see
  // lib/useSeriesSearch.ts) -- this used to only submit to /series?q=...
  // on Enter, with nothing shown while typing. searchOpen still controls
  // the icon-vs-expanded-form toggle; searchFocused separately gates the
  // live-results dropdown so it only shows while the field is actually
  // focused, not just expanded.
  const { query: search, setQuery: setSearch, results: liveResults, loading: liveLoading, reset: resetSearch } =
    useSeriesSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [lastPathname, setLastPathname] = useState(pathname);
  // See Q2-02: is_admin comes from GET /me now, not a comparison against
  // NEXT_PUBLIC_ADMIN_EMAIL -- that env var is NEXT_PUBLIC_-prefixed, so
  // it always shipped in the client bundle regardless of whether it
  // granted real access, identifying a specific phishing target for no
  // reason. This only controls whether the Admin link renders --
  // requireAdmin on the backend independently enforces real access on
  // every admin route either way.
  const [isAdmin, setIsAdmin] = useState(false);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setNotifOpen(false);
    setDiscoverOpen(false);
    setMobileMenuOpen(false);
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
    let cancelled = false;

    async function loadIsAdmin() {
      if (!user) {
        if (!cancelled) setIsAdmin(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/me', {
          headers: { Authorization: 'Bearer ' + session.access_token },
        });
        const json = res.ok ? await res.json() : null;
        if (!cancelled) setIsAdmin(!!json?.data?.is_admin);
      } catch {
        // Admin link just won't show if this fails -- the safe default,
        // and not a real access gate either way (see the comment above).
      }
    }

    loadIsAdmin();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
      if (searchFormRef.current && !searchFormRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
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
    setSearchFocused(false);
    router.push(trimmed ? '/series?q=' + encodeURIComponent(trimmed) : '/series');
  }

  // Picking a live result navigates via the Link itself, straight to that
  // series -- same as the admin panel and DashboardHeader. Just tidies the
  // search UI back up afterward rather than leaving the box expanded with
  // a stale query in it.
  function handleLiveResultSelect() {
    setSearchFocused(false);
    setSearchOpen(false);
    resetSearch();
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

  // Pages with their own full sidebar + header (logo, nav, search,
  // notifications, profile menu) -- HomeAuthed for '/', DiscoverAuthed for
  // '/series', MoodsAuthed for '/moods', TropesAuthed for '/tropes',
  // CollectionsAuthed for '/collections', NewReleasesAuthed for
  // '/new-releases', AdminSidebar for '/admin' and every '/admin/*'
  // sub-page -- so this top navbar would just duplicate them. Every other
  // authed route still gets this bar as normal. Add new dashboard-style
  // pages' paths here as they're built; give a route its own entry in
  // DASHBOARD_PREFIX_ROUTES instead of DASHBOARD_ROUTES if it has
  // sub-pages that should also hide this navbar (like /admin/candidates) --
  // plain DASHBOARD_ROUTES only match exactly, so a page like '/series'
  // doesn't accidentally hide the navbar on '/series/[id]', which has no
  // sidebar of its own.
  const DASHBOARD_ROUTES = ['/', '/series', '/moods', '/tropes', '/collections', '/new-releases', '/admin', '/settings'];
  const DASHBOARD_PREFIX_ROUTES = ['/admin'];
  const isDashboardRoute =
    DASHBOARD_ROUTES.includes(pathname) || DASHBOARD_PREFIX_ROUTES.some((route) => pathname.startsWith(route + '/'));
  if (user && isDashboardRoute) {
    return null;
  }

  return (
    <>
    {/* bg-background/70 + backdrop-blur-lg (up from /90 + blur-md) -- the
        old values read as an opaque flat bar, which clashed with the
        moody, depth-heavy poster stage on the homepage. This lets more of
        whatever's underneath show through, so the nav reads as a pane of
        glass over the page rather than a separate flat layer pasted on
        top of it. `relative` here is just so the gradient rule below can
        anchor to this element instead of the page. */}
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-transparent relative px-6 py-3 flex items-center gap-6">
      {/* Replaces the old flat border-b border-border. A plain gray 1px
          line read as a generic app-header divider; this thin brand
          gradient (transparent -> pink-vivid -> transparent) reads more
          like the edge of a stage curtain rail, which fits the "theater"
          framing the homepage's poster deck already leans into ("A BLUMI
          SELECTION", the card deck itself). Subtle enough to still work
          as a plain divider on pages without the 3D stage. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-pink-vivid/60 to-transparent"
      />
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

      <button
        ref={mobileMenuButtonRef}
        type="button"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        className="md:hidden flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors shrink-0"
      >
        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div className="flex-1 flex justify-end ml-auto">
        {searchOpen ? (
          <form ref={searchFormRef} onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  if (!search.trim()) setSearchOpen(false);
                }}
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

            {searchFocused && search.trim().length >= SEARCH_MIN_QUERY_LENGTH && (
              <SeriesSearchResults
                query={search.trim()}
                loading={liveLoading}
                results={liveResults}
                onSelect={handleLiveResultSelect}
              />
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors shrink-0"
          >
            <Search className="size-4.5" />
          </button>
        )}
      </div>

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
                  <p className="text-sm text-popover-foreground flex items-center justify-center gap-1">
                    You&apos;re all caught up! <FlowerIcon className="size-3.5 text-primary" />
                  </p>
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
        ) : (
          <div className="flex items-center gap-2 ml-1">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="border border-border bg-card text-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-muted transition-colors"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="bg-brand-gradient text-white px-5 py-2 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>

    {mobileMenuOpen && (
      <div ref={mobileMenuRef} className="md:hidden sticky top-[57px] z-40 bg-background border-b border-border shadow-lg px-6 py-4 flex flex-col gap-1">
        {user ? (
          NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={'py-2.5 text-base font-semibold ' + (isActive(href) ? 'text-primary' : 'text-foreground/70')}
            >
              {label}
            </Link>
          ))
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground pt-1 pb-1">Discover</p>
            {DISCOVER_MENU.map((item) => (
              <Link key={item.label} href={item.href} className="py-2 pl-2 text-sm text-foreground/70">
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" aria-hidden="true" />
            {LOGGED_OUT_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={'py-2.5 text-base font-semibold ' + (isActive(href) ? 'text-primary' : 'text-foreground/70')}
              >
                {label}
              </Link>
            ))}
          </>
        )}
      </div>
    )}
    </>
  );
}