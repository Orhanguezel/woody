'use client';

import * as React from 'react';
import { BookOpenText, CheckCircle2, Plus, RefreshCcw, Save, Search, Trash2 } from 'lucide-react';
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
import type { BlogCategory, BlogPostAdminView, BlogPostUpsertBody } from '@/integrations/shared';
import {
  useCreateBlogPostAdminMutation,
  useDeleteBlogPostAdminMutation,
  useListBlogPostsAdminQuery,
  useUpdateBlogPostAdminMutation,
} from '@/integrations/hooks';

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

const EMPTY_FORM: BlogForm = {
  locale: 'tr',
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

function formatDate(value: string | null, locale: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

function StatusBadge({ status, active }: { status: string; active: boolean }) {
  const published = status === 'published' && active;
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md border px-2 py-0.5 text-[11px]',
        published ? 'border-emerald-400/40 text-emerald-700' : 'border-slate-300 text-slate-500',
      )}
    >
      {published ? 'Yayında' : active ? 'Taslak' : 'Pasif'}
    </Badge>
  );
}

export default function AdminBlogClient() {
  const [locale, setLocale] = React.useState('tr');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [editingId, setEditingId] = React.useState('');
  const [form, setForm] = React.useState<BlogForm>(EMPTY_FORM);

  const postsQ = useListBlogPostsAdminQuery({ locale });
  const [createPost, createState] = useCreateBlogPostAdminMutation();
  const [updatePost, updateState] = useUpdateBlogPostAdminMutation();
  const [deletePost, deleteState] = useDeleteBlogPostAdminMutation();

  const posts = postsQ.data ?? [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const filteredPosts = React.useMemo(() => {
    const q = search.toLocaleLowerCase('tr-TR');
    if (!q) return posts;
    return posts.filter((post) =>
      [post.title, post.slug, post.category, post.author]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('tr-TR').includes(q)),
    );
  }, [posts, search]);

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, locale }));
  }, [locale]);

  function resetForm() {
    setEditingId('');
    setForm({ ...EMPTY_FORM, locale });
  }

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

  async function savePost() {
    const body = buildBody();
    if (!body) return;

    try {
      if (editingId) {
        await updatePost({ id: editingId, body }).unwrap();
        toast.success('Blog yazısı güncellendi');
      } else {
        await createPost(body).unwrap();
        toast.success('Blog yazısı oluşturuldu');
      }
      resetForm();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function removePost(id: string) {
    try {
      await deletePost({ id, locale }).unwrap();
      if (editingId === id) resetForm();
      toast.success('Blog yazısı silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase">
            <BookOpenText className="size-4 text-emerald-600" />
            Woody İçerik
          </div>
          <h1 className="font-semibold text-3xl text-foreground tracking-normal">Blog</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Dinamik blog yazıları, yayın durumu, görsel ve SEO alanları.
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
          <Button variant="outline" onClick={() => postsQ.refetch()} disabled={postsQ.isFetching}>
            <RefreshCcw className={cn('mr-2 size-4', postsQ.isFetching && 'animate-spin')} />
            Yenile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(420px,540px)_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="size-5 text-emerald-600" />
              {editingId ? 'Yazı Düzenle' : 'Yeni Yazı'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div className="space-y-2">
                <Label htmlFor="blog-title">Başlık</Label>
                <Input
                  id="blog-title"
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    updateForm('title', title);
                    if (!editingId) updateForm('slug', slugify(title));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-status">Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: BlogForm['status']) => updateForm('status', value)}
                >
                  <SelectTrigger id="blog-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="published">Yayında</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                value={form.slug}
                onChange={(event) => updateForm('slug', slugify(event.target.value))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blog-category">Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(value: BlogCategory) => updateForm('category', value)}
                >
                  <SelectTrigger id="blog-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-order">Sıra</Label>
                <Input
                  id="blog-order"
                  inputMode="numeric"
                  value={form.display_order}
                  onChange={(event) => updateForm('display_order', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-excerpt">Özet</Label>
              <Textarea
                id="blog-excerpt"
                value={form.excerpt}
                onChange={(event) => updateForm('excerpt', event.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-content">İçerik HTML</Label>
              <Textarea
                id="blog-content"
                value={form.content}
                onChange={(event) => updateForm('content', event.target.value)}
                rows={9}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blog-image">Görsel URL</Label>
                <Input
                  id="blog-image"
                  value={form.image_url}
                  onChange={(event) => updateForm('image_url', event.target.value)}
                  placeholder="/assets/woody/blog/example.svg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-author">Yazar</Label>
                <Input
                  id="blog-author"
                  value={form.author}
                  onChange={(event) => updateForm('author', event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blog-published-at">Yayın tarihi</Label>
                <Input
                  id="blog-published-at"
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(event) => updateForm('published_at', event.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="blog-active">Aktif</Label>
                  <p className="text-muted-foreground text-xs">Public sitede gösterilebilir.</p>
                </div>
                <Switch
                  id="blog-active"
                  checked={form.is_active}
                  onCheckedChange={(value) => updateForm('is_active', value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-meta-title">SEO başlık</Label>
              <Input
                id="blog-meta-title"
                value={form.meta_title}
                onChange={(event) => updateForm('meta_title', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-meta-description">SEO açıklama</Label>
              <Textarea
                id="blog-meta-description"
                value={form.meta_description}
                onChange={(event) => updateForm('meta_description', event.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                Temizle
              </Button>
              <Button onClick={savePost} disabled={isSaving}>
                <Save className="mr-2 size-4" />
                {isSaving ? 'Kaydediliyor' : editingId ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Yazılar
            </CardTitle>
            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setSearch(searchInput.trim());
                  }}
                  className="pl-9"
                  placeholder="Başlık, slug, kategori..."
                />
              </div>
              <Button variant="outline" onClick={() => setSearch(searchInput.trim())}>
                Ara
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {postsQ.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                Blog yazısı bulunamadı.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Yayın</TableHead>
                      <TableHead className="w-[180px] text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="min-w-64">
                            <p className="font-medium text-foreground">{post.title || '-'}</p>
                            <p className="text-muted-foreground text-xs">{post.slug || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>
                          <StatusBadge status={post.status} active={post.is_active} />
                        </TableCell>
                        <TableCell>{formatDate(post.published_at, locale)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(post.id);
                                setForm(postToForm(post));
                              }}
                            >
                              Düzenle
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removePost(post.id)}
                              disabled={deleteState.isLoading}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
