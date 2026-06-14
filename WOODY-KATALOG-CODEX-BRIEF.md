# BRIEF — Codex: Woody Katalog Taksonomisi + Erişim Sistemi

> Mimari plan: `WOODY-KATALOG-ERISIM-PLAN.md` (önce onu oku — şema SQL'leri orada)
> Branch: `woody-katalog-erisim` | Commit öneki: `feat(woody):` / `fix(woody):`
> Fazlar SIRAYLA yapılır; her faz sonunda build + smoke test geçmeden sonrakine geçilmez.

## Mutlak Kurallar

- [x] **ALTER TABLE YASAK.** Şema değişikliği = seed SQL dosyasındaki CREATE TABLE'ı
      düzenle → `bun run build && bun run db:seed:fresh` (komut adını package.json'dan teyit et).
- [ ] **Koda gömülü içerik YASAK.** Tüm metin/veri DB'den (modüller veya `site_settings`).
      Mevcut `isTr ? '...' : '...'` fallback'leri yalnızca son çare olarak kalabilir.
- [x] Seed ID'leri **20-hex kısa format** (char(36) taşması yaşandı, tekrar etme).
- [x] Marka adı her dilde **"Woody and Friends"** — asla çevrilmez,
      "Woody ve Arkadaşları" YANLIŞ.
- [ ] i18n: TÜM aktif dillerde kayıt üret (TR kaynak; çevirisi olmayanlar TR fallback).
      Aktif dil listesi `site_settings.app_locales` + backend `.env APP_LOCALES`.
- [ ] Dijital içerik dosyaları **public static'ten servis edilemez** — yalnızca
      entitlement kontrolü yapan kimlik doğrulamalı uçtan.
- [x] Mevcut `subscriptions` modülüne DOKUNMA.
- [x] TypeScript strict; runtime Bun.

---

## FAZ 1 — Şema + Seed (backend/src/db/seed/sql/)

### 1.1 Mevcut dosya düzenlemeleri
- [x] `022_products.sql` → `products` CREATE TABLE'a kolonlar: `series_id`, `level_id`,
      `purchase_mode ENUM('online','quote') DEFAULT 'online'`, `is_free TINYINT(1) DEFAULT 0`,
      `access_duration_days INT NULL` + index'ler (plan §2a).
- [x] `023_orders_payments.sql` → `orders`'a 10 kargo alanı (plan §2b).
- [x] `026_quote_requests.sql` → `product_id CHAR(36) NULL` + index;
      `level` enum'una `'pro'` ekle (plan §2c).

### 1.2 Yeni dosya: `030_woody_catalog_schema.sql`
- [x] Tablolar: `product_series(+_i18n)`, `product_levels(+_i18n)`,
      `product_contents(+_i18n)`, `user_entitlements` — DDL planda hazır (plan §2d), aynen kullan.
- [x] Seed: 3 kategori (Okul/Atölye/Ev-Özel Ders, `module_key='store'`),
      2 seri (ogrenci/ogretmen), 4 seviye (basic=1, junior=2, senior=3, pro=4) —
      hepsi tüm dillerde i18n.

### 1.3 page_store veri taşıma (KRİTİK)
- [x] `020_woody_site_settings.sql` içindeki `page_store` JSON'larından (tüm diller)
      `categories` ve `products` dizilerini İNCELE; her ürünü `products` + `product_i18n`
      seed satırına dönüştür (görsel referansları `storage_assets` ID'leriyle).
- [x] Her ürüne doğru `category_id`, `series_id`, `level_id`, `purchase_mode`
      (okul kategorisindekiler `quote`), `is_free`, `price`, `access_duration_days`
      (ücretli dijital setlerde 365) ata. Emin olunamayan eşleme varsa ürünü
      `is_active=0` bırak ve brief sonuna NOT düş.
- [x] `page_store` JSON'larından `categories`/`products` anahtarlarını ÇIKAR;
      `title/description/eyebrow/hero/sections/seo/quoteWhatsApp/quoteMessage/primaryCTA/ui`
      kalsın.
- [x] WhatsApp teklif mesaj şablonuna ürün adı placeholder'ı ekle (ör. `{{product}}`).

### 1.4 Doğrulama
- [x] `bun run build` temiz.
- [x] Fresh seed hatasız; `SELECT COUNT(*)` ile yeni tablolar + taşınan ürünler kontrol.
- [ ] Commit: `feat(woody): katalog taksonomi semasi + page_store urun verisi DB'ye tasindi`

---

## FAZ 2 — Backend API

### 2.1 Taxonomy public ucu
- [x] Yeni modül `backend/src/modules/catalog/` (mevcut woody modül desenini kopyala —
      ör. `homeSections`): `GET /api/v1/catalog/taxonomy?locale=xx` →
      `{ categories:[{id,slug,name,order}], series:[...], levels:[{...,rank}] }`
      (yalnız `is_active=1`, sıralı).
- [x] `routes/project.ts`'e kaydet.

### 2.2 Store ürün uçları (checkout modülü)
- [x] `GET /checkout/store/products` → filtre paramları `category, series, level, isFree`
      (slug veya id kabul et); yanıt alanları: `purchaseMode, isFree, accessDurationDays,
      hasPhysical, seriesSlug/levelSlug + adları`.
- [x] Ürün detay yanıtına içerik listesi: SADECE meta
      (`id, kind, mediaType, title, description, isPreview, displayOrder`).
      `storage_asset_id` / dosya URL'i public yanıtta YOK.

### 2.3 Entitlements modülü — `backend/src/modules/entitlements/`
- [x] `GET /api/v1/me/library` (JWT zorunlu) → aktif erişimli ürünler + içerik meta +
      `expiresAt` / kalan gün.
- [x] `GET /api/v1/me/contents/:contentId` → erişim kuralı:
      ürün `is_free=1` VEYA içerik `is_preview=1` → login yeter;
      değilse aktif entitlement (`status='active'` ve (`expires_at IS NULL` veya `> NOW()`)) şart.
      Teslim: storage üzerinden kimlik doğrulamalı stream/kısa ömürlü imzalı URL.
      Süresi dolmuşsa 403 + `{ reason: 'expired' }`.
- [x] `POST /api/v1/me/library/free/:productId` → ürün `is_free=1` değilse 400;
      entitlement upsert (`source='free'`, `expires_at=NULL`).

### 2.4 Satın alma entegrasyonu (checkout modülü)
- [x] Sipariş oluşturmada her item için ürün `purchase_mode='online'` doğrula; değilse 400.
- [x] Sepette `hasPhysical` ürün varsa kargo adres alanları zorunlu; `orders` kargo
      kolonlarına yaz.
- [x] iyzipay callback `paid` → her order_item için `user_entitlements` upsert:
      yeni: `starts_at=NOW(), expires_at = access_duration_days IS NULL ? NULL : NOW()+gün`;
      mevcut aktif: `expires_at = GREATEST(expires_at, NOW()) + gün` (uzatma).
      `source='purchase'`, `order_id` bağla. Idempotent olmalı (callback tekrarına dayanıklı).
- [x] `quote_requests` create ucu `productId` kabul etsin.

### 2.5 Admin API
- [x] Series/Levels CRUD: `packages/shared-backend/modules/categories/admin.controller.ts`
      desenini kopyala → `GET list / GET :id / POST / PATCH / DELETE / PATCH :id/active`.
- [x] Products admin: yeni alanlar create/update/list-filtrelerine eklendi.
- [x] `GET/POST/PATCH/DELETE /admin/products/:id/contents(/:contentId)` —
      i18n başlık/açıklama dahil; dijitalde storage upload bağlantısı.
- [x] `/admin/entitlements`: `GET` (filtre: userId, productId, status, q) /
      `POST` (manuel ver: userId, productId, gün) / `PATCH :id` (uzat / revoke).
- [x] `/admin/orders/:id` PATCH → kargo alanları + `shipped_at`; `status='shipped'`
      geçişiyle uyumlu.
- [x] Doğrulama: `bun run build` + Swagger'da uçlar görünür + curl smoke test.
- [ ] Commit: `feat(woody): catalog taxonomy + entitlements API + checkout erisim hook`

---

## FAZ 3 — Admin Panel (admin_panel/src/app/(main)/admin/(admin)/)

Pattern: **list + AYRI detay/yeni sayfası** (referans: `users` modülü; `products` mevcut yapısı).

- [x] `/admin/series` ve `/admin/levels`: liste (ad, slug, sıra, aktif toggle) +
      `[id]` detay (tüm dillerde ad/slug/açıklama; locale switcher mevcut desenle).
- [x] `/admin/products` listesi: Seri / Seviye / Satış Modu / Ücretsiz kolon + filtreleri.
- [x] `/admin/products/[id]` Genel sekmesi: Grup (kategori select), Seri, Seviye,
      Satış Modu (online/teklif), Ücretsiz toggle, Erişim süresi (gün; boş=süresiz).
- [x] `/admin/products/[id]` YENİ "İçerikler" sekmesi: içerik listesi (tür ikonu,
      başlık, önizleme rozeti, sıra, aktif) + ekleme formu:
      tür (dijital/matbu) → dijitalde media_type + storage upload (mevcut storage
      entegrasyonu) veya harici URL; tüm dillerde başlık/açıklama; sıralama (drag yerine
      order input yeterli).
- [x] `/admin/entitlements`: liste (kullanıcı e-posta, ürün, kaynak, durum, bitiş,
      kalan gün) + filtreler + "Erişim Ver" modal (kullanıcı ara, ürün seç, süre gün) +
      satır aksiyonları: uzat (gün ekle), iptal et.
- [x] `/admin/orders/[id]`: kargo adres bloğu (okunur) + kargo firması/takip no/
      gönderim tarihi formu; listeye "kargo bekleyen" filtresi
      (paid + hasPhysical + shipped_at IS NULL).
- [x] Admin menüsüne yeni sayfalar eklendi; TR locale dosyaları
      (`src/locale/tr/admin`) güncellendi.
- [x] RTK Query hook'ları mevcut integration desenine uygun.
- [x] Doğrulama: build + her sayfada CRUD smoke test.
- [ ] Commit: `feat(woody): admin — seri/seviye/icerik/erisim yonetimi + siparis kargo`

---

## FAZ 4 — Frontend (frontend/src/app/[locale]/)

### 4.1 Store DB migrasyonu (EN KRİTİK ADIM)
- [x] `WoodyStoreShowcase.tsx` (+ `WoodyStoreClient`): kategori/ürün verisini
      `page_store` JSON'ından DEĞİL, `/catalog/taxonomy` + `/checkout/store/products`
      API'lerinden al (SSR'da fetch, mevcut SSR desenine uy).
- [x] Sayfa metinleri (`hero, eyebrow, ui.*, primaryCTA, quoteMessage…`) `page_store`
      site_settings'ten gelmeye devam eder.

### 4.2 Store UX
- [x] Filtre çubuğu: Grup / Seri / Seviye (taxonomy'den; URL query ile senkron, SSR uyumlu).
- [x] Ürün kartı 3 durum: Ücretsiz rozet + "Ücretsiz İzle" | fiyat + Sepete Ekle |
      WhatsApp Teklif (fiyatsız). WhatsApp linki `wa.me/<settings numarası>` +
      mesaj şablonunda ürün adı.
- [x] `/store/[slug]` detay: içerik listesi (kilit / önizleme durumları), seri+seviye
      rozetleri, matbu içerik "kargoyla gönderilir" notu; kullanıcı sahipse
      "İçeriği İzle" + kalan süre.
- [x] `/store/checkout`: sepette matbu içerikli ürün varsa adres formu zorunlu
      (profilden ön-dolu); sipariş yanıtındaki hatalar kullanıcıya gösterilir.

### 4.3 Üye kütüphanesi
- [x] `/me/library`: satın alınan/eklenen setler, kalan süre, süresi dolanda
      "yeniden satın al" CTA.
- [x] İçerik izleme: video player / PDF görüntüleyici / ses — içerik teslim ucundan;
      mevcut `/library` ve `/digital-content` sayfaları bu yapıya bağlanır
      (yönlendirme veya birleştirme; ölü sayfa kalmasın).
- [x] Ücretsiz ürün akışı: login değilse login'e, dönüşte otomatik kütüphaneye ekleme.

### 4.4 i18n + doğrulama
- [x] Tüm yeni UI metinleri `page_store.ui` (veya ilgili settings anahtarı) üzerinden,
      TÜM dillerde seed'e eklendi — koda gömülü metin yok.
- [x] Build + SSR hatasız; `/store` LCP görseli ve SEO meta korunmuş.
- [ ] Commit: `feat(woody): store DB katalog migrasyonu + uye kutuphanesi + filtreler`

---

## FAZ 5 — QA (çıkış kriteri)

- [ ] Plan §6'daki **erişim matrisinin 11 senaryosu** tek tek doğrulandı (curl + UI).
- [ ] iyzipay sandbox: ödeme → callback → entitlement → kütüphanede izleme uçtan uca.
- [x] Callback'in iki kez gelmesi entitlement'ı bozmuyor (idempotency).
- [ ] Tüm dillerde store + ürün detay + kütüphane render (en az TR/EN/DE göz kontrolü).
- [ ] Admin: seri/seviye/kategori/içerik/erişim CRUD'ları çalışıyor; yeni eklenen
      taksonomi sitede anında (cache temizliğiyle) görünüyor — home-layout cache
      dersi: cache invalidation TÜM dilleri kapsamalı (`all:true` deseni).
- [x] `rg "Woody ve Arkadaş" frontend admin_panel` → 0 sonuç.
- [x] Fresh seed'den tam kurulum tekrarı: `db:seed:fresh` sonrası site + admin ayakta.
- [x] Antigravity'ye UI doğrulama brief'i: store filtreleri, 3 kart durumu, checkout
      adres akışı, kütüphane player ekranları.

## Riskler / Dikkat

1. **page_store migrasyonu geri dönüşsüz görünmesin:** 020'deki eski JSON'u silmeden
   önce `docs/` altına yedeğini koy (`docs/page-store-backup-2026-06-11.json`).
2. **Locale enum gotcha:** API `locale` doğrulaması `APP_LOCALES` env'den türetiliyor —
   yeni dil EKLENMEYECEK; mevcut dil setiyle çalış.
3. **Shared modüller** (`packages/shared-backend/modules/products`, `categories`)
   diğer projelerle ortak desen taşır — woody'ye özgü davranışları mümkünse
   `backend/src/modules/` altındaki woody modüllerinde tut; shared'a eklenen alanlar
   geriye dönük uyumlu olmalı (NULL'lanabilir / DEFAULT'lu).
4. **Entitlement idempotency:** `UNIQUE(user_id, product_id)` var — upsert kullan,
   düz INSERT değil.
5. Dijital dosyaları yanlışlıkla `images`/public alanlardan döndürme — içerik
   dosyası SADECE teslim ucundan.
