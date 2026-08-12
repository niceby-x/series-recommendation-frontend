import Link from 'next/link';
import Image from 'next/image';
import { Eye, MoreVertical } from 'lucide-react';

export interface QueueRow {
  id: number;
  posterUrl: string | null;
  title: string;
  country: string;
  year: number | null;
  typeLabel: string;
  submittedBy: string;
  submittedAgo: string;
  priority: 'High' | 'Medium' | 'Low';
}

const PRIORITY_CLASS: Record<QueueRow['priority'], string> = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
};

function CuratorAvatar({ name }: { name: string }) {
  return (
    <span className="flex items-center justify-center size-7 rounded-full bg-brand-lilac/40 text-[#5E4B6B] text-[11px] font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function EditorialQueueTable({ rows }: { rows: QueueRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
        <p className="text-foreground font-semibold mb-1">Nothing waiting on you</p>
        <p className="text-muted-foreground text-sm">New TMDb discoveries will show up here for review.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/60">
              <th className="px-5 py-3 font-bold">Title</th>
              <th className="px-3 py-3 font-bold">Type</th>
              <th className="px-3 py-3 font-bold">Source</th>
              <th className="px-3 py-3 font-bold">Submitted By</th>
              <th className="px-3 py-3 font-bold">Submitted</th>
              <th className="px-3 py-3 font-bold">Priority</th>
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-muted">
                      {row.posterUrl ? (
                        <Image src={row.posterUrl} alt={row.title} fill sizes="44px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground text-[14px] font-semibold truncate">{row.title}</p>
                      <p className="text-muted-foreground text-[12.5px] truncate">
                        {row.country}
                        {row.year ? ' · ' + row.year : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-[12.5px] font-semibold bg-brand-lilac/25 text-[#5E4B6B] px-2.5 py-1 rounded-full whitespace-nowrap">
                    {row.typeLabel}
                  </span>
                </td>
                <td className="px-3 py-3 text-[13px] text-muted-foreground whitespace-nowrap">TMDB</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <CuratorAvatar name={row.submittedBy} />
                    <span className="text-[13px] text-foreground">{row.submittedBy}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[13px] text-muted-foreground whitespace-nowrap">{row.submittedAgo}</td>
                <td className="px-3 py-3">
                  <span className={'text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ' + PRIORITY_CLASS[row.priority]}>
                    {row.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href="/admin/candidates"
                      aria-label={'Review ' + row.title}
                      className="flex items-center justify-center size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-muted transition-colors"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <Link
                      href="/admin/candidates"
                      aria-label={'More actions for ' + row.title}
                      className="flex items-center justify-center size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-muted transition-colors"
                    >
                      <MoreVertical className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
