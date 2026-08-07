// lib/formatTime.ts
//
// Formats a real ISO timestamp (e.g. collections.updated_at) as a short
// "2d ago" string. Distinct from the mock timeAgo strings hardcoded in
// lib/dashboardContent.ts/lib/adminContent.ts -- this computes from an
// actual Date, for real data.

export function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks + 'w ago';
  const months = Math.floor(days / 30);
  if (months < 12) return months + 'mo ago';
  const years = Math.floor(days / 365);
  return years + 'y ago';
}
