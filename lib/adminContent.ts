// lib/adminContent.ts
//
// Content for the Admin Dashboard (app/admin/page.tsx). Real data covers
// Total Titles, Pending Review, Published, Users, Recently Published,
// Recent Activity (D2-01 -- GET /admin/activity, backed by the
// admin_actions audit log from A2-02), and Top Moods (D2-01 -- GET
// /admin/top-moods, aggregated fresh from real series_tags/tags). Only
// Comments and the StatCard week-over-week deltas remain placeholder,
// pending a comments feature and real historical time-series data that
// don't exist yet -- same honest-mock convention as lib/dashboardContent.ts.

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
