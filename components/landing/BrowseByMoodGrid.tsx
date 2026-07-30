import Link from 'next/link';
import type { MoodTile } from '../../lib/landingContent';

// Mood filtering isn't wired into Explore yet (only country/genre/year/
// episodes/rating are real filters there -- see components/explore).
// Rather than link to a ?mood= param Explore can't read, these honestly
// link to the plain catalog for now, same convention CategoryNav uses
// elsewhere in the app for not-yet-real filters.
export default function BrowseByMoodGrid({ moods }: { moods: MoodTile[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {moods.map((mood) => (
        <Link
          key={mood.name}
          href="/series"
          className={
            'group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ' +
            mood.gradient
          }
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
            <span className="text-2xl mb-2" aria-hidden>
              🌸
            </span>
            <p className="font-heading text-lg font-normal text-[#4A2F3F]">{mood.name}</p>
            <p className="text-[#4A2F3F]/70 text-[12px] mt-0.5">{mood.count} stories</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
