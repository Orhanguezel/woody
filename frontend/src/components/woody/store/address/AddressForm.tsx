'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import type { StoreUiCopy } from '../types';
import AddressAutocomplete from './AddressAutocomplete';
import MapPicker from './MapPicker';
import { addressApi, ApiError, type AddressDraft, type BookAddress, type GeoSuggestion } from './address-api';

const INPUT_CLS =
  'w-full rounded-lg border border-[#eadfce] bg-white px-3.5 py-2.5 text-[14px] text-[#24333f] outline-none transition focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/20';
const LABEL_CLS = 'mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]';

export const ADDRESS_ERROR_KEYS: Record<string, keyof StoreUiCopy> = {
  address_name_required: 'errorAddressName',
  address_phone_required: 'errorAddressPhone',
  address_limit_reached: 'errorAddressLimit',
  billing_address_required: 'errorBillingAddress',
  billing_name_required: 'errorBillingName',
  billing_identity_invalid: 'errorBillingIdentity',
  billing_company_required: 'errorBillingCompany',
  billing_tax_number_invalid: 'errorBillingTaxNumber',
};

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  autoComplete,
  className,
  inputMode,
  hint,
  testId,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  className?: string;
  inputMode?: 'numeric' | 'tel' | 'text';
  hint?: string;
  testId?: string;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className={LABEL_CLS}>{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLS}
        autoComplete={autoComplete}
        data-testid={testId}
      />
      {hint ? <span className="mt-1 block text-[11px] font-semibold text-[#9a8a74]">{hint}</span> : null}
    </label>
  );
}

type Props = {
  ui: StoreUiCopy;
  initial: AddressDraft;
  addressId?: string;
  /** Fatura alanlarını göster (checkout fatura seçimi / adres defteri). */
  showInvoice?: boolean;
  onSaved: (addresses: BookAddress[], id: string) => void;
  onCancel?: () => void;
};

