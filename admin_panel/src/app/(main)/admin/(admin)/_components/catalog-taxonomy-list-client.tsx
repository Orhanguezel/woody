'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  EyeOff,
  Layers3,
  Plus,
  RefreshCcw,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useListLevelsAdminQuery,
  useListSeriesAdminQuery,
  useUpdateLevelAdminMutation,
  useUpdateSeriesAdminMutation,
} from '@/integrations/hooks';
import { cn } from '@/lib/utils';

type Props = {
  kind: 'series' | 'levels';
};

const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'it', 'ar', 'ru', 'pt', 'nl'];

export default function CatalogTaxonomyListClient({ kind }: Props) {
  const isSeries = kind === 'series';
  const [locale, setLocale] = React.useState('tr');
  const [search, setSearch] = React.useState('');
  const deferredSearch = React.useDeferredValue(search.trim().toLocaleLowerCase('tr-TR'));
  const seriesQ = useListSeriesAdminQuery({ locale }, { skip: !isSeries });
  const levelsQ = useListLevelsAdminQuery({ locale }, { skip: isSeries });
  const q = isSeries ? seriesQ : levelsQ;
  const allRows = q.data ?? [];
  const rows = React.useMemo(() => {
    if (!deferredSearch) return allRows;
    return allRows.filter((row) =>
      [row.name, row.code, row.slug].some((value) => value?.toLocaleLowerCase('tr-TR').includes(deferredSearch)),
    );
  }, [allRows, deferredSearch]);
  const activeCount = allRows.filter((row) => row.is_active).length;
  const passiveCount = allRows.length - activeCount;
  const base = isSeries ? '/admin/series' : '/admin/levels';
  const title = isSeries ? 'Seriler' : 'Seviyeler';
  const singular = isSeries ? 'Seri' : 'Seviye';
  const [updateSeries, updateSeriesState] = useUpdateSeriesAdminMutation();
  const [updateLevel, updateLevelState] = useUpdateLevelAdminMutation();
  const updating = updateSeriesState.isLoading || updateLevelState.isLoading;

  async function toggleActive(id: string, isActive: boolean) {
    const body = { locale, is_active: isActive };
    if (isSeries) await updateSeries({ id, body });
    else await updateLevel({ id, body });
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">Woody Store</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{title}</h1>
          <p className="font-serif text-sm italic text-gm-muted opacity-70">
            Ürün kataloğundaki {title.toLocaleLowerCase('tr-TR')} ve yayın durumlarını yönetin.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="group relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gm-muted/50 transition-colors group-focus-within:text-gm-gold" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`${singular} ara...`}
              className="h-12 rounded-2xl border-gm-border-soft bg-gm-surface/40 pl-12 text-sm focus:ring-gm-gold/50"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
            className="h-12 rounded-full border-gm-border-soft bg-gm-surface/50 px-6 text-[10px] font-bold uppercase tracking-widest shadow-lg"
          >
            <RefreshCcw className={cn('mr-2 size-4', q.isFetching && 'animate-spin')} />
            Yenile
          </Button>
          <Button asChild className="h-12 rounded-full px-7 text-[10px] font-bold uppercase tracking-widest shadow-lg">
            <Link href={`${base}/new`}>
              <Plus className="mr-2 size-4" />
              Yeni {singular}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <StatCard label={`Toplam ${singular}`} value={allRows.length} icon={Layers3} accent="gold" />
        <StatCard label="Aktif" value={activeCount} icon={CheckCircle2} accent="success" />
        <StatCard label="Pasif" value={passiveCount} icon={EyeOff} accent="muted" />
      </div>

      <Card className="overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-surface/20 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 border-b border-gm-border-soft bg-gm-surface/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-xl text-gm-text">{title} Listesi</h2>
            <p className="mt-1 text-xs text-gm-muted">{rows.length} kayıt gösteriliyor</p>
          </div>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="h-10 w-full rounded-full border-gm-border-soft bg-gm-surface/50 px-4 text-xs sm:w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((item) => (
                <SelectItem key={item} value={item}>{item.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Ad</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kod</TableHead>
                {!isSeries ? <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Rank</TableHead> : null}
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Sıra</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Durum</TableHead>
                <TableHead className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gm-border-soft">
                    <TableCell className="px-8 py-6"><Skeleton className="h-10 w-52 bg-gm-surface/20" /></TableCell>
                    <TableCell colSpan={isSeries ? 4 : 5} className="py-6"><Skeleton className="h-10 w-full bg-gm-surface/20" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id} className="group border-gm-border-soft transition-colors hover:bg-gm-primary/[0.03]">
                    <TableCell className="px-8 py-6">
                      <div className="font-serif text-lg text-gm-text transition-colors group-hover:text-gm-primary">{row.name || row.code}</div>
                      <div className="mt-1 max-w-64 truncate text-xs text-gm-muted">/{row.slug}</div>
                    </TableCell>
                    <TableCell className="py-6 font-mono text-xs text-gm-muted">{row.code}</TableCell>
                    {!isSeries ? <TableCell className="py-6 font-serif text-lg text-gm-text">{row.rank ?? '-'}</TableCell> : null}
                    <TableCell className="py-6 font-serif text-lg text-gm-text">{row.display_order}</TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <Switch checked={row.is_active} disabled={updating} onCheckedChange={(checked) => toggleActive(row.id, checked)} />
                        <span className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em]',
                          row.is_active
                            ? 'border-gm-success/20 bg-gm-success/5 text-gm-success'
                            : 'border-gm-muted/20 bg-gm-muted/5 text-gm-muted',
                        )}>
                          <span className={cn('size-1.5 rounded-full', row.is_active ? 'bg-gm-success' : 'bg-gm-muted')} />
                          {row.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-10 rounded-full px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-gm-gold/10 hover:text-gm-gold">
                        <Link href={`${base}/${encodeURIComponent(row.id)}`}>
                          Düzenle
                          <ChevronRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isSeries ? 5 : 6} className="py-28 text-center">
                    <div className="flex flex-col items-center gap-5 opacity-30">
                      <Layers3 className="size-16 text-gm-gold/50" />
                      <span className="font-serif text-xl italic text-gm-muted">Kayıt bulunamadı.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accent: 'gold' | 'success' | 'muted';
}) {
  const color = accent === 'success' ? 'text-gm-success' : accent === 'muted' ? 'text-gm-muted' : 'text-gm-gold';
  const hover = accent === 'success' ? 'hover:border-gm-success/20' : accent === 'muted' ? 'hover:border-gm-muted/30' : 'hover:border-gm-gold/20';
  return (
    <Card className={cn('group relative overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-bg-deep/40 p-8 shadow-xl backdrop-blur-md transition-all', hover)}>
      <div className="absolute -right-4 -top-4 p-8 opacity-5 transition-all duration-700 group-hover:scale-125 group-hover:opacity-10">
        <Icon size={100} className={color} />
      </div>
      <div className="relative z-10 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">{label}</p>
        <div className={cn('font-serif text-5xl text-gm-text', accent !== 'gold' && color)}>{value}</div>
      </div>
    </Card>
  );
}
