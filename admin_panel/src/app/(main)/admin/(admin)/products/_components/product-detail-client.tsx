'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ImageIcon, Package, Save, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ProductAdminView, ProductUpsertBody } from '@/integrations/shared';
import {
  useCreateProductAdminMutation,
  useGetProductAdminQuery,
  useListProductCategoriesAdminQuery,
  useListProductSubcategoriesAdminQuery,
  useUpdateProductAdminMutation,
} from '@/integrations/hooks';

const LOCALES = ['tr', 'en'];

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const AREA_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

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

function emptyForm(locale: string): ProductForm {
  return {
    locale,
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
}

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

function parseTags(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
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

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = id === 'new';
  const initialLocale = (searchParams.get('locale') || 'tr').toLowerCase();

  const [locale, setLocale] = React.useState(LOCALES.includes(initialLocale) ? initialLocale : 'tr');
  const [form, setForm] = React.useState<ProductForm>(() => emptyForm(locale));

  const productQ = useGetProductAdminQuery({ id, locale }, { skip: isNew });
  const categoriesQ = useListProductCategoriesAdminQuery({ locale });
  const subcategoriesQ = useListProductSubcategoriesAdminQuery({
    locale,
    categoryId: form.category_id || undefined,
  });

  const [createProduct, createState] = useCreateProductAdminMutation();
  const [updateProduct, updateState] = useUpdateProductAdminMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const categories = categoriesQ.data ?? [];
  const subcategories = subcategoriesQ.data ?? [];

  // Edit: (id, locale) basina bir kez form'u doldur
  const hydratedKey = React.useRef('');
  React.useEffect(() => {
    if (isNew) return;
    const data = productQ.data;
    if (!data) return;
    const key = `${id}:${locale}`;
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;
    setForm(productToForm(data));
  }, [isNew, id, locale, productQ.data]);

  // New: locale degisince form.locale'i guncelle (girilen veriyi koru)
  React.useEffect(() => {
    if (!isNew) return;
    setForm((prev) => ({ ...prev, locale }));
  }, [isNew, locale]);

  function updateForm<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  async function save() {
    const body = buildBody();
    if (!body) return;
    try {
      if (isNew) {
        const created = await createProduct(body).unwrap();
        toast.success('Ürün oluşturuldu');
        router.replace(`/admin/products/${created.id}?locale=${encodeURIComponent(locale)}`);
      } else {
        await updateProduct({ id, body }).unwrap();
        toast.success('Ürün güncellendi');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  if (!isNew && productQ.isError) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/products')}
          className="rounded-full hover:bg-gm-surface transition-all"
        >
          <ArrowLeft className="mr-2 size-4" />
          Ürünler
        </Button>
        <Card className="bg-gm-error/5 border-gm-error/20 rounded-[32px] p-12 text-center">
          <h2 className="font-serif text-2xl text-gm-error mb-2">Ürün yüklenemedi</h2>
          <Button
            variant="outline"
            onClick={() => productQ.refetch()}
            className="rounded-full border-gm-error/30 text-gm-error hover:bg-gm-error/10 transition-all"
          >
            Tekrar dene
          </Button>
        </Card>
      </div>
    );
  }

  const loading = !isNew && productQ.isLoading;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/products')}
              className="rounded-full -ml-3 hover:bg-gm-surface group transition-all"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Woody Store
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-4xl text-gm-text">
              {isNew ? 'Yeni Ürün' : form.title || 'Ürün'}
            </h1>
            {!isNew ? (
              <Badge
                className={cn(
                  'rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase border',
                  form.is_active
                    ? 'bg-gm-success/10 text-gm-success border-gm-success/20'
                    : 'bg-gm-error/10 text-gm-error border-gm-error/20',
                )}
              >
                {form.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
            ) : null}
          </div>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {isNew ? 'Yeni bir mağaza ürünü oluşturun.' : `ID: ${id}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-gm-border-soft bg-gm-surface/20 px-4 py-2 text-gm-muted text-[10px] font-bold tracking-widest uppercase"
          >
            Dil
          </Badge>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="rounded-full border-gm-border-soft bg-gm-surface/20 h-11 w-28 text-[10px] font-bold tracking-widest uppercase">
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
        </div>
      </div>

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-[32px] bg-gm-surface/20" />
          <Skeleton className="h-96 rounded-[32px] bg-gm-surface/20" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
          {/* Ürün bilgileri */}
          <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
            <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
              <CardTitle className="font-serif text-2xl flex items-center gap-3">
                <Package className="h-5 w-5 text-gm-gold" />
                Ürün Bilgileri
              </CardTitle>
              <CardDescription className="font-serif italic text-gm-muted opacity-70">
                {locale.toUpperCase()} içeriği — başlık, fiyat, kategori, stok.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
                <div className="space-y-3">
                  <Label htmlFor="p-title" className={LABEL_CLS}>
                    Başlık
                  </Label>
                  <Input
                    id="p-title"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    onBlur={() => {
                      if (!form.slug) updateForm('slug', slugify(form.title));
                    }}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-price" className={LABEL_CLS}>
                    Fiyat (₺)
                  </Label>
                  <Input
                    id="p-price"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="p-slug" className={LABEL_CLS}>
                  Slug
                </Label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    id="p-slug"
                    value={form.slug}
                    onChange={(e) => updateForm('slug', e.target.value)}
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateForm('slug', slugify(form.title))}
                    className="rounded-2xl border-gm-border-soft h-12 px-5 text-[10px] font-bold tracking-widest uppercase"
                  >
                    <Sparkles className="mr-2 size-3.5" />
                    Üret
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="p-desc" className={LABEL_CLS}>
                  Açıklama
                </Label>
                <Textarea
                  id="p-desc"
                  className={cn(AREA_CLS, 'min-h-28')}
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Kategori</Label>
                  <Select
                    value={form.category_id || undefined}
                    onValueChange={(value) => {
                      updateForm('category_id', value);
                      updateForm('sub_category_id', 'none');
                    }}
                  >
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue placeholder="Kategori seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Alt kategori</Label>
                  <Select
                    value={form.sub_category_id}
                    onValueChange={(value) => updateForm('sub_category_id', value)}
                  >
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue placeholder="Alt kategori seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
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

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-3">
                  <Label htmlFor="p-code" className={LABEL_CLS}>
                    Ürün kodu
                  </Label>
                  <Input
                    id="p-code"
                    value={form.product_code}
                    onChange={(e) => updateForm('product_code', e.target.value)}
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-stock" className={LABEL_CLS}>
                    Stok
                  </Label>
                  <Input
                    id="p-stock"
                    inputMode="numeric"
                    value={form.stock_quantity}
                    onChange={(e) => updateForm('stock_quantity', e.target.value)}
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-order" className={LABEL_CLS}>
                    Sıra
                  </Label>
                  <Input
                    id="p-order"
                    inputMode="numeric"
                    value={form.order_num}
                    onChange={(e) => updateForm('order_num', e.target.value)}
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex h-12 items-center justify-between px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                  <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">
                    Aktif
                  </Label>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked: boolean) => updateForm('is_active', checked)}
                    className="data-[state=checked]:bg-gm-gold"
                  />
                </div>
                <div className="flex h-12 items-center justify-between px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                  <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">
                    Öne çıkan
                  </Label>
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(checked: boolean) => updateForm('is_featured', checked)}
                    className="data-[state=checked]:bg-gm-gold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Görsel & SEO */}
          <div className="space-y-8">
            <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
              <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-gm-gold" />
                  Görsel & Etiketler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {form.image_url ? (
                  <div
                    role="img"
                    aria-label={form.alt || form.title}
                    className="w-full aspect-video rounded-2xl border border-gm-border-soft bg-gm-surface bg-center bg-cover"
                    style={{ backgroundImage: `url("${form.image_url}")` }}
                  />
                ) : (
                  <div className="w-full aspect-video rounded-2xl border border-dashed border-gm-border-soft bg-gm-surface/30 flex items-center justify-center text-gm-muted/50">
                    <ImageIcon className="size-10" />
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="p-image" className={LABEL_CLS}>
                    Görsel URL
                  </Label>
                  <Input
                    id="p-image"
                    value={form.image_url}
                    onChange={(e) => updateForm('image_url', e.target.value)}
                    placeholder="/media/woody/... veya https://..."
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-alt" className={LABEL_CLS}>
                    Görsel alt metni
                  </Label>
                  <Input
                    id="p-alt"
                    value={form.alt}
                    onChange={(e) => updateForm('alt', e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-tags" className={LABEL_CLS}>
                    Etiketler
                  </Label>
                  <Input
                    id="p-tags"
                    value={form.tags}
                    onChange={(e) => updateForm('tags', e.target.value)}
                    placeholder="basic, storyland, kitap"
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-specs" className={LABEL_CLS}>
                    Özellikler
                  </Label>
                  <Textarea
                    id="p-specs"
                    className={cn(AREA_CLS, 'min-h-24')}
                    value={form.specifications}
                    onChange={(e) => updateForm('specifications', e.target.value)}
                    placeholder={'Seviye: Basic\nTür: Basılı kitap'}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
              <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                  <Search className="h-5 w-5 text-gm-gold" />
                  SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="p-meta-title" className={LABEL_CLS}>
                    Meta title
                  </Label>
                  <Input
                    id="p-meta-title"
                    value={form.meta_title}
                    onChange={(e) => updateForm('meta_title', e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-meta-desc" className={LABEL_CLS}>
                    Meta description
                  </Label>
                  <Textarea
                    id="p-meta-desc"
                    className={cn(AREA_CLS, 'min-h-20')}
                    value={form.meta_description}
                    onChange={(e) => updateForm('meta_description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/products')}
          className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all text-[10px] font-bold tracking-widest uppercase"
        >
          İptal
        </Button>
        <Button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-dim px-10 h-12 font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-gm-gold/20 transition-all active:scale-95"
        >
          <Save className="mr-2 size-4" />
          {isNew ? 'Oluştur' : 'Güncelle'}
        </Button>
      </div>
    </div>
  );
}
