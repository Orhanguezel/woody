'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ImageIcon,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Search,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ProductAdminView, ProductUpsertBody } from '@/integrations/shared';
import {
  useCreateProductAdminMutation,
  useDeleteProductAdminMutation,
  useListProductCategoriesAdminQuery,
  useListProductsAdminQuery,
  useListProductSubcategoriesAdminQuery,
  useUpdateProductAdminMutation,
} from '@/integrations/hooks';

type ProductForm = {
  locale: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  category_id: string;
  sub_category_id: string;
  image_url: string;
  product_code: string;
  stock_quantity: string;
  order_num: string;
  tags: string;
  specifications: string;
  alt: string;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  is_featured: boolean;
};

const EMPTY_FORM: ProductForm = {
  locale: 'tr',
  title: '',
  slug: '',
  description: '',
  price: '0',
  category_id: '',
  sub_category_id: 'none',
  image_url: '',
  product_code: '',
  stock_quantity: '0',
  order_num: '0',
  tags: '',
  specifications: '',
  alt: '',
  meta_title: '',
  meta_description: '',
  is_active: true,
  is_featured: false,
};

const LOCALES = ['tr', 'en'];

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(value);
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSpecifications(value: string): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const line of value.split('\n')) {
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey?.trim();
    const val = rest.join(':').trim();
    if (key && val) out[key] = val;
  }
  return Object.keys(out).length ? out : undefined;
}

function specsToText(specifications: Record<string, string> | null) {
  if (!specifications) return '';
  return Object.entries(specifications)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function productToForm(product: ProductAdminView): ProductForm {
  return {
    locale: product.locale,
    title: product.title,
    slug: product.slug,
    description: product.description ?? '',
    price: String(product.price),
    category_id: product.category_id,
    sub_category_id: product.sub_category_id ?? 'none',
    image_url: product.image_url ?? '',
    product_code: product.product_code ?? '',
    stock_quantity: String(product.stock_quantity),
    order_num: String(product.order_num),
    tags: product.tags.join(', '),
    specifications: specsToText(product.specifications),
    alt: product.alt ?? '',
    meta_title: product.meta_title ?? '',
    meta_description: product.meta_description ?? '',
    is_active: product.is_active,
    is_featured: product.is_featured,
  };
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md border px-2 py-0.5 text-[11px]',
        active ? 'border-emerald-400/40 text-emerald-700' : 'border-slate-300 text-slate-500',
      )}
    >
      {active ? 'Aktif' : 'Pasif'}
    </Badge>
  );
}

