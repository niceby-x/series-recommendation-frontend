'use client';

import Link from 'next/link';
import { useState } from 'react';

// The series detail page is a server component, so it never sees the query
// string (filters, search, mood/trope context) that was active on /series
// when the user clicked in -- params only carries the route's [id]. This
// reads document.referrer client-side and, if it was actually the browse
// page, restores its full path + query string so "Back to Browse" returns
// the user to where they left off instead of a reset /series. Same
// lazy-initializer pattern DashboardHeader.tsx uses for reading
// localStorage: SSR-safe (guarded by typeof window), computed once on mount.
function getBackHref(): string {
  if (typeof window === 'undefined' || !document.referrer) return '/series';

  try {
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.origin === window.location.origin && referrerUrl.pathname === '/series') {
      return referrerUrl.pathname + referrerUrl.search;
    }
  } catch {
    // Malformed/inaccessible referrer -- fall through to the plain /series
    // default below.
  }

  return '/series';
}

export default function BackToBrowseLink() {
  const [href] = useState(getBackHref);

  return (
    <Link href={href} className="text-primary hover:text-brand-purple-vivid text-sm mb-6 block">
      ← Back to Browse
    </Link>
  );
}

