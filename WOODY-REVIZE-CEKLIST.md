# Woody Revize Çeklisti — 2026-08-30

Rapor: [WOODY-REVIZE-RAPORU-2026-08-30.md](WOODY-REVIZE-RAPORU-2026-08-30.md)
Kural: her fazın sonunda `bun run build` yeşil + ilgili doğrulama maddesi işaretli olmadan faz kapanmaz.

## Faz 0 — Kararlar

- [x] "Satın Al" = gerçek ödeme, **PayTR** (kullanıcı kararı 2026-08-30)
- [ ] Müşteri teyidi: kart görsellerinde rozet hatası (hepsi "JUNIOR LEVEL 2") → düzeltilmiş 9 görsel
- [ ] Müşteri teyidi: "For Individual Studetns" yazım hatası
- [ ] Müşteri teyidi: Mini School fiyatları (Basic öğretmen 1.500 < öğrenci 2.500 kasıtlı mı?)
- [ ] Müşteri teyidi: Junior videosunda oyuncak sayısı (4 mü 9 mu?)
- [ ] Karar: PRO seviyesi store'a girecek mi (varsayım: hayır, kart/fiyat yok)
- [ ] Karar: "en az 3 adet" kural mı bilgilendirme mi (varsayım: bilgilendirme)

## Faz 1 — Medya hazırlığı

- [x] 4 video → 1080×1920 @30fps CRF24 AAC128k `+faststart` (`mini-school-tanitim.mp4`, `home-tutor-{basic,junior,senior}.mp4`)
- [x] 4 poster karesi (JPEG/WebP, videoyla aynı adla `-poster` eki)
- [x] 9 kart PNG → ~800×1200 WebP (`ev-{basic,junior,senior}.webp`, `mini-school-{ogretmen,ogrenci}-{basic,junior,senior}.webp`)
- [x] Hedef klasör: `frontend/public/media/woody/revize-2026-08/`
- [x] VPS'e senkron (deploy notu: `frontend/public/media` git dışı, rsync ile gider)
- [x] Kaynak klasörler `.gitignore`'da

## Faz 2 — Sayfa revizyonları (Mini School + Ev & Özel Ders)

### İçerik (config + DB seed, 10 dil: tr en de es fr it nl ru ar pt-BR)

