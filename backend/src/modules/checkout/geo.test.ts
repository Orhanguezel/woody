import { describe, expect, test } from 'bun:test';

import { mapPhotonFeature } from './geo';
import { normalizeBookEntry } from './addressBook';

describe('geo + address book', () => {
  test('Photon sonucu il/ilçe/mahalle olarak eşlenir', () => {
    const s = mapPhotonFeature({
      geometry: { coordinates: [34.567123456, 36.789] },
      properties: { street: '7. Cadde', housenumber: '7', district: 'Akkent Mahallesi', county: 'Yenişehir', state: 'Mersin', postcode: '33000', countrycode: 'TR' },
    });
    expect(s).toEqual({
      label: 'Akkent Mahallesi, 7. Cadde No: 7, Yenişehir, Mersin',
      address: 'Akkent Mahallesi, 7. Cadde No: 7',
      neighbourhood: 'Akkent Mahallesi',
      district: 'Yenişehir',
      city: 'Mersin',
      postalCode: '33000',
      country: 'TR',
      latitude: 36.789,
      longitude: 34.5671235,
    });
    expect(mapPhotonFeature({ properties: {} })).toBeNull();
  });

  test('adres defteri kaydı ad, telefon, adres ve il ister; koordinat sınırları korunur', () => {
    expect(() => normalizeBookEntry({ name: 'Ada', address: 'X', city: 'Mersin' })).toThrow('address_phone_required');
    const entry = normalizeBookEntry({ title: ' Ev ', name: 'Ada', phone: '0532', address: 'Akkent', city: 'Mersin', latitude: 36.7, longitude: 999 });
    expect(entry.title).toBe('Ev');
    expect(entry.latitude).toBe(36.7);
    expect(entry.longitude).toBeNull();
    expect(entry.invoiceType).toBe('individual');
  });
});
