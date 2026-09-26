// =============================================================
// Adres tamamlama (2026-09-26): OpenStreetMap / Photon vekili.
// Google Maps anahtarı yok; Photon ücretsiz ve yazarken arama (autocomplete)
// kullanımına izin verir. İstekler sunucu üzerinden gider: önbellek, zaman aşımı,
// Türkiye önceliği ve tek bir User-Agent (adil kullanım).
// Türkiye eşlemesi: il = state, ilçe = county (yoksa city), mahalle = district/locality.
// =============================================================

export type GeoSuggestion = {
  label: string;
  address: string;
  neighbourhood: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, unknown>;
};

const PHOTON = 'https://photon.komoot.io';
// Türkiye sınır kutusu (minLon,minLat,maxLon,maxLat) — sonuçlar buraya öncelik verir.
const TR_BBOX = '25.5,35.7,45.0,42.3';
const TIMEOUT_MS = 5000;
const CACHE_MAX = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: GeoSuggestion[] }>();

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function mapPhotonFeature(feature: PhotonFeature): GeoSuggestion | null {
  const p = feature.properties ?? {};
  const [lon, lat] = feature.geometry?.coordinates ?? [];
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  const street = [str(p.street), str(p.housenumber)].filter(Boolean).join(' No: ');
  const name = str(p.name);
  const neighbourhood = str(p.district) || str(p.locality);
  const city = str(p.state) || str(p.city);
  const district = str(p.county) || (str(p.city) !== city ? str(p.city) : '');
  const firstLine = [
    neighbourhood,
    street,
    name && name !== street && name !== neighbourhood && name !== district && name !== city ? name : '',
  ].filter(Boolean);
  const address = Array.from(new Set(firstLine)).join(', ');
  const label = [address, district, city].filter(Boolean).join(', ');
  if (!label) return null;
  return {
    label,
    address,
    neighbourhood,
    district,
    city,
    postalCode: str(p.postcode),
    country: (str(p.countrycode) || 'TR').toUpperCase(),
    latitude: Math.round(lat * 1e7) / 1e7,
    longitude: Math.round(lon * 1e7) / 1e7,
  };
}

async function photon(path: string, cacheKey: string, userAgent: string): Promise<GeoSuggestion[]> {
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  const res = await fetch(`${PHOTON}${path}`, {
    headers: { 'user-agent': userAgent, accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`photon_${res.status}`);
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const seen = new Set<string>();
  const value = (data.features ?? [])
    .map(mapPhotonFeature)
    .filter((item): item is GeoSuggestion => Boolean(item))
    // Türkiye dışı sonuçları ele (bbox yalnız öncelik verir).
    .filter((item) => item.country === 'TR')
    .filter((item) => (seen.has(item.label) ? false : (seen.add(item.label), true)));
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(cacheKey, { at: Date.now(), value });
  return value;
}

export function geoSearch(query: string, userAgent: string) {
  const q = query.replace(/\s+/g, ' ').trim().slice(0, 120);
  if (q.length < 3) return Promise.resolve([] as GeoSuggestion[]);
  const params = new URLSearchParams({ q, limit: '6', bbox: TR_BBOX });
  return photon(`/api/?${params}`, `s:${q.toLocaleLowerCase('tr')}`, userAgent);
}

export function geoReverse(latitude: number, longitude: number, userAgent: string) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return Promise.resolve([] as GeoSuggestion[]);
  const lat = latitude.toFixed(5);
  const lon = longitude.toFixed(5);
  const params = new URLSearchParams({ lat, lon, limit: '1' });
  return photon(`/reverse?${params}`, `r:${lat},${lon}`, userAgent);
}
