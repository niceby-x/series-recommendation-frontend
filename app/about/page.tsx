export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
          Help every BL fan discover their next favorite story.
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          BLumi doesn&apos;t host content — instead, we help fans discover BL series, movies,
          and anime through intelligent recommendations, curated collections, and
          community-driven discovery. Organized around moods, tropes, and relationship
          dynamics instead of just genres, because that&apos;s how BL fans actually think
          about the stories they love.
        </p>
        <p className="text-muted-foreground">
          Our goal: a user finishes a BL series and instinctively opens BLumi to decide
          what to watch next.
        </p>
      </div>
    </main>
  );
}