'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, RefreshCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type Props = {
  kind: 'series' | 'levels';
};

export default function CatalogTaxonomyListClient({ kind }: Props) {
  const isSeries = kind === 'series';
  const [locale, setLocale] = React.useState('tr');
  const seriesQ = useListSeriesAdminQuery({ locale }, { skip: !isSeries });
  const levelsQ = useListLevelsAdminQuery({ locale }, { skip: isSeries });
  const q = isSeries ? seriesQ : levelsQ;
  const rows = q.data ?? [];
  const base = isSeries ? '/admin/series' : '/admin/levels';
  const [updateSeries, updateSeriesState] = useUpdateSeriesAdminMutation();
  const [updateLevel, updateLevelState] = useUpdateLevelAdminMutation();
  const updating = updateSeriesState.isLoading || updateLevelState.isLoading;

  async function toggleActive(id: string, isActive: boolean) {
    const body = { locale, is_active: isActive };
    if (isSeries) await updateSeries({ id, body });
    else await updateLevel({ id, body });
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">
            Woody Store
          </p>
          <h1 className="font-serif text-4xl text-gm-text">{isSeries ? 'Seriler' : 'Seviyeler'}</h1>
        </div>
        <div className="flex gap-3">
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="h-10 w-24 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['tr', 'en', 'de', 'fr', 'es', 'it', 'ar', 'ru', 'pt', 'nl'].map((item) => (
                <SelectItem key={item} value={item}>
                  {item.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => q.refetch()} className="rounded-full">
            <RefreshCcw className="mr-2 size-4" />
            Yenile
          </Button>
          <Button asChild className="rounded-full">
            <Link href={`${base}/new`}>
              <Plus className="mr-2 size-4" />
              Yeni
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[24px] border-gm-border-soft bg-gm-surface/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Kod</TableHead>
                {!isSeries ? <TableHead>Rank</TableHead> : null}
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name || row.code}</TableCell>
                  <TableCell>{row.code}</TableCell>
                  {!isSeries ? <TableCell>{row.rank ?? '-'}</TableCell> : null}
                  <TableCell>{row.display_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={row.is_active}
                        disabled={updating}
                        onCheckedChange={(checked) => toggleActive(row.id, checked)}
                      />
                      <Badge variant={row.is_active ? 'default' : 'secondary'}>
                        {row.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={`${base}/${encodeURIComponent(row.id)}`}>Düzenle</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={isSeries ? 5 : 6} className="py-16 text-center text-gm-muted">
                    Kayıt yok
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
