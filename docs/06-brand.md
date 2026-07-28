# BLumi Brand

## Meaning

BLumi combines

BL

+

Lumi

(from illuminate)

The name represents helping fans discover stories that brighten their day.

---

## Brand Personality

Friendly

Welcoming

Inclusive

Optimistic

Trustworthy

Curious

---

## Voice

Speak like a friend recommending a great story.

Avoid technical language.

Celebrate discovery.

Keep copy short and encouraging.

---

## Color Palette

Background — `#FFF9FA`

Primary Pink — `#F58AB5`

Primary Purple — `#6B3F75`

Dark Text — `#5B3466`

Body Text — `#64657A`

Border — `#F1E6ED`

Primary actions and hero moments use a Primary Pink → Primary Purple gradient (`bg-brand-gradient` utility). Dark Text is the default heading/foreground color on light surfaces; Body Text is used for paragraph/muted copy; Background is the default page background.

(Older pastel tokens — Sakura Blush `#F7B6C8`, Lilac Haze `#C8B6F9` — remain available as `brand-blush`/`brand-lilac` for soft badge backgrounds specifically; they're intentionally softer than the vivid Primary Pink/Purple pair above, which is reserved for high-emphasis elements.)

---

## Typography

Elegant serif headings paired with a clean, highly legible body sans — warm without being twee.

Headings — DM Serif Display (`font-heading`), regular weight only (the family has no bold cut)

Body — Inter (`font-sans`)

**Type scale** (exact px, not the Tailwind default scale):

| Role | Font | Size | Weight |
|---|---|---|---|
| Logo wordmark | DM Serif Display | 38px | 400 |
| Hero Title | DM Serif Display | 48px (line-height 1.1) | 400 |
| Hero Card Title | DM Serif Display | 28px (line-height 1.1) | 400 |
| Section Title | DM Serif Display | 32px | 400 |
| Card Title | Inter | 20px | 600 |
| Navigation | Inter | 16px | 500 |
| Body | Inter | 18px | 400 |
| Button | Inter | 16px | 600 |
| Metadata | Inter | 14px | 400 |
| Badge | Inter | 13px | 600 |
| Small Text | Inter | 14px | 400 |

Note: the original numeric spec called for Hero Title at 64px and Hero Card Title at 52px, but those sizes rendered noticeably larger than the reference mockup image actually shows — the mockup's card title, in particular, reads closer to Section Title size, not nearly double it. The values above are scaled down to match the mockup image, which has been treated as ground truth over the literal numbers where the two conflicted.

Note the distinction between **Hero Card Title** (the large serif title inside the hero carousel, e.g. a featured series name) and **Card Title** (the smaller Inter/sans title on catalog grid cards) — different font family entirely, not just a size difference.

---

## Elevation

Radius — 20px base (18–24px range) for card/panel surfaces; fully pill-shaped buttons (`rounded-full`) are unaffected by this scale.

Shadow — `0 20px 60px rgba(88,54,99,.12)`, used on elevated surfaces like the hero carousel.

---

## Logo

A six-petal flower mark in the brand gradient, with a white play triangle at its center — discovery and playback in one symbol.

Variants: full color (default), light (white, for dark/photo backgrounds), dark (Deep Mauve, for light backgrounds), monochrome (greyscale, for contexts where brand color shouldn't appear).

Icon-only and icon+wordmark ("BLumi") lockups are both supported; see `components/Logo.tsx`.