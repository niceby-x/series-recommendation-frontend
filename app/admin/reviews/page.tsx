'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import ReviewsList, { type ReviewRow } from '../../../components/admin/ReviewsList';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';
type FilterKey = 'all' | 'with_text';

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All Ratings',
  with_text: 'With Written Review',
};

export default function AdminReviewsPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

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

      const [reviewsRes, countsRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/reviews', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader }),
      ]);

      if (reviewsRes.status === 401 || countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (reviewsRes.status === 403 || countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!reviewsRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const reviewsJson = await reviewsRes.json();
      setReviews(reviewsJson.data || []);

      const countsJson = await countsRes.json();
      setPendingCount(countsJson.pending || 0);

      setAccess('ok');
    }

    loadAll();
  }, [user]);

  const visibleReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter === 'with_text' && !r.review_text) return false;
      if (!query) return true;
      const haystack = (r.users?.username ?? '') + ' ' + (r.series?.title ?? '') + ' ' + (r.review_text ?? '');
      return haystack.toLowerCase().includes(query);
    });
  }, [reviews, search, filter]);

  async function handleRemove(review: ReviewRow) {
    const confirmed = window.confirm(
      'Remove this review' + (review.users ? ' from ' + review.users.username : '') + '? This cannot be undone.'
    );
    if (!confirmed) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    setRemovingIds((prev) => new Set(prev).add(review.id));

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/reviews/' + review.id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(review.id);
      return next;
    });

    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    }
  }

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
        <p className="text-rose-500">Could not load reviews. Try refreshing the page.</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={pendingCount} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[900px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground">Reviews</h1>
              <p className="text-muted-foreground text-[14px] mt-1">
                {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'} submitted. Not shown publicly yet -- this is
                visibility &amp; moderation only.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user, series, or text"
                  className="bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors w-[220px]"
                />
              </div>

              <div className="relative">
                <select
                  aria-label="Filter reviews"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterKey)}
                  className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
                >
                  {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                    <option key={key} value={key}>
                      {FILTER_LABELS[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <ReviewsList reviews={visibleReviews} removingIds={removingIds} onRemove={handleRemove} />
        </div>
      </div>
    </div>
  );
}
