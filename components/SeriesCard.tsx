import Image from 'next/image';
import Link from 'next/link';

export interface SeriesCardData {
  id: number;
  title: string;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
  poster_url: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  airing: 'On Air',
  completed: 'Completed',
  upcoming: 'Coming Soon',
};

const STATUS_CLASSES: Record<string, string> = {
  airing: 'bg-brand-blush text-[#4A2F3F]',
  completed: 'bg-brand-lilac text-[#3D2E52]',
  upcoming: 'bg-white/90 text-foreground',
};

export default function SeriesCard({ series }: { series: SeriesCardData }) {
  const statusLabel = STATUS_LABELS[series.status] ?? series.status;
  const statusClass = STATUS_CLASSES[series.status] ?? 'bg-white/90 text-foreground';

  return (
    <Link
      href={`/series/${series.id}`}
      className="group relative block overflow-hidden rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {series.poster_url ? (
          <Image
            src={series.poster_url}
            alt={series.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 p-4">
            <span className="font-heading text-sm text-center text-muted-foreground">
              {series.title}
            </span>
          </div>
        )}

        <span
          className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${statusClass}`}
        >
          {statusLabel}
        </span>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-xs text-white/90 line-clamp-5">
            {series.synopsis || 'No synopsis available yet.'}
          </p>
        </div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center mb-1 text-[11px] text-muted-foreground">
          <span>{series.country}</span>
          <span>{series.year}</span>
        </div>
        <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
          {series.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1">{series.episode_count} episodes</p>
      </div>
    </Link>
  );
}
