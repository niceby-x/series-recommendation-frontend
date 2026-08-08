import Link from 'next/link';
import Image from 'next/image';
import type { MoodTile } from '../../lib/landingContent';

// Mood filtering isn't wired into Explore yet (only country/genre/year/
// episodes/rating are real filters there -- see components/explore).
// Rather than link to a ?mood= param Explore can't read, these honestly
// link to the plain catalog for now, same convention CategoryNav uses
// elsewhere in the app for not-yet-real filters.
export default function BrowseByMoodGrid({ moods }: { moods: MoodTile[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
      {moods.map((mood) => {
        return (
          <Link
            key={mood.name}
            href="/series"
            className={
              'group relative aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ' +
              mood.gradient
            }
          >
            {mood.image && (
              <Image
                src={mood.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                aria-hidden
              />
            )}

            {/* Soft fade so text stays legible over any part of the illustration */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent" aria-hidden />

            {/* Text overlaid bottom-left directly on the art, like the mockup */}
            <div className="absolute bottom-0 left-0 px-4 pb-4">
              <p className="font-heading text-lg font-normal text-[#4A2F3F]">{mood.name}</p>
              <p className="text-[#4A2F3F]/60 text-[12px] mt-0.5">{mood.count} stories</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}