'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  function navLinkClass(href: string) {
    return (
      'relative py-1 transition-colors ' +
      (isActive(href)
        ? 'text-white after:absolute after:left-0 after:right-0 after:-bottom-[17px] after:h-[2px] after:bg-blue-500'
        : 'text-gray-300 hover:text-white')
    );
  }

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const isAdmin = !!(user?.email && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-blue-400 font-bold text-lg">
        Blumi
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/series" className={navLinkClass('/series')}>
          Browse
        </Link>
        {user && (
          <Link href="/my-list" className={navLinkClass('/my-list')}>
            My List
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin/candidates" className={navLinkClass('/admin')}>
            Admin
          </Link>
        )}

        {loading ? null : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-gray-900 transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                {initial}
              </span>
              <span className="text-gray-300 text-sm hidden sm:inline">{user.email}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm text-gray-300 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}