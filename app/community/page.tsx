import FlowerIcon from '../../components/shared/FlowerIcon';

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md">
        <FlowerIcon className="size-10 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
          Community is blooming soon
        </h1>
        <p className="text-muted-foreground">
          We&apos;re building a place for BL fans to share recommendations, reviews, and
          favorite couples together. Check back soon!
        </p>
      </div>
    </main>
  );
}