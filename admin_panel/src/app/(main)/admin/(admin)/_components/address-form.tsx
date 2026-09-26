"use client";

// =============================================================
// Ortak adres formu + adres özeti (2026-09-26)
// Kullanım: sipariş detayı (teslimat / fatura düzeltme) ve üye detayı (adres defteri).
// Doğrulamanın sahibi backend'dir (addresses.ts / addressBook.ts); burada yalnız
// hata kodları Türkçeye çevrilir.
// =============================================================

import * as React from "react";

import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAddressFields, AdminBookAddressFields } from "@/integrations/hooks";
import { apiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

export type AddressFormMode = "shipping" | "billing" | "book";

const ADDRESS_ERROR_LABEL: Record<string, string> = {
  shipping_address_required: "Teslimat adresi için adres ve il zorunludur.",
  billing_address_required: "Fatura adresi için adres ve il zorunludur.",
  billing_name_required: "Bireysel faturada ad soyad zorunludur.",
  billing_identity_invalid: "T.C. kimlik numarası geçersiz (11 hane, kontrol hanesi tutmuyor).",
  billing_company_required: "Kurumsal faturada firma unvanı ve vergi dairesi zorunludur.",
  billing_tax_number_invalid: "Vergi kimlik numarası 10 haneli olmalıdır.",
  address_name_required: "Ad soyad zorunludur.",
  address_phone_required: "Telefon zorunludur.",
  address_limit_reached: "Bir üye en fazla 20 adres kaydedebilir.",
  invalid_id: "Geçersiz kayıt kimliği.",
  invalid_request: "Geçersiz istek.",
  not_found: "Kayıt bulunamadı.",
};

/** Adres API hatasını Türkçe mesaja çevirir. */
export function addressErrorMessage(err: unknown, fallback = "Adres kaydedilemedi."): string {
  const raw = apiErrorMessage(err, "");
  if (!raw) return fallback;
  return ADDRESS_ERROR_LABEL[raw] ?? raw;
}

export function emptyBookAddress(partial?: Partial<AdminBookAddressFields>): AdminBookAddressFields {
  return {
    title: "",
    name: "",
    phone: "",
    address: "",
    district: "",
    city: "",
    postalCode: "",
    country: "TR",
    invoiceType: "individual",
    identityNumber: "",
    companyName: "",
    taxOffice: "",
    taxNumber: "",
    latitude: null,
    longitude: null,
    isDefaultShipping: false,
    isDefaultBilling: false,
    ...partial,
  };
}

const labelCls = "text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1";
const inputCls = "bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm";

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  mono,
  inputMode,
  maxLength,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  mono?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor={id} className={labelCls}>
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        className={cn(inputCls, mono && "font-mono")}
      />
    </div>
  );
}

