// lib/adminContent.ts
//
// Content for the Admin Dashboard (app/admin/page.tsx). Real data (fetched
// via the existing /admin/candidates/counts, /admin/users, and /series
// endpoints) covers Total Titles, Pending Review, Published, Users, and
// Recently Published -- those numbers are true today. Everything else here
// (Comments, Recent Activity, Top Moods percentages, week-over-week
// deltas) is PLACEHOLDER pending real tables/endpoints that don't exist yet
// (no comments feature, no activity log, no mood-tag column on series) --
// same honest-mock convention as lib/dashboardContent.ts.

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Film,
  Clapperboard,
  FolderOpen,
  Tag as TagIcon,
  Smile,
  Star,
  Hash,
  ClipboardList,
  CheckCircle2,
  Sparkles,
  Users,
  MessageCircle,
  Flag,
  Settings,
  Boxes,
  RefreshCw,
  FileText,
  Heart,
  Leaf,
  Zap,
  Coffee,
  CloudRain,
  PlusCircle,
  FolderPlus,
  Wand2,
  UploadCloud,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string | null; // null = not a real destination yet (see AdminSidebar)
  icon: LucideIcon;
  badgeKey?: 'pending'; // resolved to a live count in AdminSidebar
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

// href: real destinations only where a page actually exists today
// (Dashboard, Editorial Queue, Reviews, Users, Tags, Series & Movies,
// Collections, Moods, Tropes, Import & Sync). Everything else renders as a
// disabled row with a "Soon" pill in AdminSidebar -- same honest-placeholder
// convention as DashboardSidebar/MoodFilterChips' empty state, rather than
// a link that goes nowhere real.
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    label: 'Content',
    items: [
      { label: 'Series & Movies', href: '/admin/series', icon: Film },
      { label: 'Episodes', href: null, icon: Clapperboard },
      { label: 'Collections', href: '/admin/collections', icon: FolderOpen },
      { label: 'Genres', href: '/admin/genres', icon: TagIcon },
      { label: 'Moods', href: '/admin/moods', icon: Smile },
      { label: 'Tropes', href: '/admin/tropes', icon: Star },
      { label: 'Tags', href: '/admin/tags', icon: Hash },
    ],
  },
  {
    label: 'Curation',
    items: [
      { label: 'Editorial Queue', href: '/admin/candidates', icon: ClipboardList, badgeKey: 'pending' },
      { label: 'Reviews', href: '/admin/reviews', icon: CheckCircle2 },
      { label: 'Curator Picks', href: '/admin/curator-picks', icon: Sparkles },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Comments', href: null, icon: MessageCircle },
      { label: 'Reports', href: null, icon: Flag },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: null, icon: Settings },
      { label: 'Taxonomies', href: null, icon: Boxes },
      { label: 'Import & Sync', href: '/admin/import', icon: RefreshCw },
      { label: 'Logs', href: null, icon: FileText },
    ],
  },
];

export const ADMIN_DASHBOARD_ITEM: AdminNavItem = { label: 'Dashboard', href: '/admin', icon: LayoutDashboard };

export interface StatCardMeta {
  key: string;
  label: string;
  color: 'rose' | 'orange' | 'emerald' | 'violet' | 'sky';
  icon: LucideIcon;
}

// value/delta/subtitle for each are filled in by app/admin/page.tsx (real
// where the data exists, placeholder where it doesn't -- see file header).
export const STAT_CARDS: StatCardMeta[] = [
  { key: 'total', label: 'Total Titles', color: 'rose', icon: Film },
  { key: 'pending', label: 'Pending Review', color: 'orange', icon: ClipboardList },
  { key: 'published', label: 'Published', color: 'emerald', icon: CheckCircle2 },
  { key: 'users', label: 'Users', color: 'violet', icon: Users },
  { key: 'comments', label: 'Comments', color: 'sky', icon: MessageCircle },
];

// Curator names cycled onto real pending candidates for the "Submitted By"
// column -- candidates don't have a real submitted_by field (discovery is
// an automated TMDb script per AGENTS.md, not per-curator submission), so
// this is a display-only placeholder, not a claim about who really found
// each title.
export const MOCK_CURATORS = ['Nico', 'Hana', 'Mika', 'Aki', 'Yui'];

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconClass: string;
  text: string;
  target: string;
  actor: string;
  timeAgo: string;
}

// Placeholder pending a real admin activity/audit-log table (tracked
// separately as A2-02 -- the personal version of this, MOCK_RECENT_ACTIVITY
// in dashboardContent.ts, is now real, see H2-04).
export const MOCK_ADMIN_ACTIVITY: ActivityItem[] = [
  { id: 'aa1', icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-600', text: 'was published', target: 'Cherry Magic', actor: 'Hana', timeAgo: '1h ago' },
  { id: 'aa2', icon: Star, iconClass: 'bg-violet-100 text-violet-600', text: 'added new mood', target: '"Healing"', actor: 'Admin', timeAgo: '3h ago' },
  { id: 'aa3', icon: FileText, iconClass: 'bg-sky-100 text-sky-600', text: 'updated', target: 'Step by Step', actor: 'Mika', timeAgo: '5h ago' },
  { id: 'aa4', icon: Flag, iconClass: 'bg-rose-100 text-rose-600', text: 'reported a comment on', target: 'Love in The Air', actor: 'A user', timeAgo: '8h ago' },
  { id: 'aa5', icon: FolderOpen, iconClass: 'bg-amber-100 text-amber-600', text: 'created new collection', target: '"Office Romance"', actor: 'Yui', timeAgo: '1d ago' },
];

export interface TopMoodItem {
  name: string;
  icon: LucideIcon;
  colorClass: string; // bg-* for the progress bar
  pct: number;
}

// Placeholder pending a real mood tag on `series` + aggregate query (no
// per-title mood column yet -- see lib/moodsContent.ts's own note). Uses
// the same six canonical mood names as lib/landingContent.ts's MOCK_MOODS
// so this never disagrees with the rest of the app about what a "mood" is.
export const MOCK_TOP_MOODS: TopMoodItem[] = [
  { name: 'Healing', icon: Leaf, colorClass: 'bg-violet-400', pct: 28 },
  { name: 'Heartwarming', icon: Heart, colorClass: 'bg-rose-400', pct: 24 },
  { name: 'Angsty', icon: Zap, colorClass: 'bg-amber-400', pct: 18 },
  { name: 'Cozy', icon: Coffee, colorClass: 'bg-orange-300', pct: 15 },
  { name: 'Melancholic', icon: CloudRain, colorClass: 'bg-slate-400', pct: 15 },
];

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string | null; // null = not a real flow yet, renders disabled
  colorClass: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Add New Title', icon: PlusCircle, href: '/admin/candidates', colorClass: 'text-rose-600 bg-rose-50' },
  { label: 'Add Collection', icon: FolderPlus, href: '/collections', colorClass: 'text-violet-600 bg-violet-50' },
  { label: 'Manage Moods', icon: Wand2, href: null, colorClass: 'text-amber-600 bg-amber-50' },
  { label: 'Import from TMDB', icon: UploadCloud, href: null, colorClass: 'text-sky-600 bg-sky-50' },
];
