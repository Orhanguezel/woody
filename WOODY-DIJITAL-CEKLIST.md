# WOODY DİJİTAL + SATIŞ FAZLARI — UYGULAMA ÇEKLİSTİ (Codex)

**Tarih:** 2026-06-10 · **Hazırlayan:** Claude Code (mimari kontrat) · **Uygulayıcı:** Codex
**Bağlam raporu:** `docs/WOODY-SATIS-SEO-RAPORU.md` · **Kurallar:** İçerik hard-code edilmez (DB/site_settings veya `config/pages/<locale>/` deseni), marka **"Woody and Friends"** (sabit, çevrilmez), deploy: `./deploy/deploy.sh <hedef>`.

## KESİN KARARLAR
- Marka her yerde **"Woody and Friends"** (TR metin içinde de). "Woody ve Arkadaşları" KULLANILMAZ.
- **Musicland = herkese açık + SEO indexlenir.** Library = "Yakında" (gri) + ileride **abonelikli ücretli** içerik.
- Üyelik altyapısı ŞİMDİ kurulur (kayıt → satın almaya yönlendirme iskeleti); ödemeli içerik henüz YOK.
- Storyland/Movieland'deki mevcut 4 haneli şifre koruması ŞİMDİLİK kalır (okul içerikleri) — ama bkz. C-7 güvenlik notu.

---

## FAZ 0 — Hızlı Kazanımlar (rapordan; ürün gerektirmez)

