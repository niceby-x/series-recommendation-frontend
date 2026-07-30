const STEPS = [
  {
    number: '01',
    title: 'Discover',
    description: 'Find BL stories through moods, tropes, and curated collections.',
    emoji: '🌸',
  },
  {
    number: '02',
    title: 'Explore',
    description: 'Read trusted recommendations and emotional insights.',
    emoji: '📖',
  },
  {
    number: '03',
    title: 'Bloom',
    description: 'Save your favorites and discover your next unforgettable story.',
    emoji: '🌺',
  },
];

export default function HowItWorks() {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {STEPS.map((step) => (
        <div
          key={step.number}
          className="rounded-2xl border border-border bg-gradient-to-br from-accent/60 to-transparent p-6 flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-primary text-[13px] font-bold mb-1">{step.number}</p>
            <h3 className="font-heading text-xl font-normal text-foreground mb-1.5">{step.title}</h3>
            <p className="text-muted-foreground text-[13px] leading-snug max-w-[190px]">{step.description}</p>
          </div>
          <span className="flex items-center justify-center size-16 rounded-full bg-card border border-border shrink-0 text-2xl">
            {step.emoji}
          </span>
        </div>
      ))}
    </div>
  );
}
