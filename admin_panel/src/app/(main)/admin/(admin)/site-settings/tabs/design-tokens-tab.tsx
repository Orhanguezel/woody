"use client";

import * as React from "react";

import { Box, Eye, Info, Layout, MousePointer2, Palette, RefreshCcw, Save, Type } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetSiteSettingAdminByKeyQuery, useUpdateSiteSettingAdminMutation } from "@/integrations/hooks";
import { cn } from "@/lib/utils";

type TokenForm = {
  version: string;
  colors: Record<string, string>;
  typography: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
  branding: Record<string, string>;
};

type ThemePreset = {
  id: string;
  label: string;
  description: string;
  preview: { primary: string; bg: string; text: string; accent: string };
  tokens: TokenForm;
};

/** Tasarım tokenları sekmesi — form varsayılanı (marka bağımsız). */
const DEFAULTS: TokenForm = {
  version: "2",
  colors: {
    brand_primary: "#16a34a",
    brand_primary_dark: "#15803d",
    brand_primary_light: "#22c55e",
    brand_secondary: "#15803d",
    brand_accent: "#854d0e",
    bg_base: "#f7fee7",
    bg_deep: "#ecfccb",
    bg_surface: "#FFFFFF",
    bg_surface_high: "#f0fdf4",
    text_primary: "#14532d",
    text_secondary: "#365314",
    text_muted: "#64748b",
    border: "rgba(22,101,52,0.22)",
    success: "#16a34a",
    warning: "#ca8a04",
    error: "#dc2626",
  },
  typography: {
    font_display: "var(--font-inter), system-ui, sans-serif",
    font_serif: "Georgia, serif",
    font_sans: "var(--font-inter), system-ui, sans-serif",
    font_mono: "ui-monospace, monospace",
    base_size: "16px",
  },
  radius: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", pill: "9999px" },
  shadows: {
    soft: "0 2px 20px rgba(22,163,74,0.08)",
    card: "0 8px 40px rgba(22,163,74,0.12)",
    glow_primary: "0 0 60px rgba(22,163,74,0.18)",
    glow_gold: "0 0 30px rgba(22,163,74,0.14)",
  },
  branding: {
    app_name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Platform",
    tagline: "Ürün ve içerik deneyiminizi tek yerden yönetin.",
    tagline_en: "Manage your product experience from one place.",
    logo_url: "",
    favicon_url: "",
    theme_color: "#15803d",
  },
};

function ColorRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gm-surface/30 border border-gm-border-soft hover:border-gm-gold/30 transition-all">
      <div className="relative group">
        <div
          className="w-12 h-12 rounded-xl border border-gm-border-soft overflow-hidden shadow-inner"
          style={{ backgroundColor: value }}
        />
        {isHex && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-8 bg-gm-bg-deep border-gm-border-soft rounded-2xl p-0 px-3 font-mono text-xs text-gm-text focus:ring-gm-gold/50 focus-visible:ring-0 transition-all"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function PreviewCard({ form }: { form: TokenForm }) {
  const { colors, typography, shadows, radius, branding } = form;
  const primary = colors.brand_primary;
  const onPrimaryText = colors.bg_surface;

  return (
    <Card
      className="overflow-hidden rounded-[32px] border p-8 [--preview-primary:var(--primary)]"
      style={
        {
          backgroundColor: colors.bg_base,
          borderColor: `color-mix(in srgb, ${primary} 20%, transparent)`,
          boxShadow: shadows.card,
          '--preview-primary': primary,
        } as React.CSSProperties
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8" style={{ backgroundColor: primary }} />
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{ color: primary, fontFamily: typography.font_sans }}
          >
            Önizleme
          </span>
        </div>
        <h3
          className="text-3xl"
          style={{ color: colors.text_primary, fontFamily: typography.font_display }}
        >
          {branding.app_name}
        </h3>
        <p
          className="text-lg italic leading-relaxed"
          style={{ color: colors.text_secondary, fontFamily: typography.font_serif }}
        >
          &quot;{branding.tagline}&quot;
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            style={{
              backgroundColor: primary,
              color: onPrimaryText,
              borderRadius: radius.pill,
              fontFamily: typography.font_sans,
              boxShadow: shadows.glow_primary,
            }}
            className="border-none px-8 text-[10px] font-bold uppercase tracking-widest transition-transform hover:scale-105"
          >
            Randevu Al
          </Button>
          <Button
            variant="outline"
            style={{
              borderColor: primary,
              color: colors.text_primary,
              borderRadius: radius.pill,
              fontFamily: typography.font_sans,
            }}
            className="bg-transparent px-8 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-[color-mix(in_srgb,var(--preview-primary)_5%,transparent)]"
          >
            Profil
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ThemePresetsSection({ busy, onApplied }: { busy: boolean; onApplied: (tokens: TokenForm) => void }) {
  const { data: presetsRow, isLoading: lp } = useGetSiteSettingAdminByKeyQuery("theme_presets");
  const {
    data: activeRow,
    isLoading: la,
    refetch: refetchActive,
  } = useGetSiteSettingAdminByKeyQuery("active_theme_preset");
  const [updateSetting] = useUpdateSiteSettingAdminMutation();
  const [applyingId, setApplyingId] = React.useState<string | null>(null);

  const presets = React.useMemo<ThemePreset[]>(() => {
    if (!presetsRow?.value) return [];
    try {
      const raw = typeof presetsRow.value === "string" ? JSON.parse(presetsRow.value) : presetsRow.value;
      return Array.isArray(raw) ? (raw as ThemePreset[]) : [];
    } catch {
      return [];
    }
  }, [presetsRow?.value]);

  const activeId = typeof activeRow?.value === "string" ? activeRow.value.trim() : "";
  const activeLabel = presets.find((p) => p.id === activeId)?.label;

  const apply = async (preset: ThemePreset) => {
    setApplyingId(preset.id);
    try {
      await updateSetting({ key: "active_theme_preset", value: preset.id, locale: "*" }).unwrap();
      await updateSetting({
        key: "design_tokens",
        value: JSON.stringify(preset.tokens),
        locale: "*",
      }).unwrap();
      onApplied(preset.tokens);
      await refetchActive();

      // Auto-purge frontend cache so theme change is visible immediately.
      // Best-effort: don't fail the apply if revalidation errors out.
      let revalidated = false;
      try {
        const res = await fetch("/api/revalidate-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ all: true }),
        });
        revalidated = res.ok;
      } catch {
        revalidated = false;
      }

      toast.success(
        revalidated
          ? `"${preset.label}" teması uygulandı ve frontend cache temizlendi.`
          : `"${preset.label}" teması uygulandı (cache 5 dk içinde otomatik yenilenecek).`,
      );
    } catch {
      toast.error("Tema uygulanırken hata oluştu.");
    } finally {
      setApplyingId(null);
    }
  };

  if (lp || la) return null;
  if (presets.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gm-gold/10 flex items-center justify-center text-gm-gold">
          <Layout size={20} />
        </div>
        <div>
          <h4 className="font-serif text-xl text-gm-text">Tema Şablonları</h4>
          <p className="text-xs text-gm-muted italic">
            Hazır tema paletlerinden birini uygulayın. Aktif şablon:{" "}
            <span className="font-semibold text-gm-text not-italic">{activeLabel || "—"}</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {presets.map((p) => {
          const isActive = p.id === activeId;
          const isLoading = applyingId === p.id;
          return (
            <Card
              key={p.id}
              className={cn(
                "group relative overflow-hidden bg-gm-surface/20 border-gm-border-soft rounded-[20px] backdrop-blur-sm shadow-xl p-0 transition-all border",
                isActive
                  ? "border-gm-gold shadow-[0_0_0_4px_rgba(212,175,55,0.15)]"
                  : "border-gm-border-soft hover:border-gm-gold/40",
              )}
            >
              <div className="h-28 relative" style={{ backgroundColor: p.preview.bg }}>
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full shadow-sm" style={{ backgroundColor: p.preview.primary }} />
                  <div className="w-9 h-9 rounded-full shadow-sm" style={{ backgroundColor: p.preview.accent }} />
                  <div className="w-7 h-7 rounded-full shadow-sm" style={{ backgroundColor: p.preview.text }} />
                </div>
                {isActive && (
                  <Badge className="absolute top-3 right-3 bg-gm-gold text-gm-bg hover:bg-gm-gold text-[10px] tracking-widest uppercase">
                    Aktif
                  </Badge>
                )}
              </div>
              <CardContent className="p-8 space-y-3">
                <div>
                  <div className="font-serif text-base text-gm-text">{p.label}</div>
                  <div className="text-[11px] text-gm-muted leading-relaxed mt-1">{p.description}</div>
                </div>
                <Button
                  size="sm"
                  variant={isActive ? "outline" : "default"}
                  disabled={busy || isLoading || isActive}
                  onClick={() => apply(p)}
                  className={cn(
                    "w-full rounded-full text-[10px] font-bold tracking-widest uppercase h-9",
                    !isActive && "bg-gm-gold text-gm-bg hover:bg-gm-gold-light",
                  )}
                >
                  {isLoading ? "Uygulanıyor..." : isActive ? "Şu an aktif" : "Bu Temayı Uygula"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Separator className="bg-gm-border-soft mt-2" />
    </section>
  );
}

export const DesignTokensTab: React.FC = () => {
  const { data: settingRow, isLoading, isFetching, refetch } = useGetSiteSettingAdminByKeyQuery("design_tokens");
  const [updateSetting, { isLoading: isSaving }] = useUpdateSiteSettingAdminMutation();
  const [form, setForm] = React.useState<TokenForm>(DEFAULTS);

  React.useEffect(() => {
    if (settingRow?.value) {
      const val = typeof settingRow.value === "string" ? JSON.parse(settingRow.value) : settingRow.value;
      setForm((prev) => ({ ...prev, ...val }));
    }
  }, [settingRow?.value]);

  const handleSave = async () => {
    try {
      await updateSetting({ key: "design_tokens", value: JSON.stringify(form), locale: "*" }).unwrap();
      toast.success("Tasarım tokenları başarıyla güncellendi.");
    } catch {
      toast.error("Kayıt sırasında hata oluştu.");
    }
  };

  const busy = isLoading || isFetching || isSaving;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Görsel Kimlik</span>
          </div>
          <h2 className="font-serif text-3xl text-gm-text">Design Token Editörü</h2>
          <p className="text-gm-muted text-sm mt-2 font-serif italic">
            Uygulamanın renk paleti, tipografi ve stil kurallarını gerçek zamanlı yönetin.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={busy}
            className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase px-6 h-11"
          >
            <RefreshCcw className={cn("mr-2 size-4", busy && "animate-spin")} />
            Yenile
          </Button>
          <Button
            onClick={handleSave}
            disabled={busy}
            className="bg-gm-gold text-gm-bg hover:bg-gm-gold-light rounded-full px-10 h-11 font-bold tracking-widest uppercase"
          >
            <Save className="mr-2 size-4" />
            DEĞİŞİKLİKLERİ KAYDET
          </Button>
        </div>
      </div>

      <ThemePresetsSection busy={busy} onApplied={(tokens) => setForm((prev) => ({ ...prev, ...tokens }))} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left: Editor */}
        <div className="xl:col-span-8 space-y-12">
          {/* Colors */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gm-gold/10 flex items-center justify-center text-gm-gold">
                <Palette size={20} />
              </div>
              <div>
                <h4 className="font-serif text-xl text-gm-text">Renk Paleti</h4>
                <p className="text-xs text-gm-muted italic">Marka renkleri ve arayüz tonları.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(form.colors).map(([key, value]) => (
                <ColorRow
                  key={key}
                  label={key}
                  value={value}
                  onChange={(v) => setForm((p) => ({ ...p, colors: { ...p.colors, [key]: v } }))}
                  disabled={busy}
                />
              ))}
            </div>
          </section>

          <Separator className="bg-gm-border-soft" />

          {/* Typography */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Type size={20} />
              </div>
              <div>
                <h4 className="font-serif text-xl text-gm-text">Tipografi</h4>
                <p className="text-xs text-gm-muted italic">Font aileleri ve temel metin boyutları.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gm-surface/30 rounded-[32px] border border-gm-border-soft">
              {Object.entries(form.typography).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                    {key}
                  </Label>
                  <Input
                    value={value}
                    onChange={(e) => setForm((p) => ({ ...p, typography: { ...p.typography, [key]: e.target.value } }))}
                    className="bg-gm-bg-deep border-gm-border-soft rounded-2xl h-11 font-mono text-xs text-gm-text focus:ring-gm-gold/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </section>

          <Separator className="bg-gm-border-soft" />

          {/* Radius & Shadows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MousePointer2 size={20} />
                </div>
                <h4 className="font-serif text-xl text-gm-text">Köşe Yuvarlama</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(form.radius).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-2xl bg-gm-surface/30 border border-gm-border-soft">
                    <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block mb-2">
                      {key}
                    </Label>
                    <Input
                      value={value}
                      onChange={(e) => setForm((p) => ({ ...p, radius: { ...p.radius, [key]: e.target.value } }))}
                      className="bg-gm-bg-deep border-gm-border-soft rounded-2xl p-0 px-3 h-auto font-mono text-xs text-gm-text focus:ring-gm-gold/50 focus-visible:ring-0 transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <Box size={20} />
                </div>
                <h4 className="font-serif text-xl text-gm-text">Gölgeler</h4>
              </div>
              <div className="space-y-3">
                {Object.entries(form.shadows).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-2xl bg-gm-surface/30 border border-gm-border-soft">
                    <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block mb-2">
                      {key}
                    </Label>
                    <Input
                      value={value}
                      onChange={(e) => setForm((p) => ({ ...p, shadows: { ...p.shadows, [key]: e.target.value } }))}
                      className="bg-gm-bg-deep border-gm-border-soft rounded-2xl p-0 px-3 h-auto font-mono text-xs text-gm-text focus:ring-gm-gold/50 focus-visible:ring-0 transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="xl:col-span-4">
          <div className="sticky top-24 space-y-8">
            <div className="flex items-center gap-4 px-6">
              <Eye className="text-gm-gold" />
              <h4 className="font-serif text-xl italic text-gm-text">Canlı Önizleme</h4>
            </div>
            <PreviewCard form={form} />
            <div className="p-8 rounded-[32px] bg-gm-gold/5 border border-gm-gold/20 space-y-4">
              <div className="flex items-center gap-3">
                <Info size={16} className="text-gm-gold" />
                <span className="text-[10px] font-bold text-gm-gold tracking-widest uppercase">Bilgi</span>
              </div>
              <p className="text-xs text-gm-muted leading-relaxed italic font-serif">
                Yaptığınız değişiklikler frontend ve mobile uygulamalar tarafından anlık olarak (cache süresi
                sonrasında) takip edilecektir. Versiyon v{form.version} olarak işaretlenmiştir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
