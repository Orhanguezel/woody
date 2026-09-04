-- =============================================================
-- Pazarlama modullerinin DB izlerini temizler.
-- Silinen moduller: twitter/X, google-ads, ga4,
--                   gtm, meta, google-connect, banners, campaigns
-- Kod tarafi 2026-09-03'te kaldirildi; bu betik geride kalan
-- tablo ve site_settings satirlarini siler.
--
-- KORUNANLAR (silinmez — canli sitenin izleme altyapisi):
--   site_settings.ga4_measurement_id      -> frontend GA4 etiketi
--   site_settings.gtm_container_id        -> frontend GTM etiketi
--   site_settings.facebook_pixel_id       -> frontend Meta Pixel
--   site_settings.socials                 -> footer sosyal medya linkleri
--   site_settings.google_client_id/secret -> Google OAuth (login)
--   gsc_url_index + GSC OAuth ayarlari     -> URL indeks denetimi
-- =============================================================

DROP TABLE IF EXISTS `tweets`;
DROP TABLE IF EXISTS `social_content_plans`;

DELETE FROM `site_settings`
WHERE `key` IN (
  -- Google Ads API modulu
  'google_ads_enabled', 'google_ads_customer_id', 'google_ads_customer_label',
  'google_ads_login_customer_id', 'google_ads_developer_token',
  -- Bu uc OAuth anahtari GSC URL Inspection tarafindan da kullanildigi icin korunur:
  -- google_ads_client_id, google_ads_client_secret, google_ads_refresh_token
  -- GA4 Data API / GTM API
  'ga4_property_id', 'gtm_account_id',
  'google_oauth_redirect', 'google_refresh_token',
  -- Meta Pixel CAPI admin modulu
  'meta_enabled', 'meta_pixel_id', 'meta_capi_token', 'meta_test_event_code'
);

-- Twitter/X + diger sosyal platform gonderi ayarlari (twitter modulu)
DELETE FROM `site_settings`
WHERE `key` REGEXP '^(twitter|x_api|x_oauth|linkedin_|instagram_api|facebook_api|youtube_api|social_publish)';
