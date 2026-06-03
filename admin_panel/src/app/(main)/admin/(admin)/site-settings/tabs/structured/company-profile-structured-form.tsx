// =============================================================
// FILE: src/components/admin/site-settings/structured/CompanyProfileStructuredForm.tsx
// =============================================================

"use client";

import type React from "react";

import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTranslations } from "@/i18n";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export const companyProfileSchema = z
  .object({
    company_name: z.string().trim().optional(),
    slogan: z.string().trim().optional(),
    about: z.string().trim().optional(),
  })
  .strict();

export type CompanyProfileFormState = z.infer<typeof companyProfileSchema>;

export type CompanyProfileStructuredFormProps = {
  value: any;
  onChange: (next: CompanyProfileFormState) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  seed?: CompanyProfileFormState;
};

const safeObj = (v: any) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);

export function companyObjToForm(v: any, seed: CompanyProfileFormState): CompanyProfileFormState {
  const base = safeObj(v) || seed;
  const parsed = companyProfileSchema.safeParse(base);
  return parsed.success ? parsed.data : seed;
}

export function companyFormToObj(s: CompanyProfileFormState) {
  return companyProfileSchema.parse({
    company_name: s.company_name?.trim() || "",
    slogan: s.slogan?.trim() || "",
    about: s.about?.trim() || "",
  });
}

export const CompanyProfileStructuredForm: React.FC<CompanyProfileStructuredFormProps> = ({
  value,
  onChange,
  errors,
  disabled,
  seed,
}) => {
  const adminLocale = usePreferencesStore((s) => s.adminLocale);
  const t = useAdminTranslations(adminLocale || undefined);

  const s = (seed || {
    company_name: "",
    slogan: "",
    about: "",
  }) as CompanyProfileFormState;
  const form = companyObjToForm(value, s);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label
          htmlFor="company-name"
          className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
        >
          {t("admin.siteSettings.structured.companyProfile.labels.companyName")}
        </Label>
        <Input
          id="company-name"
          className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
          value={form.company_name || ""}
          onChange={(e) => onChange({ ...form, company_name: e.target.value })}
          disabled={disabled}
        />
        {errors?.company_name && <p className="text-xs text-gm-error">{errors.company_name}</p>}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="company-slogan"
          className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
        >
          {t("admin.siteSettings.structured.companyProfile.labels.slogan")}
        </Label>
        <Input
          id="company-slogan"
          className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
          value={form.slogan || ""}
          onChange={(e) => onChange({ ...form, slogan: e.target.value })}
          disabled={disabled}
        />
        {errors?.slogan && <p className="text-xs text-gm-error">{errors.slogan}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label
          htmlFor="company-about"
          className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
        >
          {t("admin.siteSettings.structured.companyProfile.labels.about")}
        </Label>
        <Textarea
          id="company-about"
          rows={6}
          value={form.about || ""}
          onChange={(e) => onChange({ ...form, about: e.target.value })}
          disabled={disabled}
          className="bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
        />
        {errors?.about && <p className="text-xs text-gm-error">{errors.about}</p>}
      </div>
    </div>
  );
};

CompanyProfileStructuredForm.displayName = "CompanyProfileStructuredForm";
