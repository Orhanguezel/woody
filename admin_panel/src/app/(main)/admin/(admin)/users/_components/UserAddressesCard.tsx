"use client";

// =============================================================
// Üye adres defteri (customer_addresses) — yönetici görünümü.
// Ekle / düzenle / sil + varsayılan teslimat/fatura işaretleri.
// =============================================================

import * as React from "react";

import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AddressForm,
  AddressSummary,
  addressErrorMessage,
  emptyBookAddress,
} from "@/app/(main)/admin/(admin)/_components/address-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminBookAddress, AdminBookAddressFields } from "@/integrations/hooks";
import {
  useCreateUserAddressAdminMutation,
  useDeleteCustomerAddressAdminMutation,
  useListUserAddressesAdminQuery,
  useUpdateCustomerAddressAdminMutation,
} from "@/integrations/hooks";

function toBody(v: AdminBookAddressFields): AdminBookAddressFields {
  return {
    title: v.title,
    name: v.name,
    phone: v.phone,
    address: v.address,
    district: v.district,
    city: v.city,
    postalCode: v.postalCode,
    country: v.country,
    invoiceType: v.invoiceType,
    identityNumber: v.identityNumber,
    companyName: v.companyName,
    taxOffice: v.taxOffice,
    taxNumber: v.taxNumber,
    latitude: v.latitude,
    longitude: v.longitude,
    isDefaultShipping: v.isDefaultShipping,
    isDefaultBilling: v.isDefaultBilling,
  };
}

export function UserAddressesCard({
  userId,
  defaults,
}: {
  userId: string;
  /** Yeni adres formunu üyenin ad/telefonuyla önceden doldurmak için. */
  defaults?: { name?: string | null; phone?: string | null };
}) {
  const listQ = useListUserAddressesAdminQuery({ userId });
  const [createAddress, createState] = useCreateUserAddressAdminMutation();
  const [updateAddress, updateState] = useUpdateCustomerAddressAdminMutation();
  const [deleteAddress, deleteState] = useDeleteCustomerAddressAdminMutation();

  // 'new' = yeni adres formu, string = düzenlenen adres id'si
  const [editing, setEditing] = React.useState<string | null>(null);
  const addresses = listQ.data?.addresses ?? [];
  const saving = createState.isLoading || updateState.isLoading;

  async function onCreate(v: AdminBookAddressFields) {
    await createAddress({ userId, body: toBody(v) }).unwrap();
    toast.success("Adres eklendi.");
    setEditing(null);
  }

  async function onUpdate(id: string, v: AdminBookAddressFields) {
    await updateAddress({ id, userId, body: toBody(v) }).unwrap();
    toast.success("Adres güncellendi.");
    setEditing(null);
  }

  async function onDelete(a: AdminBookAddress) {
    if (!confirm(`"${a.title || a.name || "Adres"}" silinsin mi?`)) return;
    try {
      await deleteAddress({ id: a.id, userId }).unwrap();
      toast.success("Adres silindi.");
    } catch (err) {
      toast.error(addressErrorMessage(err, "Adres silinemedi."));
    }
  }

  return (
    <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
      <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="font-serif text-2xl flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gm-gold" /> Kayıtlı adresler
              <Badge variant="outline" className="ml-2 rounded-full border-gm-gold/30 text-gm-gold bg-gm-gold/5">
                {addresses.length}
              </Badge>
            </CardTitle>
            <CardDescription className="font-serif italic text-gm-muted opacity-70">
              Üyenin ödeme adımında seçtiği teslimat ve fatura adresleri.
            </CardDescription>
          </div>
          {editing === null ? (
            <Button
              size="sm"
              onClick={() => setEditing("new")}
              disabled={listQ.isLoading}
              className="rounded-full border border-gm-border-soft bg-gm-surface/40 hover:bg-gm-surface text-gm-text font-bold tracking-widest uppercase text-[10px] px-6 h-10"
            >
              <Plus className="mr-2 size-4" />
              Adres ekle
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {editing === "new" ? (
          <AddressForm
            mode="book"
            initial={emptyBookAddress({
              name: defaults?.name ?? "",
              phone: defaults?.phone ?? "",
              isDefaultShipping: addresses.length === 0,
              isDefaultBilling: addresses.length === 0,
            })}
            saving={saving}
            submitLabel="Ekle"
            onSubmit={onCreate}
            onCancel={() => setEditing(null)}
          />
        ) : null}

        {listQ.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-40 rounded-[24px] bg-gm-surface/20" />
            <Skeleton className="h-40 rounded-[24px] bg-gm-surface/20" />
          </div>
        ) : listQ.isError ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gm-error/20 bg-gm-error/5 p-4 text-sm text-gm-error">
            <span>{addressErrorMessage(listQ.error, "Adresler yüklenemedi.")}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => listQ.refetch()}
              className="rounded-full border-gm-error/30"
            >
              Tekrar dene
            </Button>
          </div>
        ) : addresses.length === 0 && editing !== "new" ? (
          <div className="rounded-[24px] border border-dashed border-gm-border-soft p-6 text-sm italic text-gm-muted">
            Bu üyenin kayıtlı adresi yok.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {addresses.map((a) =>
              editing === a.id ? (
                <div key={a.id} className="md:col-span-2">
                  <AddressForm
                    mode="book"
                    initial={emptyBookAddress(a)}
                    saving={saving}
                    onSubmit={(v) => onUpdate(a.id, v)}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <div key={a.id} className="space-y-4 rounded-[24px] border border-gm-border-soft bg-gm-surface/10 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase">
                        {a.title || "Adres"}
                      </span>
                      {a.isDefaultShipping ? (
                        <Badge className="rounded-full border border-gm-success/20 bg-gm-success/10 text-gm-success text-[9px]">
                          Varsayılan teslimat
                        </Badge>
                      ) : null}
                      {a.isDefaultBilling ? (
                        <Badge className="rounded-full border border-gm-gold/30 bg-gm-gold/10 text-gm-gold text-[9px]">
                          Varsayılan fatura
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Düzenle"
                        aria-label="Düzenle"
                        disabled={editing !== null || deleteState.isLoading}
                        onClick={() => setEditing(a.id)}
                        className="rounded-full h-9 w-9 p-0 hover:bg-gm-surface"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Sil"
                        aria-label="Sil"
                        disabled={editing !== null || deleteState.isLoading}
                        onClick={() => onDelete(a)}
                        className="rounded-full h-9 w-9 p-0 text-gm-error/60 hover:bg-gm-error hover:text-gm-bg"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <AddressSummary value={a} withInvoice />
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
