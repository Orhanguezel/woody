'use client';

import { useState } from 'react';
import { Building2, Check, Home, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import type { StoreUiCopy } from '../types';
import AddressForm from './AddressForm';
import { addressApi, emptyDraft, type Account, type BookAddress } from './address-api';

type Props = {
  ui: StoreUiCopy;
  account?: Account;
  addresses: BookAddress[];
  onAddressesChange: (addresses: BookAddress[]) => void;
  /** Seçim modu (checkout): kartlar radyo gibi seçilir. Verilmezse yönetim modu. */
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Kartta fatura kimliğini göster (fatura seçimi). */
  showInvoiceSummary?: boolean;
  name: string;
  testId?: string;
};

export function addressLines(address: BookAddress) {
  return [address.address, [address.district, address.city].filter(Boolean).join(' / '), address.postalCode].filter(Boolean);
}

export function invoiceSummary(address: BookAddress, ui: StoreUiCopy) {
  return address.invoiceType === 'corporate'
    ? `${ui.invoiceCorporate}: ${address.companyName} · ${address.taxOffice} · ${address.taxNumber}`
    : `${ui.invoiceIndividual}${address.identityNumber ? ` · ${address.identityNumber}` : ''}`;
}

/** Kayıtlı adresler: seçilebilir kartlar + ekle / düzenle / sil. */
export default function AddressBook({ ui, account, addresses, onAddressesChange, selectedId, onSelect, showInvoiceSummary, name, testId }: Props) {
  const [editing, setEditing] = useState<string | 'new' | null>(addresses.length ? null : 'new');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const selectable = Boolean(onSelect);

  async function remove(id: string) {
    const { addresses: next } = await addressApi.remove(id);
    onAddressesChange(next);
    setConfirmDelete(null);
    if (selectedId === id && next[0]) onSelect?.(next[0].id);
  }

  return (
    <div className="space-y-3" data-testid={testId}>
      {addresses.length === 0 && editing !== 'new' ? <p className="text-[14px] text-[#68727b]">{ui.noAddressesYet}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2" role={selectable ? 'radiogroup' : undefined}>
        {addresses.map((address) =>
          editing === address.id ? (
            <div key={address.id} className="sm:col-span-2">
              <AddressForm
                ui={ui}
                addressId={address.id}
                initial={address}
                onSaved={(next, id) => {
                  onAddressesChange(next);
                  setEditing(null);
                  onSelect?.(id);
                }}
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <div
              key={address.id}
              className={`relative rounded-2xl bg-white p-4 ring-1 transition ${selectable && selectedId === address.id ? 'ring-2 ring-[#f58220] shadow-[0_10px_26px_rgba(245,130,32,0.16)]' : 'ring-[#eadfce]'}`}
            >
              <label className={`flex gap-3 ${selectable ? 'cursor-pointer' : ''}`}>
                {selectable ? (
                  <input
                    type="radio"
                    name={name}
                    checked={selectedId === address.id}
                    onChange={() => onSelect?.(address.id)}
                    className="mt-1 h-4 w-4 accent-[#f58220]"
                  />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    {address.invoiceType === 'corporate' ? <Building2 className="h-4 w-4 text-[#f58220]" aria-hidden /> : <Home className="h-4 w-4 text-[#f58220]" aria-hidden />}
                    <span className="font-black text-[#24333f]">{address.title || address.name}</span>
                    {address.isDefaultShipping ? <span className="rounded-full bg-[#eef6f3] px-2 py-0.5 text-[10px] font-black uppercase text-[#0c8f74]">{ui.defaultShipping}</span> : null}
                    {address.isDefaultBilling ? <span className="rounded-full bg-[#fff1e2] px-2 py-0.5 text-[10px] font-black uppercase text-[#d96f12]">{ui.defaultBilling}</span> : null}
                  </span>
                  <span className="mt-1.5 block text-[13px] font-semibold text-[#24333f]">{address.name} · {address.phone}</span>
                  {addressLines(address).map((line) => (
                    <span key={line} className="block text-[13px] leading-5 text-[#68727b]">{line}</span>
                  ))}
                  {showInvoiceSummary ? <span className="mt-1.5 block text-[12px] font-semibold text-[#5f6871]">{invoiceSummary(address, ui)}</span> : null}
                  {address.latitude !== null ? (
                    <span className="mt-1 inline-flex items-center text-[#0c8f74]" title={`${address.latitude}, ${address.longitude}`}>
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  ) : null}
                </span>
              </label>
              <div className="mt-3 flex items-center gap-3 border-t border-[#f5ecdc] pt-2.5 text-[12px] font-bold">
                <button type="button" onClick={() => setEditing(address.id)} className={`inline-flex items-center gap-1 text-[#5f6871] hover:text-[#d96f12] ${FOCUS_RING}`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  {ui.edit}
                </button>
                {confirmDelete === address.id ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-red-700">{ui.deleteAddressConfirm}</span>
                    <button type="button" onClick={() => void remove(address.id)} className={`rounded-full bg-red-600 px-2.5 py-0.5 text-white ${FOCUS_RING}`}>
                      <Check className="h-3.5 w-3.5" aria-label={ui.deleteAddress} />
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className={`text-[#5f6871] ${FOCUS_RING}`}>{ui.cancel}</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(address.id)} className={`inline-flex items-center gap-1 text-[#9a8a74] hover:text-red-700 ${FOCUS_RING}`}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    {ui.deleteAddress}
                  </button>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {editing === 'new' ? (
        <AddressForm
          ui={ui}
          initial={emptyDraft(account)}
          onSaved={(next, id) => {
            onAddressesChange(next);
            setEditing(null);
            onSelect?.(id);
          }}
          onCancel={addresses.length ? () => setEditing(null) : undefined}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#eadfce] bg-white/60 px-4 py-4 text-[14px] font-black text-[#d96f12] transition hover:border-[#f58220] hover:bg-white ${FOCUS_RING}`}
          data-testid="address-add"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {ui.addNewAddress}
        </button>
      )}
    </div>
  );
}