- [x] M2/E1: `guide` bloğu kaldır — `config/pages/*/workshop.json` + `home-tutor.json` (20 dosya)
- [x] M2/E1: aynı kaldırma `020_woody_site_settings.sql` `page_workshop` + `page_home-tutor` satırlarında
- [x] M1: görünen "Atölye Serisi" → "Mini School Serisi" (title/eyebrow/hero; **route ve slug değişmez**, SEO keywords'te "atölye/workshop" kalır)
- [x] M1: menü etiketi (`034_menu_i18n_translations.sql` + admin menü kayıtları)
- [x] M1: store kategori adı "Atölye Serisi" → "Mini School Serisi" (`store-products.json` categories + `021_categories.sql` + `030_woody_catalog_schema.sql` i18n)
- [x] M4: `pageUi.videoCaption` anahtarı: "Mini school serisi içerik videosu" (+9 çeviri)
- [x] E2 caption'ları: "Basic/Junior/Senior ev serisi içerik videosu" (+çeviriler)
- [x] Video yolları config'e taşınır: `media.heroVideo`, `media.contentVideos[]` (koda gömülü 3 sabit silinir — §4.3)

### Bileşenler

- [x] M3: `WorkshopPageClient.tsx` — coming-soon Öğretmen/Öğrenci kartları yerine tek 9:16 video (poster + `preload="none"` + altında caption)
- [x] M5: workshop seviye bölümü okul serisindekiyle aynı görsellere geçer (PRESCHOOL kutu görselleri)
- [x] M6: seviye kartlarında "Fiyat Teklifi Al/Teklif Formu" ikilisi yerine tek "Satın Al" → `/store` (PayTR açılınca doğrudan ürüne)
- [x] E2: `HomeTutorPageClient.tsx` — 3 dikey video grid (mobil 1 sütun, masaüstü 3)
- [x] E3/E4: home-tutor seviye bölümü + tek Satın Al butonu
- [x] 16:9 `aspect-video` kapları dikey içerik için düzeltilir (4 konum)

### Doğrulama

- [x] `bun run build` (frontend) yeşil (2026-08-30, exit 0)
- [x] tr + en + ar (RTL) görsel kontrol
- [ ] `node scripts/marka-denetimi.mjs` temiz

## Faz 3 — Store revizyonu

### Veri

- [x] `022_products.sql` CREATE TABLE'a `video_url LONGTEXT` (**ALTER yasak**; `bun run build && bun run db:seed:*:fresh`)
- [x] S6: Okul Serisi ürünleri (id 1,2,3) store'dan çıkar (config 10 dil + katalog seed)
- [x] S3: Ev Serisi 3 ürün — 3.000 / 3.750 / 4.250 TL, `purchase_mode='online'`, yeni WebP görseller, `video_url` = ilgili ev videosu
- [x] S8: Mini School 6 ürün — öğretmen 1.500/2.750/3.750, öğrenci 2.500/2.500/2.500, görseller, `video_url` = mini school videosu
- [x] Eski "Atölye/Home PRO, Tam Set, Dijital Materyal, Online Kütüphane" kalemlerinin akıbeti netleşir (PDF'te yok — varsayım: kaldırılır, karar notu düşülür)
- [x] Fiyat biçimi tek tip: `3.000 TL`

### Görünüm

- [x] S1: filtre şeridi altı beyaz, başlıklar hafifletilir
- [x] S2/S7: Ev 3'lü sıra; Mini School üstte 3 öğretmen + altta 3 öğrenci
- [x] S4: "Ürün Videosu" butonu → 9:16 video modalı
- [x] S9: "en az 3 adet / 1 öğretmen seti yeterli / öğrenci sayısı kadar" not şeridi
- [x] "Şimdi Satın Al" butonu → checkout akışı

### Doğrulama

- [x] `db:seed:fresh` sonrası API ürünleri doğru döner (fiyat, video, görsel)
- [ ] 10 dilde store render + `marka-denetimi` (tr/en/ar dogrulandi; marka-denetimi scripti bu repoya kopyalanmali)

## Faz 4 — PayTR ödeme altyapısı

### Backend

- [x] `packages/shared-backend/modules/payments/paytr.ts`: `createPaytrToken` (HMAC-SHA256, kuruş, base64 basket, TRY→TL), `verifyPaytrCallback` (`timingSafeEqual`), `encodePaytrBasket`
- [x] `index.ts` export + env şeması: `PAYTR_MERCHANT_ID/KEY/SALT`, `PAYTR_TEST_MODE`, `FEATURE_PAYTR_PAYMENT` (**fallback yok — yoksa 503**, `.env.example` boş satırlar)
- [x] `POST /checkout/orders/:id/paytr/initiate` — iyzipay/initiate kalıbı; `merchant_oid = 'WD'+uuid tiresiz` → `payment_ref`; `payment_attempts` kaydı
- [x] `POST /checkout/paytr/callback` — public, form-encoded (`@fastify/formbody` kontrolü), HMAC doğrula, idempotent, **düz metin "OK"**
- [x] `023_orders_payments.sql` içine `paytr_callback_logs` CREATE TABLE (merchant_oid, status, total_amount, source_ip, outcome, detail, payload JSON, received_at)
- [x] Her callback denemesi loglanır (doğrulanamayan dahil)

### Frontend

- [x] Checkout sayfasına PayTR iframe adımı (`https://www.paytr.com/odeme/guvenli/{token}` + iframeResizer)
- [x] Dönüş sayfaları: `?payment=success|failed` durumları (mevcut `checkoutUrl` kalıbı)
- [x] Sepet/adres akışı fiziksel ürün doğrulamasıyla (mevcut `/checkout/orders` şeması)

### Admin panel

- [x] PayTR callback log ekranı (liste + outcome istatistikleri) — QE `paytr-logs` ekranının portu
- [ ] Sipariş listesinde `payment_method=paytr` görünürlüğü

## Faz 7 — PayTR canlı mod ön koşulları (2026-08-31)

PayTR mağazası açıldı (Mağaza No **742589**, test modunda). PayTR'ın canlı mod öncesi
istediği site kontrolleri ve karşılıkları:

| PayTR'ın istediği | Durum |
| --- | --- |
| İletişim bilgileri | [x] `/tr/contact` — telefon, WhatsApp, e-posta yayında |
| Firma ve adres bilgileri | [x] Satıcı kimliği 4 yasal sayfada; **açık adres detayı doğrulanmalı** |
| Teslimat ve kargo koşulları | [x] `/tr/teslimat-ve-kargo` (yeni) |
| Mesafeli satış sözleşmesi | [x] `/tr/mesafeli-satis` — taslak yerine tam metin |
| Ön bilgilendirme formu | [x] `/tr/on-bilgilendirme` — taslak yerine tam metin |
| İptal, iade ve geri ödeme | [x] `/tr/iade-cayma` — taslak yerine tam metin |
| Test/demo içerik temizliği | [x] `/tr/store` 12 gerçek ürün, gerçek fiyat — demo içerik yok |

### Yapılanlar

- [x] `038_woody_legal_commerce_pages.sql` — 4 ticari yasal sayfa CMS `custom_pages`'e
      (module_key: `preliminary_info`, `distance_sales`, `refund`, `shipping`), idempotent
- [x] `LegalDraftPage` + 30 adet `YASAL TASLAK` config JSON kaldırıldı (10 dil × 3 sayfa)
- [x] `CmsLegalPageContent` — ortak CMS gövdesi; çevirisi olmayan dilde bağlayıcı TR metne düşer
- [x] 4 rota: `/mesafeli-satis`, `/on-bilgilendirme`, `/iade-cayma`, `/teslimat-ve-kargo`
      (üçü `noindex` taslaktı → indexlenebilir)
- [x] Footer yasal sütununa 4 link (10 dil etiketli) — sayfalar artık siteden erişilebilir
- [x] Sitemap: 4 sayfa `trOnly` (içerik TR mevzuatına tabi, ince duplike üretmesin)
- [x] Checkout'ta **Ön Bilgilendirme + Mesafeli Satış onay kutusu** (link'li, ayrı checkbox)
      — önceden sadece KVKK metni vardı, sözleşme onayı hiç alınmıyordu; KVKK metnine de link

### Bekleyen — kullanıcı aksiyonu

- [ ] **PayTR mağaza kaydındaki site adresi Instagram profili görünüyor** → Mağaza Paneli'nden
      `https://woodyvearkadaslari.com` olarak güncellenmeli/eklenmeli (iframe API alan adına bağlı)
- [ ] Canlı DB'ye uygula: `mysql ... woody_db < /tmp/038_woody_legal.sql` (dosya VPS'e kopyalandı)
- [ ] Frontend deploy (`./deploy/deploy.sh frontend`)
- [ ] Satıcı kimliğinde **açık adres** (sokak/no) ve varsa vergi dairesi/no doğrulanmalı —
      şu an "Yenişehir / MERSİN 33000". Admin panel → Özel Sayfalar'dan düzenlenir.
