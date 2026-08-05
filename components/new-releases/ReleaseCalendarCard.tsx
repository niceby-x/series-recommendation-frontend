import Link from 'next/link';
import Image from 'next/image';

export interface CalendarDay {
  label: string; // 'Mon'..'Sun'
  date: number; // day-of-month
  hasRelease: boolean;
  isToday: boolean;
}

export interface TodayRelease {
  id: number | string;
  title: string;
  country: string;
  imageUrl: string | null;
}

// The week strip (Mon-Sun, today highlighted) is built from the real
// current date -- see NewReleasesAuthed for how `hasRelease` dots are
// derived. "Today's Releases" below is real too when a series' mock
// release offset happens to land on today; otherwise it shows the most
// recent release instead of an empty state, same "don't show a dead end"
// reasoning as DiscoverAuthed's Recommended row.
export default function ReleaseCalendarCard({
  days,
  todayLabel,
  releases,
}: {
  days: CalendarDay[];
  todayLabel: string;
  releases: TodayRelease[];
}) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-heading text-[16px] font-normal text-foreground">Release Calendar</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View full calendar
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {days.map((d) => (
          <span key={d.label} className="text-[10.5px] font-semibold text-muted-foreground uppercase">
            {d.label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1 py-1">
            <span
              className={
                'flex items-center justify-center size-8 rounded-full text-[12.5px] font-semibold transition-colors ' +
                (d.isToday ? 'bg-brand-gradient text-white' : 'text-foreground/80')
              }
            >
              {d.date}
            </span>
            <span className={'size-1 rounded-full ' + (d.hasRelease ? 'bg-primary' : 'bg-transparent')} />
          </div>
        ))}
      </div>

      <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">
        Today&apos;s Releases · {todayLabel}
      </p>
      <div className="flex flex-col gap-2.5">
        {releases.map((r) => {
          const inner = (
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-muted">
                {r.imageUrl ? (
                  <Image src={r.imageUrl} alt={r.title} fill sizes="44px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-[13.5px] font-semibold truncate">{r.title}</p>
                <p className="text-muted-foreground text-[11.5px] truncate">{r.country} · Series</p>
              </div>
              <span className="bg-muted text-foreground/70 text-[10.5px] font-semibold px-2 py-1 rounded shrink-0">EP 1</span>
            </div>
          );
          return (
            <Link key={r.id} href={'/series/' + r.id} className="hover:bg-muted/60 rounded-[12px] -mx-2 px-2 py-1 transition-colors">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
