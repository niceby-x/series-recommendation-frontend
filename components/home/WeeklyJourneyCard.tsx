'use client';

import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Weekly discovery streak (see H2-03 -- backed by GET /me/gamification,
// replaces MOCK_WEEKLY_JOURNEY). Same fetch/auth pattern and independent-
// fetch convention as BloomJourneyCard -- see that file's header note.
interface WeekDay {
  date: string;
  label: string;
  completed: boolean;
  is_today: boolean;
}

interface GamificationStats {
  week_completed_count: number;
  week_goal: number;
  week: WeekDay[];
}

export default function WeeklyJourneyCard() {
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
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
        <p className="text-muted-foreground text-[13px]">Couldn&apos;t load this week&apos;s journey.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
        <p className="text-muted-foreground text-[13px]">Loading...</p>
      </div>
    );
  }

  const { week_completed_count, week_goal, week } = stats;

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">This Week&apos;s Journey</p>
        <span className="text-muted-foreground text-[13px] font-semibold shrink-0">
          {week_completed_count}/{week_goal}
        </span>
      </div>
      <p className="text-muted-foreground text-[13px]">Discover {week_goal} new stories this week</p>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5">
          {week.map((day, i) => (
            <span
              key={i}
              className={
                'flex items-center justify-center size-7 rounded-full text-[11px] font-bold transition-colors ' +
                (day.completed ? 'bg-brand-gradient text-white' : 'bg-muted text-muted-foreground') +
                (day.is_today && !day.completed ? ' ring-2 ring-primary ring-offset-1 ring-offset-card' : '')
              }
            >
              {day.label}
            </span>
          ))}
        </div>
        <span className="flex items-center justify-center size-9 rounded-full bg-brand-blush/30 text-primary shrink-0 ml-2">
          <Gift className="size-4" />
        </span>
      </div>
    </div>
  );
}