- [ ] Kargo firması adı ve iade gönderim adresi netleşince metinlere yazılmalı

### Ops / dış bağımlılık

- [ ] PayTR mağaza hesabı bilgileri (merchant_id/key/salt) — **müşteri/Orhan**
- [ ] PayTR panelinde bildirim URL tanımı: `https://woodyvearkadaslari.com/api/v1/checkout/paytr/callback`
- [x] Nginx: callback route dışarı açık, rate-limit muafiyeti
- [ ] VPS env + `pm2 restart` (PAYTR blogu eklenmedi — flag yokken varsayilan false/fail-closed; merchant bilgileriyle birlikte eklenecek)
- [ ] Test modunda uçtan uca ödeme (test kartı) → başarılı/başarısız/hash-mismatch üç senaryo
- [ ] `PAYTR_TEST_MODE=false` + gerçek düşük tutarlı doğrulama

### Doğrulama

- [x] Callback'e sahte POST → "OK" döner ama sipariş değişmez + log düşer
- [ ] Aynı callback iki kez → ikincisi işlem yapmaz (idempotency)
- [x] `grep -rnE "(PAYTR_[A-Z_]+)[^=]{0,40}(\?\?|\|\|)" backend packages` boş (secret fallback taraması)

## Faz 5 — Kapanış