export default function AdminProductsClient() {
  const [locale, setLocale] = React.useState('tr');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [editingId, setEditingId] = React.useState('');
  const [form, setForm] = React.useState<ProductForm>(EMPTY_FORM);

  const categoriesQ = useListProductCategoriesAdminQuery({ locale });
  const subcategoriesQ = useListProductSubcategoriesAdminQuery({
    locale,
    categoryId: form.category_id || undefined,
  });
  const productsQ = useListProductsAdminQuery({
    locale,
    q: search || undefined,
    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 100,
    sort: 'order_num',
    order: 'asc',
  });

  const [createProduct, createState] = useCreateProductAdminMutation();
  const [updateProduct, updateState] = useUpdateProductAdminMutation();
  const [deleteProduct, deleteState] = useDeleteProductAdminMutation();

  const products = productsQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const subcategories = subcategoriesQ.data ?? [];
  const isSaving = createState.isLoading || updateState.isLoading;

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, locale }));
  }, [locale]);

  function resetForm() {
    setEditingId('');
    setForm({ ...EMPTY_FORM, locale });
  }

  function updateForm<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function doSearch() {
    setSearch(searchInput.trim());
  }

  function buildBody(): ProductUpsertBody | null {
    const title = form.title.trim();
    const slug = form.slug.trim();
    const categoryId = form.category_id.trim();
    const price = Number(form.price);
    const stock = Number(form.stock_quantity);
    const orderNum = Number(form.order_num);

    if (!title || !slug || !categoryId) {
      toast.error('Başlık, slug ve kategori gerekli');
      return null;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Geçerli bir fiyat gir');
      return null;
    }

    return {
      locale: form.locale,
      item_type: 'product',
      title,
      slug,
      description: form.description.trim() || null,
      price,
      category_id: categoryId,
      sub_category_id: form.sub_category_id === 'none' ? null : form.sub_category_id,
      image_url: form.image_url.trim() || null,
      images: form.image_url.trim() ? [form.image_url.trim()] : [],
      product_code: form.product_code.trim() || null,
      stock_quantity: Number.isFinite(stock) ? Math.max(0, stock) : 0,
      order_num: Number.isFinite(orderNum) ? Math.max(0, orderNum) : 0,
      tags: parseTags(form.tags),
      specifications: parseSpecifications(form.specifications),
      alt: form.alt.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      is_active: form.is_active ? 1 : 0,
      is_featured: form.is_featured ? 1 : 0,
    };
  }

  async function saveProduct() {
    const body = buildBody();
    if (!body) return;

    try {
      if (editingId) {
        await updateProduct({ id: editingId, body }).unwrap();
        toast.success('Ürün güncellendi');
      } else {
        await createProduct(body).unwrap();
        toast.success('Ürün oluşturuldu');
      }
      resetForm();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function removeProduct(id: string) {
    try {
      await deleteProduct({ id }).unwrap();
      if (editingId === id) resetForm();
      toast.success('Ürün silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase">
            <Package className="size-4 text-sky-600" />
            Woody Store
          </div>
          <h1 className="font-semibold text-3xl text-foreground tracking-normal">Ürünler</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Mağaza ürünleri, fiyat, stok, kategori, görsel ve SEO alanları.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              productsQ.refetch();
              categoriesQ.refetch();
              subcategoriesQ.refetch();
            }}
            disabled={productsQ.isFetching || categoriesQ.isFetching}
          >
            <RefreshCcw
              className={cn(
                'mr-2 size-4',
                (productsQ.isFetching || categoriesQ.isFetching) && 'animate-spin',
              )}
            />
            Yenile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(420px,520px)_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="size-5 text-sky-600" />
              {editingId ? 'Ürün Düzenle' : 'Yeni Ürün'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <div className="space-y-2">
                  <Label htmlFor="product-title">Başlık</Label>
                  <Input
                    id="product-title"
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                    onBlur={() => {
                      if (!form.slug) updateForm('slug', slugify(form.title));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Fiyat</Label>
                  <Input
                    id="product-price"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) => updateForm('price', event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-slug">Slug</Label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    id="product-slug"
                    value={form.slug}
                    onChange={(event) => updateForm('slug', event.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={() => updateForm('slug', slugify(form.title))}>
                    Slug üret
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Açıklama</Label>
                <Textarea
                  id="product-description"
                  className="min-h-24"
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(value) => {
                      updateForm('category_id', value);
                      updateForm('sub_category_id', 'none');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alt kategori</Label>
                  <Select
                    value={form.sub_category_id}
                    onValueChange={(value) => updateForm('sub_category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alt kategori seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Yok</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="product-code">Ürün kodu</Label>
                  <Input
                    id="product-code"
                    value={form.product_code}
                    onChange={(event) => updateForm('product_code', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Stok</Label>
                  <Input
                    id="product-stock"
                    inputMode="numeric"
                    value={form.stock_quantity}
                    onChange={(event) => updateForm('stock_quantity', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-order">Sıra</Label>
                  <Input
                    id="product-order"
                    inputMode="numeric"
                    value={form.order_num}
                    onChange={(event) => updateForm('order_num', event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-image">Görsel URL</Label>
                <Input
                  id="product-image"
                  value={form.image_url}
                  onChange={(event) => updateForm('image_url', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-alt">Görsel alt metni</Label>
                <Input
                  id="product-alt"
                  value={form.alt}
                  onChange={(event) => updateForm('alt', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-tags">Etiketler</Label>
                <Input
                  id="product-tags"
                  value={form.tags}
                  onChange={(event) => updateForm('tags', event.target.value)}
                  placeholder="basic, storyland, kitap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-specs">Özellikler</Label>
                <Textarea
                  id="product-specs"
                  className="min-h-20"
                  value={form.specifications}
                  onChange={(event) => updateForm('specifications', event.target.value)}
                  placeholder={'Seviye: Basic\nTür: Basılı kitap'}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-meta-title">Meta title</Label>
                  <Input
                    id="product-meta-title"
                    value={form.meta_title}
                    onChange={(event) => updateForm('meta_title', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-meta-description">Meta description</Label>
                  <Input
                    id="product-meta-description"
                    value={form.meta_description}
                    onChange={(event) => updateForm('meta_description', event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked: boolean) => updateForm('is_active', checked)}
                  />
                  <span className="text-sm">Aktif</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(checked: boolean) => updateForm('is_featured', checked)}
                  />
                  <span className="text-sm">Öne çıkan</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveProduct} disabled={isSaving}>
                <Save className="mr-2 size-4" />
                {editingId ? 'Güncelle' : 'Oluştur'}
              </Button>
              {editingId ? (
                <Button variant="ghost" onClick={resetForm}>
                  Yeni ürün
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4 text-lg">
              <span className="flex items-center gap-2">
                <Package className="size-5 text-orange-600" />
                Ürün Listesi
              </span>
              <Badge variant="secondary">{products.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') doSearch();
                  }}
                  placeholder="Başlıkta ara"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm kategoriler</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={doSearch}>
                <Search className="mr-2 size-4" />
                Ara
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsQ.isLoading ? (
                  ['product-skeleton-1', 'product-skeleton-2', 'product-skeleton-3'].map((key) => (
                    <TableRow key={key}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                      Ürün bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 items-center justify-center rounded-md border bg-muted/40">
                            {product.image_url ? (
                              <div
                                aria-label={product.alt ?? product.title}
                                className="size-full rounded-md bg-center bg-cover"
                                role="img"
                                style={{ backgroundImage: `url("${product.image_url}")` }}
                              />
                            ) : (
                              <ImageIcon className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{product.title}</div>
                            <div className="text-muted-foreground text-xs">
                              {product.product_code ?? product.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category_name ?? '-'}</TableCell>
                      <TableCell>{formatMoney(product.price)}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <ActiveBadge active={product.is_active} />
                          {product.is_featured ? (
                            <Badge variant="secondary" className="w-fit rounded-md">
                              Öne çıkan
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(product.id);
                              setForm(productToForm(product));
                            }}
                          >
                            Düzenle
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProduct(product.id)}
                            disabled={deleteState.isLoading}
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

            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-muted-foreground text-sm">
              <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
              Ürün görselleri URL veya storage asset entegrasyonu ile güncellenebilir; gerçek upload için
              storage ekranı ayrı kalır.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
