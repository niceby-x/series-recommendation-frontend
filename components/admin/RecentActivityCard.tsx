import { CheckCircle2, XCircle, RefreshCw, ShieldCheck, ShieldOff, Ban, Trash2, TrendingUp, type LucideIcon } from 'lucide-react';
import { formatTimeAgo } from '../../lib/formatTime';

// D2-01: real data now (GET /admin/activity, see the backend handoff),
// fetched server-side in app/admin/page.tsx alongside its other admin
// data and passed down as a plain prop -- same pattern as
// RecentlyPublishedCard/EditorialQueueTable, not a separate client fetch.
export interface RealActivityItem {
  id: number;
  action: string;
  target_type: string;
  target_label: string;
  actor_label: string;
  created_at: string;
}

// The nine action strings logAdminAction() (A2-02) actually writes --
// these are the only ones that will ever come back from GET
// /admin/activity, so an unrecognized action falls through to a generic
// fallback below rather than crashing on a future action type this map
// hasn't been updated for yet.
const ACTIVITY_META: Record<string, { icon: LucideIcon; iconClass: string; verb: string }> = {
  'candidate.approve': { icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-600', verb: 'was approved' },
  'candidate.reject': { icon: XCircle, iconClass: 'bg-rose-100 text-rose-600', verb: 'was rejected' },
  'candidate.restore': { icon: RefreshCw, iconClass: 'bg-sky-100 text-sky-600', verb: 'was restored to the queue' },
  'user.promote': { icon: ShieldCheck, iconClass: 'bg-violet-100 text-violet-600', verb: 'was promoted to admin' },
  'user.demote': { icon: ShieldOff, iconClass: 'bg-slate-100 text-slate-600', verb: 'was demoted from admin' },
  'user.ban': { icon: Ban, iconClass: 'bg-rose-100 text-rose-600', verb: 'was banned' },
  'user.unban': { icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-600', verb: 'was unbanned' },
  'user.delete': { icon: Trash2, iconClass: 'bg-rose-100 text-rose-600', verb: 'was deleted' },
};

// rank_snapshot.run's target is a date (see the backend's target_label
// resolution), which reads oddly as "{date} was computed" -- everything
// else fits the generic "{target} {verb}" shape fine.
function describeActivity(item: RealActivityItem): { icon: LucideIcon; iconClass: string; target: string; verb: string } {
  if (item.action === 'rank_snapshot.run') {
    return { icon: TrendingUp, iconClass: 'bg-sky-100 text-sky-600', target: 'Rank snapshot', verb: 'was computed for ' + item.target_label };
  }

  const meta = ACTIVITY_META[item.action];
  return {
    icon: meta?.icon ?? RefreshCw,
    iconClass: meta?.iconClass ?? 'bg-slate-100 text-slate-600',
    target: item.target_label,
    verb: meta?.verb ?? 'was updated',
  };
}

export default function RecentActivityCard({ items }: { items: RealActivityItem[] }) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <p className="font-heading text-[16px] font-normal text-foreground mb-1">Recent Activity</p>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-[13px] py-3">No admin activity recorded yet.</p>
      ) : (
        <div className="divide-y divide-border/60">
          {items.map((item) => {
            const { icon: Icon, iconClass, target, verb } = describeActivity(item);
            return (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <span className={'flex items-center justify-center size-8 rounded-full shrink-0 ' + iconClass}>
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-foreground text-[13.5px] leading-snug">
                    <span className="font-semibold">{target}</span> {verb}
                  </p>
                  <p className="text-muted-foreground text-[12px] mt-0.5">
                    by {item.actor_label} · {formatTimeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
