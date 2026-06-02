'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone,
  Eye,
  Users,
  Plus,
  Loader2,
  Save,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import type { UserRoleName, AdminUsersListParams } from '@/integrations/shared';
import { useListUsersAdminQuery, useCreateUserAdminMutation } from '@/integrations/hooks';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { cn } from '@/lib/utils';

function boolParam(v: string | null): boolean | undefined {
  if (v == null) return undefined;
  const s = v.trim();
  if (s === '1' || s === 'true') return true;
  if (s === '0' || s === 'false') return false;
  return undefined;
}

function safeInt(v: string | null, fb: number): number {
  const n = Number(v ?? '');
  return Number.isFinite(n) && n >= 0 ? n : fb;
}

function pickQuery(sp: URLSearchParams): AdminUsersListParams {
  const q = sp.get('q') ?? undefined;
  const role = (sp.get('role') ?? undefined) as UserRoleName | undefined;
  const is_active = boolParam(sp.get('is_active'));
  const limit = safeInt(sp.get('limit'), 20) || 20;
  const offset = safeInt(sp.get('offset'), 0);
  const sort = (sp.get('sort') ?? undefined) as AdminUsersListParams['sort'] | undefined;
  const order = (sp.get('order') ?? undefined) as AdminUsersListParams['order'] | undefined;

  return {
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
    ...(typeof is_active === 'boolean' ? { is_active } : {}),
    limit,
    offset,
    ...(sort ? { sort } : {}),
    ...(order ? { order } : {}),
  };
}

function toSearchParams(p: AdminUsersListParams): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set('q', p.q);
  if (p.role) sp.set('role', p.role);
  if (typeof p.is_active === 'boolean') sp.set('is_active', p.is_active ? '1' : '0');
  if (p.limit != null) sp.set('limit', String(p.limit));
  if (p.offset != null) sp.set('offset', String(p.offset));
  if (p.sort) sp.set('sort', p.sort);
  if (p.order) sp.set('order', p.order);
  return sp.toString();
}

type CreateUserForm = {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin';
  is_active: boolean;
};

const EMPTY_CREATE_FORM: CreateUserForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'user',
  is_active: true,
};

