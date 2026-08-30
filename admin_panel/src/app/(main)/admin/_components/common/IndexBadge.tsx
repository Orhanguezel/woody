'use client';

// İçerik listelerinde (blog/ürün) Google indeks durumu rozeti.
// Kaynak: /admin/search-console/entity-index (gsc_url_index cache).

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GSC_CATEGORY_META, type GscIndexItem } from '@/integrations/shared';

export function IndexBadge({ item }: { item?: GscIndexItem | null }) {
  const category = item?.category ?? 'unchecked';
  const meta = GSC_CATEGORY_META[category] ?? GSC_CATEGORY_META.unchecked;
  const title = item
    ? `${item.label}${item.coverage_state ? ` · ${item.coverage_state}` : ''}${item.checked_at ? ` · denetim: ${new Date(item.checked_at).toLocaleDateString('tr-TR')}` : ''}${item.recommendation ? `\n${item.recommendation}` : ''}`
    : 'Bu URL henüz Google’da denetlenmedi (Search Console → Yenile).';
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold',
        meta.tone,
      )}
    >
      <Globe className="size-3" />
      {meta.label}
    </span>
  );
}
