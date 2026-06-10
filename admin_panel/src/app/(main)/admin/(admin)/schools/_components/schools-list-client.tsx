'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Eye,
  LinkIcon,
  Plus,
  RefreshCcw,
  School,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
  DigitalAssetType,
  DigitalAssetView,
  SchoolLevel,
  WoodyProduct,
} from '@/integrations/shared';
import {
  useCreateDigitalAssetAdminMutation,
  useDeleteDigitalAssetAdminMutation,
  useDeleteSchoolAdminMutation,
  useListAssetsAdminQuery,
  useListDigitalAssetsAdminQuery,
  useListSchoolsAdminQuery,
  useUpdateDigitalAssetAdminMutation,
} from '@/integrations/hooks';

const ASSET_TYPES: DigitalAssetType[] = ['pdf', 'video', 'audio', 'image', 'other'];
const LEVELS: SchoolLevel[] = ['basic', 'junior', 'senior'];
const PRODUCTS: WoodyProduct[] = ['storyland', 'movieland', 'musicland', 'library'];

type AssetForm = {
  title: string;
  asset_type: DigitalAssetType;
  storage_asset_id: string;
  level: SchoolLevel | 'none';
  product: WoodyProduct | 'none';
  is_active: boolean;
};

const EMPTY_ASSET: AssetForm = {
  title: '',
  asset_type: 'pdf',
  storage_asset_id: '',
  level: 'none',
  product: 'none',
  is_active: true,
};

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
}

function assetToForm(asset: DigitalAssetView): AssetForm {
  return {
    title: asset.title,
    asset_type: asset.asset_type,
    storage_asset_id: asset.storage_asset_id ?? '',
    level: asset.level ?? 'none',
    product: asset.product ?? 'none',
    is_active: asset.is_active,
  };
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest',
        active ? 'bg-gm-success/10 text-gm-success' : 'bg-gm-error/10 text-gm-error',
      )}
    >
      <div className={cn('w-1 h-1 rounded-full', active ? 'bg-gm-success' : 'bg-gm-error')} />
      {active ? 'Aktif' : 'Pasif'}
    </div>
  );
}

