import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clapperboard, Star } from 'lucide-react';
import RatingForm from '../../../components/shared/RatingForm';
import WatchlistButton from '@/components/shared/WatchlistButton';

interface Series {
  id: number;
  title: string;
  original_title: string | null;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
  poster_url: string | null;
  average_rating: number | null;
  rating_count: number;
}

async function getSeriesById(id: string): Promise<Series> {
  // no-store: series data (rating, status, synopsis edits from admin, etc.)
  // changes at runtime, per AGENTS.md's fetch-caching rule.
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series/' + id, {
    cache: 'no-store',
  });

  // GET /series/:id 404s for both a missing series and a malformed/non-numeric
  // id (see backend src/index.ts), so this one check covers both cases the
  // task calls out. Anything else unexpected (5xx, network) still throws
  // into the nearest error boundary rather than reading series.status on
  // an undefined series.
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to load series ' + id + ': ' + res.status);
  }

  const json = await res.json();
  return json.data;
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesById(id);

  const statusBadgeClass = series.status === 'completed'
    ? 'text-xs px-2 py-1 rounded bg-green-900 text-green-300'
    : 'text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300';

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <Link href="/series" className="text-blue-400 hover:text-blue-300 text-sm mb-6 block">
        ← Back to Browse
      </Link>

      <div className="max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl shadow-black/50">
            {series.poster_url ? (
              <Image
                src={series.poster_url}
                alt={series.title}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-gray-600 text-sm px-4 text-center">{series.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-4">
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
              {series.country}
            </span>
            <span className={statusBadgeClass}>
              {series.status}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-2">{series.title}</h1>

          {series.original_title && (
            <p className="text-gray-500 mb-4">{series.original_title}</p>
          )}

          <div className="flex gap-6 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {series.year}</span>
            <span className="flex items-center gap-1.5"><Clapperboard className="size-4" /> {series.episode_count} episodes</span>
            {series.average_rating != null ? (
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Star className="size-4 fill-yellow-400" />
                {series.average_rating.toFixed(1)}
                <span className="text-gray-500">
                  ({series.rating_count} {series.rating_count === 1 ? 'rating' : 'ratings'})
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-500">
                <Star className="size-4" /> No ratings yet
              </span>
            )}
          </div>

          <div className="mb-6">
            <WatchlistButton seriesId={series.id} />
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-3 text-blue-400">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed">
              {series.synopsis || 'No synopsis available.'}
            </p>
          </div>

          <RatingForm seriesId={series.id} />
        </div>
      </div>
    </main>
  );
}