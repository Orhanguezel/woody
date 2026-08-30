// =============================================================
// FILE: src/navigation/sidebar/sidebar-items.ts
// FINAL — GuezelWebDesign — Sidebar items (labels are dynamic via site_settings.ui_admin)
// - Dashboard base: /admin/dashboard
// - Admin pages: /admin/...  (route group "(admin)" URL'e dahil olmaz)
// =============================================================

import {
  Bell,
  Bot,
  BookOpenText,
  Image as ImageIcon,
  Tag,
  CreditCard,
  Database,
  FileSearch,
  HardDrive,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Package,
  Layers,
  Receipt,
  FileText,
  School,
  Send,
  Settings,
  Trash2,
  Users,
  Menu as MenuIcon,
  Twitter,
  BarChart3,
  Search,
  Activity,
  Facebook,
  Link2,
  type LucideIcon,
} from 'lucide-react';
import type { TranslateFn } from '@/i18n';

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  /** Optional dynamic badge (e.g. unread count) */
  badgeKey?: string;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export type AdminNavItemKey =
  | 'dashboard'
  | 'site_settings'
  | 'reviews'
  | 'mail'
  | 'users'
  | 'email_templates'
  | 'notifications'
  | 'storage'
  | 'db'
  | 'audit'
  | 'support'
  | 'chat'
  | 'wallet'
  | 'orders'
  | 'paytr_logs'
  | 'quote_requests'
  | 'products'
  | 'series'
  | 'levels'
  | 'entitlements'
  | 'blog'
  | 'schools'
  | 'payment_settings'
  | 'announcements'
  | 'subscriptions'
  | 'subscription_plans'
  | 'cache'
  | 'llm_prompts'
  | 'banners'
  | 'campaigns'
  | 'twitter'
  | 'google_ads'
  | 'search_console'
  | 'ga4'
  | 'gtm'
  | 'meta'
  | 'google_connect'
  | 'navigation'
  | 'home_layout'
  | 'docs';

export type AdminNavGroupKey = 'general' | 'content' | 'marketing' | 'communication' | 'system';

export type AdminNavConfigItem = {
  key: AdminNavItemKey;
  url: string;
  icon?: LucideIcon;
  badgeKey?: string;
};

export type AdminNavConfigGroup = {
  id: number;
  key: AdminNavGroupKey;
  items: AdminNavConfigItem[];
};

