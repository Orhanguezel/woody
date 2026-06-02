'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCcw,
  Search,
  User,
  Wallet,
  X,
  AlertCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

import type {
  WalletAdminView,
  WalletPaymentMethod,
  WalletPaymentStatus,
  WalletTransactionView,
} from '@/integrations/shared';
import {
  useAdjustWalletAdminMutation,
  useApproveWalletDepositAdminMutation,
  useListWalletDepositsAdminQuery,
  useListWalletsAdminQuery,
  useListWalletTransactionsAdminQuery,
  usePatchWalletStatusAdminMutation,
  useRejectWalletDepositAdminMutation,
} from '@/integrations/hooks';

function fmtMoney(v: string | number, currency: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return `${v} ${currency}`;
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function fmtDate(v: string | null | undefined) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('de-DE');
}

function errMsg(err: unknown, fallback: string) {
  const e = err as any;
  return e?.data?.error || e?.data?.message || e?.error || e?.message || fallback;
}

function statusTone(status: WalletPaymentStatus | string) {
  if (status === 'completed') return 'success' as const;
  if (status === 'failed' || status === 'refunded') return 'error' as const;
  return 'warning' as const;
}

const TH = 'py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted';
const THX = 'py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted';
const FIELD = 'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const LABEL = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

function Pill({ tone, children }: { tone: 'success' | 'error' | 'warning' | 'muted'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border',
        tone === 'success' ? 'bg-gm-success/10 text-gm-success border-gm-success/20' :
        tone === 'error' ? 'bg-gm-error/10 text-gm-error border-gm-error/20' :
        tone === 'warning' ? 'bg-gm-warning/10 text-gm-warning border-gm-warning/20' :
        'bg-gm-surface/40 text-gm-muted border-gm-border-soft'
      )}
    >
      {children}
    </span>
  );
}