export function AddressForm({
  mode,
  initial,
  saving,
  submitLabel = "Kaydet",
  onSubmit,
  onCancel,
}: {
  mode: AddressFormMode;
  initial: AdminBookAddressFields;
  saving?: boolean;
  submitLabel?: string;
  /** Hata fırlatırsa form içinde Türkçe gösterilir. */
  onSubmit: (value: AdminBookAddressFields) => Promise<void>;
  onCancel?: () => void;
}) {
  const [v, setV] = React.useState<AdminBookAddressFields>(initial);
  const [error, setError] = React.useState("");
  const uid = React.useId();

  function set<K extends keyof AdminBookAddressFields>(key: K, value: AdminBookAddressFields[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(v);
    } catch (err) {
      setError(addressErrorMessage(err));
    }
  }

  const showInvoice = mode !== "shipping";
  const corporate = v.invoiceType === "corporate";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[24px] border border-gm-border-soft bg-gm-surface/10 p-6"
    >
      {mode === "book" ? (
        <Field
          id={`${uid}-title`}
          label="Adres Başlığı"
          value={v.title}
          onChange={(x) => set("title", x)}
          disabled={saving}
          maxLength={60}
        />
      ) : null}

      {showInvoice ? (
        <div className="space-y-3">
          <Label className={labelCls}>Fatura Türü</Label>
          <div className="flex gap-3">
            {(["individual", "corporate"] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => set("invoiceType", type)}
                className={cn(
                  "rounded-full h-10 px-6 text-[10px] font-bold tracking-widest uppercase border-gm-border-soft transition-all",
                  v.invoiceType === type
                    ? "bg-gm-gold text-gm-bg border-gm-gold"
                    : "bg-gm-surface/20 hover:bg-gm-surface hover:border-gm-gold/50",
                )}
              >
                {type === "individual" ? "Bireysel" : "Kurumsal"}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Field id={`${uid}-name`} label="Ad Soyad" value={v.name} onChange={(x) => set("name", x)} disabled={saving} />
        <Field
          id={`${uid}-phone`}
          label="Telefon"
          value={v.phone}
          onChange={(x) => set("phone", x)}
          disabled={saving}
          mono
          inputMode="tel"
        />
      </div>

      {showInvoice && !corporate ? (
        <Field
          id={`${uid}-tckn`}
          label="T.C. Kimlik No (isteğe bağlı)"
          value={v.identityNumber}
          onChange={(x) => set("identityNumber", x.replace(/\D/g, ""))}
          disabled={saving}
          mono
          inputMode="numeric"
          maxLength={11}
        />
      ) : null}

      {showInvoice && corporate ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Field
            id={`${uid}-company`}
            label="Firma Unvanı"
            value={v.companyName}
            onChange={(x) => set("companyName", x)}
            disabled={saving}
          />
          <Field
            id={`${uid}-taxoffice`}
            label="Vergi Dairesi"
            value={v.taxOffice}
            onChange={(x) => set("taxOffice", x)}
            disabled={saving}
          />
          <Field
            id={`${uid}-vkn`}
            label="Vergi Kimlik No"
            value={v.taxNumber}
            onChange={(x) => set("taxNumber", x.replace(/\D/g, ""))}
            disabled={saving}
            mono
            inputMode="numeric"
            maxLength={10}
          />
        </div>
      ) : null}

      <div className="space-y-3">
        <Label htmlFor={`${uid}-address`} className={labelCls}>
          Adres
        </Label>
        <Textarea
          id={`${uid}-address`}
          value={v.address}
          onChange={(e) => set("address", e.target.value)}
          disabled={saving}
          rows={3}
          className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Field id={`${uid}-city`} label="İl" value={v.city} onChange={(x) => set("city", x)} disabled={saving} />
        <Field
          id={`${uid}-district`}
          label="İlçe"
          value={v.district}
          onChange={(x) => set("district", x)}
          disabled={saving}
        />
        <Field
          id={`${uid}-postal`}
          label="Posta Kodu"
          value={v.postalCode}
          onChange={(x) => set("postalCode", x)}
          disabled={saving}
          mono
        />
        <Field
          id={`${uid}-country`}
          label="Ülke"
          value={v.country}
          onChange={(x) => set("country", x)}
          disabled={saving}
        />
      </div>

      {mode === "book" ? (
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`${uid}-def-ship`}
              checked={v.isDefaultShipping}
              onCheckedChange={(c) => set("isDefaultShipping", c === true)}
              disabled={saving}
            />
            <Label htmlFor={`${uid}-def-ship`} className="text-sm text-gm-text">
              Varsayılan teslimat adresi
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id={`${uid}-def-bill`}
              checked={v.isDefaultBilling}
              onCheckedChange={(c) => set("isDefaultBilling", c === true)}
              disabled={saving}
            />
            <Label htmlFor={`${uid}-def-bill`} className="text-sm text-gm-text">
              Varsayılan fatura adresi
            </Label>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-2xl border border-gm-error/20 bg-gm-error/5 px-4 py-3 text-sm text-gm-error">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full h-10 px-6 text-[10px] font-bold tracking-widest uppercase"
          >
            <X className="mr-2 size-4" />
            Vazgeç
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-dim px-8 h-10 font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-gm-gold/20 transition-all active:scale-95"
        >
          <Save className="mr-2 size-4" />
          {saving ? "Kaydediliyor…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/** Salt okunur adres özeti (fatura alanları `withInvoice` ile). */
export function AddressSummary({
  value,
  withInvoice,
}: {
  value: Pick<
    AdminAddressFields,
    | "name"
    | "phone"
    | "address"
    | "district"
    | "city"
    | "postalCode"
    | "country"
    | "invoiceType"
    | "identityNumber"
    | "companyName"
    | "taxOffice"
    | "taxNumber"
  >;
  withInvoice?: boolean;
}) {
  const place = [value.district, value.city].filter(Boolean).join(" / ");
  const tail = [value.postalCode, value.country].filter(Boolean).join(" · ");
  const corporate = value.invoiceType === "corporate";
  return (
    <div className="space-y-1 text-sm text-gm-text">
      {withInvoice ? (
        <div className="pb-2">
          <span className="rounded-full border border-gm-border-soft px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
            {corporate ? "Kurumsal" : "Bireysel"}
          </span>
        </div>
      ) : null}
      {withInvoice && corporate ? (
        <>
          <div className="font-serif text-lg">{value.companyName || "-"}</div>
          <div className="text-gm-muted">
            {value.taxOffice || "-"} V.D. · VKN <span className="font-mono">{value.taxNumber || "-"}</span>
          </div>
          {value.name ? <div>{value.name}</div> : null}
        </>
      ) : (
        <>
          <div className="font-serif text-lg">{value.name || "-"}</div>
          {withInvoice && value.identityNumber ? (
            <div className="text-gm-muted">
              TCKN <span className="font-mono">{value.identityNumber}</span>
            </div>
          ) : null}
        </>
      )}
      {value.phone ? <div className="font-mono text-gm-muted">{value.phone}</div> : null}
      <div className="whitespace-pre-line">{value.address || "-"}</div>
      {place ? <div>{place}</div> : null}
      {tail ? <div className="text-gm-muted">{tail}</div> : null}
    </div>
  );
}
