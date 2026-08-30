// Tek seferlik Google Ads temizlik (her islem bagimsiz try/catch):
//  (1) bozuk "Page view" (cift-URL) donusumunu sil
//  (2) WhatsApp lead donusumune deger ata (TL200)
//  (3) Display Expansion onerisini reddet
// Calistir (VPS, backend dizininde): bun scripts/gads-fix.ts
import { getGoogleAdsSettings } from '@shared/shared-backend/modules/googleAds/settings';
import {
  getGoogleAdsAccessToken,
  googleAdsSearch,
  googleAdsMutate,
} from '@shared/shared-backend/modules/googleAds/helpers/ads-client';

const LEAD_VALUE = 200;
const API_VERSION = process.env.GOOGLE_ADS_API_VERSION || 'v21';
const pick = (row: any, key: string): any => (row?.[key] ?? {});

async function main() {
  const s = await getGoogleAdsSettings();
  if (!s.customerId) throw new Error('customerId yok');
  const token = await getGoogleAdsAccessToken(s);
  console.log('customer:', s.customerId);

  const ca = (await googleAdsSearch(
    s,
    token,
    `SELECT conversion_action.resource_name, conversion_action.name, conversion_action.category FROM conversion_action`,
  )) as any[];
  const malformed = ca.find((r) => {
    const n = String(pick(r, 'conversionAction').name ?? '');
    return /page load/i.test(n) && /\.com\/https:\/\//i.test(n);
  });
  const whatsapp = ca.find((r) => /whatsapp/i.test(String(pick(r, 'conversionAction').name ?? '')));

  // (1) bozuk donusumu sil
  if (malformed) {
    const rn = pick(malformed, 'conversionAction').resourceName;
    try {
      await googleAdsMutate(s, token, 'conversionActions', [{ remove: rn }]);
      console.log('(1) SILINDI bozuk Page view');
    } catch (e: any) {
      console.log('(1) SILINEMEDI (muhtemelen codeless, UI gerekir):', e?.message ?? e);
    }
  } else console.log('(1) bozuk Page view bulunamadi');

  // (2) WhatsApp donusum degeri (ASIL ONEMLI)
  if (whatsapp) {
    const rn = pick(whatsapp, 'conversionAction').resourceName;
    try {
      await googleAdsMutate(s, token, 'conversionActions', [
        {
          update: {
            resourceName: rn,
            valueSettings: { defaultValue: LEAD_VALUE, alwaysUseDefaultValue: true },
          },
          updateMask: 'value_settings.default_value,value_settings.always_use_default_value',
        },
      ]);
      console.log(`(2) DEGER ATANDI: WhatsApp lead = TL${LEAD_VALUE}`);
    } catch (e: any) {
      console.log('(2) DEGER ATANAMADI:', e?.message ?? e);
    }
  } else console.log('(2) WhatsApp donusumu bulunamadi');

  // (3) Display Expansion onerisini reddet
  try {
    const rec = (await googleAdsSearch(
      s,
      token,
      `SELECT recommendation.resource_name, recommendation.type FROM recommendation WHERE recommendation.type = 'DISPLAY_EXPANSION_OPT_IN'`,
    )) as any[];
    if (rec.length) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'developer-token': s.developerToken,
        'Content-Type': 'application/json',
      };
      if (s.loginCustomerId) headers['login-customer-id'] = s.loginCustomerId;
      const res = await fetch(
        `https://googleads.googleapis.com/${API_VERSION}/customers/${s.customerId}/recommendations:dismiss`,
        { method: 'POST', headers, body: JSON.stringify({ operations: rec.map((r) => ({ resourceName: pick(r, 'recommendation').resourceName })) }) },
      );
      console.log('(3) DISMISS Display Expansion:', res.ok ? 'OK' : `HATA ${res.status} ${(await res.text()).slice(0, 160)}`);
    } else console.log('(3) Display Expansion onerisi bulunamadi');
  } catch (e: any) {
    console.log('(3) recommendation sorgu/dismiss hata:', e?.message ?? e);
  }

  console.log('BITTI');
  process.exit(0);
}

main().catch((e) => {
  console.error('HATA:', e?.message ?? e);
  process.exit(1);
});
