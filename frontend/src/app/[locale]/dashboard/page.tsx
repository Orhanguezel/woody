'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Calendar,
  Sparkles,
  CreditCard,
  Settings,
  ArrowRight,
  ShieldCheck,
  Lock,
  ShoppingBag,
  LayoutGrid,
  Trash2,
  Eye,
  Clock,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/auth.store';
import { localizePath, normalizeError } from '@/integrations/shared';
import {
  useGetMyProfileQuery,
  useUpsertMyProfileMutation,
  useUpdateUserMutation,
  useListMyPendingOutcomesQuery,
  useGetUserHistoryQuery,
  useDeleteReadingMutation,
  useDeleteAllReadingsMutation,
  useListMyBookingsQuery,
} from '@/integrations/rtk/hooks';
import type { HistoryItem, ReadingType } from '@/integrations/rtk/public/history.public.endpoints';
import AvatarUpload from '@/components/common/AvatarUpload';
import CityAutocomplete from '@/components/common/CityAutocomplete';
import ReviewModal from '@/components/common/public/ReviewModal';
import BookingMessageButton from '@/components/common/BookingMessageButton';
import dashboardCopy from '@/config/pages/dashboard-copy.json';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type TabKey = 'overview' | 'profile' | 'bookings' | 'history' | 'security';
type HistoryFilter = 'all' | ReadingType;
const VALID_TABS: TabKey[] = ['overview', 'profile', 'bookings', 'history', 'security'];
type SupportedLocale = 'tr' | 'en';

type DashCardProps = {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
};

function DashCard({ href, icon, eyebrow, title, description, cta }: DashCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-(--gm-border-soft) bg-(--gm-surface) p-8 transition-all duration-400 hover:-translate-y-1 hover:border-(--gm-gold)/40 hover:shadow-card overflow-hidden"
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-(--gm-gold)/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-(--gm-gold)/10 border border-(--gm-gold)/30 flex items-center justify-center text-(--gm-gold-deep) mb-6">
          {icon}
        </div>
        <span className="font-display text-[10px] tracking-[0.32em] text-(--gm-gold-deep) uppercase">
          {eyebrow}
        </span>
        <h3 className="font-serif text-2xl text-(--gm-text) mt-1 mb-3">{title}</h3>
        <p className="text-sm text-(--gm-text-dim) leading-relaxed mb-6">{description}</p>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-(--gm-gold-deep) group-hover:text-(--gm-gold) transition-colors mt-auto">
          {cta}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold text-(--gm-gold-deep) tracking-[0.2em] uppercase mb-2">
      {children}
    </label>
  );
}

function fieldClasses() {
  return 'w-full bg-(--gm-bg-deep) border border-(--gm-border-soft) rounded-xl px-5 py-3.5 text-sm text-(--gm-text) placeholder:text-(--gm-muted) focus:border-(--gm-gold)/50 outline-none transition-colors';
}

