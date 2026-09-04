export const SEARCH_CONSOLE_ADMIN_BASE = "/admin/search-console";

export type GscIndexCategory = "indexed" | "not_indexed" | "issue" | "unknown";
export type GscEntityIndexCategory = GscIndexCategory | "unchecked";

export type GscIndexItem = {
  url: string;
  verdict: string;
  coverage_state: string;
  last_crawl: string | null;
  checked_at: string | null;
  category: GscIndexCategory;
  label: string;
  recommendation: string;
};

export type GscStatusResp = { connected: boolean; site: string };
export type GscEntityIndexArgs = { type: "blog" | "product"; locale: string };
export type GscEntityInspectArgs = GscEntityIndexArgs & { slug: string };
export type GscEntityIndexResp = GscEntityIndexArgs & {
  items: Record<string, GscIndexItem>;
  summary: Record<GscEntityIndexCategory, number>;
};

export const GSC_CATEGORY_META: Record<GscEntityIndexCategory, { label: string; tone: string }> = {
  indexed: { label: "İndexli", tone: "bg-gm-success/10 text-gm-success border-gm-success/20" },
  not_indexed: { label: "İndexsiz", tone: "bg-gm-gold/10 text-gm-gold border-gm-gold/20" },
  issue: { label: "Sorun", tone: "bg-gm-error/10 text-gm-error border-gm-error/20" },
  unknown: { label: "Bilinmiyor", tone: "bg-gm-muted/10 text-gm-muted border-gm-border-soft" },
  unchecked: { label: "Denetlenmedi", tone: "bg-gm-muted/5 text-gm-muted/60 border-gm-border-soft" },
};

export const GSC_VERDICT_LABELS: Record<string, string> = {
  PASS: "İndexli",
  PARTIAL: "Kısmi",
  FAIL: "Sorunlu",
  NEUTRAL: "Nötr",
  VERDICT_UNSPECIFIED: "Bilinmiyor",
};
