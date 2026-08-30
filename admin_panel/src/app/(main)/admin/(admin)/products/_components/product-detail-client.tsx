'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  LinkIcon,
  Package,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ProductAdminView, ProductUpsertBody } from '@/integrations/shared';
import type { ProductContentUpsertBody } from '@/integrations/endpoints/admin/products_admin.endpoints';
import {
  useCreateProductContentAdminMutation,
  useCreateProductAdminMutation,
  useDeleteProductContentAdminMutation,
  useGetProductAdminQuery,
  useListLevelsAdminQuery,
  useListProductContentsAdminQuery,
  useListProductCategoriesAdminQuery,
  useListProductSubcategoriesAdminQuery,
  useListSeriesAdminQuery,
  useUpdateProductContentAdminMutation,
  useUpdateProductAdminMutation,
} from '@/integrations/hooks';
import { useContentLocales } from '@/app/(main)/admin/_components/common/useContentLocales';
import { IndexStatusPanel } from '@/app/(main)/admin/_components/common/IndexStatusPanel';
import { scoreProductSeoQuality } from '@/integrations/shared/product-seo-quality';
import ProductSeoQualityPanel from './product-seo-quality-panel';

// Ürün id'si saf hex (tire yok); slug tire içerir. URL'de slug kullanılsın diye ayırt eder.
const PRODUCT_ID_RE = /^[0-9a-f]{12,}$/i;

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
  series_id: string;
  level_id: string;
  purchase_mode: 'online' | 'quote';
  is_free: boolean;
  access_duration_days: string;
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
    series_id: 'none',
    level_id: 'none',
    purchase_mode: 'online',
    is_free: false,
    access_duration_days: '',
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
    series_id: product.series_id ?? 'none',
    level_id: product.level_id ?? 'none',
    purchase_mode: product.purchase_mode,
    is_free: product.is_free,
    access_duration_days: product.access_duration_days == null ? '' : String(product.access_duration_days),
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

  const { codes: LOCALES } = useContentLocales();
  const [locale, setLocale] = React.useState(initialLocale || 'tr');
  const [form, setForm] = React.useState<ProductForm>(() => emptyForm(locale));

  // Gerçek product_id — URL slug ile açıldığında GET yanıtından çözülür; API çağrıları bunu kullanır.
  const [productId, setProductId] = React.useState<string | null>(
    isNew ? null : PRODUCT_ID_RE.test(id) ? id : null,
  );
  const pid = productId ?? id;

  const productQ = useGetProductAdminQuery({ id: pid, locale }, { skip: isNew });
  const categoriesQ = useListProductCategoriesAdminQuery({ locale });
  const seriesQ = useListSeriesAdminQuery({ locale });
  const levelsQ = useListLevelsAdminQuery({ locale });
  const subcategoriesQ = useListProductSubcategoriesAdminQuery({
    locale,
    categoryId: form.category_id || undefined,
  });
  // İçerikler gerçek product_id gerektirir; slug çözülene kadar bekle.
  const contentsQ = useListProductContentsAdminQuery(
    { productId: productId ?? '', locale },
    { skip: isNew || !productId },
  );

  const [createProduct, createState] = useCreateProductAdminMutation();
  const [updateProduct, updateState] = useUpdateProductAdminMutation();
  const [createContent, createContentState] = useCreateProductContentAdminMutation();
  const [updateContent, updateContentState] = useUpdateProductContentAdminMutation();
  const [deleteContent, deleteContentState] = useDeleteProductContentAdminMutation();
  const saving = createState.isLoading || updateState.isLoading;
  const seoQuality = React.useMemo(
    () => scoreProductSeoQuality(form),
    [form],
  );

  const categories = categoriesQ.data ?? [];
  const subcategories = subcategoriesQ.data ?? [];
  const series = seriesQ.data ?? [];
  const levels = levelsQ.data ?? [];
  const contents = contentsQ.data ?? [];

  const [contentForm, setContentForm] = React.useState({
    id: '',
    kind: 'digital' as 'digital' | 'physical',
    media_type: 'video' as NonNullable<ProductContentUpsertBody['media_type']>,
    storage_asset_id: '',
    external_url: '',
    title: '',
    description: '',
    display_order: '0',
    is_preview: false,
    is_active: true,
  });

  // Edit: (id, locale) basina bir kez form'u doldur
  const hydratedKey = React.useRef('');
  React.useEffect(() => {
    if (isNew) return;
    const data = productQ.data;
    if (!data) return;
    const key = `${data.id}:${locale}`;
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;
    setForm(productToForm(data));
    setProductId(data.id);
    // Adres çubuğunda id yerine slug göster; locale değişince o dilin slug'ına senkronla.
    if (data.slug && data.slug !== id) {
      router.replace(`/admin/products/${encodeURIComponent(data.slug)}?locale=${encodeURIComponent(locale)}`, {
        scroll: false,
      });
    }
  }, [isNew, id, locale, productQ.data, router]);

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
    const accessDays = form.access_duration_days.trim()
      ? Number(form.access_duration_days)
      : null;

    if (!title || !slug || !categoryId) {
      toast.error('Başlık, slug ve kategori gerekli');
      return null;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Geçerli bir fiyat gir');
      return null;
    }
    if (accessDays !== null && (!Number.isFinite(accessDays) || accessDays < 1)) {
      toast.error('Erişim süresi boş veya pozitif gün olmalı');
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
      series_id: form.series_id === 'none' ? null : form.series_id,
      level_id: form.level_id === 'none' ? null : form.level_id,
      purchase_mode: form.purchase_mode,
      is_free: form.is_free ? 1 : 0,
      access_duration_days: accessDays,
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
        const created: { id: string } = await createProduct(body).unwrap();
        toast.success('Ürün oluşturuldu');
        router.replace(`/admin/products/${encodeURIComponent(form.slug.trim() || created.id)}?locale=${encodeURIComponent(locale)}`);
      } else {
        await updateProduct({ id: pid, body }).unwrap();
        toast.success('Ürün güncellendi');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  function resetContentForm() {
    setContentForm({
      id: '',
      kind: 'digital',
      media_type: 'video',
      storage_asset_id: '',
      external_url: '',
      title: '',
      description: '',
      display_order: '0',
      is_preview: false,
      is_active: true,
    });
  }

  async function saveContent() {
    if (isNew) return;
    const title = contentForm.title.trim();
    if (!title) {
      toast.error('İçerik başlığı gerekli');
      return;
    }
    const body: ProductContentUpsertBody = {
      locale,
      kind: contentForm.kind,
      media_type: contentForm.kind === 'digital' ? contentForm.media_type : null,
      storage_asset_id: contentForm.storage_asset_id.trim() || null,
      external_url: contentForm.external_url.trim() || null,
      title,
      description: contentForm.description.trim() || null,
      display_order: Number(contentForm.display_order) || 0,
      is_preview: contentForm.is_preview,
      is_active: contentForm.is_active,
    };
    try {
      if (contentForm.id) {
        await updateContent({ productId: pid, contentId: contentForm.id, body }).unwrap();
        toast.success('İçerik güncellendi');
      } else {
        await createContent({ productId: pid, body }).unwrap();
        toast.success('İçerik eklendi');
      }
      resetContentForm();
      contentsQ.refetch();
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
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="bg-gm-surface/20 border border-gm-border-soft rounded-full p-1">
            <TabsTrigger value="general" className="rounded-full px-6 text-[10px] font-bold uppercase tracking-widest">
              Genel
            </TabsTrigger>
            <TabsTrigger
              value="contents"
              disabled={isNew}
              className="rounded-full px-6 text-[10px] font-bold uppercase tracking-widest"
            >
              İçerikler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
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

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Seri</Label>
                  <Select value={form.series_id} onValueChange={(value) => updateForm('series_id', value)}>
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue placeholder="Seri seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      <SelectItem value="none">Yok</SelectItem>
                      {series.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name || item.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Seviye</Label>
                  <Select value={form.level_id} onValueChange={(value) => updateForm('level_id', value)}>
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue placeholder="Seviye seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      <SelectItem value="none">Yok</SelectItem>
                      {levels.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name || item.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Satış modu</Label>
                  <Select
                    value={form.purchase_mode}
                    onValueChange={(value) => updateForm('purchase_mode', value as 'online' | 'quote')}
                  >
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="quote">Teklif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="p-access-days" className={LABEL_CLS}>
                    Erişim süresi
                  </Label>
                  <Input
                    id="p-access-days"
                    inputMode="numeric"
                    value={form.access_duration_days}
                    onChange={(e) => updateForm('access_duration_days', e.target.value)}
                    placeholder="Boş = süresiz"
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
                <div className="flex h-12 items-center justify-between self-end px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                  <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">
                    Ücretsiz
                  </Label>
                  <Switch
                    checked={form.is_free}
                    onCheckedChange={(checked: boolean) => updateForm('is_free', checked)}
                    className="data-[state=checked]:bg-gm-gold"
                  />
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

            <ProductSeoQualityPanel score={seoQuality} />

            <IndexStatusPanel type="product" locale={locale} slug={form.slug} disabled={isNew} />
          </div>
            </div>
          </TabsContent>

          <TabsContent value="contents" className="mt-0">
            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] items-start">
              <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
                <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
                  <CardTitle className="font-serif text-2xl flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gm-gold" />
                    İçerikler
                  </CardTitle>
                  <CardDescription className="font-serif italic text-gm-muted opacity-70">
                    Dosya URL’i public yanıtta görünmez; erişim teslim ucundan yapılır.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gm-border-soft">
                    {contentsQ.isFetching && contents.length === 0 ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-6">
                          <Skeleton className="h-12 w-full bg-gm-surface/20" />
                        </div>
                      ))
                    ) : contents.length === 0 ? (
                      <div className="p-12 text-center text-gm-muted font-serif italic">
                        İçerik yok
                      </div>
                    ) : (
                      contents.map((item) => (
                        <div key={item.id} className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-full border-gm-border-soft text-[9px] uppercase tracking-widest">
                                {item.kind === 'physical' ? 'Matbu' : item.mediaType ?? 'Dijital'}
                              </Badge>
                              {item.isPreview ? (
                                <Badge className="rounded-full bg-gm-success/10 text-gm-success text-[9px] uppercase tracking-widest">
                                  Önizleme
                                </Badge>
                              ) : null}
                              {!item.isActive ? (
                                <Badge variant="secondary" className="rounded-full text-[9px] uppercase tracking-widest">
                                  Pasif
                                </Badge>
                              ) : null}
                            </div>
                            <div className="font-serif text-xl text-gm-text truncate">{item.title}</div>
                            <div className="text-[10px] text-gm-muted font-mono">
                              Sıra {item.displayOrder} · {item.storageAssetId || item.externalUrl || '-'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() =>
                                setContentForm({
                                  id: item.id,
                                  kind: item.kind,
                                  media_type: item.mediaType ?? 'video',
                                  storage_asset_id: item.storageAssetId ?? '',
                                  external_url: item.externalUrl ?? '',
                                  title: item.title,
                                  description: item.description ?? '',
                                  display_order: String(item.displayOrder),
                                  is_preview: item.isPreview,
                                  is_active: item.isActive,
                                })
                              }
                            >
                              Düzenle
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deleteContentState.isLoading}
                              className="rounded-full hover:bg-gm-error/10 hover:text-gm-error"
                              onClick={async () => {
                                try {
                                  await deleteContent({ productId: pid, contentId: item.id }).unwrap();
                                  toast.success('İçerik silindi');
                                  contentsQ.refetch();
                                } catch (error) {
                                  toast.error(apiErrorMessage(error));
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
                <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
                  <CardTitle className="font-serif text-2xl flex items-center gap-3">
                    <Plus className="h-5 w-5 text-gm-gold" />
                    {contentForm.id ? 'İçerik Düzenle' : 'İçerik Ekle'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className={LABEL_CLS}>Tür</Label>
                      <Select
                        value={contentForm.kind}
                        onValueChange={(value) =>
                          setContentForm((prev) => ({ ...prev, kind: value as 'digital' | 'physical' }))
                        }
                      >
                        <SelectTrigger className={INPUT_CLS}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                          <SelectItem value="digital">Dijital</SelectItem>
                          <SelectItem value="physical">Matbu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className={LABEL_CLS}>Medya</Label>
                      <Select
                        value={contentForm.media_type}
                        disabled={contentForm.kind === 'physical'}
                        onValueChange={(value) =>
                          setContentForm((prev) => ({
                            ...prev,
                            media_type: value as NonNullable<ProductContentUpsertBody['media_type']>,
                          }))
                        }
                      >
                        <SelectTrigger className={INPUT_CLS}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                          {['video', 'pdf', 'audio', 'image', 'other'].map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className={LABEL_CLS}>Başlık</Label>
                    <Input
                      value={contentForm.title}
                      onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))}
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={LABEL_CLS}>Açıklama</Label>
                    <Textarea
                      value={contentForm.description}
                      onChange={(e) => setContentForm((prev) => ({ ...prev, description: e.target.value }))}
                      className={cn(AREA_CLS, 'min-h-20')}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={LABEL_CLS}>Storage asset ID</Label>
                    <Input
                      value={contentForm.storage_asset_id}
                      onChange={(e) => setContentForm((prev) => ({ ...prev, storage_asset_id: e.target.value }))}
                      className={cn(INPUT_CLS, 'font-mono')}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={LABEL_CLS}>Harici URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/60" />
                      <Input
                        value={contentForm.external_url}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, external_url: e.target.value }))}
                        className={cn(INPUT_CLS, 'pl-12 font-mono')}
                      />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-[1fr_1fr_1fr]">
                    <div className="space-y-3">
                      <Label className={LABEL_CLS}>Sıra</Label>
                      <Input
                        inputMode="numeric"
                        value={contentForm.display_order}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, display_order: e.target.value }))}
                        className={cn(INPUT_CLS, 'font-mono')}
                      />
                    </div>
                    <div className="flex h-12 items-center justify-between self-end px-4 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                      <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">Önizleme</Label>
                      <Switch
                        checked={contentForm.is_preview}
                        onCheckedChange={(value) => setContentForm((prev) => ({ ...prev, is_preview: value }))}
                      />
                    </div>
                    <div className="flex h-12 items-center justify-between self-end px-4 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                      <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase">Aktif</Label>
                      <Switch
                        checked={contentForm.is_active}
                        onCheckedChange={(value) => setContentForm((prev) => ({ ...prev, is_active: value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={resetContentForm} className="rounded-full">
                      Temizle
                    </Button>
                    <Button
                      onClick={saveContent}
                      disabled={createContentState.isLoading || updateContentState.isLoading}
                      className="rounded-full"
                    >
                      <Save className="mr-2 size-4" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
