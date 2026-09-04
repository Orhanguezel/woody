'use client';

// =============================================================
// FILE: /[locale]/me/notifications
// Kullanicinin bildirim kutusu.
//
// Sitede bildirim sayfasi HIC yoktu; backend uclari da bos stub'di
// (`/notifications` -> []). Artik gercek modul var
// (backend/src/modules/notifications) ve siparis/odeme olaylari
// buraya kayit dusuyor.
// =============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Cinzel } from 'next/font/google';
import { Bell, Package, CreditCard, BookOpen, User, Megaphone, Settings, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from '@/integrations/rtk/hooks';

const cinzel = Cinzel({ subsets: ['latin'] });

/** Bildirim turune gore ikon + renk. */
const TYPE_META: Record<string, { icon: React.ElementType; tone: string; label: string }> = {
  order: { icon: Package, tone: 'text-sky-500', label: 'Sipariş' },
  payment: { icon: CreditCard, tone: 'text-emerald-500', label: 'Ödeme' },
  content: { icon: BookOpen, tone: 'text-violet-500', label: 'İçerik' },
  account: { icon: User, tone: 'text-amber-500', label: 'Hesap' },
  announcement: { icon: Megaphone, tone: 'text-brand-gold', label: 'Duyuru' },
  system: { icon: Settings, tone: 'text-muted-foreground', label: 'Sistem' },
};

function meta(type: string) {
  return TYPE_META[type] ?? TYPE_META.system;
}

/** "3 dakika önce" / "dün" gibi okunur zaman. */
function relativeTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dakika önce`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} saat önce`;
  const day = Math.floor(hour / 24);
  if (day === 1) return 'dün';
  if (day < 30) return `${day} gün önce`;
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useListNotificationsQuery({});
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, markAllState] = useMarkAllNotificationsReadMutation();
  const [removeNotification] = useDeleteNotificationMutation();

  const items = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const unread = items.filter((n) => !n.is_read).length;

  async function onMarkAll() {
    try {
      await markAllRead().unwrap();
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
      refetch();
    } catch {
      toast.error('İşlem tamamlanamadı');
    }
  }

  async function onRead(id: string) {
    try {
      await markRead({ id, is_read: true } as never).unwrap();
    } catch {
      toast.error('İşlem tamamlanamadı');
    }
  }

  async function onDelete(id: string) {
    try {
      await removeNotification({ id } as never).unwrap();
      toast.success('Bildirim silindi');
    } catch {
      toast.error('Silinemedi');
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-32">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="space-y-4 text-center">
          <h1 className={`${cinzel.className} text-4xl text-foreground md:text-5xl`}>Bildirimler</h1>
          <p className="font-serif italic text-muted-foreground">
            {unread > 0
              ? `${unread} okunmamış bildiriminiz var.`
              : 'Siparişleriniz ve hesabınızla ilgili gelişmeler burada görünür.'}
          </p>
        </div>

        {unread > 0 ? (
          <div className="flex justify-center">
            <button
              onClick={onMarkAll}
              disabled={markAllState.isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-surface/30 px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-brand-gold/40 hover:text-brand-gold disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Tümünü okundu işaretle
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-[2rem] border border-border/20 bg-surface/30" />
            ))}
          </div>
        ) : isError ? (
          <section className="rounded-[2.5rem] border border-border/20 bg-surface/30 p-10 text-center">
            <p className="text-muted-foreground">Bildirimler yüklenemedi.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-full border border-border/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand-gold"
            >
              Yeniden dene
            </button>
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-[2.5rem] border border-border/20 bg-surface/30 p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-6 font-serif italic text-muted-foreground">
              Henüz bildiriminiz yok.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              Sipariş verdiğinizde ve ödemeniz tamamlandığında burada bilgilendirilirsiniz.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {items.map((n, i) => {
              const m = meta(String(n.type ?? 'system'));
              const Icon = m.icon;
              return (
                <motion.article
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className={`group rounded-[2rem] border p-6 transition-colors md:p-8 ${
                    n.is_read
                      ? 'border-border/20 bg-surface/20'
                      : 'border-brand-gold/30 bg-brand-gold/[0.06]'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className="mt-1 shrink-0">
                      <Icon className={`h-6 w-6 ${m.tone}`} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-bold text-foreground">{n.title}</h2>
                        {!n.is_read ? (
                          <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                            Yeni
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                        <span>{m.label}</span>
                        <span>·</span>
                        <span>{relativeTime(String(n.created_at ?? ''))}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {!n.is_read ? (
                        <button
                          onClick={() => onRead(String(n.id))}
                          title="Okundu işaretle"
                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-high hover:text-brand-gold"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => onDelete(String(n.id))}
                        title="Sil"
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-high hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
