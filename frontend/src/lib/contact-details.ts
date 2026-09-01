/**
 * İletişim künyesi — tek normalizasyon noktası.
 *
 * Kaynak İKİ katmanlı: `site_settings.contact_info` (DB, öncelikli) + `site-defaults.json`
 * (yedek). Adres alanı iki farklı biçimde gelebiliyor: düz metin ya da PostalAddress
 * nesnesi. Tüketiciler (iletişim sayfası, footer, schema.org) aynı biçimi görmeli;
 * bu modül olmadan bir taraf adresi gösterip diğeri boş bırakıyordu.
 *
 * Marka/ünvan bilgisi burada YAZMAZ — yalnızca gelen değer normalize edilir.
 */

export type ContactAddressParts = {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
};

export type ContactDetails = {
  /** Görünen marka / ticari ad */
  companyName: string;
  /** Fatura ünvanı — mesafeli satışta ve ödeme sağlayıcı denetiminde aranır */
  legalName: string;
  /** Satıcı gerçek kişi/kurum adı */
  sellerName: string;
  phones: string[];
  phone: string;
  whatsapp: string;
  email: string;
  address: ContactAddressParts;
  businessHours: string[];
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asStr(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

function asStrArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asStr).filter(Boolean);
}

/** JSON string olarak saklanmış ayar değerlerini de kabul et. */
function toRecord(value: unknown): UnknownRecord {
  if (isRecord(value)) {
    // { value: {...} } sarmalı (site_settings satırı) — içeriği aç
    if ('value' in value && (isRecord(value.value) || typeof value.value === 'string')) {
      return toRecord(value.value);
    }
    return value;
  }
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw.startsWith('{')) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function parseAddress(value: unknown): ContactAddressParts {
  if (isRecord(value)) {
    return {
      streetAddress: asStr(value.streetAddress),
      addressLocality: asStr(value.addressLocality),
      addressRegion: asStr(value.addressRegion),
      postalCode: asStr(value.postalCode),
      addressCountry: asStr(value.addressCountry),
    };
  }
  // Düz metin adres: tek parça olarak sokak alanına yazılır, biçimlendirme bozulmaz.
  const text = asStr(value);
  return text ? { streetAddress: text } : {};
}

function hasAddress(parts: ContactAddressParts): boolean {
  return Boolean(
    parts.streetAddress || parts.addressLocality || parts.addressRegion || parts.postalCode,
  );
}

function pick(primary: string, fallback: string): string {
  return primary || fallback;
}

function readOne(raw: UnknownRecord): ContactDetails {
  const phones = asStrArray(raw.phones);
  const phone = asStr(raw.phone) || phones[0] || '';
  const whatsapp = asStr(raw.whatsappNumber) || asStr(raw.whatsapp) || phones[1] || '';

  return {
    companyName: asStr(raw.companyName),
    legalName: asStr(raw.legalName),
    sellerName: asStr(raw.sellerName),
    phones: phones.length ? phones : phone ? [phone] : [],
    phone,
    whatsapp,
    email: asStr(raw.email),
    address: parseAddress(raw.address),
    businessHours: asStrArray(raw.businessHours),
  };
}

/**
 * DB değeri + yedek yapılandırmayı alan alan birleştirir.
 * Boş bırakılan bir DB alanı yedeği siler değil, yedeğe düşer.
 */
export function mergeContactDetails(primary: unknown, fallback: unknown): ContactDetails {
  const a = readOne(toRecord(primary));
  const b = readOne(toRecord(fallback));

  return {
    companyName: pick(a.companyName, b.companyName),
    legalName: pick(a.legalName, b.legalName),
    sellerName: pick(a.sellerName, b.sellerName),
    phones: a.phones.length ? a.phones : b.phones,
    phone: pick(a.phone, b.phone),
    whatsapp: pick(a.whatsapp, b.whatsapp),
    email: pick(a.email, b.email),
    address: hasAddress(a.address) ? a.address : b.address,
    businessHours: a.businessHours.length ? a.businessHours : b.businessHours,
  };
}

/** Adresi tek satırlık okunur metne çevirir. Ülke etiketi çağıran taraftan (dile göre) gelir. */
export function formatAddressLine(
  parts: ContactAddressParts | undefined,
  countryLabel = '',
): string {
  if (!parts) return '';
  const locality = [parts.postalCode, parts.addressLocality].filter(Boolean).join(' ');
  return [parts.streetAddress, locality, parts.addressRegion, countryLabel]
    .map((piece) => asStr(piece))
    .filter(Boolean)
    .join(', ');
}

/** `tel:` / `wa.me` için rakamlaştırma. TR yerel numaralarını E.164'e taşır. */
export function toE164TR(value: string): string {
  const digits = asStr(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('90')) return `+${digits}`;
  if (digits.startsWith('0')) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return `+${digits}`;
}

export function whatsappHref(value: string): string {
  const e164 = toE164TR(value);
  return e164 ? `https://wa.me/${e164.replace(/\D/g, '')}` : '';
}
