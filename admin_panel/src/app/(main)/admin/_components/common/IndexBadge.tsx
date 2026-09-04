"use client";

import { Globe } from "lucide-react";

import { GSC_CATEGORY_META, type GscIndexItem } from "@/integrations/shared";
import { cn } from "@/lib/utils";

export function IndexBadge({ item }: { item?: GscIndexItem | null }) {
  const category = item?.category ?? "unchecked";
  const meta = GSC_CATEGORY_META[category] ?? GSC_CATEGORY_META.unchecked;
  const title = item
    ? `${item.label}${item.coverage_state ? ` · ${item.coverage_state}` : ""}${item.checked_at ? ` · denetim: ${new Date(item.checked_at).toLocaleDateString("tr-TR")}` : ""}${item.recommendation ? `\n${item.recommendation}` : ""}`
    : "Bu URL henüz Google’da denetlenmedi.";

  return (
    <span
      title={title}
      className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold text-[11px]", meta.tone)}
    >
      <Globe className="size-3" />
      {meta.label}
    </span>
  );
}
