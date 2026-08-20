'use client';

import AdminAccountMenu from './AdminAccountMenu';
import { useAdminPageHeaderValue } from './AdminPageHeaderContext';

// Same row shape as AdminHeader (title+subtitle on the left, then
// whatever search the page provides, then the account pill on the right)
// so navigating between the dashboard and any other admin page doesn't
// change where things sit -- just what's in them. The search slot is
// deliberately just `{search}` rather than a shared search component: each
// page's search box is wired to that page's own local filter state (see
// e.g. app/admin/users/page.tsx's `search`/`setSearch`), not a shared
// concept, so it stays owned by the page and only rendered up here.
export default function AdminPageTopBar({ email }: { email: string | null }) {
  const { title, subtitle, search, actions } = useAdminPageHeaderValue();

  return (
    <div className="flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between gap-x-5 gap-y-3 flex-1 min-w-0">
      <div className="min-w-0 shrink-0 max-w-full">
        {title && (
          <h1 className="font-heading text-[18px] md:text-[20px] leading-tight font-normal text-foreground min-w-0 truncate">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-muted-foreground text-[12px] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 min-w-0 ml-auto sm:ml-0">
        {search}
        {actions}
        <AdminAccountMenu email={email} />
      </div>
    </div>
  );
}
