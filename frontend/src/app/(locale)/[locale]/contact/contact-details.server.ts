import 'server-only';

import { cache } from 'react';

import { fetchSetting } from '@/i18n/server';
import { mergeContactDetails, type ContactDetails } from '@/lib/contact-details';
import { getDefaultContactInfo, getPublicAppName } from '@/lib/site-config';

/**
 * İletişim künyesini sunucuda çözer: DB `site_settings.contact_info` önce,
 * `site-defaults.json` yedek. SSR'da çözülmesi şart — künye hem SEO/LocalBusiness
 * hem de ödeme sağlayıcı denetimi için sayfanın ilk HTML'inde görünmeli.
 */
export const loadContactDetails = cache(async (locale: string): Promise<ContactDetails> => {
  const row = await fetchSetting('contact_info', locale, { revalidate: 300 });
  const merged = mergeContactDetails(row?.value ?? null, getDefaultContactInfo());

  return {
    ...merged,
    companyName: merged.companyName || getPublicAppName(),
  };
});
