import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/siteConfig';

// Served at /robots.txt automatically by Next's app/robots.ts convention.
// /admin/* is gated by ADMIN_EMAIL server-side anyway (see docs/AGENTS.md),
// but there's no reason to let it show up in search results too.
// /my-list is a signed-in user's personal watchlist -- private, no SEO
// value, and login-walled, so it's excluded the same way.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/my-list'],
    },
    sitemap: SITE_URL + '/sitemap.xml',
  };
}
