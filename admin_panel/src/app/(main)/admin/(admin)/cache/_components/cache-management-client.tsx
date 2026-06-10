'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { BookOpen, GraduationCap, Library, Newspaper, ShoppingBag, Trash2, RefreshCcw, Globe } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

async function revalidate(opts: { all?: boolean; path?: string }) {
  const res = await fetch('/admin/api/revalidate-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Revalidation failed');
  return data;
}

const CACHE_ACTIONS = [
  {
    id: 'all',
    label: 'Tüm Site Cache',
    description:
      "Tüm sayfaların cache'ini temizler. Tema/tasarım değişiklikleri ve site ayarları için bunu kullanın.",
    icon: Globe,
    action: () => revalidate({ all: true }),
    variant: 'destructive' as const,
  },
  {
    id: 'home',
    label: 'Ana Sayfa',
    description: "Ana sayfanın cache'ini temizler.",
    icon: Globe,
    action: () => revalidate({ path: '/tr' }),
  },
  {
    id: 'preschool',
    label: 'Preschool',
    description: "Okul serisi sayfasının cache'ini temizler.",
    icon: GraduationCap,
    action: () => revalidate({ path: '/tr/preschool' }),
  },
  {
    id: 'workshop',
    label: 'Workshop',
    description: "Atölye serisi sayfasının cache'ini temizler.",
    icon: BookOpen,
    action: () => revalidate({ path: '/tr/workshop' }),
  },
  {
    id: 'store',
    label: 'Store',
    description: "Mağaza ve ürün sayfalarının cache'ini temizler.",
    icon: ShoppingBag,
    action: () => revalidate({ path: '/tr/store' }),
  },
  {
    id: 'library',
    label: 'Library',
    description: "Dijital kütüphane sayfasının cache'ini temizler.",
    icon: Library,
    action: () => revalidate({ path: '/tr/library' }),
  },
  {
    id: 'blog',
    label: 'Blog',
    description: "Blog liste sayfasının cache'ini temizler.",
    icon: Newspaper,
    action: () => revalidate({ path: '/tr/blog' }),
  },
];

export default function CacheManagementClient() {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [lastCleared, setLastCleared] = React.useState<Record<string, string>>({});

  async function handleClear(id: string, action: () => Promise<any>) {
    setLoading(id);
    try {
      await action();
      const now = new Date().toLocaleTimeString('tr-TR');
      setLastCleared((prev) => ({ ...prev, [id]: now }));
      toast.success(id === 'all' ? 'Tüm site cache temizlendi' : 'Cache temizlendi');
    } catch (err: any) {
      toast.error(err?.message || 'Cache temizlenemedi');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-px bg-gm-gold" />
          <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Önbellek</span>
        </div>
        <h1 className="font-serif text-4xl text-gm-text">Cache Yönetimi</h1>
        <p className="text-gm-muted text-sm font-serif italic opacity-70">
          Frontend sayfalarının cache&apos;ini temizleyin. İçerik güncellemelerinin anında görünmesini sağlar.
        </p>
      </div>

      {/* Actions Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Hızlı Temizle</span>
          </div>
          {CACHE_ACTIONS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-5 hover:bg-gm-primary/[0.03] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shadow-inner border',
                    item.variant === 'destructive'
                      ? 'bg-gm-error/10 text-gm-error border-gm-error/20'
                      : 'bg-gm-gold/10 text-gm-gold border-gm-gold/20'
                  )}
                >
                  <item.icon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-gm-text">{item.label}</span>
                    {lastCleared[item.id] && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-gm-surface/50 border border-gm-border-soft text-gm-muted font-mono">
                        {lastCleared[item.id]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gm-muted opacity-70 mt-0.5">{item.description}</p>
                </div>
              </div>
              <Button
                variant={item.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleClear(item.id, item.action)}
                disabled={loading !== null}
                className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px] shrink-0"
              >
                {loading === item.id ? (
                  <RefreshCcw className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Temizle
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-lg">
        <CardContent className="p-8 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Bilgi</span>
          </div>
          <p className="text-sm text-gm-muted opacity-80">
            Frontend sayfaları 5 dakika (300 saniye) boyunca cache&apos;lenir. Cache temizlendiğinde sayfalar bir
            sonraki ziyarette API&apos;den taze veri çeker.
          </p>
          <p className="text-sm text-gm-muted opacity-80">
            Tema şablonu uygulandığında otomatik olarak tüm cache temizlenir — el ile temizlemeye gerek yoktur.
            Sadece içerik (yorumlar, ürünler vb.) güncellendiğinde bu sayfayı kullanın.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