- [ ] Lighthouse (store + workshop + home-tutor) — video ağırlığı LCP'yi bozmuyor
- [x] Sitemap/hreflang tutarlı, `llms.txt` içerik güncel
- [x] GA4 e-ticaret olayları: `begin_checkout`, `purchase` (mevcut GA4 G-0D7LYLF51K)
- [ ] Müşteriye kusur listesi iletildi (5.1–5.5)
- [ ] `project.portfolio.json` + `projects:scan` güncel
- [x] Deploy + canlı smoke test

## Faz 6 — SEO bulgu turu (2026-08-30 akşam, ekosistem oturumuyla ortak)

- [x] 6 sayfa title 30-60 karaktere (workshop/home-tutor/woody-academy/blog/library/store; canlı `seo_pages` admin API + config tr/en + 020 seed) — suffix payı hesaba katıldı
- [x] Store SEO: "yaşa uygun set" niyeti (title + heroSubtitle) + Seviye Bulucu'ya ageCta butonu (ekosistem devri)
- [x] nginx: kök istek `location = / { return 308 /tr; }` apex 443'te — Next proxy hop'u kalktı (canlı conf yedeği: /root/woody.conf.yedek-20260830; repo conf canlıdan FARKLI, aynen basılmaz)
- [x] Blog yanlış-locale kopya fix: generateStaticParams locale-başına slug; yanlış dilde slug → 308 doğru URL'ye; bilinmeyen slug → 404 (eski: her slug 200 + self-canonical → GSC 1527/765 kök nedeni; bulgu: ekosistem oturumu)
- [x] sameAs kontrolü: 3 sosyal profil (YouTube/FB/IG) zaten tüm sayfalarda JSON-LD'de — denetim aracı ölçememiş, iş çıkmadı
- [x] Blog yanlış-locale 308/404 CANLIDA doğrulandı (uydurma→404, /fr/<tr-slug>→308→doğru slug→200)
- [x] KÖK ONARIM: [locale]/layout Suspense'i children'ı sarıyordu → tüm sayfalarda notFound/redirect 200 dönüyordu; RouteEffects adasına taşındı, site geneli statü kodları düzeldi
- [ ] SEED DRIFT (ekosistem oturumu, 2026-08-30): canlı blog_posts i18n (6 yazı tr) + page_preschool tr, 024/033/020 seed'lerinden İLERİDE — canlıya full nodrop seed ÇALIŞTIRMA; sonraki seed bakımında canlı içerik seed'e geri taşınacak
- [x] <html lang> refactor TAMAM (9943eda, canlı): route group çift root layout; lang params.locale'den, prerender'da tr/fr/ar/ru/en doğrulandı. Yan iş: `useClientSearchParams` hook'u (Suspense'siz SSR-güvenli) — 9 bileşen geçirildi, yeni bileşenlerde useSearchParams yerine BU kullanılmalı
- [ ] Lighthouse derin işler: kullanılmayan JS, TTI 4.1s, kontrast/dokunma hedefleri (ayrı tur)
- [ ] GEO: Wikipedia/Wikidata + sosyal profil tamamlama — ekosistem oturumu Orhan'a raporluyor
