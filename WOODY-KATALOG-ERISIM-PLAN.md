# WOODY — Katalog Taksonomisi + Satın Alma & Erişim Sistemi (Mimari Plan v2)

> Hazırlayan: Claude Code (Mimar) — 2026-06-11
> Uygulayıcı: Codex (brief: `WOODY-KATALOG-CODEX-BRIEF.md`) | Doğrulama: Antigravity
> Branch önerisi: `woody-katalog-erisim`

## 0. Temel İlke — Her Şey Admin Panelden Yönetilir

**Dinamik içerik kuralı bu projede OLMAZSA OLMAZ:** frontend'de görünen hiçbir içerik
koda gömülmez. Tüm içerik DB'de durur ve admin panelden yönetilir.

| İçerik türü | Yönetim yeri |
|---|---|
| Kategoriler (Okul/Atölye/Ev-Özel Ders) | `categories` modülü → `/admin/categories` |
| Seriler (Öğrenci/Öğretmen) | YENİ `product_series` → `/admin/series` |
| Seviyeler (Basic/Junior/Senior/Pro) | YENİ `product_levels` → `/admin/levels` |
| Ürünler (setler), fiyat, satış modu, erişim süresi | `products` modülü → `/admin/products` |
| Set içerikleri (dijital dosyalar + matbu kalemler) | YENİ `product_contents` → ürün detayı "İçerikler" sekmesi |
| Erişim hakları | YENİ `user_entitlements` → `/admin/entitlements` |
| Sipariş + kargo takibi | `orders` modülü → `/admin/orders` |
| Mağaza sayfa metinleri (hero, CTA, rozet, `catalog.ui` etiketleri) | `site_settings` (`page_store`) → site ayarları |
| WhatsApp teklif numarası ve mesaj şablonu | `site_settings` |
| Teklif talepleri | `quote_requests` → `/admin/quote-requests` |

### KRİTİK MEVCUT DURUM TESPİTİ — `page_store` migrasyonu

Mağaza sayfası (`WoodyStoreShowcase.tsx`) bugün ürün ve kategori verisini **DB'den DEĞİL**,
`site_settings.page_store` JSON'ı içindeki gömülü `categories` ve `products` dizilerinden
okuyor. Bu plan kapsamında:

1. `page_store` içindeki ürün/kategori verisi **gerçek modüllere taşınır**
   (`categories`, `products` + i18n tabloları — seed SQL olarak yazılır, fresh ile gelir).
2. `page_store` JSON'ında yalnızca **sayfa düzeyi UI içeriği kalır**: `title`,
   `description`, `eyebrow`, `hero`, `sections`, `seo`, `quoteWhatsApp`, `quoteMessage`,
   `primaryCTA`, `ui` (etiketler). `categories` ve `products` anahtarları JSON'dan çıkarılır.
3. Store sayfası ürün verisini API'den (`/checkout/store/products` + `/catalog/taxonomy`)
   çeker; metinleri `page_store`'dan almaya devam eder. İkisi de admin'den yönetilir.

## 1. Kavramsal Model (Onaylanmış Kararlar)

- **Satış birimi = SET.** `products` tablosundaki her kayıt satılabilir bir settir
  (ör. "Öğrenci Junior Seti"). Setin tek fiyatı vardır; her setin fiyatı farklı olabilir.
- **Set içerikleri** dijital (video, PDF, ses — sitede izlenir) veya **matbu** (kargoyla
  adrese gönderilir) olabilir. Bir set ikisini birden içerebilir.
- **Taksonomi 3 eksen:**
  1. **Grup (hedef kitle):** Okul / Atölye / Ev-Özel Ders → mevcut `categories`
     (3 kayıt, `module_key='store'`); ürün bağlantısı mevcut `products.category_id`
  2. **Seri:** Öğrenci / Öğretmen → yeni `product_series`
  3. **Seviye:** Basic → Junior → Senior → Pro (4 düz seviye) → yeni `product_levels`
- **Okul grubu ürünler:** sitede herkese görünür; fiyat/sepet yerine
  **"WhatsApp ile Teklif Al"** (`purchase_mode='quote'`). Online satılmaz, sepete eklenemez.
- **Atölye ve Ev-Özel Ders ürünleri:** online satılır (`purchase_mode='online'`).
- **Ücretsiz ürünler:** `is_free=1` — dijital içerikleri üye girişiyle izlenir
  (ücretsiz içerik için de üyelik şart; lead toplama amaçlı).
- **Ücretli dijital erişim SÜRELİ:** satın alma, ürün bazında tanımlı gün kadar erişim
  verir (`access_duration_days`, seed varsayılanı 365; admin ürün bazında değiştirir).
  Süre bitince yeniden satın alma ile uzar.
