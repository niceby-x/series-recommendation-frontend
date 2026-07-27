'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

interface Props {
  seriesList: Series[];
}

export default function SeriesFilter({ seriesList }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [country, setCountry] = useState(searchParams.get('country') ?? 'All');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'All');

  const countries = ['All', ...Array.from(new Set(seriesList.map(s => s.country)))];
  const statuses = ['All', 'completed', 'airing', 'upcoming'];

  const filtered = seriesList.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = country === 'All' || series.country === country;
    const matchesStatus = status === 'All' || series.status === status;
    return matchesSearch && matchesCountry && matchesStatus;
  });

  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search series..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-blue-500"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        >
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-6">
        Showing {filtered.length} of {seriesList.length} series
      </p>

      {/* Series grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <p className="text-gray-400 col-span-full">No series found.</p>
        ) : (
          filtered.map((series) => {
            const detailHref = '/series/' + series.id;
            const badgeColorClass = series.status === 'completed'
              ? 'bg-green-900/80 text-green-300'
              : 'bg-yellow-900/80 text-yellow-300';
            const badgeClassName = 'absolute top-2 right-2 text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm ' + badgeColorClass;

            return (
              <a
                key={series.id}
                href={detailHref}
                className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 block"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-800">
                  {series.poster_url ? (
                    <Image
                      src={series.poster_url}
                      alt={series.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <span className="text-gray-600 text-sm px-4 text-center">{series.title}</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <span className={badgeClassName}>
                    {series.status}
                  </span>

                  {/* Hover overlay with synopsis */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-xs text-gray-200 line-clamp-5">
                      {series.synopsis || 'No synopsis available.'}
                    </p>
                  </div>
                </div>

                {/* Info below poster */}
                <div className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
                      {series.country}
                    </span>
                    <span className="text-[10px] text-gray-500">{series.year}</span>
                  </div>
                  <h2 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {series.title}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-1">{series.episode_count} episodes</p>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}