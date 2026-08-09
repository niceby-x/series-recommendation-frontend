// lib/siteConfig.ts
//
// Single source for the site's canonical/production URL -- used to build
// absolute URLs for metadataBase, robots.ts, sitemap.ts, and per-page
// generateMetadata() (OG images, canonical links). NEXT_PUBLIC_SITE_URL
// lets a custom domain be swapped in later via env var alone; falls back
// to the current Vercel deployment URL (also the one CORS-allowed on the
// backend, see allowedOrigins in src/index.ts) so this works out of the
// box without extra setup.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://series-recommendation-frontend.vercel.app';
