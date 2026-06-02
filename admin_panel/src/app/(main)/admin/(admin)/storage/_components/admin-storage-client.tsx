'use client';

// =============================================================
// FILE: src/app/(main)/admin/(admin)/storage/_components/admin-storage-client.tsx
// Admin Storage — Medya kütüphanesi grid (hal-fiyatlari sürümü)
// Genel kabuk: woody orders standardı (gm-theme)
// =============================================================

import * as React from 'react';
import { toast } from 'sonner';
import {
  CheckSquare,
  ClipboardCheck,
  File as FileIcon,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  Search,
  Square,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { StorageAsset, StorageListQuery } from '@/integrations/shared';
import {
  useBulkCreateAssetsAdminMutation,
  useBulkDeleteAssetsAdminMutation,
  useCreateAssetAdminMutation,
  useDeleteAssetAdminMutation,
  useListAssetsAdminQuery,
  useListFoldersAdminQuery,
} from '@/integrations/hooks';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

// ─── Storage UI helpers (inline; haldefiyat storage-ui.ts ile aynı) ──────────────
const ADMIN_STORAGE_ALL_OPTION = 'all';
const ADMIN_STORAGE_DEFAULT_BUCKET = 'public';
const ADMIN_STORAGE_DEFAULT_LIMIT = 100;

const ADMIN_STORAGE_MIME_OPTIONS = [
  { value: 'image/', labelKey: 'imageType', fallback: 'Görsel' },
  { value: 'video/', labelKey: 'videoType', fallback: 'Video' },
  { value: 'audio/', labelKey: 'audioType', fallback: 'Ses' },
  { value: 'application/pdf', labelKey: 'pdfType', fallback: 'PDF' },
] as const;

type MediaFilters = {
  search: string;
  bucket: string;
  folder: string;
  mime: string;
  page: number;
};

function buildAdminStorageListQuery(filters: Omit<MediaFilters, 'page'>): StorageListQuery {
  return {
    q: filters.search || undefined,
    bucket: filters.bucket !== ADMIN_STORAGE_ALL_OPTION ? filters.bucket : undefined,
    folder: filters.folder !== ADMIN_STORAGE_ALL_OPTION ? filters.folder : undefined,
    mime: filters.mime !== ADMIN_STORAGE_ALL_OPTION ? filters.mime : undefined,
    sort: 'created_at',
    order: 'desc',
    limit: ADMIN_STORAGE_DEFAULT_LIMIT,
  };
}

function formatAdminStorageBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const base = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));
  return `${Math.round((bytes / Math.pow(base, unitIndex)) * 100) / 100} ${sizes[unitIndex]}`;
}

function getAdminStorageMimeIcon(mime: string): LucideIcon {
  if (mime.startsWith('image/')) return ImageIcon;
  return FileIcon;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { data?: { error?: { message?: unknown }; message?: unknown }; message?: unknown };
  const cands = [e?.data?.error?.message, e?.data?.message, e?.message];
  for (const c of cands) if (typeof c === 'string' && c.trim()) return c;
  return fallback;
}

const PAGE_SIZE = 24;
const UPLOAD_FOLDER = 'images';

function dimensions(item: StorageAsset): string {
  if (!item.width || !item.height) return '-';
  return `${item.width} x ${item.height} px`;
}

function fileName(item: StorageAsset): string {
  return item.name || item.path.split('/').pop() || item.id;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image_load_failed'));
    image.src = url;
  });
}

async function resizeImageAsset(item: StorageAsset, width: number): Promise<File> {
  if (!item.url) throw new Error('url_missing');
  const image = await loadImage(item.url);
  const sourceWidth = item.width || image.naturalWidth;
  const sourceHeight = item.height || image.naturalHeight;
  if (!sourceWidth || !sourceHeight) throw new Error('dimensions_missing');

  const height = Math.max(1, Math.round((sourceHeight * width) / sourceWidth));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (!blob) throw new Error('resize_failed');

  const base = fileName(item).replace(/\.[^.]+$/, '').replace(/-\d+px$/, '');
  return new window.File([blob], `${base}-${width}px.webp`, { type: 'image/webp' });
}