- **Matbu içerik:** ödeme onayı sonrası siparişteki adrese kargolanır; admin panelden
  kargo firması + takip no girilir.

## 2. Şema Değişiklikleri (ALTER YASAK — seed dosyaları düzenlenir + fresh seed)

### 2a. `022_products.sql` — `products` CREATE TABLE'a eklenecek kolonlar

```sql
series_id            CHAR(36) NULL,
level_id             CHAR(36) NULL,
purchase_mode        ENUM('online','quote') NOT NULL DEFAULT 'online',
is_free              TINYINT(1) NOT NULL DEFAULT 0,
access_duration_days INT NULL,            -- NULL = süresiz; ücretli setlerde seed: 365
-- + KEY idx_products_series (series_id), KEY idx_products_level (level_id)
```

Not: Grup ekseni için mevcut `category_id` kullanılır, yeni kolon GEREKMEZ.

### 2b. `023_orders_payments.sql` — `orders` CREATE TABLE'a kargo alanları

```sql
shipping_name        VARCHAR(160) NULL,
shipping_phone       VARCHAR(32)  NULL,
shipping_address     VARCHAR(500) NULL,
shipping_city        VARCHAR(100) NULL,
shipping_district    VARCHAR(100) NULL,
shipping_postal_code VARCHAR(16)  NULL,
shipping_country     VARCHAR(64)  NULL DEFAULT 'TR',
shipping_carrier     VARCHAR(64)  NULL,
shipping_tracking_no VARCHAR(128) NULL,
shipped_at           DATETIME(3)  NULL,
```

### 2c. `026_quote_requests.sql` — `quote_requests` CREATE TABLE'a

```sql
product_id CHAR(36) NULL,   -- teklif istenen okul ürünü (opsiyonel bağ)
-- + KEY quote_requests_product_idx (product_id)
```

Ayrıca mevcut `level` ENUM('basic','junior','senior','mixed') yeni seviye setiyle
uyumlu kalır; 'pro' eklenir: ENUM('basic','junior','senior','pro','mixed').

### 2d. YENİ DOSYA: `030_woody_catalog_schema.sql`

```sql
-- Seri (Öğrenci / Öğretmen)
CREATE TABLE IF NOT EXISTS `product_series` (
  id CHAR(36) NOT NULL PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,            -- 'ogrenci' | 'ogretmen'
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3), updated_at DATETIME(3)
);
CREATE TABLE IF NOT EXISTS `product_series_i18n` (
  series_id CHAR(36) NOT NULL,
  locale VARCHAR(8) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (series_id, locale),
  UNIQUE KEY uq_series_slug_locale (slug, locale)
);

-- Seviye (Basic/Junior/Senior/Pro)
CREATE TABLE IF NOT EXISTS `product_levels` (
  id CHAR(36) NOT NULL PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,            -- 'basic'|'junior'|'senior'|'pro'
  rank INT NOT NULL DEFAULT 0,                 -- 1..4 sıralama
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3), updated_at DATETIME(3)
);
CREATE TABLE IF NOT EXISTS `product_level_i18n` (
  level_id CHAR(36) NOT NULL,
  locale VARCHAR(8) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (level_id, locale),
  UNIQUE KEY uq_level_slug_locale (slug, locale)
);

-- Set içerikleri (dijital + matbu)
CREATE TABLE IF NOT EXISTS `product_contents` (
  id CHAR(36) NOT NULL PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  kind ENUM('digital','physical') NOT NULL,
  media_type ENUM('video','pdf','audio','image','other') NULL,  -- yalnız digital
  storage_asset_id CHAR(36) NULL,              -- dijital dosya (storage modülü)
  external_url LONGTEXT NULL,                  -- alternatif: harici/embed kaynak
  is_preview TINYINT(1) NOT NULL DEFAULT 0,    -- satın almasız önizleme (login şart)
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3), updated_at DATETIME(3),
  KEY idx_contents_product (product_id)
);
CREATE TABLE IF NOT EXISTS `product_content_i18n` (
  content_id CHAR(36) NOT NULL,
  locale VARCHAR(8) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (content_id, locale)
);

-- Erişim hakları (entitlement)
CREATE TABLE IF NOT EXISTS `user_entitlements` (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  order_id CHAR(36) NULL,                      -- satın almayla geldiyse
  source ENUM('purchase','manual','free') NOT NULL DEFAULT 'purchase',
  status ENUM('active','expired','revoked') NOT NULL DEFAULT 'active',
  starts_at DATETIME(3) NOT NULL,
  expires_at DATETIME(3) NULL,                 -- NULL = süresiz (ücretsiz ürünler)
  created_at DATETIME(3), updated_at DATETIME(3),
  UNIQUE KEY uq_user_product (user_id, product_id),
  KEY idx_entitlements_user (user_id)
);
```

