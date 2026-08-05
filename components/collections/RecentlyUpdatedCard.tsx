import { ALL_COLLECTIONS, RECENTLY_UPDATED_KEYS } from '../../lib/collectionsContent';

// Same row layout as TopRatedSeriesCard/PopularInMoodCard's right-rail
// lists. Order comes from RECENTLY_UPDATED_KEYS rather than an actual
// updated_at sort -- no real "updated" timestamp exists yet (see
// lib/collectionsContent.ts header).
export default function RecentlyUpdatedCard() {
  const items = RECENTLY_UPDATED_KEYS.map((key) => ALL_COLLECTIONS.find((c) => c.key === key)).filter(
    (c): c is NonNullable<typeof c> => !!c
  );

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Recently Updated</p>
        <span className="text-primary text-[12.5px] font-semibold shrink-0">View all</span>
      </div>
      <div className="divide-y divide-border/60">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center gap-3 py-2.5">
              <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30 flex items-center justify-center">
                <Icon className="size-4 text-primary/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-[13.5px] font-semibold truncate">{item.title}</p>
                <p className="text-muted-foreground text-[11.5px] truncate">
                  Updated {item.updatedAgo} · {item.seriesCount} Series
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
