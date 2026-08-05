import { FolderPlus, Sparkles } from 'lucide-react';

export default function CreateCollectionCTA({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative rounded-[20px] bg-gradient-to-br from-brand-blush/40 via-card to-brand-lilac/30 border border-border/60 shadow-sm p-5 overflow-hidden">
      <Sparkles className="absolute top-4 right-5 size-4 text-brand-gold" />
      <FolderPlus className="absolute -bottom-4 -right-4 size-24 text-brand-lilac/40 rotate-[-8deg]" />

      <div className="relative">
        <p className="font-heading text-[17px] font-normal text-foreground mb-1.5">Create Your Own Collection</p>
        <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 max-w-[80%]">
          Organize series your way and never lose track of what you love.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          <FolderPlus className="size-4" />
          Create Collection
        </button>
      </div>
    </div>
  );
}
