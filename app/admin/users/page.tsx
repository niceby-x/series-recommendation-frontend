'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import UsersTable, { type UserRow } from '../../../components/admin/UsersTable';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';
type SortKey = 'newest' | 'oldest' | 'most_ratings' | 'alpha';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  most_ratings: 'Most Ratings',
  alpha: 'A–Z',
};

export default function AdminUsersPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadAll() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAccess('signed_out');
        return;
      }
      const authHeader = { Authorization: 'Bearer ' + session.access_token };

      const [usersRes, countsRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/users', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader }),
      ]);

      if (usersRes.status === 401 || countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (usersRes.status === 403 || countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!usersRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const usersJson = await usersRes.json();
      setUsers(usersJson.data || []);

      const countsJson = await countsRes.json();
      setPendingCount(countsJson.pending || 0);

      setAccess('ok');
    }

    loadAll();
  }, [user]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? users.filter((u) => u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      : users;

    const sorted = [...filtered];
    if (sort === 'oldest') sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === 'newest') sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === 'most_ratings') sorted.sort((a, b) => b.ratings_count - a.ratings_count);
    else if (sort === 'alpha') sorted.sort((a, b) => a.username.localeCompare(b.username));

    return sorted;
  }, [users, search, sort]);

  if (access === 'checking') return null;

  if (access === 'signed_out') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-semibold hover:opacity-80">
            Sign in
          </button>{' '}
          to access the admin dashboard.
        </p>
      </main>
    );
  }

  if (access === 'forbidden') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </main>
    );
  }

  if (access === 'error') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500">Could not load users. Try refreshing the page.</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={pendingCount} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1100px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground">Users</h1>
              <p className="text-muted-foreground text-[14px] mt-1">
                {users.length} registered {users.length === 1 ? 'user' : 'users'}.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors w-[220px]"
                />
              </div>

              <div className="relative">
                <select
                  aria-label="Sort users"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <option key={key} value={key}>
                      Sort: {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <UsersTable rows={visibleUsers} />
        </div>
      </div>
    </div>
  );
}
