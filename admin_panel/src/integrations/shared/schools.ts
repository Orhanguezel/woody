// =============================================================
// FILE: src/integrations/shared/schools.ts
// Woody school admin types + normalizers
// =============================================================

export type SchoolRole = 'owner' | 'teacher' | 'student';
export type DigitalAssetType = 'video' | 'pdf' | 'audio' | 'image' | 'other';
export type SchoolLevel = 'basic' | 'junior' | 'senior';
export type WoodyProduct = 'storyland' | 'movieland' | 'musicland' | 'library';

export type SchoolView = {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type SchoolUserView = {
  id: string;
  school_id: string;
  user_id: string;
  role: SchoolRole;
  email: string | null;
  created_at: string | null;
};

export type DigitalAssetView = {
  id: string;
  title: string;
  asset_type: DigitalAssetType;
  storage_asset_id: string | null;
  level: SchoolLevel | null;
  product: WoodyProduct | null;
  is_active: boolean;
  storage_mime: string | null;
  storage_name: string | null;
  storage_path: string | null;
  storage_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SchoolContentAccessView = {
  id: string;
  school_id: string;
  digital_asset_id: string;
  granted_at: string | null;
  title: string;
  asset_type: DigitalAssetType;
  level: SchoolLevel | null;
  product: WoodyProduct | null;
  storage_asset_id: string | null;
  storage_mime: string | null;
  storage_name: string | null;
  storage_path: string | null;
  storage_url: string | null;
  is_active: boolean;
};

export type SchoolUpsertBody = {
  name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  city?: string | null;
  is_active?: number;
};

export type SchoolUserCreateBody = {
  user_id: string;
  role?: SchoolRole;
};

export type DigitalAssetUpsertBody = {
  title: string;
  asset_type?: DigitalAssetType;
  storage_asset_id?: string | null;
  level?: SchoolLevel | null;
  product?: WoodyProduct | null;
  is_active?: number;
};

function toStr(value: unknown) {
  return String(value ?? '').trim();
}

function toNullableStr(value: unknown) {
  const s = toStr(value);
  return s ? s : null;
}

function toBool(value: unknown) {
  if (typeof value === 'boolean') return value;
  return value === 1 || value === '1' || value === 'true';
}

function toRole(value: unknown): SchoolRole {
  const s = toStr(value);
  return s === 'owner' || s === 'student' ? s : 'teacher';
}

function toAssetType(value: unknown): DigitalAssetType {
  const s = toStr(value);
  if (s === 'video' || s === 'audio' || s === 'image' || s === 'other') return s;
  return 'pdf';
}

function toLevel(value: unknown): SchoolLevel | null {
  const s = toStr(value);
  return s === 'basic' || s === 'junior' || s === 'senior' ? s : null;
}

function toProduct(value: unknown): WoodyProduct | null {
  const s = toStr(value);
  if (s === 'storyland' || s === 'movieland' || s === 'musicland' || s === 'library') return s;
  return null;
}

export function normalizeSchool(raw: unknown): SchoolView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    name: toStr(r.name),
    contact_email: toNullableStr(r.contact_email),
    contact_phone: toNullableStr(r.contact_phone),
    city: toNullableStr(r.city),
    is_active: toBool(r.is_active),
    created_at: toNullableStr(r.created_at),
    updated_at: toNullableStr(r.updated_at),
  };
}

export function normalizeSchoolUser(raw: unknown): SchoolUserView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    school_id: toStr(r.school_id),
    user_id: toStr(r.user_id),
    role: toRole(r.role),
    email: toNullableStr(r.email),
    created_at: toNullableStr(r.created_at),
  };
}

export function normalizeDigitalAsset(raw: unknown): DigitalAssetView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    title: toStr(r.title),
    asset_type: toAssetType(r.asset_type),
    storage_asset_id: toNullableStr(r.storage_asset_id),
    storage_mime: toNullableStr(r.storage_mime),
    storage_name: toNullableStr(r.storage_name),
    storage_path: toNullableStr(r.storage_path),
    storage_url: toNullableStr(r.storage_url),
    level: toLevel(r.level),
    product: toProduct(r.product),
    is_active: toBool(r.is_active),
    created_at: toNullableStr(r.created_at),
    updated_at: toNullableStr(r.updated_at),
  };
}

export function normalizeSchoolContentAccess(raw: unknown): SchoolContentAccessView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    school_id: toStr(r.school_id),
    digital_asset_id: toStr(r.digital_asset_id),
    granted_at: toNullableStr(r.granted_at),
    title: toStr(r.title),
    asset_type: toAssetType(r.asset_type),
    level: toLevel(r.level),
    product: toProduct(r.product),
    storage_asset_id: toNullableStr(r.storage_asset_id),
    storage_mime: toNullableStr(r.storage_mime),
    storage_name: toNullableStr(r.storage_name),
    storage_path: toNullableStr(r.storage_path),
    storage_url: toNullableStr(r.storage_url),
    is_active: toBool(r.is_active),
  };
}
