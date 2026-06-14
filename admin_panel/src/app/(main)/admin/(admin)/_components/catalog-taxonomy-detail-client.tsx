'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateLevelAdminMutation,
  useCreateSeriesAdminMutation,
  useGetLevelAdminQuery,
  useGetSeriesAdminQuery,
  useUpdateLevelAdminMutation,
  useUpdateSeriesAdminMutation,
} from '@/integrations/hooks';

type Props = {
  kind: 'series' | 'levels';
  id: string;
};

type FormState = {
  code: string;
  name: string;
  slug: string;
  description: string;
  display_order: string;
  rank: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  code: '',
  name: '',
  slug: '',
  description: '',
  display_order: '0',
  rank: '0',
  is_active: true,
};

export default function CatalogTaxonomyDetailClient({ kind, id }: Props) {
  const router = useRouter();
  const isNew = id === 'new';
  const isSeries = kind === 'series';
  const base = isSeries ? '/admin/series' : '/admin/levels';
  const [locale, setLocale] = React.useState('tr');
  const seriesQ = useGetSeriesAdminQuery({ id, locale }, { skip: !isSeries || isNew });
  const levelQ = useGetLevelAdminQuery({ id, locale }, { skip: isSeries || isNew });
  const data = isSeries ? seriesQ.data : levelQ.data;
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [createSeries, createSeriesState] = useCreateSeriesAdminMutation();
  const [updateSeries, updateSeriesState] = useUpdateSeriesAdminMutation();
  const [createLevel, createLevelState] = useCreateLevelAdminMutation();
  const [updateLevel, updateLevelState] = useUpdateLevelAdminMutation();
  const saving =
    createSeriesState.isLoading ||
    updateSeriesState.isLoading ||
    createLevelState.isLoading ||
    updateLevelState.isLoading;

  React.useEffect(() => {
    if (!data) return;
    setForm({
      code: data.code,
      name: data.name,
      slug: data.slug,
      description: data.description ?? '',
      display_order: String(data.display_order),
      rank: String(data.rank ?? 0),
      is_active: data.is_active,
    });
  }, [data]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    const body = {
      locale,
      code: form.code.trim(),
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      display_order: Number(form.display_order) || 0,
      rank: Number(form.rank) || 0,
      is_active: form.is_active,
    };
    if (!body.code || !body.name || !body.slug) {
      toast.error('Kod, ad ve slug gerekli');
      return;
    }
    try {
      if (isSeries) {
        const result = isNew
          ? await createSeries(body).unwrap()
          : await updateSeries({ id, body }).unwrap();
        toast.success('Seri kaydedildi');
        if (isNew) router.replace(`/admin/series/${result.id}`);
      } else {
        const result = isNew
          ? await createLevel(body).unwrap()
          : await updateLevel({ id, body }).unwrap();
        toast.success('Seviye kaydedildi');
        if (isNew) router.replace(`/admin/levels/${result.id}`);
      }
    } catch {
      toast.error('Kayıt tamamlanamadı');
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(base)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">
              Woody Store
            </p>
            <h1 className="font-serif text-4xl text-gm-text">
              {isNew ? 'Yeni' : form.name || 'Detay'}
            </h1>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full">
          <Save className="mr-2 size-4" />
          Kaydet
        </Button>
        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger className="h-10 w-24 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['tr', 'en', 'de', 'fr', 'es', 'it', 'ar', 'ru', 'pt', 'nl'].map((item) => (
              <SelectItem key={item} value={item}>
                {item.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-[24px] border-gm-border-soft bg-gm-surface/20">
        <CardHeader>
          <CardTitle className="font-serif">{isSeries ? 'Seri' : 'Seviye'} Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Kod</Label>
            <Input value={form.code} onChange={(e) => setField('code', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ad</Label>
            <Input value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setField('slug', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sıra</Label>
            <Input value={form.display_order} onChange={(e) => setField('display_order', e.target.value)} />
          </div>
          {!isSeries ? (
            <div className="space-y-2">
              <Label>Rank</Label>
              <Input value={form.rank} onChange={(e) => setField('rank', e.target.value)} />
            </div>
          ) : null}
          <div className="flex items-center gap-3 pt-7">
            <Switch checked={form.is_active} onCheckedChange={(v) => setField('is_active', v)} />
            <Label>Aktif</Label>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Açıklama</Label>
            <Textarea value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
