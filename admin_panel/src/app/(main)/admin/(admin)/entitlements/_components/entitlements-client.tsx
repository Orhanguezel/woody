'use client';

import * as React from 'react';
import { CalendarClock, Gift, RefreshCcw, Search, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  useCreateEntitlementAdminMutation,
  useListEntitlementsAdminQuery,
  useListProductsAdminQuery,
  useListUsersAdminQuery,
  useUpdateEntitlementAdminMutation,
} from '@/integrations/hooks';

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
}

function fmtDate(value: string | null) {
  if (!value) return 'Süresiz';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('tr-TR');
}

export default function EntitlementsClient() {
  const [status, setStatus] = React.useState('all');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [productId, setProductId] = React.useState('all');
  const [userId, setUserId] = React.useState('');
  const [grantProductId, setGrantProductId] = React.useState('');
  const [grantDays, setGrantDays] = React.useState('');
  const [userSearch, setUserSearch] = React.useState('');
  const [extendDays, setExtendDays] = React.useState('30');
  const [open, setOpen] = React.useState(false);

  const entitlementsQ = useListEntitlementsAdminQuery({
    q: search || undefined,
    status: status === 'all' ? undefined : status,
    productId: productId === 'all' ? undefined : productId,
    limit: 100,
  });
  const productsQ = useListProductsAdminQuery({ locale: 'tr', limit: 200, sort: 'order_num', order: 'asc' });
  const usersQ = useListUsersAdminQuery({ q: userSearch || undefined, limit: 20 });
  const [createEntitlement, createState] = useCreateEntitlementAdminMutation();
  const [updateEntitlement, updateState] = useUpdateEntitlementAdminMutation();

  const rows = entitlementsQ.data?.data ?? [];
  const products = productsQ.data ?? [];
  const users = usersQ.data ?? [];
  const fetching = entitlementsQ.isFetching || productsQ.isFetching;

  function doSearch() {
    setSearch(searchInput.trim());
  }

  async function grant() {
    if (!userId || !grantProductId) {
      toast.error('Kullanıcı ve ürün seç');
      return;
    }
    const days = grantDays.trim() ? Number(grantDays) : null;
    if (days !== null && (!Number.isFinite(days) || days < 1)) {
      toast.error('Süre boş veya pozitif gün olmalı');
      return;
    }
    try {
      await createEntitlement({ userId, productId: grantProductId, days }).unwrap();
      toast.success('Erişim verildi');
      setOpen(false);
      setUserId('');
      setGrantProductId('');
      setGrantDays('');
      entitlementsQ.refetch();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function extend(id: string) {
    const days = Number(extendDays);
    if (!Number.isFinite(days) || days < 1) {
      toast.error('Uzatma günü pozitif olmalı');
      return;
    }
    try {
      await updateEntitlement({ id, body: { days } }).unwrap();
      toast.success('Erişim uzatıldı');
      entitlementsQ.refetch();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function revoke(id: string) {
    try {
      await updateEntitlement({ id, body: { revoke: true, status: 'revoked' } }).unwrap();
      toast.success('Erişim iptal edildi');
      entitlementsQ.refetch();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">
              Woody Store
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Erişim Hakları</h1>
          <p className="text-sm font-serif italic text-gm-muted">
            Satın alınan, ücretsiz veya manuel verilen içerik erişimleri.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => entitlementsQ.refetch()}
            disabled={fetching}
            className="rounded-full border-gm-border-soft px-8 h-12 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCcw className={cn('mr-2 size-4', fetching && 'animate-spin')} />
            Yenile
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-8 h-12 text-[10px] font-bold uppercase tracking-widest">
                <Gift className="mr-2 size-4" />
                Erişim Ver
              </Button>
            </DialogTrigger>
            <DialogContent className="border-gm-border-soft bg-gm-bg-deep sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Manuel Erişim Ver</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5">
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Kullanıcı ara</Label>
                  <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="E-posta veya ad"
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Kullanıcı</Label>
                  <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue placeholder="Kullanıcı seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} {user.full_name ? `· ${user.full_name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
                  <div className="space-y-3">
                    <Label className={LABEL_CLS}>Ürün</Label>
                    <Select value={grantProductId} onValueChange={setGrantProductId}>
                      <SelectTrigger className={INPUT_CLS}>
                        <SelectValue placeholder="Ürün seç" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className={LABEL_CLS}>Süre</Label>
                    <Input
                      value={grantDays}
                      onChange={(e) => setGrantDays(e.target.value)}
                      placeholder="Boş = süresiz"
                      inputMode="numeric"
                      className={cn(INPUT_CLS, 'font-mono')}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">
                  İptal
                </Button>
                <Button onClick={grant} disabled={createState.isLoading} className="rounded-full">
                  Erişim Ver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 grid gap-8 md:grid-cols-2 xl:grid-cols-4 items-end">
          <div className="space-y-3 md:col-span-2">
            <Label className={LABEL_CLS}>Ara</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/60" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder="Kullanıcı veya ürün ara"
                className={cn(INPUT_CLS, 'pl-12')}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className={LABEL_CLS}>Ürün</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className={INPUT_CLS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                <SelectItem value="all">Tüm ürünler</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className={LABEL_CLS}>Durum</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className={INPUT_CLS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="expired">Süresi doldu</SelectItem>
                <SelectItem value="revoked">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kullanıcı</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Ürün</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kaynak</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">Bitiş</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">Durum</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entitlementsQ.isFetching && rows.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gm-border-soft">
                    <TableCell colSpan={6} className="p-6">
                      <Skeleton className="h-10 w-full bg-gm-surface/20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center text-gm-muted font-serif italic">
                    Kayıt yok
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03]">
                    <TableCell className="py-6 px-8">
                      <div className="font-serif text-lg text-gm-text">{row.userName || row.userEmail || row.userId}</div>
                      <div className="text-[10px] font-mono text-gm-muted">{row.userEmail}</div>
                    </TableCell>
                    <TableCell className="py-6 text-sm text-gm-muted">{row.productTitle || row.productId}</TableCell>
                    <TableCell className="py-6 text-center">
                      <Badge variant="outline" className="rounded-full border-gm-border-soft text-[9px] uppercase tracking-widest">
                        {row.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-xs">{fmtDate(row.expiresAt)}</span>
                        <span className="text-[9px] uppercase tracking-widest text-gm-muted">
                          {row.remainingDays == null ? 'Süresiz' : `${row.remainingDays} gün`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <Badge
                        className={cn(
                          'rounded-full text-[9px] uppercase tracking-widest',
                          row.status === 'active'
                            ? 'bg-gm-success/10 text-gm-success'
                            : 'bg-gm-error/10 text-gm-error',
                        )}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-2">
                        <Input
                          value={extendDays}
                          onChange={(e) => setExtendDays(e.target.value)}
                          inputMode="numeric"
                          className="h-9 w-20 rounded-full bg-gm-surface/30 text-center font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateState.isLoading}
                          onClick={() => extend(row.id)}
                          className="rounded-full"
                        >
                          <CalendarClock className="mr-2 size-4" />
                          Uzat
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={updateState.isLoading || row.status === 'revoked'}
                          onClick={() => revoke(row.id)}
                          className="rounded-full hover:bg-gm-error/10 hover:text-gm-error"
                        >
                          <ShieldOff className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
