'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ListFilter, ShieldCheck, Leaf, CalendarClock } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import type { HeroFeature } from '../../lib/landingContent';
import Spotlight from '../shared/Spotlight';

const ROTATING_WORDS = [
  { text: 'BLOOM', c1: '#F58AB5' },
  { text: 'UNFOLD', c1: '#F58AB5' },
  { text: 'CONNECT', c1: '#C8B6F9' },
  { text: 'SHINE', c1: '#F5C563' },
];

const SPARKLES = [
  { left: '4%', top: '10%', size: 6, delay: 0, duration: 2.2 },
  { left: '92%', top: '20%', size: 5, delay: 0.4, duration: 2.6 },
  { left: '50%', top: '-8%', size: 4, delay: 0.9, duration: 2.1 },
  { left: '80%', top: '70%', size: 5, delay: 1.3, duration: 2.4 },
];

const TRENDING_MOODS = ['Friends to Lovers', 'Healing', 'Slow Burn', 'School Life', 'Fated Mates', 'Bittersweet'];

// Reflective fan card -- inspired by the "Mirror Hall" collection-gallery
// reference: a wide arc of tilted cards, each with a soft mirrored
// reflection fading into the dark floor beneath it. Rebuilt in BLumi's own
// palette (deep plum/gold, not literal black/navy) so it still reads as
// this brand rather than a generic dark-UI showcase.
function FanCard({
  card,
  index,
  center,
  prefersReducedMotion,
}: {
  card: HeroFeature;
  index: number;
  center: number;
  prefersReducedMotion: boolean;
}) {
  const offset = index - center;
  const angle = offset * 11;
  const lift = Math.abs(offset) * 10;
  const scale = 1 - Math.abs(offset) * 0.055;
  const z = 20 - Math.abs(offset);

  return (
    <motion.div
      className="relative shrink-0 -mx-3 md:-mx-4 first:ml-0 last:mr-0"
      style={{ transformOrigin: 'bottom center', zIndex: z }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 50, rotate: 0 }}
      animate={{ opacity: 1, y: lift, rotate: angle, scale }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.15 + Math.abs(offset) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: lift - 16, rotate: angle * 0.35, scale: scale + 0.08, zIndex: 30 }}
    >
      <Link href={String(card.id).startsWith('hero-fallback') ? '/series' : `/series/${card.id}`} className="block">
        <div className="relative w-[92px] sm:w-[110px] md:w-[128px] aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/15 bg-brand-mauve/40">
          {card.imageUrl ? (
            <Image src={card.imageUrl} alt={card.title} fill sizes="130px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple-vivid/50 to-brand-mauve/60 px-2 text-center">
              <span className="text-white/80 text-[10px] leading-snug">{card.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
        </div>
      </Link>

      {/* Mirrored reflection -- same image, flipped, faded via mask-image
          rather than -webkit-box-reflect (Firefox doesn't support that
          property; mask-image is broadly supported and gives the same
          fade-to-nothing floor effect). */}
      {card.imageUrl && (
        <div
          className="absolute top-full left-0 w-[92px] sm:w-[110px] md:w-[128px] aspect-[2/3] opacity-25 pointer-events-none"
          style={{
            transform: 'scaleY(-1)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 65%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 65%)',
          }}
          aria-hidden
        >
          <Image src={card.imageUrl} alt="" fill sizes="130px" className="object-cover" />
        </div>
      )}
    </motion.div>
  );
}

export default function LandingHero({ deck }: { deck: HeroFeature[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const centerIndex = (deck.length - 1) / 2;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#241528] via-[#3B2145] to-[#7A4A63] pt-[56px] md:pt-[72px] pb-[64px] md:pb-[84px]">
      {/* Ambient glow -- deep plum at top settling into a warm rose/gold
          floor glow at the bottom, where the card reflections live. Kept
          in BLumi's own hues (mauve/purple/gold) rather than the reference's
          cool blue-violet, so this still reads as the same brand, just
          after dark. */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center bottom, rgba(245,138,181,0.28), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(200,182,249,0.25), transparent 35%), radial-gradient(circle at 88% 25%, rgba(245,197,99,0.18), transparent 30%)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: '#fffbea',
              boxShadow: '0 0 6px 2px rgba(245,197,99,0.7)',
              animation: 'sparkle-flicker ' + s.duration + 's ease-in-out ' + s.delay + 's infinite',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
        <Spotlight className="group" color="rgba(245, 197, 99, 0.14)">
          <p className="inline-flex items-center gap-1.5 text-white/70 text-[11px] font-bold tracking-[0.18em] mb-3">
            <FlowerIcon className="size-3 text-brand-blush" aria-hidden /> CURATED WITH LOVE
          </p>
          <h1 className="font-display text-[38px] sm:text-[48px] md:text-[62px] leading-[1.05] font-normal mb-1">
            <span className="text-white italic">Where Stories</span>
          </h1>
          <div className="relative inline-block mb-4">
            <span
              key={wordIndex}
              className="text-shine animate-word-in inline-block text-[46px] sm:text-[58px] md:text-[74px] leading-none font-display font-medium tracking-tight"
              style={{
                ['--shine-c1' as string]: ROTATING_WORDS[wordIndex].c1,
                ['--shine-c2' as string]: 'var(--color-brand-gold)',
              }}
            >
              {ROTATING_WORDS[wordIndex].text}
            </span>
            <span className="block h-[3px] w-16 mx-auto mt-3 rounded-full bg-gradient-to-r from-brand-blush via-brand-gold to-brand-lilac" aria-hidden />
          </div>
          <p className="text-white/70 text-[15px] md:text-[17px] leading-relaxed max-w-xl mx-auto mb-6">
            Discover thoughtfully curated BL series, movies, and anime through moods, tropes,
            emotional journeys, and trusted recommendations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-7 text-white/65 text-[13px]">
            <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5 text-brand-blush" /> New picks weekly</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-brand-blush" /> Safe space for everyone</span>
            <span className="inline-flex items-center gap-1.5"><Leaf className="size-3.5 text-brand-blush" /> Stories that stay with you</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/series"
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden bg-brand-gradient text-white text-[15px] font-semibold px-7 py-3 rounded-tl-[20px] rounded-tr-[8px] rounded-br-[20px] rounded-bl-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:opacity-90 transition-opacity"
            >
              <span className="relative">Discover Stories</span>
              <ArrowRight className="relative size-4 group-hover/btn:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
            </Link>
            <Link
              href="/series"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white text-[15px] font-semibold px-6 py-3 rounded-tl-[20px] rounded-tr-[8px] rounded-br-[20px] rounded-bl-[8px] hover:bg-white/15 transition-colors"
            >
              Browse by Mood <ListFilter className="size-4" />
            </Link>
          </div>
        </Spotlight>
      </div>

      {/* Fanned card gallery -- see FanCard above. overflow-x-auto lets the
          fan scroll horizontally on narrow screens rather than clipping.
          pb-* reserves room for each card's reflection: the reflection is
          absolutely positioned (top-full) below its card, so it doesn't
          contribute to this container's own layout height -- without this
          padding it spills past the gallery and floats, faded, over
          whatever section comes next in the DOM. */}
      <div className="relative mt-12 md:mt-16 px-6 pb-20 md:pb-28 overflow-x-auto no-scrollbar">
        <div className="flex items-end justify-center min-w-max mx-auto w-fit px-8" style={{ perspective: 1200 }}>
          {deck.map((card, i) => (
            <FanCard key={card.id} card={card} index={i} center={centerIndex} prefersReducedMotion={!!prefersReducedMotion} />
          ))}
        </div>
      </div>

      {/* Bottom label + trending moods -- the "SILVER STORM" beat from the
          reference, repurposed to something real: our actual trending
          moods instead of a made-up collection name. */}
      <div className="relative mt-10 md:mt-14 text-center px-6">
        <span className="inline-flex items-center justify-center size-8 rounded-full bg-white/10 border border-white/20 mb-2">
          <FlowerIcon className="size-4 text-brand-blush" />
        </span>
        <p className="text-white/60 text-[11px] font-bold tracking-[0.18em] mb-1">TRENDING MOODS</p>
        <div className="h-[2px] w-10 mx-auto mb-4 rounded-full bg-gradient-to-r from-brand-blush to-brand-gold" aria-hidden />
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {TRENDING_MOODS.map((mood) => (
            <Link
              key={mood}
              href="/series"
              className="text-white/75 text-[12px] font-medium bg-white/10 border border-white/15 px-3 py-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors"
            >
              {mood}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