export default function SchoolsListClient() {
  const schoolsQ = useListSchoolsAdminQuery();
  const assetsQ = useListDigitalAssetsAdminQuery();
  const storageQ = useListAssetsAdminQuery({ limit: 100, sort: 'created_at', order: 'desc' });
  const schools = schoolsQ.data ?? [];
  const assets = assetsQ.data ?? [];
  const storageAssets = storageQ.data?.items ?? [];

  const [deleteSchool, deleteSchoolState] = useDeleteSchoolAdminMutation();
  const [createAsset, createAssetState] = useCreateDigitalAssetAdminMutation();
  const [updateAsset, updateAssetState] = useUpdateDigitalAssetAdminMutation();
  const [deleteAsset, deleteAssetState] = useDeleteDigitalAssetAdminMutation();

  const [assetForm, setAssetForm] = React.useState<AssetForm>(EMPTY_ASSET);
  const [editingAssetId, setEditingAssetId] = React.useState('');
  const isSavingAsset = createAssetState.isLoading || updateAssetState.isLoading;
  const anyFetching = schoolsQ.isFetching || assetsQ.isFetching || storageQ.isFetching;

  function resetAssetForm() {
    setEditingAssetId('');
    setAssetForm(EMPTY_ASSET);
  }

  async function removeSchool(id: string) {
    try {
      await deleteSchool({ id }).unwrap();
      toast.success('Okul silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function saveAsset() {
    const title = assetForm.title.trim();
    if (!title) {
      toast.error('İçerik başlığı gerekli');
      return;
    }
    const body = {
      title,
      asset_type: assetForm.asset_type,
      storage_asset_id: assetForm.storage_asset_id.trim() || null,
      level: assetForm.level === 'none' ? null : assetForm.level,
      product: assetForm.product === 'none' ? null : assetForm.product,
      is_active: assetForm.is_active ? 1 : 0,
    };
    try {
      if (editingAssetId) {
        await updateAsset({ id: editingAssetId, body }).unwrap();
        toast.success('Dijital içerik güncellendi');
      } else {
        await createAsset(body).unwrap();
        toast.success('Dijital içerik oluşturuldu');
      }
      resetAssetForm();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function removeAsset(id: string) {
    try {
      await deleteAsset({ id }).unwrap();
      if (editingAssetId === id) resetAssetForm();
      toast.success('Dijital içerik silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Woody School
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Okullar</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Okul hesapları, kullanıcı bağlantıları ve dijital içerik erişimleri.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              schoolsQ.refetch();
              assetsQ.refetch();
              storageQ.refetch();
            }}
            disabled={anyFetching}
            className="rounded-full border-gm-border-soft px-8 h-12 bg-gm-surface/20 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn('mr-2 size-4', anyFetching && 'animate-spin')} />
            Yenile
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
          >
            <Link href="/admin/schools/new">
              <Plus className="mr-2 size-4" />
              Yeni Okul
            </Link>
          </Button>
        </div>
      </div>

      {/* Okul listesi */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Okul
                </TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Şehir
                </TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  İletişim
                </TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Durum
                </TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  İşlem
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolsQ.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-10 w-48 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6">
                      <Skeleton className="h-4 w-24 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6">
                      <Skeleton className="h-4 w-32 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <Skeleton className="h-6 w-20 mx-auto bg-gm-surface/20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <Skeleton className="h-8 w-20 ml-auto bg-gm-surface/20 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <School className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">
                        Henüz okul yok. “Yeni Okul” ile ekleyin.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow
                    key={school.id}
                    className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                  >
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gm-surface border border-gm-border-soft flex items-center justify-center text-gm-gold shadow-inner group-hover:border-gm-gold/50 transition-all">
                          <School className="size-5" />
                        </div>
                        <div>
                          <Link
                            href={`/admin/schools/${encodeURIComponent(school.id)}`}
                            className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors"
                          >
                            {school.name}
                          </Link>
                          <div className="text-[10px] text-gm-muted font-mono opacity-60 uppercase tracking-tighter">
                            ID: {school.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-sm text-gm-muted">{school.city || '-'}</TableCell>
                    <TableCell className="py-6 text-sm text-gm-muted font-mono">
                      {[school.contact_email, school.contact_phone].filter(Boolean).join(' · ') || '-'}
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <StatusPill active={school.is_active} />
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-1 opacity-30 group-hover:opacity-100 transition-all">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-colors"
                        >
                          <Link
                            prefetch={false}
                            href={`/admin/schools/${encodeURIComponent(school.id)}`}
                          >
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSchool(school.id)}
                          disabled={deleteSchoolState.isLoading}
                          className="rounded-full hover:bg-gm-error/10 hover:text-gm-error transition-colors"
                        >
                          <Trash2 className="size-4" />
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

      {/* Dijital İçerikler (global kütüphane) */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gm-gold" />
            Dijital İçerikler
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_160px_160px_160px_minmax(220px,1fr)_auto]">
            <div className="space-y-2">
              <Label className={LABEL_CLS}>Başlık</Label>
              <Input
                value={assetForm.title}
                onChange={(e) => setAssetForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="İçerik başlığı"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-2">
              <Label className={LABEL_CLS}>Tip</Label>
              <Select
                value={assetForm.asset_type}
                onValueChange={(v) => setAssetForm((p) => ({ ...p, asset_type: v as DigitalAssetType }))}
              >
                <SelectTrigger className={INPUT_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  {ASSET_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={LABEL_CLS}>Seviye</Label>
              <Select
                value={assetForm.level}
                onValueChange={(v) => setAssetForm((p) => ({ ...p, level: v as SchoolLevel | 'none' }))}
              >
                <SelectTrigger className={INPUT_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="none">Seviye yok</SelectItem>
                  {LEVELS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={LABEL_CLS}>Ürün</Label>
              <Select
                value={assetForm.product}
                onValueChange={(v) => setAssetForm((p) => ({ ...p, product: v as WoodyProduct | 'none' }))}
              >
                <SelectTrigger className={INPUT_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="none">Ürün yok</SelectItem>
                  {PRODUCTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={LABEL_CLS}>Dosya</Label>
              <Select
                value={assetForm.storage_asset_id || 'none'}
                onValueChange={(v) =>
                  setAssetForm((p) => ({ ...p, storage_asset_id: v === 'none' ? '' : v }))
                }
              >
                <SelectTrigger className={INPUT_CLS}>
                  <SelectValue placeholder="Storage dosyası seç" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="none">Dosya yok</SelectItem>
                  {storageAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name || asset.path || asset.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <div className="flex h-12 items-center gap-2 px-5 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                <Switch
                  checked={assetForm.is_active}
                  onCheckedChange={(checked: boolean) =>
                    setAssetForm((p) => ({ ...p, is_active: checked }))
                  }
                  className="data-[state=checked]:bg-gm-gold"
                />
                <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">
                  Aktif
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={saveAsset}
              disabled={isSavingAsset}
              className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-dim px-8 h-11 font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-gm-gold/20 transition-all active:scale-95"
            >
              <Plus className="mr-2 size-4" />
              {editingAssetId ? 'Güncelle' : 'İçerik Ekle'}
            </Button>
            {editingAssetId ? (
              <Button
                variant="ghost"
                onClick={resetAssetForm}
                className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px]"
              >
                Yeni içerik
              </Button>
            ) : null}
          </div>

          <div className="rounded-2xl border border-gm-border-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                    Başlık
                  </TableHead>
                  <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                    Tip
                  </TableHead>
                  <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                    Seviye
                  </TableHead>
                  <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                    Ürün
                  </TableHead>
                  <TableHead className="py-5 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                    Durum
                  </TableHead>
                  <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                    Güncelleme
                  </TableHead>
                  <TableHead className="py-5 px-6 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {assetsQ.isLoading ? (
                  ['a1', 'a2', 'a3'].map((key) => (
                    <TableRow key={key} className="border-gm-border-soft">
                      <TableCell colSpan={7} className="py-5 px-6">
                        <Skeleton className="h-8 bg-gm-surface/20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-gm-muted font-serif italic opacity-50">
                      Henüz dijital içerik yok.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => (
                    <TableRow
                      key={asset.id}
                      className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                    >
                      <TableCell className="py-5 px-6">
                        <div className="font-serif text-base text-gm-text">{asset.title}</div>
                        <div className="text-[11px] text-gm-muted font-mono opacity-60">
                          {asset.storage_name || asset.storage_path || asset.storage_asset_id || '-'}
                        </div>
                        {asset.storage_url ? (
                          <a
                            href={asset.storage_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-gm-gold text-xs hover:underline"
                          >
                            <LinkIcon className="size-3" />
                            Dosyayı aç
                          </a>
                        ) : null}
                      </TableCell>
                      <TableCell className="py-5 text-sm text-gm-muted">{asset.asset_type}</TableCell>
                      <TableCell className="py-5 text-sm text-gm-muted">{asset.level ?? '-'}</TableCell>
                      <TableCell className="py-5 text-sm text-gm-muted">{asset.product ?? '-'}</TableCell>
                      <TableCell className="py-5 text-center">
                        <StatusPill active={asset.is_active} />
                      </TableCell>
                      <TableCell className="py-5 text-xs text-gm-muted font-mono">
                        {formatDate(asset.updated_at ?? asset.created_at)}
                      </TableCell>
                      <TableCell className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-1 opacity-30 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAssetId(asset.id);
                              setAssetForm(assetToForm(asset));
                            }}
                            className="rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-gm-gold/10 hover:text-gm-gold"
                          >
                            Düzenle
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAsset(asset.id)}
                            disabled={deleteAssetState.isLoading}
                            className="rounded-full hover:bg-gm-error/10 hover:text-gm-error transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
