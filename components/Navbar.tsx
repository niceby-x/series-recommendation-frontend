'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bookmark, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import Logo from './Logo';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
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
    router.push(trimmed ? `/series?q=${encodeURIComponent(trimmed)}` : '/series');
  }

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  function navLinkClass(href: string) {
    return (
      'text-base font-medium transition-colors ' +
      (isActive(href) ? 'text-primary' : 'text-foreground/60 hover:text-foreground')
    );
  }

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const isAdmin = !!(user?.email && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 py-3 flex items-center gap-6">
      <Link href="/" className="shrink-0">
        <Logo variant="full" theme="brand" size={53} />
      </Link>

      <div className="hidden md:flex items-center gap-6 shrink-0">
        <Link href="/" className={navLinkClass('/')}>
          Home
        </Link>
        <Link href="/series" className={navLinkClass('/series')}>
          Explore
        </Link>
        {user && (
          <Link href="/my-list" className={navLinkClass('/my-list')}>
            Lists
          </Link>
        )}
        <Link href="/community" className={navLinkClass('/community')}>
          Community
        </Link>
        <Link href="/about" className={navLinkClass('/about')}>
          About
        </Link>
        {isAdmin && (
          <Link href="/admin/candidates" className={navLinkClass('/admin')}>
            Admin
          </Link>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series, movies, anime..."
            className="w-full bg-muted text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2 text-sm border border-transparent focus:outline-none focus:border-ring transition-colors"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 shrink-0">
        {user && (
          <Link
            href="/my-list"
            aria-label="My List"
            className="hidden sm:flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors"
          >
            <Bookmark className="size-4.5" />
          </Link>
        )}

        {loading ? null : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full pl-1 pr-1 py-1 hover:bg-muted transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading">
                {initial}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm text-popover-foreground truncate">{user.email}</p>
                </div>
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
          <Link
            href="/login"
            className="bg-brand-gradient text-white px-5 py-2 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}