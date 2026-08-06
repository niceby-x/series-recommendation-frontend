export interface UserRow {
  id: number;
  email: string;
  username: string;
  created_at: string;
  ratings_count: number;
  watchlist_count: number;
  is_admin: boolean;
}

function relativeJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function UserAvatar({ name }: { name: string }) {
  return (
    <span className="flex items-center justify-center size-9 rounded-full bg-brand-gradient text-white text-[13px] font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function UsersTable({ rows }: { rows: UserRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
        <p className="text-foreground font-semibold mb-1">No users match this search</p>
        <p className="text-muted-foreground text-sm">Try a different name or email.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/60">
              <th className="px-5 py-3 font-bold">User</th>
              <th className="px-3 py-3 font-bold">Joined</th>
              <th className="px-3 py-3 font-bold">Ratings</th>
              <th className="px-3 py-3 font-bold">Watchlist</th>
              <th className="px-5 py-3 font-bold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <UserAvatar name={row.username} />
                    <div className="min-w-0">
                      <p className="text-foreground text-[14px] font-semibold truncate">{row.username}</p>
                      <p className="text-muted-foreground text-[12.5px] truncate">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                  {relativeJoinDate(row.created_at)}
                </td>
                <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">{row.ratings_count}</td>
                <td className="px-3 py-3 text-[13px] text-foreground whitespace-nowrap">{row.watchlist_count}</td>
                <td className="px-5 py-3">
                  {row.is_admin ? (
                    <span className="text-[12px] font-semibold bg-brand-blush/30 text-primary px-2.5 py-1 rounded-full whitespace-nowrap">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[12px] font-semibold bg-muted text-muted-foreground px-2.5 py-1 rounded-full whitespace-nowrap">
                      Member
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
