# Blumi

A discovery and tracking platform for Boys' Love (BL) dramas, movies, and shows — built as a personal full-stack project, starting from SQL fundamentals up through a deployed production app with an internal content-review pipeline.

Unlike a generic drama database, Blumi is scoped specifically to BL content, with metadata (posters, genres, cast, seasons) sourced from TMDb and curated through an internal admin review queue rather than imported blindly.

---

## Live

- Frontend: https://series-recommendation-frontend.vercel.app
- Backend API: https://series-recommendation-backend.onrender.com

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth (client-side session handling)

**Backend**
- Node.js + Express + TypeScript
- Supabase (Postgres + Auth)
- TMDb API (metadata, posters, credits)

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: Supabase

---

## Current Features

**User-facing**
- Browse BL series with poster cards, hover animations, and status badges, with working country/genre/year/sort filters and search (including a filterable Discover grid that loads more on demand rather than fetching the whole catalog up front)
- Series detail pages with dynamic per-page metadata (title/description/OG image) for link previews
- Account registration and login (Supabase Auth, email/password)
- Ratings (1–10 numeric score, optional written review) on series, with real aggregate averages/counts shown on cards and detail pages, upsert-on-resubmit, and the form prefilling a user's existing rating
- Watchlist with status tracking (plan to watch / watching / completed)
- "My List" page grouping watchlist entries by status
- Moods — browse by mood (romantic, heartfelt, etc.), matched against real series tags
- Tropes — browse by trope, matched against real series tags, with counts and poster art pulled from actual matches
- Collections — personal (create/edit/add-to) and curated (admin-managed) lists of series
- New Releases page with a release calendar and "Just Released"/"Trending" surfaces
- robots.txt and a generated sitemap for search engines

**Content pipeline (admin-only)**
- TMDb keyword-based discovery script (`discover-series-by-keyword.ts`) that searches both TV and movies under the "boys' love (bl)" TMDb keyword, resolves each result's real country, detects animation and season count, and pulls genres + top cast in the same request
- Discovered content lands in a `series_candidates` staging table — nothing reaches the live catalog automatically
- Admin review dashboard (`/admin/candidates`, gated by an `ADMIN_EMAIL` env var check on the backend) with:
  - Live Pending / Approved / Rejected counts and tabs
  - Table-style review rows with poster thumbnail, genre tags, top cast, and a direct TMDb link
  - Inline edit-before-approve (title, country, status, year, episode count, synopsis)
  - Keyboard shortcuts (`A` approve / `R` reject) on the active row
  - Bulk-reject for long-running (60+ episode) and animated content
  - Data-completeness warnings (missing synopsis/genres/cast) via a color-coded left accent per row
  - Restore-to-pending, which correctly unwinds an approval (removes the `series` row and its genre/cast links) if you change your mind
- Approving a candidate finds-or-creates its genres and cast members (deduplicated by name) and links them to the new series via `series_genres` / `series_cast`

---

## Database Schema (Supabase / Postgres)

- `series` — the live, user-facing catalog
- `series_candidates` — staging table for TMDb discoveries pending admin review
- `genres`, `series_genres` — genre taxonomy and series-genre links
- `cast_members`, `series_cast` — actor/character data and series-cast links
- `ratings` — user ratings per series
- `user_lists` — watchlist entries with status
- `users` — app-level user record linked to Supabase Auth via `auth_id`

---

## Development

**Backend**
```bash
cd series-recommendation-backend
npm install
npm run dev   # runs on localhost:3001
```

**Frontend**
```bash
cd series-recommendation-frontend
npm install
npm run dev   # runs on localhost:3000
```

Both require their own `.env` — see `AGENTS.md` for the required variables.

---

## Roadmap

Ideas discussed but not yet built (see `docs/03-roadmap.md` for the full phased list):
- Recommendation explanations ("recommended because you liked X, Y, Z")
- Real personalization (the current "Recommended For You" row is just "everything else," not tailored)
- User profiles and public watch history
- Community reviews/social features (the `/community` page is a placeholder)

---

## Design Philosophy

The site should feel like a curated recommendation source for BL fans specifically — not a generic TMDb clone. Dark theme, blue accent, poster-forward browsing, minimal chrome on user-facing pages.