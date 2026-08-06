'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import TagDimensionSection, { type AdminTag } from '../../../components/admin/TagDimensionSection';
import type { TagDimension } from '../../../lib/taxonomy';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

// Same 5 dimensions and copy as the candidates taxonomy editor
// (app/admin/candidates/page.tsx's dimensionSections) -- kept in sync by
// hand since one lives in a page and the other here, but the source of
// truth for which dimensions exist is lib/taxonomy.ts's TagDimension type.
const DIMENSION_SECTIONS: { dimension: TagDimension; label: string; helperText: string }[] = [
  { dimension: 'mood', label: 'Mood', helperText: 'Discovery Tags -- how a series feels to watch' },
  { dimension: 'trope', label: 'Tropes', helperText: 'Discovery Tags -- recurring story patterns' },
  { dimension: 'relationship_dynamic', label: 'Relationship Dynamics', helperText: 'Discovery Tags -- how the leads relate' },
  { dimension: 'theme', label: 'Themes', helperText: 'Discovery Tags -- Level 2' },
  { dimension: 'content_warning', label: 'Content Warnings', helperText: 'Discovery Tags -- Level 3' },
];

export default function AdminTagsPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [pendingCount, setPendingCount] = useState(0);
  const [tagsByDimension, setTagsByDimension] = useState<Record<string, AdminTag[]>>({});
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAccess('signed_out');
        return;
      }
      const authHeader = { Authorization: 'Bearer ' + session.access_token };

      const [tagsRes, countsRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags?all=true', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader }),
      ]);

      if (tagsRes.status === 401 || countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (tagsRes.status === 403 || countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!tagsRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const tagsJson = await tagsRes.json();
      setTagsByDimension(tagsJson.data || {});

      const countsJson = await countsRes.json();
      setPendingCount(countsJson.pending || 0);

      setAccess('ok');
    }

    load();
  }, [user]);

  async function handleCreate(dimension: TagDimension, label: string, emoji: string): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return false;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + session.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dimension, display_label: label, display_emoji: emoji || null }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    setTagsByDimension((prev) => ({
      ...prev,
      [dimension]: [...(prev[dimension] || []), json.data],
    }));
    return true;
  }

  async function handleToggle(tag: AdminTag) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    setBusyIds((prev) => new Set(prev).add(tag.id));

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags/' + tag.id + '/toggle', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(tag.id);
      return next;
    });

    if (!res.ok) return;

    const json = await res.json();
    setTagsByDimension((prev) => ({
      ...prev,
      [tag.dimension]: (prev[tag.dimension] || []).map((t) => (t.id === tag.id ? json.data : t)),
    }));
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
        <p className="text-rose-500">Could not load tags. Try refreshing the page.</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={pendingCount} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[820px] mx-auto">
          <div className="mb-6">
            <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground">Tags</h1>
            <p className="text-muted-foreground text-[14px] mt-1">
              Manage Taxonomy v1&apos;s governed vocabulary. Click a tag to deactivate it -- it stays out of the tagging UI
              but nothing that already used it breaks.
            </p>
          </div>

          {DIMENSION_SECTIONS.map(({ dimension, label, helperText }) => (
            <TagDimensionSection
              key={dimension}
              dimension={dimension}
              label={label}
              helperText={helperText}
              tags={tagsByDimension[dimension] || []}
              busyIds={busyIds}
              onCreate={handleCreate}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
