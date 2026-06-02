// =============================================================
// FILE: src/app/(main)/admin/(admin)/chat/components/ChatKnowledgePanel.tsx
// AI Knowledge Base CRUD panel — gm standart kabuk
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useListChatKnowledgeAdminQuery,
  useCreateChatKnowledgeAdminMutation,
  useUpdateChatKnowledgeAdminMutation,
  useDeleteChatKnowledgeAdminMutation,
} from '@/integrations/hooks';
import type {
  ChatAiKnowledgeItem,
  ChatAiKnowledgeCreateBody,
  ChatAiKnowledgeUpdateBody,
  ChatAiKnowledgeListParams,
} from '@/integrations/shared';

const FIELD = 'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-11 focus:ring-gm-gold/50 text-sm';
const LABEL = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';
const TH = 'py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted';

type FormState = {
  locale: string;
  title: string;
  content: string;
  tags: string;
  priority: number;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  locale: 'de',
  title: '',
  content: '',
  tags: '',
  priority: 100,
  is_active: true,
};

function KnowledgeFormDialog({
  open,
  onClose,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  editItem: ChatAiKnowledgeItem | null;
}) {
  const t = useAdminT('admin.chat');
  const { localeOptions, defaultLocaleFromDb, coerceLocale } = useAdminLocales();
  const [create, { isLoading: creating }] = useCreateChatKnowledgeAdminMutation();
  const [update, { isLoading: updating }] = useUpdateChatKnowledgeAdminMutation();

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);

  React.useEffect(() => {
    if (editItem) {
      setForm({
        locale: coerceLocale(editItem.locale, defaultLocaleFromDb),
        title: editItem.title,
        content: editItem.content,
        tags: editItem.tags ?? '',
        priority: editItem.priority,
        is_active: editItem.is_active === 1,
      });
    } else {
      setForm({ ...EMPTY_FORM, locale: coerceLocale('', defaultLocaleFromDb) || EMPTY_FORM.locale });
    }
  }, [editItem, open, coerceLocale, defaultLocaleFromDb]);

  const saving = creating || updating;

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error(t('knowledge.requiredFields'));
      return;
    }

    try {
      if (editItem) {
        const body: ChatAiKnowledgeUpdateBody = {
          locale: form.locale,
          title: form.title.trim(),
          content: form.content.trim(),
          tags: form.tags.trim() || null,
          priority: form.priority,
          is_active: form.is_active ? 1 : 0,
        };
        await update({ id: editItem.id, body }).unwrap();
        toast.success(t('knowledge.updated'));
      } else {
        const body: ChatAiKnowledgeCreateBody = {
          locale: form.locale,
          title: form.title.trim(),
          content: form.content.trim(),
          tags: form.tags.trim() || undefined,
          priority: form.priority,
          is_active: form.is_active ? 1 : 0,
        };
        await create(body).unwrap();
        toast.success(t('knowledge.created'));
      }
      onClose();
    } catch {
      toast.error(t('knowledge.saveError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-background border-gm-border-soft rounded-[28px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-gm-text">
            {editItem ? t('knowledge.editTitle') : t('knowledge.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LABEL}>{t('knowledge.locale')}</Label>
              <Select value={form.locale} onValueChange={(v) => setForm((p) => ({ ...p, locale: v }))}>
                <SelectTrigger className={FIELD}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  {(localeOptions.length
                    ? localeOptions
                    : [{ value: coerceLocale('', defaultLocaleFromDb) || 'de', label: 'Default' }]
                  )
                    .filter((opt) => !!opt.value)
                    .map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label || opt.value.toUpperCase()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={LABEL}>{t('knowledge.priority')}</Label>
              <Input
                type="number"
                min={0}
                max={1000}
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) || 100 }))}
                className={FIELD}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={LABEL}>{t('knowledge.titleLabel')}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t('knowledge.titlePlaceholder')}
              className={FIELD}
            />
          </div>

          <div className="space-y-2">
            <Label className={LABEL}>{t('knowledge.contentLabel')}</Label>
            <Textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder={t('knowledge.contentPlaceholder')}
              className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className={LABEL}>{t('knowledge.tags')}</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder={t('knowledge.tagsPlaceholder')}
              className={FIELD}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-4">
            <Label className="text-sm text-gm-text">{t('knowledge.active')}</Label>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v: boolean) => setForm((p) => ({ ...p, is_active: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-full border-gm-border-soft px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
            {t('knowledge.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px]">
            <Save className="mr-2 h-4 w-4" />
            {saving ? t('knowledge.saving') : t('knowledge.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main panel ─────────────────────────────────────────────

export default function ChatKnowledgePanel() {
  const t = useAdminT('admin.chat');
  const { localeOptions } = useAdminLocales();
  const [remove] = useDeleteChatKnowledgeAdminMutation();

  const [localeFilter, setLocaleFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ChatAiKnowledgeItem | null>(null);

  const params: ChatAiKnowledgeListParams = React.useMemo(() => {
    const p: ChatAiKnowledgeListParams = { limit: 100 };
    if (localeFilter !== 'all') p.locale = localeFilter;
    const q = search.trim();
    if (q) p.q = q;
    return p;
  }, [localeFilter, search]);

  const { data, isFetching } = useListChatKnowledgeAdminQuery(params);
  const items = data?.items ?? [];

  const handleEdit = (item: ChatAiKnowledgeItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id).unwrap();
      toast.success(t('knowledge.deleted'));
    } catch {
      toast.error(t('knowledge.deleteError'));
    }
  };

  return (
    <>
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[28px] backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[11px] font-bold tracking-[0.2em] uppercase text-gm-gold">{t('knowledge.title')}</CardTitle>
            <Button size="sm" onClick={handleAdd} className="rounded-full px-6 h-10 font-bold tracking-widest uppercase text-[10px]">
              <Plus className="mr-2 h-4 w-4" />
              {t('knowledge.addNew')}
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('knowledge.searchPlaceholder')}
              className={cn(FIELD, 'sm:max-w-[280px]')}
            />
            <Select value={localeFilter} onValueChange={setLocaleFilter}>
              <SelectTrigger className={cn(FIELD, 'w-[150px]')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                <SelectItem value="all">{t('knowledge.allLocales')}</SelectItem>
                {localeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label || opt.value.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-2xl border border-gm-border-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className={cn(TH, 'pl-6 w-[70px]')}>{t('knowledge.locale')}</TableHead>
                  <TableHead className={cn(TH, 'w-[60px] text-center')}>{t('knowledge.priority')}</TableHead>
                  <TableHead className={TH}>{t('knowledge.titleLabel')}</TableHead>
                  <TableHead className={cn(TH, 'hidden md:table-cell')}>{t('knowledge.tags')}</TableHead>
                  <TableHead className={cn(TH, 'w-[70px] text-center')}>{t('knowledge.active')}</TableHead>
                  <TableHead className={cn(TH, 'w-[100px] pr-6')} />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <AlertCircle className="w-12 h-12 text-gm-gold/50" />
                        <span className="font-serif italic text-base text-gm-muted">
                          {isFetching ? t('knowledge.loading') : t('knowledge.noItems')}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                      <TableCell className="py-5 pl-6">
                        <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-gm-border-soft bg-gm-surface/40 text-gm-muted">
                          {item.locale.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 text-center text-xs font-mono text-gm-muted">{item.priority}</TableCell>
                      <TableCell className="py-5">
                        <p className="text-sm font-medium text-gm-text">{item.title}</p>
                        <p className="text-xs text-gm-muted opacity-60 line-clamp-1 mt-0.5">{item.content}</p>
                      </TableCell>
                      <TableCell className="py-5 hidden md:table-cell text-xs text-gm-muted opacity-70">{item.tags || '-'}</TableCell>
                      <TableCell className="py-5 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border',
                          item.is_active ? 'bg-gm-success/10 text-gm-success border-gm-success/20' : 'bg-gm-surface/40 text-gm-muted border-gm-border-soft'
                        )}>
                          {item.is_active ? t('knowledge.yes') : t('knowledge.no')}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 pr-6">
                        <div className="flex gap-1 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-gm-gold/10 hover:text-gm-gold" onClick={() => handleEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-gm-error/10 hover:text-gm-error" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
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

      <KnowledgeFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editItem={editItem} />
    </>
  );
}
