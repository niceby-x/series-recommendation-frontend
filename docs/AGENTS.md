# Blumi — Engineering Guide

## Overview

Blumi is a discovery and tracking platform for Boys' Love (BL) dramas, movies, and shows. It is a personal full-stack project — Express/TypeScript backend, Next.js/TypeScript frontend, Supabase for auth and data, TMDb for metadata.

This document captures conventions established during development, including a few bugs hit repeatedly and their fixes. Follow these to avoid re-hitting the same issues.

---

## Tech Stack

**Frontend**
- Next.js App Router, no `src/` folder — `app/`, `components/`, `lib/` sit at project root
- TypeScript
- Tailwind CSS (dark theme: near-black backgrounds, `blue-400`/`blue-500` accent)
- Supabase JS client for auth (`lib/supabase.ts`, anon key)

**Backend**
- Express + TypeScript, single `src/index.ts` entry point
- Supabase JS client with the service role key (bypasses RLS — see Security notes below)
- TMDb API via Bearer token (`TMDB_ACCESS_TOKEN`)

---

## Critical: String Concatenation Over Template Literals

**This is the most important convention in this codebase.** Template literals (`` `${...}` ``) in `fetch()` URLs and dynamic `className` strings have repeatedly gotten silently corrupted during copy-paste into this project (missing backticks, mangled interpolation, broken JSX). This has caused real bugs multiple times.

**Always use string concatenation instead:**

```ts
// Don't do this:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/series`)

// Do this:
fetch(process.env.NEXT_PUBLIC_API_URL + '/series')
```

```tsx
// Don't do this:
className={`px-4 py-2 ${isActive ? 'bg-blue-600' : 'bg-gray-800'}`}

// Do this:
className={'px-4 py-2 ' + (isActive ? 'bg-blue-600' : 'bg-gray-800')}
```

Apply this rule to every new file that builds a URL or a conditional class string, not just files that have already broken.

---

## Data Conventions

- `series.status` / `series_candidates.status` use `'airing'` / `'completed'` — not `'ongoing'` or other values
- `series.country` / `series_candidates.country` use full names: `Thailand`, `Korea`, `Japan`, `Taiwan`, `China`, `Hong Kong`, or `Other` as a fallback — not ISO codes
- `tmdb_id` is unique per row in both `series` and `series_candidates`. Negative placeholder IDs (e.g. `-17`) are used for manually-backfilled rows with no real TMDb entry — never assume `tmdb_id > 0`
- `genres.name` and `cast_members.name` both have a **unique constraint** — always find-or-create by name rather than blind-inserting, to avoid duplicate rows for the same actor/genre across series

---

## Admin / Content Pipeline

- Nothing from TMDb discovery goes directly into `series`. It lands in `series_candidates` (`review_status: pending`) and only reaches `series` via the `/admin/candidates/:id/approve` route
- Admin access is gated by comparing the signed-in user's email against an `ADMIN_EMAIL` env var on the **backend** — never hardcode an email in source. The frontend also checks a `NEXT_PUBLIC_ADMIN_EMAIL` var to conditionally show the nav link, but that's UI convenience only; the real enforcement is server-side
- Approving a candidate must also find-or-create its genres/cast and link them via `series_genres`/`series_cast`; restoring an approved candidate back to pending must reverse this (delete the `series` row and its link rows) — see `/admin/candidates/:id/restore`
- TMDb discovery (`discover-series-by-keyword.ts`) searches TV and movies as **separate passes with independent budgets** — do not share one `--limit` counter across both, or one media type can starve the other

---

## Environment Variables

**Backend `.env`**
```
SUPABASE_URL=
SUPABASE_KEY=          # service role key, not anon
TMDB_ACCESS_TOKEN=
ADMIN_EMAIL=
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_ADMIN_EMAIL=
```

---

## Deployment Notes

- Next.js server-component `fetch()` calls cache by default. Any fetch whose data changes at runtime (e.g. the series list) needs `cache: 'no-store'` explicitly, or production will silently serve stale data until the next deploy
- `tsx` is preferred over `ts-node` for running standalone backend scripts (`ts-node` has hit unresolved environment errors in this project; `tsx` has not)
- Vercel env vars (especially `NEXT_PUBLIC_*`) are baked in at build time — adding or changing one requires a fresh deploy to take effect, not just a save in the dashboard

---

## Security Notes

- The backend uses Supabase's **service role key**, which bypasses Row Level Security entirely. RLS being disabled on the tables is currently harmless because all writes go through the Express API, not directly from the browser with the anon key — but this should be tightened if that ever changes
- Never commit `.env` files or real API keys/tokens into the repo

---

## Code Style

- TypeScript throughout, explicit interfaces for API payloads
- Functional React components, hooks-based state
- Prefer small, composable files over large multi-responsibility ones
- Comment *why*, not *what*, especially around non-obvious business logic (dedup rules, status mapping, country resolution fallbacks)