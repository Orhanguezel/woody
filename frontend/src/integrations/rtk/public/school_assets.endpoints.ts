import { baseApi } from '@/integrations/rtk/baseApi';

export type SchoolAssetView = {
  asset_type: 'audio' | 'image' | 'other' | 'pdf' | 'video';
  granted_at: string | null;
  id: string;
  level: 'basic' | 'junior' | 'senior' | null;
  product: 'library' | 'movieland' | 'musicland' | 'storyland' | null;
  school_id: string;
  school_name: string | null;
  storage_asset_id: string | null;
  storage_mime: string | null;
  storage_name: string | null;
  storage_path: string | null;
  storage_url: string | null;
  title: string;
};

function toStr(value: unknown) {
  return String(value ?? '').trim();
}

function toNullableStr(value: unknown) {
  const valueAsString = toStr(value);
  return valueAsString ? valueAsString : null;
}

function normalizeSchoolAsset(raw: unknown): SchoolAssetView {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    asset_type: (toStr(row.asset_type) || 'pdf') as SchoolAssetView['asset_type'],
    granted_at: toNullableStr(row.granted_at),
    id: toStr(row.id),
    level: toNullableStr(row.level) as SchoolAssetView['level'],
    product: toNullableStr(row.product) as SchoolAssetView['product'],
    school_id: toStr(row.school_id),
    school_name: toNullableStr(row.school_name),
    storage_asset_id: toNullableStr(row.storage_asset_id),
    storage_mime: toNullableStr(row.storage_mime),
    storage_name: toNullableStr(row.storage_name),
    storage_path: toNullableStr(row.storage_path),
    storage_url: toNullableStr(row.storage_url),
    title: toStr(row.title),
  };
}

export const schoolAssetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMySchoolAssets: builder.query<SchoolAssetView[], void>({
      query: () => ({ method: 'GET', url: '/school/assets' }),
      transformResponse: (response: unknown) =>
        Array.isArray(response) ? response.map(normalizeSchoolAsset) : [],
    }),
  }),
  overrideExisting: true,
});

export const { useListMySchoolAssetsQuery } = schoolAssetsApi;
