import Link from 'next/link';
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
}

async function getSeriesById(id: string): Promise<Series> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/${id}`);
  const json = await res.json();
  return json.data;
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesById(id);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <Link href="/series" className="text-blue-400 hover:text-blue-300 text-sm mb-6 block">
        ← Back to Browse
      </Link>

      <div className="max-w-2xl">
        <div className="flex gap-3 mb-4">
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
            {series.country}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${series.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
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
    </main>
  );
}