'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Eye,
  ImageIcon,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  useDeleteProductAdminMutation,
  useListProductCategoriesAdminQuery,
  useListProductsAdminQuery,
} from '@/integrations/hooks';

const LOCALES = ['tr', 'en'];

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(value);
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

export default function ProductsListClient() {
  const [locale, setLocale] = React.useState('tr');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  const categoriesQ = useListProductCategoriesAdminQuery({ locale });
  const productsQ = useListProductsAdminQuery({
    locale,
    q: search || undefined,
    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 100,
    sort: 'order_num',
    order: 'asc',
  });
  const [deleteProduct, deleteState] = useDeleteProductAdminMutation();

  const products = productsQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const anyFetching = productsQ.isFetching || categoriesQ.isFetching;

  function doSearch() {
    setSearch(searchInput.trim());
  }

  async function removeProduct(id: string) {
    try {
      await deleteProduct({ id }).unwrap();
      toast.success('Ürün silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  const editHref = (id: string) =>
    `/admin/products/${encodeURIComponent(id)}?locale=${encodeURIComponent(locale)}`;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Woody Store
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Ürünler</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Mağaza ürünleri; fiyat, stok, kategori, görsel ve SEO alanları.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="rounded-full border-gm-border-soft bg-gm-surface/20 h-12 w-28 text-[10px] font-bold tracking-widest uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
              {LOCALES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              productsQ.refetch();
              categoriesQ.refetch();
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
            <Link href={`/admin/products/new?locale=${encodeURIComponent(locale)}`}>
              <Plus className="mr-2 size-4" />
              Yeni Ürün
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 grid gap-8 md:grid-cols-2 items-end">
          <div className="space-y-3">
            <Label className={LABEL_CLS}>Ara</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/60" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder="Başlıkta ara"
                className={cn(INPUT_CLS, 'pl-12')}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className={LABEL_CLS}>Kategori</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className={INPUT_CLS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                <SelectItem value="all">Tüm kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Ürün
                </TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Kategori
                </TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Fiyat
                </TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Stok
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
              {productsQ.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-12 w-56 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6">
                      <Skeleton className="h-4 w-24 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6">
                      <Skeleton className="h-4 w-20 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <Skeleton className="h-4 w-10 mx-auto bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <Skeleton className="h-6 w-20 mx-auto bg-gm-surface/20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <Skeleton className="h-8 w-16 ml-auto bg-gm-surface/20 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Package className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">
                        Ürün bulunamadı. “Yeni Ürün” ile ekleyin.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                  >
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl border border-gm-border-soft bg-gm-surface overflow-hidden group-hover:border-gm-gold/50 transition-all">
                          {product.image_url ? (
                            <div
                              aria-label={product.alt ?? product.title}
                              className="size-full bg-center bg-cover"
                              role="img"
                              style={{ backgroundImage: `url("${product.image_url}")` }}
                            />
                          ) : (
                            <ImageIcon className="size-4 text-gm-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={editHref(product.id)}
                            className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors block truncate"
                          >
                            {product.title}
                          </Link>
                          <div className="text-[10px] text-gm-muted font-mono opacity-60 uppercase tracking-tighter">
                            {product.product_code ?? product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-sm text-gm-muted">
                      {product.category_name ?? '-'}
                    </TableCell>
                    <TableCell className="py-6 text-sm text-gm-text font-mono">
                      {formatMoney(product.price)}
                    </TableCell>
                    <TableCell className="py-6 text-center text-sm text-gm-muted font-mono">
                      {product.stock_quantity}
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col items-center gap-1.5">
                        <StatusPill active={product.is_active} />
                        {product.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gm-gold">
                            <Star className="size-3" /> Öne çıkan
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-1 opacity-30 group-hover:opacity-100 transition-all">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-colors"
                        >
                          <Link prefetch={false} href={editHref(product.id)}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProduct(product.id)}
                          disabled={deleteState.isLoading}
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

      <div className="flex items-center gap-3 px-8">
        <div className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase bg-gm-surface/30 px-6 py-3 rounded-full border border-gm-border-soft">
          {products.length} ürün · {locale.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
