# Design System

## Personality

Warm

Elegant

Minimal

Modern

Comfortable

Premium

---

## Interface

Light Mode First

Rounded Corners

Glassmorphism

Sakura Gradients

Soft Shadows

Smooth Motion

---

## Principles

Large typography

Generous spacing

Simple navigation

Cards over tables

Minimal clutter

Accessible contrast

Consistent components

---

## Foundations

See `docs/06-brand.md` for the full color palette and typography.

Tokens live in `app/globals.css`: standard shadcn semantic tokens (`background`, `primary`, `card`, etc.) are mapped to the BLumi pastel palette for both light and dark mode, plus fixed brand tokens (`brand-blush`, `brand-lilac`, `brand-mauve`, `brand-cream`) for places that need the exact hex regardless of theme, like the logo and hero gradients.

Base corner radius is `--radius: 20px`, within the spec's 18–24px range for card/panel surfaces; pill-shaped buttons (`rounded-full`) are used for primary calls to action and are unaffected by this scale. Elevated surfaces (hero carousel, cards) use the brand shadow: `0 20px 60px rgba(88,54,99,.12)`.