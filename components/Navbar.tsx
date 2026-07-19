'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-blue-400 font-bold text-lg">
        BL Series
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/series" className="text-gray-300 hover:text-white transition-colors">
          Browse
        </Link>
        { user && (
          <Link href="/my-list" className="text-gray-300 hover:text-white transition-colors">
            My List
          </Link>
        )}

        {loading ? null : user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Log out
            </button>
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