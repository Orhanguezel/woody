'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpenText,
  CalendarClock,
  ImageIcon,
  Save,
  Search,
  Sparkles,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { BlogCategory, BlogPostAdminView, BlogPostUpsertBody } from '@/integrations/shared';
import {
  useCreateBlogPostAdminMutation,
  useGetBlogPostAdminQuery,
  useUpdateBlogPostAdminMutation,
} from '@/integrations/hooks';

const LOCALES = ['tr', 'en'];

const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'genel', label: 'Genel' },
  { value: 'haber', label: 'Haber' },
  { value: 'okul-oncesi', label: 'Okul öncesi' },
  { value: 'aile', label: 'Aile' },
  { value: 'dijital-icerik', label: 'Dijital içerik' },
  { value: 'ogretmen', label: 'Öğretmen' },
  { value: 'okul', label: 'Okul' },
  { value: 'etkinlik', label: 'Etkinlik' },
  { value: 'mevsimsel', label: 'Mevsimsel' },
];

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const AREA_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

type BlogForm = {
  locale: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  author: string;
  image_url: string;
  status: 'draft' | 'published';
  published_at: string;
  display_order: string;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
};

function emptyForm(locale: string): BlogForm {
  return {
    locale,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'genel',
    author: 'Woody Editör Ekibi',
    image_url: '',
    status: 'draft',
    published_at: '',
    display_order: '0',
    meta_title: '',
    meta_description: '',
    is_active: true,
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

function toInputDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function postToForm(post: BlogPostAdminView): BlogForm {
  return {
    locale: post.locale,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    content: post.content ?? '',
    category: post.category,
    author: post.author ?? '',
    image_url: post.image_url ?? '',
    status: post.status,
    published_at: toInputDateTime(post.published_at),
    display_order: String(post.display_order),
    meta_title: post.meta_title ?? '',
    meta_description: post.meta_description ?? '',
    is_active: post.is_active,
  };
}

export default function BlogDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = id === 'new';
  const initialLocale = (searchParams.get('locale') || 'tr').toLowerCase();

  const [locale, setLocale] = React.useState(LOCALES.includes(initialLocale) ? initialLocale : 'tr');
  const [form, setForm] = React.useState<BlogForm>(() => emptyForm(locale));

  const postQ = useGetBlogPostAdminQuery({ id, locale }, { skip: isNew });
  const [createPost, createState] = useCreateBlogPostAdminMutation();
  const [updatePost, updateState] = useUpdateBlogPostAdminMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const hydratedKey = React.useRef('');
  React.useEffect(() => {
    if (isNew) return;
    const data = postQ.data;
    if (!data) return;
    const key = `${id}:${locale}`;
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;
    setForm(postToForm(data));
  }, [isNew, id, locale, postQ.data]);

  React.useEffect(() => {
    if (!isNew) return;
    setForm((prev) => ({ ...prev, locale }));
  }, [isNew, locale]);

  function updateForm<K extends keyof BlogForm>(key: K, value: BlogForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildBody(): BlogPostUpsertBody | null {
    const title = form.title.trim();
    const slug = form.slug.trim();
    const content = form.content.trim();
    const order = Number(form.display_order);

    if (!title || !slug || !content) {
      toast.error('Başlık, slug ve içerik gerekli');
      return null;
    }

    return {
      locale: form.locale,
      title,
      slug,
      content,
      category: form.category,
      author: form.author.trim() || null,
      image_url: form.image_url.trim() || null,
      status: form.status,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      excerpt: form.excerpt.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      display_order: Number.isFinite(order) ? Math.max(0, order) : 0,
      is_active: form.is_active,
    };
  }

  async function save() {
    const body = buildBody();
    if (!body) return;
    try {
      if (isNew) {
        const created = await createPost(body).unwrap();
        toast.success('Blog yazısı oluşturuldu');
        router.replace(`/admin/blog/${created.id}?locale=${encodeURIComponent(locale)}`);
      } else {
        await updatePost({ id, body }).unwrap();
        toast.success('Blog yazısı güncellendi');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  if (!isNew && postQ.isError) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/blog')}
          className="rounded-full hover:bg-gm-surface transition-all"
        >
          <ArrowLeft className="mr-2 size-4" />
          Blog
        </Button>
        <Card className="bg-gm-error/5 border-gm-error/20 rounded-[32px] p-12 text-center">
          <h2 className="font-serif text-2xl text-gm-error mb-2">Yazı yüklenemedi</h2>
          <Button
            variant="outline"
            onClick={() => postQ.refetch()}
            className="rounded-full border-gm-error/30 text-gm-error hover:bg-gm-error/10 transition-all"
          >
            Tekrar dene
          </Button>
        </Card>
      </div>
    );
  }

  const loading = !isNew && postQ.isLoading;
  const published = form.status === 'published' && form.is_active;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/blog')}
              className="rounded-full -ml-3 hover:bg-gm-surface group transition-all"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Woody İçerik
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-4xl text-gm-text">
              {isNew ? 'Yeni Yazı' : form.title || 'Blog Yazısı'}
            </h1>
            {!isNew ? (
              <Badge
                className={cn(
                  'rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase border',
                  published
                    ? 'bg-gm-success/10 text-gm-success border-gm-success/20'
                    : form.is_active
                      ? 'bg-gm-gold/10 text-gm-gold border-gm-gold/20'
                      : 'bg-gm-error/10 text-gm-error border-gm-error/20',
                )}
              >
                {published ? 'Yayında' : form.is_active ? 'Taslak' : 'Pasif'}
              </Badge>
            ) : null}
          </div>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {isNew ? 'Yeni bir blog yazısı oluşturun.' : `ID: ${id}`}
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
          {/* Yazı bilgileri */}
          <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
            <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
              <CardTitle className="font-serif text-2xl flex items-center gap-3">
                <BookOpenText className="h-5 w-5 text-gm-gold" />
                Yazı Bilgileri
              </CardTitle>
              <CardDescription className="font-serif italic text-gm-muted opacity-70">
                {locale.toUpperCase()} içeriği — başlık, kategori, özet, gövde.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
                <div className="space-y-3">
                  <Label htmlFor="b-title" className={LABEL_CLS}>
                    Başlık
                  </Label>
                  <Input
                    id="b-title"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      updateForm('title', title);
                      if (isNew) updateForm('slug', slugify(title));
                    }}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Durum</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value: BlogForm['status']) => updateForm('status', value)}
                  >
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="published">Yayında</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="b-slug" className={LABEL_CLS}>
                  Slug
                </Label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    id="b-slug"
                    value={form.slug}
                    onChange={(e) => updateForm('slug', slugify(e.target.value))}
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

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className={LABEL_CLS}>Kategori</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value: BlogCategory) => updateForm('category', value)}
                  >
                    <SelectTrigger className={INPUT_CLS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                      {BLOG_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="b-order" className={LABEL_CLS}>
                    Sıra
                  </Label>
                  <Input
                    id="b-order"
                    inputMode="numeric"
                    value={form.display_order}
                    onChange={(e) => updateForm('display_order', e.target.value)}
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="b-excerpt" className={LABEL_CLS}>
                  Özet
                </Label>
                <Textarea
                  id="b-excerpt"
                  value={form.excerpt}
                  onChange={(e) => updateForm('excerpt', e.target.value)}
                  className={cn(AREA_CLS, 'min-h-20')}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="b-content" className={LABEL_CLS}>
                  İçerik (HTML)
                </Label>
                <Textarea
                  id="b-content"
                  value={form.content}
                  onChange={(e) => updateForm('content', e.target.value)}
                  className={cn(AREA_CLS, 'min-h-72 font-mono')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Görsel & Yayın & SEO */}
          <div className="space-y-8">
            <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
              <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                  <CalendarClock className="h-5 w-5 text-gm-gold" />
                  Görsel & Yayın
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {form.image_url ? (
                  <div
                    role="img"
                    aria-label={form.title}
                    className="w-full aspect-video rounded-2xl border border-gm-border-soft bg-gm-surface bg-center bg-cover"
                    style={{ backgroundImage: `url("${form.image_url}")` }}
                  />
                ) : (
                  <div className="w-full aspect-video rounded-2xl border border-dashed border-gm-border-soft bg-gm-surface/30 flex items-center justify-center text-gm-muted/50">
                    <ImageIcon className="size-10" />
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="b-image" className={LABEL_CLS}>
                    Görsel URL
                  </Label>
                  <Input
                    id="b-image"
                    value={form.image_url}
                    onChange={(e) => updateForm('image_url', e.target.value)}
                    placeholder="/assets/woody/blog/example.webp"
                    className={cn(INPUT_CLS, 'font-mono')}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="b-author" className={LABEL_CLS}>
                    Yazar
                  </Label>
                  <Input
                    id="b-author"
                    value={form.author}
                    onChange={(e) => updateForm('author', e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="b-published" className={LABEL_CLS}>
                    Yayın tarihi
                  </Label>
                  <Input
                    id="b-published"
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(e) => updateForm('published_at', e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="flex h-12 items-center justify-between px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                  <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">
                    Aktif (public)
                  </Label>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked: boolean) => updateForm('is_active', checked)}
                    className="data-[state=checked]:bg-gm-gold"
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
                  <Label htmlFor="b-meta-title" className={LABEL_CLS}>
                    SEO başlık
                  </Label>
                  <Input
                    id="b-meta-title"
                    value={form.meta_title}
                    onChange={(e) => updateForm('meta_title', e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="b-meta-desc" className={LABEL_CLS}>
                    SEO açıklama
                  </Label>
                  <Textarea
                    id="b-meta-desc"
                    value={form.meta_description}
                    onChange={(e) => updateForm('meta_description', e.target.value)}
                    className={cn(AREA_CLS, 'min-h-20')}
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
          onClick={() => router.push('/admin/blog')}
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