/** Adres ekle/düzenle: haritadan arama + iğne, fatura kimliği, varsayılan işaretleri. */
export default function AddressForm({ ui, initial, addressId, showInvoice = true, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<AddressDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof AddressDraft>(key: K) => (value: AddressDraft[K]) => setDraft((prev) => ({ ...prev, [key]: value }));
  const titles = [ui.titleHome, ui.titleWork, ui.titleSchool, ui.titleOther].filter(Boolean) as string[];

  function applyGeo(item: GeoSuggestion, keepCoordinates = false) {
    setDraft((prev) => ({
      ...prev,
      address: item.address || prev.address,
      district: item.district || prev.district,
      city: item.city || prev.city,
      postalCode: item.postalCode || prev.postalCode,
      ...(keepCoordinates ? {} : { latitude: item.latitude, longitude: item.longitude }),
    }));
  }

  async function onMapChange(lat: number, lon: number) {
    setDraft((prev) => ({ ...prev, latitude: lat, longitude: lon }));
    try {
      const { results } = await addressApi.reverse(lat, lon);
      if (results[0]) applyGeo(results[0], true);
    } catch {
      // Ters arama opsiyonel; kullanıcı alanları elle düzenleyebilir.
    }
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = addressId ? await addressApi.update(addressId, draft) : await addressApi.create(draft);
      onSaved(res.addresses, res.id);
    } catch (err) {
      const key = err instanceof ApiError ? ADDRESS_ERROR_KEYS[err.code] : undefined;
      setError((key && ui[key]) || ui.checkoutFailed || '');
    } finally {
      setBusy(false);
    }
  }

  return (
    // Checkout formunun içinde durur; iç içe <form> geçersiz olduğu için div + buton.
    <div
      className="rounded-2xl bg-[#fffdf9] p-5 ring-1 ring-[#f0dcb6] md:p-6"
      data-testid="address-form"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT' && (event.target as HTMLInputElement).type !== 'search') {
          event.preventDefault();
          void save();
        }
      }}
    >
      <p className="font-display text-lg font-black">{addressId ? ui.editAddress : ui.addNewAddress}</p>

      <div className="mt-4">
        <span className={LABEL_CLS}>{ui.addressTitleLabel}</span>
        <div className="flex flex-wrap gap-2">
          {titles.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => set('title')(title)}
              aria-pressed={draft.title === title}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold ring-1 transition ${draft.title === title ? 'bg-[#24333f] text-white ring-[#24333f]' : 'bg-white text-[#5f6871] ring-[#eadfce] hover:ring-[#f58220]'} ${FOCUS_RING}`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={ui.name} value={draft.name} onChange={set('name')} required autoComplete="name" testId="address-name" />
        <Field label={ui.phone} value={draft.phone} onChange={set('phone')} required type="tel" autoComplete="tel" testId="address-phone" />
      </div>

      <div className="mt-4">
        <AddressAutocomplete
          label={ui.searchAddress}
          placeholder={ui.searchAddressPlaceholder}
          noResultsLabel={ui.searchNoResults}
          unavailableLabel={ui.geoUnavailable}
          onSelect={(item) => applyGeo(item)}
        />
      </div>
      <div className="mt-3">
        <MapPicker
          latitude={draft.latitude}
          longitude={draft.longitude}
          onChange={onMapChange}
          hint={ui.mapHint}
          locateLabel={ui.useMyLocation}
          locationDeniedLabel={ui.locationDenied}
          locationUnavailableLabel={ui.locationUnavailable}
          locatingLabel={ui.locating}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={ui.addressLine || ui.address} value={draft.address} onChange={set('address')} required autoComplete="street-address" className="sm:col-span-2" testId="address-line" />
        <Field label={ui.district} value={draft.district} onChange={set('district')} autoComplete="address-level2" testId="address-district" />
        <Field label={ui.city} value={draft.city} onChange={set('city')} required autoComplete="address-level1" testId="address-city" />
        <Field label={ui.postalCode} value={draft.postalCode} onChange={set('postalCode')} autoComplete="postal-code" inputMode="numeric" />
      </div>

      {showInvoice ? (
        <fieldset className="mt-5 rounded-xl bg-white p-4 ring-1 ring-[#eadfce]">
          <legend className="px-1 text-[13px] font-black text-[#24333f]">{ui.invoiceForAddress}</legend>
          <div className="flex flex-wrap gap-4 text-[14px] font-bold" role="radiogroup" aria-label={ui.invoiceType || ''}>
            {(['individual', 'corporate'] as const).map((type) => (
              <label key={type} className="inline-flex items-center gap-2">
                <input type="radio" name={`invoice-${addressId || 'new'}`} checked={draft.invoiceType === type} onChange={() => set('invoiceType')(type)} className="h-4 w-4 accent-[#f58220]" />
                {type === 'individual' ? ui.invoiceIndividual : ui.invoiceCorporate}
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {draft.invoiceType === 'individual' ? (
              <Field label={ui.identityNumber} value={draft.identityNumber} onChange={set('identityNumber')} inputMode="numeric" hint={ui.identityHint} className="sm:col-span-2" />
            ) : (
              <>
                <Field label={ui.companyName} value={draft.companyName} onChange={set('companyName')} required autoComplete="organization" className="sm:col-span-2" />
                <Field label={ui.taxOffice} value={draft.taxOffice} onChange={set('taxOffice')} required />
                <Field label={ui.taxNumber} value={draft.taxNumber} onChange={set('taxNumber')} required inputMode="numeric" />
              </>
            )}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-[#5f6871]">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={draft.isDefaultShipping} onChange={(event) => set('isDefaultShipping')(event.target.checked)} className="h-4 w-4 accent-[#f58220]" />
          {ui.defaultShipping}
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={draft.isDefaultBilling} onChange={(event) => set('isDefaultBilling')(event.target.checked)} className="h-4 w-4 accent-[#f58220]" />
          {ui.defaultBilling}
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-full bg-[#24333f] px-5 py-2.5 text-[14px] font-black text-white transition hover:bg-[#1a262f] disabled:opacity-60 ${FOCUS_RING}`}
          data-testid="address-save"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {ui.saveAddress}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={`rounded-full px-5 py-2.5 text-[14px] font-bold text-[#5f6871] ring-1 ring-[#eadfce] hover:bg-white ${FOCUS_RING}`}>
            {ui.cancel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