### 2e. Seed verileri (030 içinde) — page_store'dan veri taşıma DAHİL

- `categories`: Okul / Atölye / Ev-Özel Ders — 3 kayıt, `module_key='store'`,
  TÜM aktif dillerde i18n (TR kaynak, çeviri yoksa TR fallback — store çok-dilli
  commit pattern'i ile aynı).
- `product_series`: ogrenci, ogretmen + tüm dillerde i18n.
- `product_levels`: basic(1), junior(2), senior(3), pro(4) + tüm dillerde i18n.
- **`page_store` JSON'ındaki mevcut ürün/kategori verisi** `products` + `product_i18n`
  seed satırlarına dönüştürülür (görseller `storage_assets` referanslarıyla).
- `020_woody_site_settings.sql` içindeki `page_store` değerlerinden `categories` ve
  `products` anahtarları ÇIKARILIR (UI metinleri kalır).
- ID'ler 20-hex kısa formatta (char(36) taşması yaşandı — 019 seed bug dersi).

## 3. Backend (Fastify)

### 3a. Public API
- `GET /api/v1/catalog/taxonomy?locale=xx` → `{ categories, series, levels }` —
  store filtre çubuğu tek çağrıyla beslenir.
- `GET /checkout/store/products` ucuna filtreler: `category`, `series`, `level`, `isFree`.
- Ürün yanıtına yeni alanlar: `purchaseMode`, `isFree`, `accessDurationDays`,
  `hasPhysical`, içerik listesi (yalnız meta: başlık, tür, `isPreview`, süre —
  **dijital dosya URL'i ASLA public yanıtta dönülmez**).

### 3b. Erişim servisi — yeni modül `backend/src/modules/entitlements`
- `GET /api/v1/me/library` → aktif entitlement'lı ürünler + içerikler + kalan süre.
- `GET /api/v1/me/contents/:contentId` → entitlement kontrolü → dijital teslim:
  kimlik doğrulamalı stream veya kısa ömürlü imzalı URL. `is_preview=1` → login yeter.
  **Dijital dosyalar public static dizinden SERVİS EDİLMEZ.**
- `POST /api/v1/me/library/free/:productId` → ücretsiz ürünü kütüphaneye ekler
  (login zorunlu; `source='free'`, `expires_at=NULL`).
- Süre kontrolü okuma anında (`expires_at < NOW()` → 403 + `reason:'expired'`).

### 3c. Satın alma akışı (checkout modülüne ek)
1. Sepete yalnız `purchase_mode='online'` ürünler girer (backend doğrular, 400).
2. Sepette matbu içerikli ürün varsa kargo adresi ZORUNLU (profilden ön-dolu).
3. iyzipay callback `paid` → her `order_item` için entitlement upsert
   (`expires_at = NOW() + access_duration_days`; aktif kayıt varsa
   `expires_at = GREATEST(expires_at, NOW()) + süre` şeklinde uzatılır).
4. Okul ürünleri: WhatsApp deep-link (`wa.me/<numara>?text=<şablon+ürün>`) — numara ve
   mesaj şablonu `site_settings`'ten. Paralel `quote_requests` formu `product_id` ile.

### 3d. Admin API
- `product_series` / `product_levels` CRUD (categories admin controller deseni).
- `products` admin: yeni alanlar (series_id, level_id, purchase_mode, is_free,
  access_duration_days) list filtreleri dahil.
- `product_contents` CRUD: `GET/POST/PATCH/DELETE /admin/products/:id/contents(/:cid)`.
- `user_entitlements` admin: listele (kullanıcı/ürün/status filtreli), manuel ver,
  süre uzat, iptal (`revoked`).
- `orders` admin: kargo alanları + takip no + `shipped_at` PATCH.

## 4. Admin Panel (Next.js) — list + ayrı detay sayfası pattern'i (referans: users)

- `/admin/series`, `/admin/levels` — CRUD: tüm dillerde ad/slug, sıra, aktiflik.
- `/admin/products/[id]` — Genel sekmesi: Grup (kategori), Seri, Seviye, Satış Modu
  (online/teklif), Ücretsiz toggle, Erişim süresi (gün). YENİ **"İçerikler"** sekmesi:
  dijital içerik (storage upload + media_type + önizleme toggle) ve matbu kalem,
  sıralama, tüm dillerde başlık/açıklama.
- `/admin/entitlements` — liste (kullanıcı, ürün, kaynak, durum, bitiş) + manuel
  verme / uzatma / iptal.
- `/admin/orders/[id]` — kargo adresi + firma/takip no/`shipped_at` girişi;
  listede "kargo bekleyen" filtresi.
- Site ayarları: `page_store` UI metin düzenlemesi mevcut site-settings ekranından
  sürdürülür (ürün/kategori anahtarları kaldırıldığı için yalnız metin kalır).

## 5. Frontend (Site) — tamamı modül/DB beslemeli

- `/store`: taxonomy ucundan 3 filtre (Grup / Seri / Seviye). Ürün kartı 3 durum:
  1. **Ücretsiz** rozeti → "Ücretsiz İzle" (login değilse login'e yönlendirme)
  2. **Fiyat + Sepete Ekle** (online)
  3. **"WhatsApp ile Teklif Al"** (okul — fiyat gösterilmez)
- `/store/[slug]`: içerik listesi (kilit ikonu; `is_preview` açık), seri/seviye
  rozetleri, matbu içerikte "kargoyla gönderilir" notu, kalan erişim süresi (sahipse).
- `/store/checkout`: matbu içerikli sepette adres formu zorunlu.
- `/me/library` (mevcut `/library` & `/digital-content` buna bağlanır): satın alınan
  setler, kalan süre, video player / PDF görüntüleyici, süresi dolana
  "yeniden satın al" CTA.
- **WoodyStoreShowcase migrasyonu:** gömülü `catalog.categories/products` yerine API;
  metinler `page_store.ui`'dan. Koda gömülü içerik kalmaz (yalnızca son çare fallback).
- Tüm taksonomi adları DB i18n'den; arayüz metinleri `page_store` site_settings'ten —
  her ikisi de admin panelden, TÜM aktif dillerde.

## 6. Uygulama Fazları

Detaylı görev listesi: `WOODY-KATALOG-CODEX-BRIEF.md`

| Faz | İş | Alan |
|-----|-----|------|
| 1 | Şema + seed: 022/023/026 düzenle, 030 oluştur, page_store veri taşıma, fresh seed | `backend/src/db/seed/sql/` |
| 2 | Backend: taxonomy ucu, entitlements modülü, checkout/iyzipay hook, içerik teslimi, admin CRUD | `backend/src/modules/`, `packages/shared-backend/modules/` |
| 3 | Admin panel: series/levels/entitlements sayfaları, products İçerikler sekmesi, orders kargo | `admin_panel/src/app/(main)/admin/(admin)/` |
| 4 | Frontend: store DB migrasyonu, filtreler, kart durumları, checkout adres, üye kütüphanesi | `frontend/src/app/[locale]/` |
| 5 | QA: erişim matrisi + i18n + Antigravity UI doğrulama | tüm uygulama |

### QA Erişim Matrisi
| Senaryo | Beklenen |
|---------|----------|
| Misafir → ücretli dijital içerik | İzleyemez (login + satın alma istenir) |
| Üye, satın almamış → ücretli içerik | İzleyemez (403) |
| Üye, satın almış, süre içinde | İzler |
| Üye, satın almış, süresi dolmuş | İzleyemez, "yeniden satın al" görür |
| Üye → ücretsiz ürün | Kütüphaneye ekler, süresiz izler |
| Misafir → okul ürünü | Görür; fiyat yok; WhatsApp CTA |
| Sepete okul ürünü ekleme (API) | 400 reddedilir |
| Matbu içerikli sipariş, adres yok | Sipariş oluşturulamaz (400) |
| Dijital dosyaya direkt URL | 401/403 (public static değil) |
| Ödeme `paid` callback | Entitlement otomatik oluşur, kütüphanede görünür |
| Admin manuel erişim verir | Kullanıcı kütüphanesinde anında görünür |

## 7. Varsayımlar / Bilinçli Kapsam Dışı

- Ücretsiz içerik için üyelik şart (lead toplama). `is_preview` ile satın almasız örnek
  içerik gösterilebilir (yine login ister).
- Kargo firması API entegrasyonu YOK — takip no manuel girilir.
- Mevcut `subscriptions` modülü bu sisteme KARIŞMAZ (ayrı konsept, dokunulmaz).
- Süresi dolan erişim için otomatik e-posta hatırlatma → ileriki faz (notifications hazır).
- `product_stock` tablosu bu modelde kullanılmaz; matbu stok `products.stock_quantity`.
- Marka adı her dilde **"Woody and Friends"** (sabit, çevrilmez).