- [x] **0.1 "Sprache" düzeltmesi:** `frontend/src/layout/header/HeaderOffcanvas.tsx:257` → `ui('ui_header_language', 'Sprache')` fallback'i locale'e göre olmalı (`tr`→"Dil", `en`→"Language"; `HeaderClient.tsx:276-279`'daki desen birebir kopyalanır). `LanguageSwitcher.tsx`'te `const def = ... || 'de'` → `|| 'tr'`.
- [x] **0.2 Sayfa bazlı meta description:** Tüm `generateMetadata` sayfaları aynı genel açıklamayı dönüyor. `woodyMetadata`'ya pageKey-bazlı description zorunluluğu: her sayfanın `config/pages/<locale>/<page>.json` → `seo.description` alanı dolu olacak (TR + EN minimum; diğer 8 dil mevcut çeviri akışıyla). Boşsa fallback genel açıklama. **Kabul:** `/`, `/tr/store`, `/tr/preschool`, `/tr/blog`, `/tr/digital-content` farklı description render eder.
- [x] **0.3 FAQPage schema:** Blog/FAQ içeriği zaten var (`config/pages/<locale>/faq.json`). FAQ render eden sayfaya `FAQPage` JSON-LD ekle (mevcut `JsonLd` bileşeni + `woody/seo.ts` deseni).
- [x] **0.4 Product schema'ya Offers:** Store ürünlerinde `Product` JSON-LD var ama `offers` yok. DB fiyatı varsa `offers: { @type: Offer, price, priceCurrency: 'TRY', availability }` ekle (`woodyProductGraph`).
- [x] **0.5 GA4 WhatsApp event:** `frontend/src/components/common/WhatsAppLink.tsx` onClick → `window.gtag?.('event','whatsapp_click',{ page_path, phone })`. AnalyticsScripts zaten GA yüklüyor; gtag yoksa sessiz geç.
- [x] **0.6 Marka tekleştirme:** Aktif kodda kalan "Woody ve Arkadaşları" geçişlerini tara (`grep -rn "Woody ve Arkada" frontend/src backend/src --include='*.{ts,tsx,json,sql}'`) → "Woody and Friends" yap. `og:site_name` ve root title'da da. (`_referans/` hariç.)

## FAZ 1 — B2B Teklif Sistemi (okul serisi; sıfır yasal yük)

- [x] **1.1 Veri modeli:** Yeni seed `backend/src/db/seed/sql/0XX_quote_requests.sql` → `quote_requests` tablosu: `id char(36)`, `org_name`, `contact_name`, `email`, `phone`, `student_count int`, `level enum('basic','junior','senior','mixed')`, `city`, `district`, `message text`, `status enum('new','contacted','quoted','won','lost') default 'new'`, `source varchar(32)`, `created_at/updated_at`. **ALTER YASAK** — CREATE TABLE seed dosyasına yazılır, `db:seed:nodrop` ile kurulur.
- [x] **1.2 Backend modül:** `backend/src/modules/quoteRequests/` → public `POST /quote-requests` (zod: student_count ≥ 30 uyarı ama reddetme; rate-limit) + admin `GET/PATCH /admin/quote-requests` (`routes/project.ts`'e kayıt).
- [x] **1.3 Frontend teklif formu:** Preschool + Store sayfalarındaki "fiyat teklifi" CTA'ları forma da bağlanır (WhatsApp linki kalır, yanına "Teklif Formu" butonu). Form: kurum adı, yetkili, e-posta, telefon, öğrenci sayısı, seviye, il/ilçe, mesaj + KVKK onay kutusu.
- [x] **1.4 Admin sayfası:** `/admin/quote-requests` — **YENİ KABUK STANDARDI** (bkz. users referans; list-client + `[id]` detail-client, gm token'ları). Durum güncelleme (new→contacted→quoted→won/lost).
- [x] **1.5 E-posta bildirimi:** Form düşünce admin'e mail (mevcut SMTP ayarları site-settings'te). PDF teklif = sonraki iterasyon.
- [x] **1.6 GA4:** `quote_form_submit` event.

## FAZ 2 — B2C Aktivasyon (ÜRÜNLER HAZIR OLUNCA — şimdi YAPILMAZ, hazırlık maddeleri hariç)

- [x] 2.1 Yasal metin sayfaları iskeleti: `/mesafeli-satis`, `/on-bilgilendirme`, `/iade-cayma`, `/kvkk` — içerik `config/pages` + DB'den, "taslak — avukat onayı bekliyor" notuyla yayında DEĞİL (noindex). Checkout'a onay checkbox'ları.
- [x] 2.2 Ön sipariş/bekleme listesi: "Çok yakında" ürün kartlarına e-posta bırakma formu (`waitlist_signups` tablosu; 1.1 desenine eş).
- [ ] 2.3 iyzico aktivasyonu (anahtar gelince): `FEATURE_IYZICO_PAYMENT=true` + sandbox test → prod. Altyapı `backend/src/modules/checkout` + `packages/shared-backend/modules/payments/iyzico.ts` HAZIR.

---

## BÖLÜM A — Breadcrumb/Başlık i18n (okul, atölye, ev-özel ders)

Sorun: `PreschoolPageClient`, `WorkshopPageClient`, `HomeTutorPageClient` hero/breadcrumb şeridindeki etiketler ve `DIGITAL_LEVEL_TITLES`/`DIGITAL_SECTION_TITLES` İngilizce hardcoded ("Preschool", "Workshop", "Home Tutor", "BASIC Level").

- [x] **A.1** Her üç sayfanın hero breadcrumb/başlık/mikro-etiket metinlerini `config/pages/<locale>/{preschool,workshop,home-tutor}.json` içine taşı (`loadWoodyPageContent` zaten bu dosyaları yüklüyor; eksik alanları JSON'lara ekle, bileşen props'tan okusun). Hardcoded `locale === 'tr' ? ... : ...` ikilileri de JSON'a taşınır (10 dil: tr,en,de,ar,fr,ru,es,it,nl,pt-br — çeviriler mevcut dosya desenine eklenir).
- [x] **A.2** Breadcrumb şeridi: "Anasayfa / <Sayfa>" yapısı `BreadcrumbList` JSON-LD ile zaten uyumlu olmalı; görünen metin locale'den gelir. Marka adı "Woody and Friends" çevrilmez.
- [x] **A.3** `DIGITAL_LEVEL_TITLES` ve `DIGITAL_SECTION_TITLES` → locale-bazlı sözlük (yeni `config/pages/<locale>/digital-content.json` alanları). "BASIC Level" → tr: "BASIC Seviye" vb. Ürün adları (Storyland/Musicland/Movieland/Library) marka — çevrilmez.

## BÖLÜM B — "Woody Dijital" Hub Sayfası (tık derinliği azaltma)

Sorun: `/digital-content` → seviye seç → bölüm seç = içerik 2-3 tık derinde.

- [x] **B.1** `DigitalContentHubClient` yeniden tasarım: TEK sayfada 4 bölüm (Storyland/Movieland/Musicland/Library) × 3 seviye (Basic/Junior/Senior) ızgarası — her hücre direkt `/digital-content/<level>/<product>` linki (tek tık). Seviye sekme/segment kontrolü kabul edilir; amaç: içeriğe **maks 1 tık**.
- [x] **B.2** Library hücreleri **gri + "Yakında" rozeti** (bkz. D). Musicland hücreleri renkli/oynatma ikonlu.
- [x] **B.3** Header menüde "Woody Dijital" görünür isim (menu_items DB üzerinden, locale başına; admin'den yönetilir — koda gömme).
- [x] **B.4** Ana sayfadan Woody Dijital'e tek tık giriş bloğu varsa korunur; yoksa home-layout'a bölüm eklenir (DB `home_sections` üzerinden).

## BÖLÜM C — Musicland: Herkese Açık + SEO

- [x] **C.1 Gerçek tema başlıkları:** `digital-content-data.ts` parçaları "Theme 1..8" — her temanın KONUSU eklenecek: `Theme 7 – Clothes` formatı. Konu listesi (Basic/Junior/Senior × 8) **müşteriden/SCOPE'tan alınacak** → `config/pages/<locale>/digital-content.json` → `musicland.tracks.<level>[]` = `{ id, title, topic }`. Müşteri listesi gelene kadar bilinenler girilir, kalanlar "Theme N" kalır (boş bırakma).
- [x] **C.2 Veri kaynağı:** Track listesi (title/topic/audio/thumbnail) hardcoded TS'ten → JSON config'e taşı (admin yönetimi ileride DB'ye; şimdilik config kabul — dinamik içerik kuralının istisnası olarak SCOPE'a not düş).
- [x] **C.3 SEO metadata:** `[level]/[product]/page.tsx` `generateMetadata` musicland için: title `"Musicland <LEVEL> – İngilizce Çocuk Şarkıları (Theme 1-8: Clothes, ...)"`, description konu adlarını içerir. `robots: index,follow` garanti (noindex OLMAMALI).
- [x] **C.4 JSON-LD:** Musicland sayfasına `ItemList` + her parça `MusicRecording { name: "Theme 7 – Clothes", inLanguage: "en" }`. "clothes" gibi aramalarda sayfanın indekslenmesi hedefi: konu adları H2/H3 olarak DOM'da görünür metin olmalı (sadece title değil).
- [x] **C.5 Erişim:** Musicland `DIGITAL_PROTECTED_SECTIONS` içinde DEĞİL (doğru) — şifre modalı musicland'de asla tetiklenmez, regresyonla doğrula.
- [x] **C.6 sitemap:** Musicland sayfaları sitemap'te (mevcut `generateStaticParams` + sitemap.ts kontrol).
- [x] **C.7 GÜVENLİK NOTU (ayrı görev):** `DIGITAL_VALID_PASSWORDS` listesi client bundle'da düz metin — okul şifre koruması ileride backend doğrulamaya taşınmalı (D'deki üyelik altyapısı buna zemin). Bu fazda davranış değiştirme, sadece TODO işaretle.

## BÖLÜM D — Library: "Yakında" + Abonelik Altyapısı İskeleti

- [x] **D.1 Library UI (şimdi):** `/digital-content/<level>/library` → gri kart ızgarası (placeholder kapaklar, `grayscale + opacity`) + merkezde "Yakında — Bu içerikler çok yakında abonelikle erişime açılacak" mesajı (10 dil, config'ten). Şifre modalı library için devre dışı.
- [x] **D.2 Library SEO:** `robots: noindex,follow` (içerik hazır olana kadar); hazır olunca kaldırılacak — koda yorumla işaretle.
- [x] **D.3 Tıklama akışı (altyapı):** Gri karta tıklayınca modal: "Bu içerik yakında üyelere özel olacak" + CTA'lar: **Üye Ol** (`/<locale>/register?next=<bu-sayfa>`) / **Giriş Yap** (`/<locale>/login?next=...`). `next` paramı login/register sonrası geri dönüşü sağlar (mevcut auth sayfalarında `next` desteği yoksa ekle).
- [x] **D.4 Abonelik veri modeli (iskelet):** Yeni seed `0XX_subscriptions.sql` → `subscription_plans` (id, code, name_tr/name_en, price_minor, currency, period enum('monthly','yearly'), is_active) + `user_subscriptions` (id, user_id FK, plan_id FK, status enum('pending','active','canceled','expired'), started_at, expires_at). NOT: adminPanelStubs'taki subscriptions STUB'ları gerçek modülle ÇAKIŞMASIN — stub route'ları kaldırılıp gerçek modül `routes/project.ts`'e bağlanır (FST_ERR_DUPLICATED_ROUTE tuzağı, bkz. stub dosyasındaki orders notu).
- [x] **D.5 Backend modül:** `backend/src/modules/subscriptions/` → public `GET /subscription-plans` (aktif planlar), auth'lu `GET /me/subscription` (kullanıcının durumu), admin CRUD. Ödeme başlatma endpoint'i Faz 2'de iyzico'ya bağlanır — şimdilik `POST /me/subscription/checkout` → `501 NOT_IMPLEMENTED` döner (sözleşme hazır).
- [x] **D.6 Frontend gating hook'u:** `useSubscriptionAccess(product)` → `{ hasAccess, isLoggedIn, status }`; library içerik render'ı bu hook'tan geçer. Şimdilik herkes için `hasAccess=false` (içerik yok). Profil sayfasına "Aboneliğim" bölümü (durum: yok/aktif).
- [x] **D.7 Admin:** Sidebar'da gizlenmiş `subscriptions`/`subscription_plans` anahtarları gerçek modül bağlanınca `HIDDEN_NAV_KEYS`'ten çıkarılır; sayfalar YENİ KABUK standardına göre (list + [id] detay).

---

## SIRALAMA ÖNERİSİ (Codex çalışma sırası)
1. FAZ 0 (0.1–0.6) — küçük, bağımsız, hemen deploy
2. BÖLÜM A + C (i18n + musicland SEO) — içerik/SEO değeri hemen
3. BÖLÜM B (hub) — UX
4. BÖLÜM D (library + abonelik iskeleti) — en kapsamlı, en son
5. FAZ 1 (B2B teklif) — paralel yürüyebilir (backend+admin ağırlıklı)

## GENEL KABUL KRİTERLERİ
- `bun run build` üç pakette de temiz; TS strict hatasız.
- Yeni admin sayfaları users-kabuk standardında (list + `[id]`, gm token'ları).
- Hiçbir kullanıcı metni koda gömülmez (config/pages veya DB; istisna: C.2 notu).
- DB şema değişikliği SADECE seed dosyasında (`ALTER` yasak), `db:seed:nodrop` idempotent.
- Her bölüm sonunda: `./deploy/deploy.sh <hedef>` + canlı smoke test (ilgili URL'ler 200, konsol temiz).
- Musicland: Google Rich Results testi `ItemList/MusicRecording` hatasız; library `noindex`.
