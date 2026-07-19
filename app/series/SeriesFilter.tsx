'use client';

import { useState } from 'react';

interface Series {
  id: number;
  title: string;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
}

interface Props {
  seriesList: Series[];
}

export default function SeriesFilter({ seriesList }: Props) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [status, setStatus] = useState('All');

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="text-gray-400 col-span-3">No series found.</p>
        ) : (
          filtered.map((series) => (
            <a key={series.id} href={`/series/${series.id}`}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition-colors block">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">{series.country}</span>
                <span className="text-xs text-gray-500">{series.year}</span>
              </div>
              <h2 className="text-lg font-semibold mb-2">{series.title}</h2>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{series.synopsis || 'No synopsis available.'}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{series.episode_count} episodes</span>
                <span className={series.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                  {series.status}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}