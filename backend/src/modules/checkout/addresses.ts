// =============================================================
// Checkout adresleri (2026-09-26): teslimat + fatura doğrulama/normalizasyon.
// Saf fonksiyonlar — router ve testler aynı kuralı kullanır.
// Fatura:
//  - bireysel: ad soyad + adres zorunlu; TC kimlik no İSTEĞE BAĞLI (girilirse
//    11 hane + resmi kontrol hanesi algoritması doğrulanır).
//  - kurumsal: unvan + vergi dairesi + 10 haneli vergi no + adres zorunlu.
// =============================================================

export type InvoiceType = 'individual' | 'corporate';

export type AddressInput = {
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  district?: unknown;
  postalCode?: unknown;
  country?: unknown;
};

export type BillingInput = AddressInput & {
  sameAsShipping?: unknown;
  invoiceType?: unknown;
  identityNumber?: unknown;
  companyName?: unknown;
  taxOffice?: unknown;
  taxNumber?: unknown;
};

export type NormalizedAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
};

export type NormalizedBilling = NormalizedAddress & {
  invoiceType: InvoiceType;
  identityNumber: string;
  companyName: string;
  taxOffice: string;
  taxNumber: string;
};

export class AddressError extends Error {}

function text(value: unknown, max: number): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** T.C. kimlik no resmi kontrol algoritması (10. ve 11. hane). */
export function isValidTcIdentity(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const tenth = (((odd * 7 - even) % 10) + 10) % 10;
  const eleventh = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  return d[9] === tenth && d[10] === eleventh;
}

export function normalizeAddress(input: AddressInput | undefined, required: boolean): NormalizedAddress | null {
  const value: NormalizedAddress = {
    fullName: text(input?.name, 191),
    phone: text(input?.phone, 40),
    address: text(input?.address, 500),
    city: text(input?.city, 120),
    district: text(input?.district, 120),
    postalCode: text(input?.postalCode, 20),
    country: (text(input?.country, 2) || 'TR').toUpperCase(),
  };
  const complete = Boolean(value.fullName && value.phone && value.address && value.city);
  if (!complete) {
    if (required) throw new AddressError('shipping_address_required');
    return null;
  }
  return value;
}

export function normalizeBilling(
  input: BillingInput | undefined,
  shipping: NormalizedAddress | null,
): NormalizedBilling {
  const invoiceType: InvoiceType = input?.invoiceType === 'corporate' ? 'corporate' : 'individual';
  const useShipping = input?.sameAsShipping === true && shipping !== null;
  const base: NormalizedAddress = useShipping
    ? shipping
    : {
        fullName: text(input?.name, 191),
        phone: text(input?.phone, 40),
        address: text(input?.address, 500),
        city: text(input?.city, 120),
        district: text(input?.district, 120),
        postalCode: text(input?.postalCode, 20),
        country: (text(input?.country, 2) || 'TR').toUpperCase(),
      };
  const billing: NormalizedBilling = {
    ...base,
    invoiceType,
    identityNumber: invoiceType === 'individual' ? digits(input?.identityNumber) : '',
    companyName: invoiceType === 'corporate' ? text(input?.companyName, 255) : '',
    taxOffice: invoiceType === 'corporate' ? text(input?.taxOffice, 191) : '',
    taxNumber: invoiceType === 'corporate' ? digits(input?.taxNumber) : '',
  };
  if (!billing.address || !billing.city) throw new AddressError('billing_address_required');
  if (invoiceType === 'individual') {
    if (!billing.fullName) throw new AddressError('billing_name_required');
    if (billing.identityNumber && !isValidTcIdentity(billing.identityNumber)) {
      throw new AddressError('billing_identity_invalid');
    }
  } else {
    if (!billing.companyName || !billing.taxOffice) throw new AddressError('billing_company_required');
    if (!/^\d{10}$/.test(billing.taxNumber)) throw new AddressError('billing_tax_number_invalid');
  }
  return billing;
}
