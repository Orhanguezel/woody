'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { QuoteRequestStatus } from '@/integrations/shared';
import { useGetQuoteRequestAdminQuery, useUpdateQuoteRequestAdminMutation } from '@/integrations/hooks';

const STATUSES: QuoteRequestStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost'];

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
}

export default function QuoteRequestDetailClient({ id }: { id: string }) {
  const query = useGetQuoteRequestAdminQuery({ id });
  const [update, updateState] = useUpdateQuoteRequestAdminMutation();
  const [status, setStatus] = React.useState<QuoteRequestStatus>('new');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (!query.data) return;
    setStatus(query.data.status);
    setMessage(query.data.message ?? '');
  }, [query.data]);

  async function save() {
    try {
      await update({ id, body: { status, message } }).unwrap();
      toast.success('Teklif talebi güncellendi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  const item = query.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-3">
            <Link href="/admin/quote-requests"><ArrowLeft className="mr-2 h-4 w-4" />Geri</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gm-text">Teklif Talebi</h1>
        </div>
        {item ? <Badge variant="outline">{item.status}</Badge> : null}
      </div>

      {query.isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : item ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
            <CardHeader><CardTitle>Başvuru Bilgileri</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                ['Kurum', item.org_name],
                ['Yetkili', item.contact_name],
                ['E-posta', item.email],
                ['Telefon', item.phone || '-'],
                ['Öğrenci sayısı', String(item.student_count)],
                ['Seviye', item.level],
                ['İl / İlçe', [item.city, item.district].filter(Boolean).join(' / ') || '-'],
                ['Kaynak', item.source],
                ['Oluşturulma', formatDate(item.created_at)],
                ['Güncellenme', formatDate(item.updated_at)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gm-border-soft bg-gm-background/60 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gm-muted">{label}</div>
                  <div className="mt-1 text-sm font-medium text-gm-text">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
            <CardHeader><CardTitle>Durum ve Not</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as QuoteRequestStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mesaj / Admin Notu</Label>
                <Textarea className="min-h-40" value={message} onChange={(event) => setMessage(event.target.value)} />
              </div>
              <Button onClick={save} disabled={updateState.isLoading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-gm-muted">Kayıt bulunamadı</CardContent></Card>
      )}
    </div>
  );
}
