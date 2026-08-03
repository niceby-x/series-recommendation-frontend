import { Compass, BookOpen } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';

const STEPS = [
  {
    number: '01',
    title: 'Discover',
    description: 'Find BL stories through moods, tropes, and curated collections.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Explore',
    description: 'Read trusted recommendations and emotional insights.',
    icon: BookOpen,
  },
  {
    number: '03',
    title: 'Bloom',
    description: 'Save your favorites and discover your next unforgettable story.',
    icon: FlowerIcon,
  },
];

export default function HowItWorks() {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {STEPS.map((step) => {
        const Icon = step.icon;
        return (
          <div
            key={step.number}
            className="rounded-2xl border border-border bg-gradient-to-br from-accent/60 to-transparent p-6 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-primary text-[13px] font-bold mb-1">{step.number}</p>
              <h3 className="font-heading text-xl font-normal text-foreground mb-1.5">{step.title}</h3>
              <p className="text-muted-foreground text-[13px] leading-snug max-w-[190px]">{step.description}</p>
            </div>
            <span className="flex items-center justify-center size-16 rounded-full bg-card border border-border shrink-0">
              <Icon className="size-6 text-primary" strokeWidth={1.75} />
            </span>
          </div>
        );
      })}
    </div>
  );
}