export const adminNavConfig: AdminNavConfigGroup[] = [
  {
    id: 1,
    key: 'general',
    items: [
      { key: 'dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
      { key: 'users', url: '/admin/users', icon: Users },
      { key: 'schools', url: '/admin/schools', icon: School },
      { key: 'products', url: '/admin/products', icon: Package },
      { key: 'series', url: '/admin/series', icon: Layers },
      { key: 'levels', url: '/admin/levels', icon: Tag },
      { key: 'entitlements', url: '/admin/entitlements', icon: CreditCard },
      { key: 'blog', url: '/admin/blog', icon: BookOpenText },
      { key: 'orders', url: '/admin/orders', icon: Package },
      { key: 'paytr_logs', url: '/admin/paytr-logs', icon: CreditCard },
      { key: 'quote_requests', url: '/admin/quote-requests', icon: FileText },
      { key: 'subscriptions', url: '/admin/subscriptions', icon: CreditCard },
      { key: 'subscription_plans', url: '/admin/subscription-plans', icon: Receipt },
    ],
  },
  {
    id: 2,
    key: 'communication',
    items: [
      { key: 'reviews', url: '/admin/reviews', icon: MessageSquare },
      { key: 'support', url: '/admin/support', icon: MessageCircle },
      { key: 'announcements', url: '/admin/announcements', icon: Megaphone },
      { key: 'notifications', url: '/admin/notifications', icon: Bell, badgeKey: 'notifications_unread' },
      { key: 'email_templates', url: '/admin/email-templates', icon: Mail },
      { key: 'chat', url: '/admin/chat', icon: Bot },
    ],
  },
  {
    id: 3,
    key: 'marketing',
    items: [
      { key: 'banners', url: '/admin/banners', icon: ImageIcon },
      { key: 'campaigns', url: '/admin/campaigns', icon: Tag },
      { key: 'twitter', url: '/admin/twitter', icon: Twitter },
      { key: 'google_ads', url: '/admin/google-ads', icon: BarChart3 },
      { key: 'search_console', url: '/admin/search-console', icon: Search },
      { key: 'ga4', url: '/admin/ga4', icon: Activity },
      { key: 'gtm', url: '/admin/gtm', icon: Tag },
      { key: 'meta', url: '/admin/meta', icon: Facebook },
      { key: 'google_connect', url: '/admin/google-connect', icon: Link2 },
    ],
  },
  {
    id: 4,
    key: 'system',
    items: [
      { key: 'site_settings', url: '/admin/site-settings', icon: Settings },
      { key: 'navigation', url: '/admin/navigation', icon: MenuIcon },
      { key: 'home_layout', url: '/admin/home-layout', icon: LayoutDashboard },
      { key: 'cache', url: '/admin/cache', icon: Trash2 },
      { key: 'wallet', url: '/admin/wallet', icon: Receipt },
      { key: 'payment_settings', url: '/admin/payment-settings', icon: CreditCard },
      { key: 'mail', url: '/admin/mail', icon: Send },
      { key: 'storage', url: '/admin/storage', icon: HardDrive },
      { key: 'db', url: '/admin/db', icon: Database },
      { key: 'audit', url: '/admin/audit', icon: FileSearch },
      { key: 'llm_prompts', url: '/admin/llm-prompts', icon: Bot },
      { key: 'docs', url: '/admin/docs', icon: BookOpenText },
    ],
  },
];

export type AdminNavCopy = {
  labels: Record<AdminNavGroupKey, string>;
  items: Record<AdminNavItemKey, string>;
};

// Fallback titles for when translations are missing
const FALLBACK_TITLES: Record<AdminNavItemKey, string> = {
  dashboard: 'Panel',
  site_settings: 'Ayarlar',
  reviews: 'Yorumlar',
  mail: 'E-Posta',
  users: 'Kullanıcılar',
  email_templates: 'E-posta Şablonları',
  notifications: 'Bildirimler',
  storage: 'Dosya Yöneticisi',
  db: 'Veritabanı',
  audit: 'Denetim Kayıtları',
  support: 'Destek',
  chat: 'Chat & AI',
  orders: 'Siparişler',
  paytr_logs: 'PayTR Kayıtları',
  quote_requests: 'Teklif Talepleri',
  products: 'Ürünler',
  series: 'Seriler',
  levels: 'Seviyeler',
  entitlements: 'Erişim Hakları',
  blog: 'Blog',
  schools: 'Okullar',
  wallet: 'Cüzdan',
  payment_settings: 'Ödeme Ayarları',
  announcements: 'Duyurular',
  subscriptions: 'Abonelikler',
  subscription_plans: 'Abonelik Planları',
  cache: 'Cache Yönetimi',
  llm_prompts: 'AI Promptları',
  banners: 'Banner Yönetimi',
  campaigns: 'Kampanyalar',
  twitter: 'Twitter / X',
  google_ads: 'Google Ads',
  search_console: 'Search Console',
  ga4: 'Google Analytics 4',
  gtm: 'Tag Manager',
  meta: 'Meta',
  google_connect: 'Google Bağlantısı',
  navigation: 'Menü & Footer',
  home_layout: 'Anasayfa Düzeni',
  docs: 'Dokümantasyon',
};

// woody backend'inde KARSILIGI OLMAYAN admin ozellikleri — menude gizlenir
// (ilgili endpoint'ler 404 + RTK retry dongusu uretiyordu). Backend modulu eklenince
// buradan cikarilir. Backend'i olan/stub'lanan tum diger anahtarlar gorunur kalir
// (dashboard, users, schools, products, blog, orders, subscriptions, subscription_plans,
//  support, notifications, site_settings, navigation, home_layout, storage).
const HIDDEN_NAV_KEYS = new Set<AdminNavItemKey>([
  'reviews',
  'announcements',
  'email_templates',
  'chat',
  'banners',
  'campaigns',
  'wallet',
  'mail',
  'db',
  'audit',
  'llm_prompts',
  // Iyzipay ayarlari site-settings > API tab'inda; ayri sayfa gereksiz (kullanici talebi)
  'payment_settings',
]);

export function buildAdminSidebarItems(
  copy?: Partial<AdminNavCopy> | null,
  t?: TranslateFn,
): NavGroup[] {
  const labels = copy?.labels ?? ({} as AdminNavCopy['labels']);
  const items = copy?.items ?? ({} as AdminNavCopy['items']);

  return adminNavConfig
    .map((group) => ({ ...group, items: group.items.filter((it) => !HIDDEN_NAV_KEYS.has(it.key)) }))
    .filter((group) => group.items.length > 0)
    .map((group) => {
    // 1. Try copy.labels[group.key]
    // 2. Try t(`admin.sidebar.groups.${group.key}`)
    // 3. Fallback to empty (or key)
    const tGroup = t ? t(`admin.sidebar.groups.${group.key}`) : '';
    const label =
      labels[group.key] || (tGroup && !tGroup.includes('admin.sidebar') ? tGroup : '') || '';

    return {
      id: group.id,
      label,
      items: group.items.map((item) => {
        // 1. Try copy.items[item.key]
        // 2. Try t(`admin.dashboard.items.${item.key}`)
        // 3. Fallback to FALLBACK_TITLES
        // 4. Fallback to key
        const tItem = t ? t(`admin.dashboard.items.${item.key}`) : '';
        const title =
          items[item.key] ||
          (tItem && !tItem.includes('admin.dashboard') ? tItem : '') ||
          FALLBACK_TITLES[item.key] ||
          item.key;

        return {
          title,
          url: item.url,
          icon: item.icon,
          badgeKey: item.badgeKey,
        };
      }),
    };
  });
}
