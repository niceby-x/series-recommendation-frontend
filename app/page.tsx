import Link from 'next/link';
import Image from 'next/image';

interface Series {
  id: number;
  title: string;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
  poster_url: string | null;
}

async function getFeaturedSeries(): Promise<Series[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Featured series fetch failed with status ' + res.status);
      return [];
    }

    const json = await res.json();
    const all: Series[] = json.data || [];
    return all.slice(0, 6);
  } catch (err) {
    console.error('Featured series fetch threw an error:', err);
    return [];
  }
}

export default async function Home() {
  const featured = await getFeaturedSeries();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-gray-950 to-gray-950" />
        <div className="relative max-w-5xl mx-auto px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-400 mb-4">
            Blumi
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-2 max-w-2xl mx-auto">
            Discover, rate, and track your next favorite BL drama.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            From Thailand to Japan, Korea, and beyond.
          </p>
          <Link
            href="/series"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Series →
          </Link>
        </div>
      </div>

      {/* Featured */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold">Featured Series</h2>
          <Link href="/series" className="text-blue-400 hover:text-blue-300 text-sm">
            See all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Couldn&apos;t load featured series right now.{' '}
            <Link href="/series" className="text-blue-400 hover:text-blue-300">
              Browse the full catalog
            </Link>{' '}
            instead.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured.map((series) => {
              const detailHref = '/series/' + series.id;

              return (
                <a
                  key={series.id}
                  href={detailHref}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 block"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-800">
                    {series.poster_url ? (
                      <Image
                        src={series.poster_url}
                        alt={series.title}
                        fill
                        sizes="(max-width: 768px) 33vw, 16vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-gray-600 text-xs px-2 text-center">{series.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {series.title}
                    </h3>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}