function fmtDate(v: string, locale: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const DEFAULT_HISTORY_ICON = <Sparkles size={18} />;

const DASH_CARD_ICONS: Record<string, React.ReactNode> = {
  user: <UserIcon size={22} />,
  calendar: <Calendar size={22} />,
  sparkles: <Sparkles size={22} />,
  clock: <Clock size={22} />,
  creditCard: <CreditCard size={22} />,
  settings: <Settings size={22} />,
  heart: <Sparkles size={22} />,
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'tr';
  const lang: SupportedLocale = locale === 'tr' ? 'tr' : 'en';
  const isTr = lang === 'tr';

  const { isAuthenticated, isReady, user } = useAuthStore();
  const isConsultantUser = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const primaryRole =
      typeof user?.role === 'string'
        ? user.role
        : user?.role && typeof user.role === 'object'
          ? user.role.name
          : null;

    return roles.includes('consultant') || primaryRole === 'consultant';
  }, [user]);

  // Tab state — URL ?tab= ile senkronize
  const initialTab = (searchParams.get('tab') as TabKey) || 'overview';
  const [tab, setTab] = useState<TabKey>(VALID_TABS.includes(initialTab) ? initialTab : 'overview');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    const t = searchParams.get('tab') as TabKey | null;
    if (t && VALID_TABS.includes(t) && t !== tab) {
      setTab(t);
    }
  }, [searchParams, tab]);

  function switchTab(next: TabKey) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', next);
    window.history.replaceState({}, '', url.toString());
  }

  // Auth guard
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace(`/${locale}/login?next=/${locale}/dashboard`);
    }
  }, [isReady, isAuthenticated, locale, router]);

  // Profile data
  const { data: profile } = useGetMyProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: pendingOutcomes } = useListMyPendingOutcomesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: history, isLoading: historyLoading } = useGetUserHistoryQuery(
    { limit: 50 },
    { skip: !isAuthenticated },
  );
  const [deleteReading, deleteReadingState] = useDeleteReadingMutation();
  const [deleteAllReadings, deleteAllReadingsState] = useDeleteAllReadingsMutation();
  const pendingCount = pendingOutcomes?.length ?? 0;
  const [upsertProfile, upsertProfileState] = useUpsertMyProfileMutation();
  const [updateUser, updateUserState] = useUpdateUserMutation();
  const { data: myBookings, isLoading: bookingsLoading } = useListMyBookingsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    targetId: string;
    consultantName: string;
  }>({
    isOpen: false,
    targetId: '',
    consultantName: '',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
  });
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const dashboardConfig = dashboardCopy as {
    text: Record<string, { tr: string; en: string }>;
    tabs: Array<{ key: TabKey; tr: string; en: string }>;
    overviewCards: Array<{
      key: string;
      hrefMode: 'tab' | 'localizedPath';
      hrefValue: string;
      icon: string;
      eyebrow: { tr: string; en: string };
      title: { tr: string; en: string };
      description: { tr: string; en: string };
      cta: { tr: string; en: string };
    }>;
    historyFilters: Array<{ key: HistoryFilter; tr: string; en: string }>;
    historyMeta: Record<string, { tr: string; en: string; route: string }>;
  };
  const tx = (key: string) => dashboardConfig.text[key]?.[lang] || dashboardConfig.text[key]?.en || key;
  const t2 = (entry: { tr: string; en: string }) => entry[lang] || entry.en;
  const historyTypes = dashboardConfig.historyFilters;

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name ?? '',
        phone: profile.phone ?? '',
        address: profile.address_line1 ?? '',
        city: profile.city ?? '',
      });
    }
  }, [profile]);

  if (!isReady || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-(--gm-bg)">
        <p className="text-(--gm-muted) text-sm">{tx('loading')}</p>
      </main>
    );
  }

  const fullName = (profile?.full_name as string) || user.full_name || user.email || '';
  const firstName = fullName.split(' ')[0] || '';
  const initials =
    fullName
      .split(/\s+/)
      .map((w) => w[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  const avatarUrl =
    (profile as any)?.avatar_url ||
    (user as any).avatar_url ||
    '';

  async function handleAvatarUploaded(newUrl: string) {
    try {
      await upsertProfile({
        profile: { avatar_url: newUrl },
      } as any).unwrap();
    } catch (err) {
      toast.error(normalizeError(err).message || tx('toastAvatarSaveError'));
    }
  }
  const memberSince = (user as any).created_at
    ? new Date((user as any).created_at).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      })
    : '';

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsertProfile({
        profile: {
          full_name: formData.fullName || null,
          phone: formData.phone || null,
          address_line1: formData.address || null,
          city: formData.city || null,
        },
      }).unwrap();
      toast.success(tx('toastProfileUpdated'));
    } catch (err) {
      toast.error(normalizeError(err).message || tx('toastGenericError'));
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast.error(tx('toastPasswordsNoMatch'));
      return;
    }
    try {
      await updateUser({ email: user!.email, password: passData.new }).unwrap();
      setPassData({ old: '', new: '', confirm: '' });
      toast.success(tx('toastPasswordUpdated'));
    } catch (err) {
      toast.error(normalizeError(err).message || tx('toastGenericError'));
    }
  }

  async function handleDeleteReading(item: HistoryItem) {
    try {
      await deleteReading({ type: item.type, id: item.id }).unwrap();
      toast.success(tx('toastReadingDeleted'));
    } catch (err) {
      toast.error(normalizeError(err).message || tx('toastDeleteFailed'));
    }
  }

  async function handleDeleteAllReadings() {
    try {
      await deleteAllReadings().unwrap();
      toast.success(tx('toastAllReadingsDeleted'));
    } catch (err) {
      toast.error(normalizeError(err).message || tx('toastDeleteFailed'));
    }
  }

  const filteredHistory =
    historyFilter === 'all'
      ? history ?? []
      : (history ?? []).filter((item) => item.type === historyFilter);

  const overviewCards: DashCardProps[] = dashboardConfig.overviewCards
    .filter((card) => (card.key === 'consultantPanel' ? isConsultantUser : true))
    .map((card) => ({
      href: card.hrefMode === 'tab' ? `?tab=${card.hrefValue}` : localizePath(locale, card.hrefValue),
      icon: DASH_CARD_ICONS[card.icon] || <Sparkles size={22} />,
      eyebrow: t2(card.eyebrow),
      title: t2(card.title),
      description: t2(card.description),
      cta: t2(card.cta),
    }));

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = dashboardConfig.tabs.map((tabItem) => ({
    key: tabItem.key,
    label: t2(tabItem),
    icon:
      tabItem.key === 'overview' ? <LayoutGrid size={14} />
      : tabItem.key === 'profile' ? <UserIcon size={14} />
      : tabItem.key === 'bookings' ? <ShoppingBag size={14} />
      : tabItem.key === 'history' ? <Sparkles size={14} />
      : <Lock size={14} />,
  }));

  return (
    <main className="min-h-screen bg-(--gm-bg) pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* User card */}
        <header className="mb-8 rounded-2xl border border-(--gm-border-soft) bg-(--gm-surface) p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <AvatarUpload
            src={avatarUrl}
            initials={initials}
            size={96}
            onUploaded={handleAvatarUploaded}
          />

          <div className="flex-1 min-w-0">
            <span className="font-display text-[10px] tracking-[0.32em] text-(--gm-gold-deep) uppercase">
              {tx('welcome')}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-(--gm-text) mt-1 leading-tight">
              {firstName
                ? tx('helloTemplate').replace('{{name}}', firstName)
                : tx('panelTitle')}
            </h1>
            <p className="text-(--gm-text-dim) text-sm mt-2 truncate">{user.email}</p>
            {memberSince && (
              <p className="text-(--gm-muted) text-xs mt-1">
                {tx('memberSinceTemplate').replace('{{date}}', memberSince)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <button
              type="button"
              onClick={() => switchTab('profile')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-(--gm-gold-deep) hover:text-(--gm-gold) transition-colors"
            >
              <Settings size={14} />
              {tx('accountSettings')}
            </button>
            <Link
              href={localizePath(locale, '/logout')}
              className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-(--gm-muted) hover:text-(--gm-text-dim) transition-colors"
            >
              {tx('signOut')}
            </Link>
          </div>
        </header>

        {/* Tabs */}
        <nav className="mb-10 flex flex-wrap gap-2 border-b border-(--gm-border-soft)">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                className={`relative inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? 'text-(--gm-gold-deep)'
                    : 'text-(--gm-text-dim) hover:text-(--gm-text)'
                }`}
              >
                {t.icon}
                {t.label}
                {active && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-(--gm-gold)" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        {tab === 'overview' && (
          <>
            {pendingCount > 0 && (
              <Link
                href={localizePath(locale, '/karne')}
                className="group flex flex-col md:flex-row items-center gap-6 mb-8 p-6 md:p-7 rounded-2xl border-2 border-(--gm-gold)/40 bg-(--gm-gold)/5 hover:bg-(--gm-gold)/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-(--gm-gold)/15 border border-(--gm-gold)/40 flex items-center justify-center text-(--gm-gold-deep) shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="font-display text-[10px] tracking-[0.32em] text-(--gm-gold-deep) uppercase mb-1.5">
                    {tx('pendingFeedbackEyebrow')}
                  </div>
                  <h3 className="font-serif text-xl text-(--gm-text)">
                    {tx('pendingFeedbackTitleTr')
                      .replace('{{count}}', String(pendingCount))
                      .replace('{{itemWord}}', pendingCount === 1 ? tx('pendingFeedbackItemSingular') : tx('pendingFeedbackItemPlural'))}
                  </h3>
                  <p className="text-sm text-(--gm-text-dim) mt-1">
                    {tx('pendingFeedbackDesc')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-(--gm-gold-deep) group-hover:text-(--gm-gold) transition-colors">
                  {tx('respond')}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            )}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overviewCards.map((c) => (
                <DashCard key={c.title} {...c} />
              ))}
            </section>

            <section className="mt-12 flex flex-col md:flex-row items-center gap-6 p-8 border border-(--gm-gold)/20 bg-(--gm-gold)/5 rounded-2xl">
              <div className="shrink-0 text-(--gm-gold-deep)">
                <ShieldCheck size={36} strokeWidth={1.4} />
              </div>
              <div>
                <div className="font-display text-[11px] tracking-[0.2em] text-(--gm-gold-deep) uppercase mb-2">
                  {tx('privacyPromiseTitle')}
                </div>
                <p className="text-(--gm-text-dim) font-light leading-relaxed text-sm">
                  {tx('privacyPromiseDesc')}
                </p>
              </div>
            </section>
          </>
        )}

        {tab === 'profile' && (
          <section className="rounded-2xl border border-(--gm-border-soft) bg-(--gm-surface) p-8 md:p-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-(--gm-gold)/10 flex items-center justify-center text-(--gm-gold-deep)">
                <UserIcon size={18} />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-(--gm-text)">
                {tx('profileInfo')}
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>{tx('fullName')}</FieldLabel>
                  <input
                    className={fieldClasses()}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={tx('fullNamePlaceholder')}
                  />
                </div>
                <div>
                  <FieldLabel>{tx('phone')}</FieldLabel>
                  <input
                    className={fieldClasses()}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>{tx('address')}</FieldLabel>
                <input
                  className={fieldClasses()}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>{tx('city')}</FieldLabel>
                <CityAutocomplete
                  value={formData.city}
                  onChange={(city) => setFormData({ ...formData, city })}
                  placeholder={tx('cityPlaceholder')}
                  country={locale === 'de' ? 'de' : 'tr'}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={upsertProfileState.isLoading}
                  className="btn-premium px-10 py-3 text-xs disabled:opacity-50"
                >
                  {upsertProfileState.isLoading
                    ? tx('saving')
                    : tx('saveChanges')}
                </button>
              </div>
            </form>
          </section>
        )}

        {tab === 'bookings' && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-(--gm-gold)/10 flex items-center justify-center text-(--gm-gold-deep)">
                <ShoppingBag size={18} />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-(--gm-text)">
                {tx('myBookings')}
              </h2>
            </div>

            {bookingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-(--gm-bg-deep) animate-pulse" />
                ))}
              </div>
            ) : !myBookings || myBookings.length === 0 ? (
              <div className="py-20 text-center space-y-6 rounded-2xl border border-dashed border-(--gm-border-soft)">
                <div className="w-16 h-16 rounded-full bg-(--gm-bg-deep) flex items-center justify-center mx-auto border border-(--gm-border-soft)">
                  <Calendar className="w-6 h-6 text-(--gm-muted)" />
                </div>
                <p className="text-(--gm-text-dim) font-serif italic">
                  {tx('noBookings')}
                </p>
                <Link href={localizePath(locale, '/consultants')} className="btn-premium inline-flex py-3 px-8">
                  {tx('findConsultants')}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {myBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-(--gm-border-soft) bg-(--gm-surface) p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-(--gm-gold)/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-(--gm-gold)/10 flex items-center justify-center text-(--gm-gold-deep) shrink-0 border border-(--gm-gold)/20 overflow-hidden">
                          {booking.consultant_avatar ? (
                            <img src={booking.consultant_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6 opacity-40" />
                          )}
                        </div>
                        {booking.status === 'confirmed' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-(--gm-success) rounded-full border-2 border-(--gm-surface) animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-[10px] font-bold text-(--gm-gold-deep) tracking-[0.2em] uppercase">
                            {tx('consultation')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                            booking.status === 'completed'
                              ? 'bg-(--gm-success)/10 text-(--gm-success)'
                              : booking.status === 'cancelled'
                              ? 'bg-(--gm-error)/10 text-(--gm-error)'
                              : 'bg-(--gm-gold)/10 text-(--gm-gold-deep)'
                          }`}>
                            {lang === 'tr' ? booking.status_label_tr || booking.status : booking.status_label_en || booking.status}
                          </span>
                        </div>
                        <h4 className="text-(--gm-text) font-serif text-xl group-hover:text-(--gm-gold) transition-colors">
                          {booking.resource_title || tx('consultant')}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-(--gm-muted) text-xs">
                           <span className="flex items-center gap-1.5"><Calendar size={13} /> {fmtDate(booking.appointment_date, locale)}</span>
                           <span className="flex items-center gap-1.5"><Clock size={13} /> {booking.appointment_time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {booking.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => setReviewModal({
                            isOpen: true,
                            targetId: booking.consultant_id || booking.resource_id,
                            consultantName: booking.resource_title || ''
                          })}
                          className="btn-outline-premium px-5 py-2.5 text-[10px]"
                        >
                          {tx('writeReview')}
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <Link
                          href={localizePath(locale, `/booking/${booking.id}/call`)}
                          className="btn-premium px-6 py-2.5 text-[10px] shadow-gold"
                        >
                          {tx('joinCall')}
                        </Link>
                      )}

                      <BookingMessageButton bookingId={booking.id} variant="secondary" label={tx('message')} />

                      <Link
                        href={localizePath(locale, `/booking/${booking.id}`)}
                        className="p-2.5 rounded-xl border border-(--gm-border-soft) text-(--gm-muted) hover:text-(--gm-gold) hover:border-(--gm-gold)/40 transition-all"
                        title={tx('details')}
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'history' && (
          <section>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-(--gm-gold)/10 flex items-center justify-center text-(--gm-gold-deep)">
                  <Sparkles size={18} />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-(--gm-text)">
                  {tx('readingHistory')}
                </h2>
              </div>

              {(history?.length ?? 0) > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--gm-error)/30 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-(--gm-error) transition hover:bg-(--gm-error)/10"
                    >
                      <Trash2 size={14} />
                      {tx('deleteAll')}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {tx('deleteAllConfirmTitle')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {tx('deleteAllConfirmDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tx('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllReadings}
                        disabled={deleteAllReadingsState.isLoading}
                      >
                        {tx('deleteAll')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {historyTypes.map((item) => {
                const active = historyFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setHistoryFilter(item.key)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                      active
                        ? 'border-(--gm-gold)/60 bg-(--gm-gold)/15 text-(--gm-gold-deep)'
                        : 'border-(--gm-border-soft) text-(--gm-text-dim) hover:border-(--gm-gold)/40 hover:text-(--gm-text)'
                    }`}
                  >
                    {item[lang]}
                  </button>
                );
              })}
            </div>

            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-(--gm-bg-deep) animate-pulse" />
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 text-center space-y-6 rounded-2xl border border-dashed border-(--gm-border-soft)">
                <div className="w-16 h-16 rounded-full bg-(--gm-bg-deep) flex items-center justify-center mx-auto border border-(--gm-border-soft)">
                  <Sparkles className="w-6 h-6 text-(--gm-muted)" />
                </div>
                <p className="text-(--gm-text-dim) font-serif italic">
                  {tx('noSavedReadings')}
                </p>
                <Link href={localizePath(locale, '/explore')} className="btn-premium inline-flex py-3 px-8">
                  {tx('getReading')}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredHistory.map((item) => {
                  const meta = { icon: DEFAULT_HISTORY_ICON };
                  const detailHref = localizePath(locale, '/dashboard');
                  return (
                    <article
                      key={`${item.type}:${item.id}`}
                      className="rounded-2xl border border-(--gm-border-soft) bg-(--gm-surface) p-5 md:p-6 transition hover:border-(--gm-gold)/40"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-(--gm-gold)/20 bg-(--gm-gold)/10 text-(--gm-gold-deep)">
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--gm-gold-deep)">
                                {tx('historyItemLabel')}
                              </span>
                              <span className="text-[10px] text-(--gm-muted)">
                                {fmtDate(item.created_at, locale)}
                              </span>
                            </div>
                            <h3 className="truncate font-serif text-lg text-(--gm-text)">
                              {item.title}
                            </h3>
                            <p className="mt-1 line-clamp-1 text-sm text-(--gm-text-dim)">
                              {item.snippet || tx('noPreview')}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Link
                            href={detailHref}
                            className="inline-flex items-center gap-2 rounded-xl border border-(--gm-border-soft) px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-(--gm-text-dim) transition hover:border-(--gm-gold)/40 hover:text-(--gm-gold)"
                          >
                            <Eye size={14} />
                            {tx('open')}
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-(--gm-error)/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-(--gm-error) transition hover:bg-(--gm-error)/10"
                              >
                                <Trash2 size={14} />
                                {tx('delete')}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {tx('deleteOneConfirmTitle')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {tx('deleteOneConfirmDesc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{tx('cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReading(item)}
                                  disabled={deleteReadingState.isLoading}
                                >
                                  {tx('delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Security / Password */}
        {tab === 'security' && (
          <section className="rounded-2xl border border-(--gm-border-soft) bg-(--gm-surface) p-8 md:p-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-(--gm-gold)/10 flex items-center justify-center text-(--gm-gold-deep)">
                <Lock size={18} />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-(--gm-text)">
                {tx('securitySettings')}
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <FieldLabel>{tx('currentPassword')}</FieldLabel>
                <input
                  type="password"
                  className={fieldClasses()}
                  value={passData.old}
                  onChange={(e) => setPassData({ ...passData, old: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>{tx('newPassword')}</FieldLabel>
                  <input
                    type="password"
                    className={fieldClasses()}
                    value={passData.new}
                    onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <FieldLabel>{tx('confirmPassword')}</FieldLabel>
                  <input
                    type="password"
                    className={fieldClasses()}
                    value={passData.confirm}
                    onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updateUserState.isLoading}
                  className="btn-premium px-10 py-3 text-xs disabled:opacity-50"
                >
                  {updateUserState.isLoading
                    ? tx('updating')
                    : tx('updatePassword')}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal((prev) => ({ ...prev, isOpen: false }))}
        targetId={reviewModal.targetId}
        targetType="consultant"
        consultantName={reviewModal.consultantName}
        locale={locale}
      />
    </main>
  );
}
