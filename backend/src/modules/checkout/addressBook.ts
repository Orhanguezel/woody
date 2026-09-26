// =============================================================
// Üye adres defteri (2026-09-26) — customer_addresses.
// Doğrulama addresses.ts ile aynı kurallar: ad, telefon, adres, il zorunlu;
// kurumsal fatura için unvan + vergi dairesi + 10 haneli VKN; TCKN isteğe bağlı
// ama girilirse kontrol hanesi doğrulanır.
// =============================================================
import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2/promise';

import { pool } from '@/db/client';
import { AddressError, normalizeBilling, type BillingInput, type NormalizedBilling } from './addresses';

export type AddressBookInput = BillingInput & {
  title?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  isDefaultShipping?: unknown;
  isDefaultBilling?: unknown;
};

export type AddressBookEntry = NormalizedBilling & {
  title: string;
  latitude: number | null;
  longitude: number | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

function coordinate(value: unknown, limit: number): number | null {
  const n = Number(value);
  return value === null || value === undefined || value === '' || !Number.isFinite(n) || Math.abs(n) > limit
    ? null
    : Math.round(n * 1e7) / 1e7;
}

export function normalizeBookEntry(input: AddressBookInput): AddressBookEntry {
  const billing = normalizeBilling({ ...input, sameAsShipping: false }, null);
  if (!billing.fullName) throw new AddressError('address_name_required');
  if (!billing.phone) throw new AddressError('address_phone_required');
  return {
    ...billing,
    title: String(input.title ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
    latitude: coordinate(input.latitude, 90),
    longitude: coordinate(input.longitude, 180),
    isDefaultShipping: input.isDefaultShipping === true,
    isDefaultBilling: input.isDefaultBilling === true,
  };
}

export function addressBookDto(row: RowDataPacket) {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    name: String(row.full_name ?? ''),
    phone: String(row.phone ?? ''),
    address: String(row.address ?? ''),
    district: String(row.district ?? ''),
    city: String(row.city ?? ''),
    postalCode: String(row.postal_code ?? ''),
    country: String(row.country ?? 'TR'),
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    invoiceType: row.invoice_type === 'corporate' ? 'corporate' : 'individual',
    identityNumber: String(row.identity_number ?? ''),
    companyName: String(row.company_name ?? ''),
    taxOffice: String(row.tax_office ?? ''),
    taxNumber: String(row.tax_number ?? ''),
    isDefaultShipping: Number(row.is_default_shipping) === 1,
    isDefaultBilling: Number(row.is_default_billing) === 1,
    updatedAt: row.updated_at,
  };
}

export async function listAddresses(userId: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM customer_addresses WHERE user_id = ?
      ORDER BY is_default_shipping DESC, is_default_billing DESC, updated_at DESC`,
    [userId],
  );
  return rows.map(addressBookDto);
}

async function clearDefaults(userId: string, entry: AddressBookEntry, exceptId: string) {
  if (entry.isDefaultShipping) {
    await pool.execute('UPDATE customer_addresses SET is_default_shipping = 0 WHERE user_id = ? AND id <> ?', [userId, exceptId]);
  }
  if (entry.isDefaultBilling) {
    await pool.execute('UPDATE customer_addresses SET is_default_billing = 0 WHERE user_id = ? AND id <> ?', [userId, exceptId]);
  }
}

function columns(entry: AddressBookEntry) {
  return [
    entry.title || null,
    entry.fullName,
    entry.phone,
    entry.address,
    entry.district || null,
    entry.city,
    entry.postalCode || null,
    entry.country || 'TR',
    entry.latitude,
    entry.longitude,
    entry.invoiceType,
    entry.identityNumber || null,
    entry.companyName || null,
    entry.taxOffice || null,
    entry.taxNumber || null,
    entry.isDefaultShipping ? 1 : 0,
    entry.isDefaultBilling ? 1 : 0,
  ];
}

export async function createAddress(userId: string, entry: AddressBookEntry) {
  const [countRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS n FROM customer_addresses WHERE user_id = ?', [userId]);
  const first = Number(countRows[0]?.n ?? 0) === 0;
  // İlk adres otomatik olarak varsayılan teslimat ve fatura adresi olur.
  const value = first ? { ...entry, isDefaultShipping: true, isDefaultBilling: true } : entry;
  if (Number(countRows[0]?.n ?? 0) >= 20) throw new AddressError('address_limit_reached');
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO customer_addresses (id, user_id, title, full_name, phone, address, district, city, postal_code,
       country, latitude, longitude, invoice_type, identity_number, company_name, tax_office, tax_number,
       is_default_shipping, is_default_billing)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, ...columns(value)],
  );
  await clearDefaults(userId, value, id);
  return id;
}

/** userId verilmezse (yönetici) sahiplik kontrolü yapılmaz. */
export async function updateAddress(id: string, entry: AddressBookEntry, userId?: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT user_id FROM customer_addresses WHERE id = ? ${userId ? 'AND user_id = ?' : ''} LIMIT 1`,
    userId ? [id, userId] : [id],
  );
  const owner = rows[0]?.user_id ? String(rows[0].user_id) : '';
  if (!owner) return false;
  await pool.execute(
    `UPDATE customer_addresses SET title = ?, full_name = ?, phone = ?, address = ?, district = ?, city = ?,
       postal_code = ?, country = ?, latitude = ?, longitude = ?, invoice_type = ?, identity_number = ?,
       company_name = ?, tax_office = ?, tax_number = ?, is_default_shipping = ?, is_default_billing = ?
     WHERE id = ?`,
    [...columns(entry), id],
  );
  await clearDefaults(owner, entry, id);
  return true;
}

export async function deleteAddress(id: string, userId?: string) {
  const [result] = await pool.execute(
    `DELETE FROM customer_addresses WHERE id = ? ${userId ? 'AND user_id = ?' : ''}`,
    userId ? [id, userId] : [id],
  );
  return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0;
}