export default function AdminStorageClient() {
  const t = useAdminT('admin.storage');

  const [filters, setFilters] = React.useState<MediaFilters>({
    search: '',
    bucket: ADMIN_STORAGE_ALL_OPTION,
    folder: ADMIN_STORAGE_ALL_OPTION,
    mime: 'image/',
    page: 1,
  });
  const [dragActive, setDragActive] = React.useState(false);
  const [bulkMode, setBulkMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = React.useState<StorageAsset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<StorageAsset | null>(null);
  const [resizeWidth, setResizeWidth] = React.useState('');
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const queryParams = React.useMemo(() => {
    const { page: _page, ...rest } = filters;
    const base = buildAdminStorageListQuery(rest);
    return {
      ...base,
      limit: PAGE_SIZE,
      offset: (filters.page - 1) * PAGE_SIZE,
    };
  }, [filters]);

  const { data: result, isLoading, isFetching, refetch } = useListAssetsAdminQuery(queryParams);
  const { data: folders = [] } = useListFoldersAdminQuery();
  const [bulkCreateAssets, bulkCreateState] = useBulkCreateAssetsAdminMutation();
  const [createAsset, createAssetState] = useCreateAssetAdminMutation();
  const [deleteAsset, deleteState] = useDeleteAssetAdminMutation();
  const [bulkDeleteAssets, bulkDeleteState] = useBulkDeleteAssetsAdminMutation();

  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loadedSize = React.useMemo(() => items.reduce((sum, item) => sum + (item.size || 0), 0), [items]);
  const busy =
    isLoading ||
    bulkCreateState.isLoading ||
    createAssetState.isLoading ||
    deleteState.isLoading ||
    bulkDeleteState.isLoading;
  const hasSelection = selectedIds.size > 0;

  const buckets = React.useMemo(() => {
    const set = new Set(items.map((item) => item.bucket).filter(Boolean));
    set.add(ADMIN_STORAGE_DEFAULT_BUCKET);
    return Array.from(set);
  }, [items]);

  function updateFilters(next: Partial<MediaFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((item) => item.id));
    });
  }

  async function uploadFiles(files: FileList | File[]) {
    const accepted = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (accepted.length === 0) {
      toast.error('Yüklenecek görsel bulunamadı.');
      return;
    }

    setUploadProgress(8);
    try {
      await bulkCreateAssets({
        files: accepted,
        bucket: ADMIN_STORAGE_DEFAULT_BUCKET,
        folder: UPLOAD_FOLDER,
      }).unwrap();
      setUploadProgress(100);
      toast.success(`${accepted.length} dosya yüklendi.`);
      setTimeout(() => setUploadProgress(null), 700);
      updateFilters({ page: 1, mime: 'image/' });
      refetch();
    } catch (err) {
      setUploadProgress(null);
      toast.error(getErrorMessage(err, t('errorFallback', null, 'Bir hata oluştu.')));
    }
  }

  async function handleBulkDelete() {
    if (!hasSelection) {
      toast.error(t('list.selectFileError', null, 'Önce dosya seçin.'));
      return;
    }

    try {
      await bulkDeleteAssets({ ids: Array.from(selectedIds) }).unwrap();
      toast.success(t('list.filesDeleted', { count: selectedIds.size }, `${selectedIds.size} dosya silindi.`));
      setSelectedIds(new Set());
      setBulkMode(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, t('errorFallback', null, 'Bir hata oluştu.')));
    }
  }

  function requestDelete(item: StorageAsset) {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;

    try {
      await deleteAsset({ id: itemToDelete.id }).unwrap();
      toast.success(t('list.fileDeleted', null, 'Dosya silindi.'));
      if (activeItem?.id === itemToDelete.id) setActiveItem(null);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, t('errorFallback', null, 'Bir hata oluştu.')));
    }
  }

  async function copyUrl() {
    if (!activeItem?.url) return;
    try {
      await navigator.clipboard.writeText(activeItem.url);
      toast.success('URL kopyalandı.');
    } catch {
      toast.error('URL kopyalanamadı.');
    }
  }

  async function createResizedAsset() {
    if (!activeItem) return;
    const width = Number(resizeWidth);
    if (!Number.isFinite(width) || width < 50) {
      toast.error('Geçerli bir genişlik girin.');
      return;
    }

    try {
      const file = await resizeImageAsset(activeItem, Math.trunc(width));
      await createAsset({
        file,
        bucket: activeItem.bucket || ADMIN_STORAGE_DEFAULT_BUCKET,
        folder: activeItem.folder || UPLOAD_FOLDER,
      }).unwrap();
      toast.success('Yeni boyut oluşturuldu.');
      setResizeWidth('');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Görsel yeniden boyutlandırılamadı.'));
    }
  }

  return (
    <>
      <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-gm-gold" />
              <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Medya</span>
            </div>
            <h1 className="font-serif text-4xl text-gm-text">Medya Kütüphanesi</h1>
            <p className="text-gm-muted text-sm font-serif italic opacity-70">
              Toplam {total.toLocaleString('tr-TR')} dosya
              {items.length > 0 ? ` · ${formatAdminStorageBytes(loadedSize)} gösterilen` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gm-surface/20 px-6 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={busy}
              className="rounded-full border-gm-border-soft px-6 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
            >
              <RefreshCcw className={cn('mr-2 size-4', isFetching && 'animate-spin')} />
              Yenile
            </Button>
            <Button
              variant={bulkMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBulkMode((value) => !value)}
              disabled={busy}
              className={cn('rounded-full px-6 h-12 font-bold tracking-widest uppercase text-[10px]', !bulkMode && 'border-gm-border-soft hover:bg-gm-surface')}
            >
              <CheckSquare className="mr-2 size-4" />
              Toplu İşlem
            </Button>
          </div>
        </div>

        {/* Upload dropzone */}
        <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                if (event.dataTransfer.files.length) uploadFiles(event.dataTransfer.files);
              }}
              className={cn(
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-8 text-center transition-colors',
                dragActive ? 'border-gm-gold bg-gm-gold/5' : 'border-gm-border-soft bg-gm-surface/20 hover:bg-gm-surface/40',
              )}
            >
              <div className="w-14 h-14 rounded-full bg-gm-gold/10 flex items-center justify-center text-gm-gold border border-gm-gold/20 mb-4 shadow-inner">
                <UploadCloud className="size-7" />
              </div>
              <p className="font-serif text-lg text-gm-text">Resim yüklemek için tıklayın</p>
              <p className="mt-1 text-sm text-gm-muted opacity-70 max-w-md">
                Görseller storage içine yüklenir; grid üzerinden URL kopyalama, silme ve yeniden boyutlandırma yapılır.
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) uploadFiles(event.target.files);
                  event.currentTarget.value = '';
                }}
              />
            </div>
            {uploadProgress !== null ? (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-center text-sm text-gm-muted opacity-70">Yükleniyor...</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
          <CardContent className="p-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gm-muted/50" />
              <Input
                placeholder={t('list.searchPlaceholder', null, 'Dosya ara…')}
                value={filters.search}
                onChange={(event) => updateFilters({ search: event.target.value })}
                className="pl-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>
            <Select value={filters.bucket} onValueChange={(bucket) => updateFilters({ bucket })}>
              <SelectTrigger className="lg:w-40 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gm-bg-deep border-gm-border-soft rounded-2xl">
                <SelectItem value={ADMIN_STORAGE_ALL_OPTION}>{t('list.allOption', null, 'Tümü')}</SelectItem>
                {buckets.map((bucket) => (
                  <SelectItem key={bucket} value={bucket}>
                    {bucket}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.folder} onValueChange={(folder) => updateFilters({ folder })}>
              <SelectTrigger className="lg:w-44 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gm-bg-deep border-gm-border-soft rounded-2xl">
                <SelectItem value={ADMIN_STORAGE_ALL_OPTION}>{t('list.allOption', null, 'Tümü')}</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder || 'root'} value={folder || ''}>
                    {folder || t('list.rootFolder', null, 'Kök')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.mime} onValueChange={(mime) => updateFilters({ mime })}>
              <SelectTrigger className="lg:w-40 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gm-bg-deep border-gm-border-soft rounded-2xl">
                <SelectItem value={ADMIN_STORAGE_ALL_OPTION}>{t('list.allOption', null, 'Tümü')}</SelectItem>
                {ADMIN_STORAGE_MIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`list.${option.labelKey}`, null, option.fallback)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Grid */}
        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[32px] border border-gm-border-soft bg-gm-surface/20 text-gm-muted">
            <Loader2 className="mr-2 size-5 animate-spin" />
            {t('list.loading', null, 'Yükleniyor…')}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[32px] border border-gm-border-soft bg-gm-surface/20 py-24 text-center">
            <div className="flex flex-col items-center gap-4 opacity-30">
              <ImageIcon className="w-16 h-16 text-gm-gold/50" />
              <span className="font-serif italic text-lg text-gm-muted">{t('list.noFiles', null, 'Dosya bulunamadı.')}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {items.map((item) => {
              const Icon = getAdminStorageMimeIcon(item.mime);
              const selected = selectedIds.has(item.id);
              const isImage = item.url && item.mime.startsWith('image/');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (bulkMode) toggleSelect(item.id);
                    else setActiveItem(item);
                  }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border bg-gm-surface/20 text-left shadow-sm transition hover:border-gm-gold/50 hover:shadow-md',
                    selected ? 'border-gm-gold ring-2 ring-gm-gold/35' : 'border-gm-border-soft',
                  )}
                >
                  {bulkMode ? (
                    <span className="absolute left-2 top-2 z-10 rounded-lg bg-gm-bg-deep/90 p-1 shadow">
                      {selected ? <CheckSquare className="size-5 text-gm-gold" /> : <Square className="size-5 text-gm-muted" />}
                    </span>
                  ) : null}
                  <div className="aspect-square bg-gm-bg-deep">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url ?? ''} alt={item.name} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Icon className="size-12 text-gm-muted/50" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-medium text-gm-text">{fileName(item)}</p>
                    <p className="text-[10px] text-gm-muted font-mono opacity-60">{dimensions(item)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="ghost"
              disabled={filters.page <= 1 || busy}
              onClick={() => updateFilters({ page: filters.page - 1 })}
              className="rounded-full px-8 h-12 hover:bg-gm-gold/10 hover:text-gm-gold font-bold tracking-widest uppercase text-[10px] disabled:opacity-30"
            >
              Önceki
            </Button>
            <span className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase bg-gm-surface/30 px-6 py-3 rounded-full border border-gm-border-soft">
              {filters.page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={filters.page >= totalPages || busy}
              onClick={() => updateFilters({ page: filters.page + 1 })}
              className="rounded-full px-8 h-12 hover:bg-gm-gold/10 hover:text-gm-gold font-bold tracking-widest uppercase text-[10px] disabled:opacity-30"
            >
              Sonraki
            </Button>
          </div>
        ) : null}
      </div>

      {/* Bulk action bar */}
      {bulkMode ? (
        <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gm-border-soft bg-gm-bg-deep/95 px-5 py-3 shadow-2xl backdrop-blur">
          <Button variant="outline" size="sm" onClick={toggleSelectAll} disabled={busy} className="rounded-full border-gm-border-soft text-[10px] font-bold uppercase tracking-widest">
            {selectedIds.size === items.length ? 'Seçimi kaldır' : 'Tümünü seç'}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={busy || !hasSelection} className="rounded-full text-[10px] font-bold uppercase tracking-widest">
            Seçilenleri Sil ({selectedIds.size})
          </Button>
        </div>
      ) : null}

      {/* Detail dialog */}
      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="max-w-[900px] p-6 bg-gm-bg-deep border-gm-border-soft rounded-[28px]">
          {activeItem ? (
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-gm-surface/30 border border-gm-border-soft">
                {activeItem.url && activeItem.mime.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeItem.url} alt={activeItem.name} className="max-h-[520px] w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gm-muted">
                    {React.createElement(getAdminStorageMimeIcon(activeItem.mime), { className: 'size-16' })}
                    <span>{activeItem.mime}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-gm-text">Dosya Detayları</DialogTitle>
                  <DialogDescription className="sr-only">Seçili dosya bilgileri ve medya işlemleri.</DialogDescription>
                </DialogHeader>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">Dosya Adı</p>
                  <p className="break-all text-sm font-medium text-gm-text">{fileName(activeItem)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">Boyutlar</p>
                  <p className="text-sm font-medium text-gm-text">{dimensions(activeItem)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">Dosya Boyutu</p>
                  <p className="text-sm font-medium text-gm-text">{formatAdminStorageBytes(activeItem.size)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">URL</p>
                  <div className="flex gap-2">
                    <Input readOnly value={activeItem.url ?? ''} onFocus={(event) => event.currentTarget.select()} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-11 text-xs font-mono" />
                    <Button variant="outline" size="icon" onClick={copyUrl} disabled={!activeItem.url} className="rounded-full size-11 border-gm-border-soft shrink-0 hover:bg-gm-gold/10 hover:text-gm-gold">
                      <ClipboardCheck className="size-4" />
                    </Button>
                  </div>
                </div>

                {activeItem.mime.startsWith('image/') ? (
                  <div className="border-t border-gm-border-soft pt-4">
                    <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-gm-gold">Yeniden Boyutlandır</h4>
                    <p className="mt-1 text-xs text-gm-muted opacity-70">Genişlik girin, yükseklik otomatik hesaplanır.</p>
                    <div className="mt-3 flex gap-2">
                      <Input
                        type="number"
                        min={50}
                        placeholder="Örn: 800"
                        value={resizeWidth}
                        onChange={(event) => setResizeWidth(event.target.value)}
                        className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-11 text-sm"
                      />
                      <Button onClick={createResizedAsset} disabled={busy || createAssetState.isLoading} className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px] shrink-0">
                        Oluştur
                      </Button>
                    </div>
                  </div>
                ) : null}

                <DialogFooter className="mt-auto">
                  <Button variant="destructive" onClick={() => requestDelete(activeItem)} disabled={busy} className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
                    <Trash2 className="mr-2 size-4" />
                    Sil
                  </Button>
                  <Button variant="outline" onClick={() => setActiveItem(null)} className="rounded-full border-gm-border-soft px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
                    Kapat
                  </Button>
                </DialogFooter>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gm-bg-deep border-gm-border-soft rounded-[28px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-gm-text">{t('list.deleteConfirmTitle', null, 'Dosyayı sil')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('list.deleteConfirmDescription', { name: itemToDelete ? fileName(itemToDelete) : t('list.defaultFileName', null, 'dosya') }, 'Bu dosya kalıcı olarak silinecek.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-gm-border-soft">{t('list.cancelButton', null, 'İptal')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full">{t('list.deleteButton', null, 'Sil')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
