import SeriesFilter from './SeriesFilter';
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

async function getSeries(): Promise<Series[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series`);
  const json = await res.json();
  return json.data;
}

export default async function SeriesPage() {
    const seriesList = await getSeries();

    return (
        <main className="min-h-screen bg-gray-950 text-white p-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Browse BL Series</h1>
            <p className="text-gray-400 mb-8">Discover your next favorite BL drama</p>
            <SeriesFilter seriesList={seriesList}/>
        </main>
    );
}