function Pager({
  label,
  hasPrev,
  hasNext,
  busy,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: {
  label: string;
  hasPrev: boolean;
  hasNext: boolean;
  busy: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 pt-2">
      <div className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase bg-gm-surface/30 px-6 py-3 rounded-full border border-gm-border-soft">
        {label}
      </div>
      <div className="flex gap-4">
        <Button
          variant="ghost"
          disabled={!hasPrev || busy}
          onClick={onPrev}
          className="rounded-full px-8 h-12 hover:bg-gm-gold/10 hover:text-gm-gold transition-all font-bold tracking-widest uppercase text-[10px] border border-transparent hover:border-gm-gold/20 disabled:opacity-30"
        >
          <ChevronLeft className="mr-2 size-4" />
          {prevLabel}
        </Button>
        <Button
          variant="ghost"
          disabled={!hasNext || busy}
          onClick={onNext}
          className="rounded-full px-8 h-12 hover:bg-gm-gold/10 hover:text-gm-gold transition-all font-bold tracking-widest uppercase text-[10px] border border-transparent hover:border-gm-gold/20 disabled:opacity-30"
        >
          {nextLabel}
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminWalletClient() {
  const t = useAdminT('admin.wallet');

  const [walletPage, setWalletPage] = React.useState(1);
  const [walletLimit] = React.useState(20);

  const [depositPage, setDepositPage] = React.useState(1);
  const [depositLimit] = React.useState(20);
  const [depositStatus, setDepositStatus] = React.useState<WalletPaymentStatus | 'all'>('pending');
  const [depositMethod, setDepositMethod] = React.useState<WalletPaymentMethod | 'all'>('all');
  const [searchUserId, setSearchUserId] = React.useState('');

  const walletsQ = useListWalletsAdminQuery({ page: walletPage, limit: walletLimit });
  const depositsQ = useListWalletDepositsAdminQuery({
    page: depositPage,
    limit: depositLimit,
    payment_status: depositStatus === 'all' ? undefined : depositStatus,
    payment_method: depositMethod === 'all' ? undefined : depositMethod,
    user_id: searchUserId.trim() || undefined,
  });

  const [patchWalletStatus, patchWalletStatusState] = usePatchWalletStatusAdminMutation();
  const [approveDeposit, approveDepositState] = useApproveWalletDepositAdminMutation();
  const [rejectDeposit, rejectDepositState] = useRejectWalletDepositAdminMutation();
  const [adjustWallet, adjustWalletState] = useAdjustWalletAdminMutation();

  const [txOpen, setTxOpen] = React.useState(false);
  const [selectedWallet, setSelectedWallet] = React.useState<WalletAdminView | null>(null);

  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [adjustUserId, setAdjustUserId] = React.useState('');
  const [adjustType, setAdjustType] = React.useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = React.useState('');
  const [adjustPurpose, setAdjustPurpose] = React.useState('');
  const [adjustDesc, setAdjustDesc] = React.useState('');

  const txQ = useListWalletTransactionsAdminQuery(
    { walletId: selectedWallet?.id || '', page: 1, limit: 50 },
    { skip: !selectedWallet?.id || !txOpen },
  );

  const busy =
    walletsQ.isFetching ||
    depositsQ.isFetching ||
    patchWalletStatusState.isLoading ||
    approveDepositState.isLoading ||
    rejectDepositState.isLoading ||
    adjustWalletState.isLoading;

  const wallets = walletsQ.data?.data ?? [];
  const deposits = depositsQ.data?.data ?? [];

  async function onWalletStatusChange(row: WalletAdminView, next: WalletAdminView['status']) {
    try {
      await patchWalletStatus({ id: row.id, body: { status: next } }).unwrap();
      toast.success(t('messages.walletStatusUpdated', {}, 'Cüzdan durumu güncellendi'));
      walletsQ.refetch();
    } catch (e) {
      toast.error(errMsg(e, t('messages.operationFailed', {}, 'İşlem başarısız')));
    }
  }

  async function onApproveDeposit(tx: WalletTransactionView) {
    try {
      await approveDeposit({ id: tx.id }).unwrap();
      toast.success(t('messages.depositApproved', {}, 'Yatırım onaylandı'));
      depositsQ.refetch();
      walletsQ.refetch();
      if (selectedWallet?.id === tx.wallet_id) txQ.refetch();
    } catch (e) {
      toast.error(errMsg(e, t('messages.operationFailed', {}, 'İşlem başarısız')));
    }
  }

  async function onRejectDeposit(tx: WalletTransactionView) {
    const reason = window.prompt(t('messages.rejectPrompt', {}, 'Red nedeni (opsiyonel):')) || undefined;
    try {
      await rejectDeposit({ id: tx.id, body: reason ? { reason } : {} }).unwrap();
      toast.success(t('messages.depositRejected', {}, 'Yatırım reddedildi'));
      depositsQ.refetch();
      if (selectedWallet?.id === tx.wallet_id) txQ.refetch();
    } catch (e) {
      toast.error(errMsg(e, t('messages.operationFailed', {}, 'İşlem başarısız')));
    }
  }

  function openAdjustForUser(row: WalletAdminView) {
    setAdjustUserId(row.user_id);
    setAdjustType('credit');
    setAdjustAmount('');
    setAdjustPurpose('');
    setAdjustDesc('');
    setAdjustOpen(true);
  }

  async function onAdjustSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(adjustAmount);
    if (!amount || amount <= 0) {
      toast.error('Geçerli bir tutar girin');
      return;
    }
    if (!adjustPurpose.trim()) {
      toast.error('Amaç alanı zorunlu');
      return;
    }
    try {
      await adjustWallet({
        user_id: adjustUserId,
        type: adjustType,
        amount,
        purpose: adjustPurpose.trim(),
        description: adjustDesc.trim() || undefined,
        payment_status: 'completed',
      }).unwrap();
      toast.success(t('messages.adjustSuccess', {}, 'Bakiye ayarlandı'));
      setAdjustOpen(false);
      walletsQ.refetch();
    } catch (e) {
      toast.error(errMsg(e, t('messages.operationFailed', {}, 'İşlem başarısız')));
    }
  }

  function openWalletTx(row: WalletAdminView) {
    setSelectedWallet(row);
    setTxOpen(true);
  }

  const walletHasPrev = walletPage > 1;
  const walletHasNext = (walletsQ.data?.data?.length ?? 0) >= walletLimit;

  const depositsHasPrev = depositPage > 1;
  const depositsHasNext = (depositsQ.data?.data?.length ?? 0) >= depositLimit;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Finans</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title', {}, 'Wallet & Ödemeler')}</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {t('description', {}, 'Wallet bakiyeleri, yatırım talepleri ve ödeme onay süreçleri')}
          </p>
        </div>
        <div className="flex items-center bg-gm-surface/20 px-6 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              walletsQ.refetch();
              depositsQ.refetch();
              if (txOpen) txQ.refetch();
            }}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn('mr-2 size-4', busy && 'animate-spin')} />
            {t('actions.refresh', {}, 'Yenile')}
          </Button>
        </div>
      </div>

      {/* Wallets Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-8 pt-7 pb-2">
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('wallets.title', {}, 'Cüzdanlar')}
            </span>
            <span className="text-[10px] text-gm-muted italic font-serif opacity-60">
              {t('wallets.desc', {}, 'Kullanıcı bakiyeleri ve durum yönetimi')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className={THX}>{t('wallets.table.user', {}, 'Kullanıcı')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('wallets.table.balance', {}, 'Bakiye')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('wallets.table.earnings', {}, 'Toplam Giriş')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('wallets.table.withdrawn', {}, 'Toplam Çıkış')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('wallets.table.status', {}, 'Durum')}</TableHead>
                  <TableHead className={cn(THX, 'text-right')}>{t('wallets.table.actions', {}, 'Aksiyon')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletsQ.isFetching && wallets.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-gm-border-soft">
                      <TableCell className="py-6 px-8"><Skeleton className="h-10 w-40 bg-gm-surface/20" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-10 w-32 bg-gm-surface/20 mx-auto rounded-2xl" /></TableCell>
                      <TableCell className="py-6 px-8"><Skeleton className="h-9 w-48 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <AlertCircle className="w-14 h-14 text-gm-gold/50" />
                        <span className="font-serif italic text-base text-gm-muted">{t('wallets.empty', {}, 'Kayıt bulunamadı')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((row) => (
                    <TableRow key={row.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gm-surface border border-gm-border-soft flex items-center justify-center text-gm-muted/60 group-hover:border-gm-gold/50 transition-all shadow-inner">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{row.full_name || '-'}</div>
                            <div className="text-[10px] text-gm-muted font-mono opacity-50 tracking-tighter">{row.email || row.user_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center font-serif text-base text-gm-text font-bold">{fmtMoney(row.balance, row.currency)}</TableCell>
                      <TableCell className="py-6 text-center text-sm text-gm-success">{fmtMoney(row.total_earnings, row.currency)}</TableCell>
                      <TableCell className="py-6 text-center text-sm text-gm-muted">{fmtMoney(row.total_withdrawn, row.currency)}</TableCell>
                      <TableCell className="py-6 text-center">
                        <Select value={row.status} onValueChange={(v) => onWalletStatusChange(row, v as WalletAdminView['status'])}>
                          <SelectTrigger className="w-[130px] mx-auto bg-gm-surface/40 border-gm-border-soft rounded-2xl h-10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                            <SelectItem value="active">active</SelectItem>
                            <SelectItem value="suspended">suspended</SelectItem>
                            <SelectItem value="closed">closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <div className="inline-flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={() => openWalletTx(row)} className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold text-[10px] font-bold uppercase tracking-widest">
                            <Wallet className="mr-2 size-4" />
                            {t('wallets.actions.transactions', {}, 'İşlemler')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openAdjustForUser(row)} className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold text-[10px] font-bold uppercase tracking-widest">
                            <Plus className="mr-2 size-4" />
                            {t('wallets.actions.adjust', {}, 'Bakiye Ayarla')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-8 pb-6">
            <Pager
              label={t('labels.page', { page: walletPage }, `Sayfa ${walletPage}`)}
              hasPrev={walletHasPrev}
              hasNext={walletHasNext}
              busy={busy}
              onPrev={() => setWalletPage((p) => Math.max(1, p - 1))}
              onNext={() => setWalletPage((p) => p + 1)}
              prevLabel={t('actions.prev', {}, 'Önceki')}
              nextLabel={t('actions.next', {}, 'Sonraki')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deposits filters */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('deposits.title', {}, 'Yatırım Talepleri')}
            </span>
            <span className="text-[10px] text-gm-muted italic font-serif opacity-60">
              {t('deposits.desc', {}, 'PayPal ve banka havalesi taleplerini onaylayın veya reddedin')}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-4 items-end">
            <div className="space-y-3">
              <Label className={cn(LABEL, 'block')}>{t('deposits.filters.status', {}, 'Durum')}</Label>
              <Select value={depositStatus} onValueChange={(v) => { setDepositStatus(v as WalletPaymentStatus | 'all'); setDepositPage(1); }}>
                <SelectTrigger className={FIELD}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="all">all</SelectItem>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="completed">completed</SelectItem>
                  <SelectItem value="failed">failed</SelectItem>
                  <SelectItem value="refunded">refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className={cn(LABEL, 'block')}>{t('deposits.filters.method', {}, 'Yöntem')}</Label>
              <Select value={depositMethod} onValueChange={(v) => { setDepositMethod(v as WalletPaymentMethod | 'all'); setDepositPage(1); }}>
                <SelectTrigger className={FIELD}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="all">all</SelectItem>
                  <SelectItem value="paypal">paypal</SelectItem>
                  <SelectItem value="bank_transfer">bank_transfer</SelectItem>
                  <SelectItem value="admin_manual">admin_manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label className={LABEL}>{t('deposits.filters.userId', {}, 'User ID')}</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/50" />
                <Input
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setDepositPage(1);
                      depositsQ.refetch();
                    }
                  }}
                  placeholder={t('deposits.filters.userIdPh', {}, 'UUID ile filtrele')}
                  className={cn(FIELD, 'pl-12')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposits table */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className={THX}>{t('deposits.table.user', {}, 'Kullanıcı')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('deposits.table.amount', {}, 'Tutar')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('deposits.table.method', {}, 'Yöntem')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('deposits.table.status', {}, 'Durum')}</TableHead>
                  <TableHead className={cn(TH, 'text-center')}>{t('deposits.table.createdAt', {}, 'Tarih')}</TableHead>
                  <TableHead className={cn(THX, 'text-right')}>{t('deposits.table.actions', {}, 'Aksiyon')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositsQ.isFetching && deposits.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-gm-border-soft">
                      <TableCell className="py-6 px-8"><Skeleton className="h-10 w-40 bg-gm-surface/20" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-24 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-24 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-28 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6 px-8"><Skeleton className="h-9 w-40 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <AlertCircle className="w-14 h-14 text-gm-gold/50" />
                        <span className="font-serif italic text-base text-gm-muted">{t('deposits.empty', {}, 'Kayıt bulunamadı')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((tx) => (
                    <TableRow key={tx.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gm-surface border border-gm-border-soft flex items-center justify-center text-gm-muted/60 group-hover:border-gm-gold/50 transition-all shadow-inner">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{tx.user_full_name || '-'}</div>
                            <div className="text-[10px] text-gm-muted font-mono opacity-50 tracking-tighter">{tx.user_email || tx.user_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center font-serif text-base text-gm-text font-bold">{fmtMoney(tx.amount, tx.currency)}</TableCell>
                      <TableCell className="py-6 text-center"><Pill tone="muted">{tx.payment_method}</Pill></TableCell>
                      <TableCell className="py-6 text-center"><Pill tone={statusTone(tx.payment_status)}>{tx.payment_status}</Pill></TableCell>
                      <TableCell className="py-6 text-center text-[10px] text-gm-muted font-mono tracking-tighter opacity-70">{fmtDate(tx.created_at)}</TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <div className="inline-flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy || tx.payment_status !== 'pending'}
                            onClick={() => onApproveDeposit(tx)}
                            className="rounded-full hover:bg-gm-success/10 hover:text-gm-success text-[10px] font-bold uppercase tracking-widest disabled:opacity-20"
                          >
                            <Check className="mr-2 size-4" />
                            {t('deposits.actions.approve', {}, 'Onayla')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy || tx.payment_status !== 'pending'}
                            onClick={() => onRejectDeposit(tx)}
                            className="rounded-full hover:bg-gm-error/10 hover:text-gm-error text-[10px] font-bold uppercase tracking-widest disabled:opacity-20"
                          >
                            <X className="mr-2 size-4" />
                            {t('deposits.actions.reject', {}, 'Reddet')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-8 pb-6 pt-2">
            <Pager
              label={t('labels.page', { page: depositPage }, `Sayfa ${depositPage}`)}
              hasPrev={depositsHasPrev}
              hasNext={depositsHasNext}
              busy={busy}
              onPrev={() => setDepositPage((p) => Math.max(1, p - 1))}
              onNext={() => setDepositPage((p) => p + 1)}
              prevLabel={t('actions.prev', {}, 'Önceki')}
              nextLabel={t('actions.next', {}, 'Sonraki')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Adjust dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md bg-background border-gm-border-soft rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-gm-text">{t('adjust.title', {}, 'Manuel Bakiye Ayarla')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onAdjustSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className={LABEL}>{t('adjust.type', {}, 'İşlem Tipi')}</Label>
              <Select value={adjustType} onValueChange={(v) => setAdjustType(v as 'credit' | 'debit')}>
                <SelectTrigger className={FIELD}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="credit">Credit (+)</SelectItem>
                  <SelectItem value="debit">Debit (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={LABEL}>{t('adjust.amount', {}, 'Tutar')}</Label>
              <Input type="number" min="0.01" step="0.01" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} required className={FIELD} />
            </div>
            <div className="space-y-2">
              <Label className={LABEL}>{t('adjust.purpose', {}, 'Amaç')}</Label>
              <Input value={adjustPurpose} onChange={(e) => setAdjustPurpose(e.target.value)} placeholder="z.B. manual_topup, correction" required className={FIELD} />
            </div>
            <div className="space-y-2">
              <Label className={LABEL}>{t('adjust.description', {}, 'Açıklama (Opsiyonel)')}</Label>
              <Textarea value={adjustDesc} onChange={(e) => setAdjustDesc(e.target.value)} rows={2} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)} className="rounded-full border-gm-border-soft px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
                {t('actions.cancel', {}, 'İptal')}
              </Button>
              <Button type="submit" disabled={adjustWalletState.isLoading} className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
                {t('actions.save', {}, 'Kaydet')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transactions dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="max-w-5xl bg-background border-gm-border-soft rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-gm-text">
              {t('transactions.title', {}, 'Cüzdan İşlemleri')} {selectedWallet ? `#${selectedWallet.id}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-2xl border border-gm-border-soft overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className={TH}>{t('transactions.table.type', {}, 'Tip')}</TableHead>
                  <TableHead className={TH}>{t('transactions.table.amount', {}, 'Tutar')}</TableHead>
                  <TableHead className={TH}>{t('transactions.table.method', {}, 'Yöntem')}</TableHead>
                  <TableHead className={TH}>{t('transactions.table.status', {}, 'Durum')}</TableHead>
                  <TableHead className={TH}>{t('transactions.table.purpose', {}, 'Amaç')}</TableHead>
                  <TableHead className={TH}>{t('transactions.table.createdAt', {}, 'Tarih')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!txQ.isFetching && (txQ.data?.data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-gm-muted italic font-serif opacity-50">
                      {t('transactions.empty', {}, 'Kayıt bulunamadı')}
                    </TableCell>
                  </TableRow>
                ) : null}

                {(txQ.data?.data ?? []).map((tx) => (
                  <TableRow key={tx.id} className="border-gm-border-soft">
                    <TableCell className="py-4 font-mono text-xs text-gm-text">{tx.type}</TableCell>
                    <TableCell className="py-4 font-bold text-gm-text">{fmtMoney(tx.amount, tx.currency)}</TableCell>
                    <TableCell className="py-4"><Pill tone="muted">{tx.payment_method}</Pill></TableCell>
                    <TableCell className="py-4"><Pill tone={statusTone(tx.payment_status)}>{tx.payment_status}</Pill></TableCell>
                    <TableCell className="py-4 text-sm text-gm-muted">{tx.purpose || '-'}</TableCell>
                    <TableCell className="py-4 text-[10px] text-gm-muted font-mono opacity-70">{fmtDate(tx.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
