import Link from 'next/link';
import { QUICK_ACTIONS } from '../../lib/adminContent';

export default function QuickActionsCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <p className="font-heading text-[16px] font-normal text-foreground mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <span className={'flex items-center justify-center size-8 rounded-full shrink-0 ' + action.colorClass}>
                <Icon className="size-4" />
              </span>
              <span className="text-[13px] font-semibold text-foreground leading-tight">{action.label}</span>
            </>
          );

          // href: null = not a real flow yet (see lib/adminContent.ts) --
          // rendered disabled rather than a button that does nothing.
          if (!action.href) {
            return (
              <div
                key={action.label}
                className="flex items-center gap-2.5 rounded-2xl border border-border/60 p-3 opacity-40 cursor-default select-none"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2.5 rounded-2xl border border-border/60 p-3 hover:border-ring hover:bg-muted/50 transition-colors"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
