import Link from 'next/link';
import Image from 'next/image';
import RatingForm from '../../../components/RatingForm';
import WatchlistButton from '@/components/WatchlistButton';

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
}

async function getSeriesById(id: string): Promise<Series> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series/' + id);
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
            <span>📅 {series.year}</span>
            <span>🎬 {series.episode_count} episodes</span>
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