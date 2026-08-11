'use client';

import { useEffect, useState } from 'react';
import FlowerIcon from '../shared/FlowerIcon';
import { supabase } from '../../lib/supabase';

// Level/XP gamification (see H2-03 -- backed by GET /me/gamification,
// replaces MOCK_BLOOM_JOURNEY). Fetched client-side, same auth-header
// pattern as RecentActivityCard, since it needs the signed-in user's
// session token and isn't available at the server-render pass that
// fetches allSeries in app/page.tsx. This card and WeeklyJourneyCard each
// call GET /me/gamification independently rather than sharing a fetch
// through HomeAuthed -- same per-card-owns-its-fetch convention
// RecentActivityCard already established.
//
// A level-1/xp-0 response is the real "brand-new user" state, not an
// error or an empty state -- rendered as-is, no special-casing.
interface GamificationStats {
  level: number;
  label: string;
  xp: number;
  xp_to_next: number;
  total_xp: number;
}

export default function BloomJourneyCard() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/me/gamification', {
          headers: { Authorization: 'Bearer ' + session.access_token },
        });

        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }

        const json = await res.json();
        if (!cancelled) setStats(json.data as GamificationStats);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-[20px] bg-gradient-to-br from-brand-blush/25 via-card to-brand-lilac/20 border border-border/60 shadow-sm p-5">
        <p className="text-muted-foreground text-[13px]">Couldn&apos;t load your Bloom Journey.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-[20px] bg-gradient-to-br from-brand-blush/25 via-card to-brand-lilac/20 border border-border/60 shadow-sm p-5">
        <p className="text-muted-foreground text-[13px]">Loading...</p>
      </div>
    );
  }

  const { level, label, xp, xp_to_next } = stats;
  const pct = xp_to_next > 0 ? Math.min(100, Math.round((xp / xp_to_next) * 100)) : 100;

  return (
    <div className="rounded-[20px] bg-gradient-to-br from-brand-blush/25 via-card to-brand-lilac/20 border border-border/60 shadow-sm p-5">
      <div className="flex items-center gap-3.5">
        <span className="flex items-center justify-center size-12 rounded-full bg-brand-gradient text-white shadow-sm shrink-0">
          <FlowerIcon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-[16px] font-normal text-foreground leading-tight">Your Bloom Journey</p>
          <p className="text-muted-foreground text-[13px]">Level {level}</p>
        </div>
      </div>

      <p className="text-foreground text-[14px] font-semibold mt-4 flex items-center gap-1">
        {label} <span aria-hidden>·</span>
      </p>

      <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-brand-gradient rounded-full" style={{ width: pct + '%' }} />
      </div>
      <p className="text-muted-foreground text-[12px] mt-1.5">
        {xp} / {xp_to_next} XP
      </p>
    </div>
  );
}
