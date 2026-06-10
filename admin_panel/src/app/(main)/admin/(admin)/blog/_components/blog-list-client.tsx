'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpenText, Eye, ImageIcon, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  useDeleteBlogPostAdminMutation,
  useListBlogPostsAdminQuery,
} from '@/integrations/hooks';

const LOCALES = ['tr', 'en'];

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
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

function StatusPill({ status, active }: { status: string; active: boolean }) {
  const published = status === 'published' && active;
  const label = published ? 'Yayında' : active ? 'Taslak' : 'Pasif';
  const tone = published
    ? 'bg-gm-success/10 text-gm-success'
    : active
      ? 'bg-gm-gold/10 text-gm-gold'
      : 'bg-gm-error/10 text-gm-error';
  const dot = published ? 'bg-gm-success' : active ? 'bg-gm-gold' : 'bg-gm-error';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest',
        tone,
      )}
    >
      <div className={cn('w-1 h-1 rounded-full', dot)} />
      {label}
    </div>
  );
}

export default function BlogListClient() {
  const [locale, setLocale] = React.useState('tr');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');

  const postsQ = useListBlogPostsAdminQuery({ locale });
  const [deletePost, deleteState] = useDeleteBlogPostAdminMutation();

  const posts = postsQ.data ?? [];
  const filteredPosts = React.useMemo(() => {
    const q = search.toLocaleLowerCase('tr-TR');
    if (!q) return posts;
    return posts.filter((post) =>
      [post.title, post.slug, post.category, post.author]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('tr-TR').includes(q)),
    );
  }, [posts, search]);

  async function removePost(id: string) {
    try {
      await deletePost({ id, locale }).unwrap();
      toast.success('Blog yazısı silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  const editHref = (id: string) =>
    `/admin/blog/${encodeURIComponent(id)}?locale=${encodeURIComponent(locale)}`;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Woody İçerik
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Blog</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Dinamik blog yazıları; yayın durumu, görsel ve SEO alanları.
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
            onClick={() => postsQ.refetch()}
            disabled={postsQ.isFetching}
            className="rounded-full border-gm-border-soft px-8 h-12 bg-gm-surface/20 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn('mr-2 size-4', postsQ.isFetching && 'animate-spin')} />
            Yenile
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
          >
            <Link href={`/admin/blog/new?locale=${encodeURIComponent(locale)}`}>
              <Plus className="mr-2 size-4" />
              Yeni Yazı
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8">
          <div className="space-y-3 max-w-xl">
            <Label className={LABEL_CLS}>Ara</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/60" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput.trim())}
                placeholder="Başlık, slug, kategori, yazar..."
                className={cn(INPUT_CLS, 'pl-12')}
              />
            </div>
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
                  Başlık
                </TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Kategori
                </TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Durum
                </TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  Yayın
                </TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                  İşlem
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postsQ.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8">
                      <Skeleton className="h-12 w-56 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6">
                      <Skeleton className="h-4 w-24 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <Skeleton className="h-6 w-20 mx-auto bg-gm-surface/20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-6">
                      <Skeleton className="h-4 w-20 bg-gm-surface/20" />
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <Skeleton className="h-8 w-16 ml-auto bg-gm-surface/20 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <BookOpenText className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">
                        Blog yazısı bulunamadı. “Yeni Yazı” ile ekleyin.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow
                    key={post.id}
                    className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                  >
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl border border-gm-border-soft bg-gm-surface overflow-hidden group-hover:border-gm-gold/50 transition-all">
                          {post.image_url ? (
                            <div
                              aria-label={post.title}
                              className="size-full bg-center bg-cover"
                              role="img"
                              style={{ backgroundImage: `url("${post.image_url}")` }}
                            />
                          ) : (
                            <ImageIcon className="size-4 text-gm-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={editHref(post.id)}
                            className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors block truncate"
                          >
                            {post.title || '-'}
                          </Link>
                          <div className="text-[10px] text-gm-muted font-mono opacity-60 lowercase tracking-tighter truncate">
                            {post.slug || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-sm text-gm-muted capitalize">
                      {post.category}
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <StatusPill status={post.status} active={post.is_active} />
                    </TableCell>
                    <TableCell className="py-6 text-sm text-gm-muted font-mono">
                      {formatDate(post.published_at, locale)}
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-1 opacity-30 group-hover:opacity-100 transition-all">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-colors"
                        >
                          <Link prefetch={false} href={editHref(post.id)}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePost(post.id)}
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
          {filteredPosts.length} yazı · {locale.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