export default function UsersListClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const t = useAdminT('admin.users');
  const tCommon = useAdminT('admin.common');

  const params = React.useMemo(() => pickQuery(sp), [sp]);
  const usersQ = useListUsersAdminQuery(params);

  const [q, setQ] = React.useState(params.q ?? '');

  // ── Yeni kullanıcı oluşturma ──────────────────────────────────────────────
  const [createUser, createState] = useCreateUserAdminMutation();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_CREATE_FORM);
  const setField = <K extends keyof CreateUserForm>(k: K, v: CreateUserForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleCreate() {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error(t('create.required', null, 'E-posta ve şifre zorunlu.'));
      return;
    }
    if (form.password.length < 8) {
      toast.error(t('create.passwordMin', null, 'Şifre en az 8 karakter olmalı.'));
      return;
    }
    try {
      await createUser({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role,
        is_active: form.is_active,
      }).unwrap();
      toast.success(t('create.success', null, 'Kullanıcı oluşturuldu.'));
      setCreateOpen(false);
      setForm(EMPTY_CREATE_FORM);
      usersQ.refetch();
    } catch (e: any) {
      toast.error(e?.data?.error?.message || t('create.failed', null, 'Kullanıcı oluşturulamadı.'));
    }
  }

  function apply(next: Partial<AdminUsersListParams>) {
    const merged: AdminUsersListParams = { ...params, ...next, offset: next.offset != null ? next.offset : 0 };
    if (!merged.q) delete (merged as any).q;
    if (!merged.role) delete (merged as any).role;
    if (typeof merged.is_active !== 'boolean') delete (merged as any).is_active;
    const qs = toSearchParams(merged);
    router.push(qs ? `/admin/users?${qs}` : `/admin/users`);
  }

  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  const canPrev = offset > 0;
  const canNext = (usersQ.data?.length ?? 0) >= limit;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">{t('list.badge', null, 'Üyelik Sistemi')}</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('list.title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            {t('list.description')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => usersQ.refetch()}
            disabled={usersQ.isFetching}
            className="rounded-full border-gm-border-soft px-8 h-12 bg-gm-surface/20 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn("mr-2 size-4", usersQ.isFetching && "animate-spin")} />
            {t('list.filters.refreshButton')}
          </Button>
          <Button
            size="sm"
            onClick={() => { setForm(EMPTY_CREATE_FORM); setCreateOpen(true); }}
            className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
          >
            <Plus className="mr-2 size-4" />
            {t('create.button', null, 'Yeni Kullanıcı')}
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('list.filters.searchLabel')}</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/60" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && apply({ q: q.trim() || undefined })}
                placeholder={t('list.filters.searchPlaceholder')}
                className="pl-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('list.filters.roleLabel')}</Label>
            <Select
              value={params.role || 'all'}
              onValueChange={(v) => apply({ role: v === 'all' ? undefined : (v as UserRoleName) })}
            >
              <SelectTrigger className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                <SelectValue placeholder={t('list.filters.rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                <SelectItem value="all">{t('roles.all')}</SelectItem>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                <SelectItem value="consultant">{t('roles.consultant')}</SelectItem>
                <SelectItem value="user">{t('roles.user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between h-12 px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
            <Label htmlFor="active-toggle" className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">{t('list.filters.onlyActive')}</Label>
            <Switch
              id="active-toggle"
              checked={params.is_active === true}
              onCheckedChange={(v) => apply({ is_active: v ? true : undefined })}
              className="data-[state=checked]:bg-gm-gold"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.fullName')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.email')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('list.table.status')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('list.table.role')}</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQ.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8"><Skeleton className="h-10 w-40 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-4 w-32 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6 text-center"><Skeleton className="h-6 w-20 mx-auto bg-gm-surface/20 rounded-full" /></TableCell>
                    <TableCell className="py-6 text-center"><Skeleton className="h-6 w-16 mx-auto bg-gm-surface/20 rounded" /></TableCell>
                    <TableCell className="py-6 px-8 text-right"><Skeleton className="h-8 w-8 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (usersQ.data ?? []).map((u) => (
                <TableRow key={u.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gm-surface border border-gm-border-soft flex items-center justify-center text-gm-gold font-serif text-xl shadow-inner group-hover:border-gm-gold/50 transition-all">
                        {u.full_name?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-serif text-lg text-gm-text flex items-center gap-2 group-hover:text-gm-primary transition-colors">
                          {u.full_name || t('list.table.unknownUser')}
                          {u.roles.includes('admin') && <ShieldCheck className="w-4 h-4 text-gm-gold" />}
                        </div>
                        <div className="text-[10px] text-gm-muted font-mono opacity-60 uppercase tracking-tighter">ID: {u.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gm-muted">
                        <Mail size={12} className="text-gm-gold/60" />
                        <span className="font-mono">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 text-xs text-gm-muted">
                          <Phone size={12} className="text-gm-gold/60" />
                          <span className="font-mono">{u.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                      u.is_active ? 'bg-gm-success/10 text-gm-success' : 'bg-gm-error/10 text-gm-error'
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", u.is_active ? 'bg-gm-success' : 'bg-gm-error')} />
                      {u.is_active ? t('list.table.statusActive') : t('list.table.statusInactive')}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded border",
                        u.roles.includes('admin') ? 'border-gm-gold/30 text-gm-gold bg-gm-gold/5' :
                        u.roles.includes('consultant') ? 'border-gm-primary/30 text-gm-primary-light bg-gm-primary/5' :
                        'border-gm-border-soft text-gm-muted'
                      )}
                    >
                      {u.roles[0] === 'admin' ? t('roles.admin') : u.roles[0] === 'consultant' ? t('roles.consultant') : t('roles.user')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 px-8 text-right">
                    <div className="flex justify-end opacity-20 group-hover:opacity-100 transition-all">
                      <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-colors">
                        <Link prefetch={false} href={`/admin/users/${encodeURIComponent(u.id)}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!usersQ.isLoading && !usersQ.data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">{t('list.table.noRecords')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8">
        <div className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase bg-gm-surface/30 px-6 py-3 rounded-full border border-gm-border-soft">
          {t('list.table.totalRecords', { count: String(usersQ.data?.length || 0) })}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev || usersQ.isFetching}
            onClick={() => apply({ offset: Math.max(0, offset - limit) })}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all text-[10px] font-bold tracking-widest uppercase"
          >
            <ChevronLeft className="mr-2 size-4" />
            {t('list.pagination.previous', null, 'Önceki')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext || usersQ.isFetching}
            onClick={() => apply({ offset: offset + limit })}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all text-[10px] font-bold tracking-widest uppercase"
          >
            {t('list.pagination.next', null, 'Sonraki')}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      {/* Yeni Kullanıcı Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg bg-background border-gm-border-soft rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-gm-text">
              {t('create.title', null, 'Yeni Kullanıcı')}
            </DialogTitle>
            <DialogDescription className="text-gm-muted font-serif italic opacity-80">
              {t('create.description', null, 'Yeni bir kullanıcı hesabı oluşturun.')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('create.fullName', null, 'Tam Ad')}</Label>
              <Input value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} placeholder="John Doe" className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('create.phone', null, 'Telefon')}</Label>
              <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+90…" className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('create.email', null, 'E-posta')} *</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="admin@example.com" className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('create.password', null, 'Şifre')} *</Label>
              <Input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="••••••••" className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
              <p className="text-[10px] text-gm-muted opacity-60 ml-1">{t('create.passwordHint', null, 'En az 8 karakter.')}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1 block">{t('create.role', null, 'Rol')}</Label>
              <Select value={form.role} onValueChange={(v) => setField('role', v as CreateUserForm['role'])}>
                <SelectTrigger className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="user">{t('roles.user')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between h-12 px-5 mt-7 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
              <Label htmlFor="create-active" className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">{t('create.active', null, 'Aktif')}</Label>
              <Switch id="create-active" checked={form.is_active} onCheckedChange={(v) => setField('is_active', v)} className="data-[state=checked]:bg-gm-gold" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createState.isLoading} className="rounded-full border-gm-border-soft px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
              {t('create.cancel', null, 'İptal')}
            </Button>
            <Button onClick={handleCreate} disabled={createState.isLoading} className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
              {createState.isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              {t('create.submit', null, 'Oluştur')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
