'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, RefreshCcw, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { QuoteRequestStatus } from '@/integrations/shared';
import { useListQuoteRequestsAdminQuery } from '@/integrations/hooks';

const STATUSES: Array<QuoteRequestStatus | 'all'> = ['all', 'new', 'contacted', 'quoted', 'won', 'lost'];

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export default function QuoteRequestsListClient() {
  const [status, setStatus] = React.useState<QuoteRequestStatus | 'all'>('all');
  const [q, setQ] = React.useState('');
  const query = useListQuoteRequestsAdminQuery({ status, q: q.trim() || undefined, limit: 50, offset: 0 });
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gm-text">Teklif Talepleri</h1>
          <p className="text-sm text-gm-muted">Okul serisi fiyat teklifi başvuruları</p>
        </div>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gm-muted" />
            <Input className="pl-9" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Kurum, yetkili, e-posta veya telefon ara" />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as QuoteRequestStatus | 'all')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kurum</TableHead>
                <TableHead>Yetkili</TableHead>
                <TableHead>Öğrenci</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.org_name}</TableCell>
                    <TableCell>{item.contact_name}<div className="text-xs text-gm-muted">{item.email}</div></TableCell>
                    <TableCell>{item.student_count} / {item.level}</TableCell>
                    <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/quote-requests/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Aç
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-gm-muted">Kayıt bulunamadı</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
