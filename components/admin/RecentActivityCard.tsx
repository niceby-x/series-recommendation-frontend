import { MOCK_ADMIN_ACTIVITY } from '../../lib/adminContent';

export default function RecentActivityCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Recent Activity</p>
        <button type="button" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </button>
      </div>
      <div className="divide-y divide-border/60">
        {MOCK_ADMIN_ACTIVITY.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 py-3">
              <span className={'flex items-center justify-center size-8 rounded-full shrink-0 ' + item.iconClass}>
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-foreground text-[13.5px] leading-snug">
                  <span className="font-semibold">{item.target}</span> {item.text}
                </p>
                <p className="text-muted-foreground text-[12px] mt-0.5">
                  by {item.actor} · {item.timeAgo}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
