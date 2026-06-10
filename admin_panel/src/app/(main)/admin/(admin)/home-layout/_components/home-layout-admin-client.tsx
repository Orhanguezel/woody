'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, RefreshCcw, Trash2, Plus, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

import {
  useListHomeSectionsAdminQuery,
  useUpdateHomeSectionAdminMutation,
  useReorderHomeSectionsAdminMutation,
  useDeleteHomeSectionAdminMutation,
  useCreateHomeSectionAdminMutation,
  type AdminHomeSectionDto,
} from '@/integrations/hooks';
import { HOME_LAYOUT_COMPONENT_OPTIONS } from '@/config/home-layout-components';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

async function revalidateHomeCache() {
  try {
    const res = await fetch('/admin/api/revalidate-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/tr' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface RowProps {
  section: AdminHomeSectionDto;
  expanded: boolean;
  onToggleExpand: () => void;
  onPatch: (patch: Partial<AdminHomeSectionDto>) => void;
  onDelete: () => void;
  saving: boolean;
}

function SortableRow({ section, expanded, onToggleExpand, onPatch, onDelete, saving }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const [configText, setConfigText] = React.useState(() => JSON.stringify(section.config ?? {}, null, 2));
  const [configError, setConfigError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setConfigText(JSON.stringify(section.config ?? {}, null, 2));
  }, [section.config]);

  const handleConfigSave = () => {
    try {
      const parsed = configText.trim() ? JSON.parse(configText) : null;
      setConfigError(null);
      onPatch({ config: parsed });
    } catch {
      setConfigError('Geçersiz JSON');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gm-border-soft rounded-2xl bg-gm-surface/30 backdrop-blur-sm overflow-hidden"
    >
      {/* Row header */}
      <div className="flex items-center gap-4 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gm-muted hover:text-gm-gold transition-colors p-1"
          aria-label="Sürükle"
        >
          <GripVertical className="size-5" />
        </button>

        <button
          onClick={onToggleExpand}
          className="text-gm-muted hover:text-gm-text transition-colors"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gm-text font-medium truncate">{section.label}</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-gm-border-soft text-gm-muted">
              {section.component_key}
            </Badge>
            <code className="text-[10px] text-gm-muted/70 font-mono">{section.slug}</code>
          </div>
          <div className="text-[11px] text-gm-muted mt-1">Sıra: {section.order_index}</div>
        </div>

        <Switch
          checked={!!section.is_active}
          onCheckedChange={(checked) => onPatch({ is_active: checked ? 1 : 0 })}
          disabled={saving}
          className="data-[state=checked]:bg-gm-gold"
        />
        <span className="text-[10px] uppercase tracking-widest text-gm-muted w-10">
          {section.is_active ? 'Aktif' : 'Pasif'}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={saving}
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-gm-border-soft size-8 p-0"
          title="Sil"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gm-border-soft space-y-4 bg-gm-bg-deep/30">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-gm-muted">Etiket (Admin)</Label>
              <Input
                defaultValue={section.label}
                onBlur={(e) => e.target.value !== section.label && onPatch({ label: e.target.value })}
                disabled={saving}
                className="h-9 bg-gm-bg-deep border-gm-border-soft"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-gm-muted">Component</Label>
              <select
                defaultValue={section.component_key}
                onBlur={(e) => e.target.value !== section.component_key && onPatch({ component_key: e.target.value })}
                disabled={saving}
                className="h-9 w-full rounded-md bg-gm-bg-deep border border-gm-border-soft text-gm-text px-3 text-sm"
              >
                {HOME_LAYOUT_COMPONENT_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-widest text-gm-muted">Config (JSON)</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleConfigSave}
                disabled={saving}
                className="h-7 text-[10px] uppercase tracking-widest border-gm-border-soft"
              >
                Config Kaydet
              </Button>
            </div>
            <Textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              rows={5}
              className="font-mono text-xs bg-gm-bg-deep border-gm-border-soft"
              disabled={saving}
            />
            {configError && <p className="text-[11px] text-rose-400">{configError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeLayoutAdminClient() {
  const { data, isLoading, isFetching, refetch } = useListHomeSectionsAdminQuery();
  const [updateSection, { isLoading: isUpdating }] = useUpdateHomeSectionAdminMutation();
  const [reorderSections, { isLoading: isReordering }] = useReorderHomeSectionsAdminMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteHomeSectionAdminMutation();
  const [createSection, { isLoading: isCreating }] = useCreateHomeSectionAdminMutation();

  const [items, setItems] = React.useState<AdminHomeSectionDto[]>([]);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [newRow, setNewRow] = React.useState({ slug: '', label: '', component_key: 'WoodyHomeHero' });

  React.useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((s) => s.id === active.id);
    const newIdx = items.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(items, oldIdx, newIdx).map((s, i) => ({ ...s, order_index: (i + 1) * 10 }));
    const payload = reordered
      .filter((s) => typeof s.id === 'string' && s.id.length >= 32)
      .map((s) => ({ id: s.id, order_index: s.order_index }));
    if (payload.length !== reordered.length || payload.length === 0) {
      toast.error('Sıralama kaydedilemedi');
      refetch();
      return;
    }
    setItems(reordered);

    try {
      await reorderSections({ items: payload }).unwrap();
      const revalidated = await revalidateHomeCache();
      toast.success(revalidated ? 'Sıralama güncellendi ve frontend cache temizlendi' : 'Sıralama güncellendi');
    } catch {
      toast.error('Sıralama kaydedilemedi');
      refetch();
    }
  };

  const patchRow = async (id: string, patch: Partial<AdminHomeSectionDto>) => {
    try {
      await updateSection({ id, data: patch as any }).unwrap();
      const revalidated = await revalidateHomeCache();
      toast.success(revalidated ? 'Kaydedildi ve frontend cache temizlendi' : 'Kaydedildi');
    } catch {
      toast.error('Kaydedilemedi');
    }
  };

  const deleteRow = async (id: string, label: string) => {
    if (!confirm(`"${label}" silinsin mi?`)) return;
    try {
      await deleteSection(id).unwrap();
      const revalidated = await revalidateHomeCache();
      toast.success(revalidated ? 'Silindi ve frontend cache temizlendi' : 'Silindi');
    } catch {
      toast.error('Silinemedi');
    }
  };

  const handleCreate = async () => {
    if (!newRow.slug || !newRow.label) {
      toast.error('Slug ve etiket zorunlu');
      return;
    }
    try {
      const maxOrder = Math.max(0, ...items.map((s) => s.order_index));
      await createSection({
        slug: newRow.slug,
        label: newRow.label,
        component_key: newRow.component_key,
        order_index: maxOrder + 10,
        is_active: 1,
        config: null,
      }).unwrap();
      const revalidated = await revalidateHomeCache();
      toast.success(revalidated ? 'Eklendi ve frontend cache temizlendi' : 'Eklendi');
      setShowNew(false);
      setNewRow({ slug: '', label: '', component_key: 'WoodyHomeHero' });
    } catch (e: any) {
      toast.error(e?.data?.error?.message || 'Eklenemedi');
    }
  };

  const busy = isLoading || isFetching || isUpdating || isReordering || isDeleting || isCreating;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Anasayfa Düzeni
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Anasayfa Düzeni</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            Section&apos;ları sürükleyip sırasını değiştir, aktif/pasif yap, config&apos;i düzenle.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 bg-gm-surface/20 px-8 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
            <div className="text-center sm:text-right min-w-[80px]">
              <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase mb-1">Toplam</p>
              <p className="font-serif text-3xl text-gm-gold">{items.length}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={busy}
              className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
            >
              <RefreshCcw className={cn('mr-2 size-4', busy && 'animate-spin')} />
              Yenile
            </Button>
          </div>
          <Button
            onClick={() => setShowNew((v) => !v)}
            disabled={busy}
            className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
          >
            <Plus className="mr-2 size-4" />
            Yeni Section
          </Button>
        </div>
      </div>

      {/* New section form */}
      {showNew && (
        <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
          <CardContent className="p-8 grid gap-6 md:grid-cols-4 items-end">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Slug (a-z, _)</Label>
              <Input
                value={newRow.slug}
                onChange={(e) => setNewRow({ ...newRow, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="my_new_section"
                className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Etiket</Label>
              <Input
                value={newRow.label}
                onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
                placeholder="Yeni Section"
                className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Component</Label>
              <select
                value={newRow.component_key}
                onChange={(e) => setNewRow({ ...newRow, component_key: e.target.value })}
                className="h-12 w-full rounded-2xl bg-gm-surface/40 border border-gm-border-soft text-gm-text px-3 text-sm"
              >
                {HOME_LAYOUT_COMPONENT_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleCreate}
              disabled={busy}
              className="rounded-full h-12 font-bold tracking-widest uppercase text-[10px]"
            >
              <Save className="mr-2 size-4" />
              Ekle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-gm-surface/20 rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 opacity-30">
              <AlertCircle className="w-16 h-16 text-gm-gold/50" />
              <span className="font-serif italic text-lg text-gm-muted">Hiç section yok.</span>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((s) => (
                    <SortableRow
                      key={s.id}
                      section={s}
                      expanded={expandedId === s.id}
                      onToggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      onPatch={(patch) => patchRow(s.id, patch)}
                      onDelete={() => deleteRow(s.id, s.label)}
                      saving={busy}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
