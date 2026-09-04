'use client';

import Link from 'next/link';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import { buildAdminSidebarItems } from '@/navigation/sidebar/sidebar-items';
import type { NavGroup } from '@/navigation/sidebar/sidebar-items';

import { useAdminUiCopy } from '@/app/(main)/admin/_components/common/useAdminUiCopy';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import type { TranslateFn } from '@/i18n';

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { useAdminSettings } from '../admin-settings-provider';
import { useStatusQuery, useGetMyProfileQuery } from '@/integrations/hooks';
import { getAdminAppName, getAdminBrandSubtitle } from '@/lib/admin-brand';

type Role = 'admin' | string;

const PUBLIC_FAVICON_FALLBACK = '/uploads/brand/favicon.svg';

type SidebarMe = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  roles?: Role[];
};

function hasRole(me: SidebarMe, role: Role) {
  if (me.role === role) return true;
  const rs = Array.isArray(me.roles) ? me.roles : [];
  return rs.includes(role);
}

export function AppSidebar({
  me,
  appName,
  variant,
  collapsible,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  me: SidebarMe;
  appName?: string;
}) {
  const { copy } = useAdminUiCopy();
  const t = useAdminT();
  const { pageMeta, branding } = useAdminSettings();
  const faviconUrl = branding.favicon_url || branding.favicon_32 || branding.logo_url;

  const { data: statusData } = useStatusQuery();
  const { data: profileData } = useGetMyProfileQuery();

  const currentUser = useMemo(() => {
    const s = statusData?.user;
    return {
      id: s?.id || me?.id || 'me',
      name: profileData?.full_name || s?.email?.split('@')[0] || me?.name || 'Admin',
      email: s?.email || me?.email || 'admin',
      role: s?.role || me?.role || 'admin',
      avatar: profileData?.avatar_url || me?.avatar || '',
      roles: me?.roles || [s?.role || 'admin'],
    };
  }, [statusData, profileData, me]);

  const wrappedT: TranslateFn = (key, params, fallback) => {
    if (typeof key === 'string' && key.startsWith('admin.dashboard.items.')) {
      const itemKey = key.replace('admin.dashboard.items.', '');
      if (pageMeta?.[itemKey]?.title) return pageMeta[itemKey].title;
    }
    return t(key, params, fallback);
  };

  const groupsForMe: NavGroup[] = hasRole(currentUser as any, 'admin')
    ? buildAdminSidebarItems(copy.nav, wrappedT)
    : [
        {
          id: 1,
          label: '',
          items: [
            {
              title: 'Panel',
              url: '/admin/dashboard',
              icon: LayoutDashboard,
            },
          ],
        },
      ];

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible} className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader className="p-0 overflow-hidden">
        <Link
          prefetch={false}
          href="/admin/dashboard"
          className={cn(
            "group flex min-h-32 flex-col items-center justify-center gap-3 border-sidebar-border/70 border-b px-5 py-5 text-center transition-all duration-200 hover:bg-brand-gold-soft",
            "group-data-[state=collapsed]:min-h-0 group-data-[state=collapsed]:gap-0 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:py-5"
          )}
        >
          <div className={cn(
            "flex h-12 w-40 shrink-0 items-center justify-center text-brand-ink transition-all duration-200 group-data-[state=collapsed]:size-8 group-data-[state=collapsed]:rounded-xl",
            branding.logo_url ? "bg-transparent" : "bg-brand-gold shadow-[0_8px_24px_-8px_rgba(22,163,74,0.35)] ring-1 ring-brand-gold/30"
          )}>
            {branding.logo_url ? (
              <>
                <img
                  src={branding.logo_url}
                  alt={branding.app_name}
                  className="size-full object-contain transition-all duration-200 group-data-[state=collapsed]:hidden"
                />
                <img
                  src={faviconUrl}
                  alt=""
                  aria-hidden="true"
                  className="hidden size-full object-contain group-data-[state=collapsed]:block"
                  onError={(event) => {
                    if (!event.currentTarget.src.endsWith(PUBLIC_FAVICON_FALLBACK)) {
                      event.currentTarget.src = PUBLIC_FAVICON_FALLBACK;
                    }
                  }}
                />
              </>
            ) : (
              <Sparkles className="size-5 transition-all duration-200 group-data-[state=collapsed]:size-4" />
            )}
          </div>
          <div className="flex flex-col items-center gap-1 leading-none transition-all duration-200 group-data-[state=collapsed]:hidden group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:overflow-hidden group-data-[state=collapsed]:opacity-0">
            <span className="font-serif font-bold text-xl tracking-tight text-sidebar-foreground whitespace-nowrap">
              {(copy.app_name || '').trim() || branding.app_name || getAdminAppName()}
            </span>
            {(getAdminBrandSubtitle() || '').trim() ? (
              <span className="text-[9px] font-bold tracking-[0.3em] text-brand-gold uppercase opacity-80 whitespace-nowrap">
                {getAdminBrandSubtitle()}
              </span>
            ) : null}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <NavMain items={groupsForMe} showQuickCreate={false} />
      </SidebarContent>

      <SidebarFooter className="p-5 border-t border-sidebar-border/70">
        <NavUser user={{ name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar }} />
      </SidebarFooter>
    </Sidebar>
  );
}
