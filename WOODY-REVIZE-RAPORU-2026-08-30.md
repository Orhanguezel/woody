# Woody Site Revize Raporu — Müşteri Materyali + Satın Alma Altyapısı

**Tarih:** 2026-08-30
**Kaynak:** `website/`, `mini school.mp4/`, `ev serisi tanıtım video/` + kullanıcı kararı (PayTR)
**Kapsam:** Mini School (Atölye) sayfası, Ev & Özel Ders sayfası, Store revizyonu, **PayTR ile gerçek satın alma**
**Çeklist:** [WOODY-REVIZE-CEKLIST.md](WOODY-REVIZE-CEKLIST.md)
**Görsel kanıtlar:** [docs/revize-2026-08-30/](docs/revize-2026-08-30/)

---

## 1. Özet

Müşteri 5 sayfalık bir revizyon brief'i (`DÜZENLEME.pdf`), 9 ürün kartı görseli ve 4 tanıtım videosu iletti. Ek olarak kullanıcı kararı geldi: **"Satın Al" gerçek ödeme olacak, sağlayıcı PayTR; mimari QuickEcommerce'ten alınacak.**

İşin dört ayağı:

1. **Sayfa revizyonları** (Mini School + Ev & Özel Ders) — metin/video/düzen değişiklikleri; bugün başlanabilir.
2. **Store revizyonu** — yeni kart düzeni, doğru fiyatlar, ürün videosu; PDF'teki hedef tasarım kod tabanında **yok**, yeni bileşen işi.
3. **PayTR ödeme altyapısı** — QuickEcommerce'teki `PayTRService` mimarisinin Fastify/TypeScript'e portu (§7). Woody'de sipariş + checkout iskeleti **zaten var** (iyzico'ya bağlı, feature-flag'li); PayTR aynı kalıba oturuyor.
4. **Medya işleme** — 4 video 4K dikey/60fps/toplam 739 MB; ham yayınlanamaz, transcode zorunlu (§4.1'de gerçek ölçüm: 205 MB → 26,8 MB).

Müşteri materyalindeki en kritik kusur: **9 kartın hepsinde kutu rozeti "JUNIOR LEVEL 2"** — Basic ve Senior kartlarında da (§5.1). Yayına girerse satış sayfasında görünür hata; müşteriden düzeltilmiş görseller istenmeli.

---

## 2. Teslim edilen dosyalar

### 2.1 `website/website/` (792 MB)

| Dosya | İçerik |
|---|---|
| `DÜZENLEME.pdf` | 5 sayfa, ekran görüntüsü üzerine notlarla revizyon brief'i |
| `ev serisi kartları.zip` | 3 × PNG, 3000×4500, ~7 MB/adet |
| `mini school kartları.zip` | 6 × PNG, 3600×5400, ~10 MB/adet |
| `ev serisi tanıtım video.zip` | 3 × MP4, 610 MB |
| `mini schoo tanıtım videol.mp4.zip` | 1 × MP4, 128 MB |

### 2.2 Repo kökündeki klasörler

`mini school.mp4/` ve `ev serisi tanıtım video/` — `website/` içindeki zip'lerin açılmış kopyaları; diskte ~1,5 GB mükerrer veri. Üç klasör de `.gitignore`'a eklendi (2026-08-30) — commit riski kapatıldı.

---

## 3. Revizyon talepleri (PDF sayfa sayfa)

### Sayfa 1–2 — Mini School sayfası (bugünkü `/[locale]/workshop`)

| # | Talep | Kod karşılığı |
|---|---|---|
| M1 | "Atölye Serisi" → **"Mini School Serisi"** (başlık, hero, eyebrow, menü) | `config/pages/{10 dil}/workshop.json` + `site_settings.page_workshop` + menü i18n |
| M2 | "Atölye modeli nasıl uygulanır?" metin bloğu **kaldırılacak** | `workshop.json` → `guide.paragraphs` + `WorkshopPageClient.tsx:114` |
| M3 | Öğretmen/Öğrenci "coming soon" kartları yerine **tek video** | `WorkshopPageClient.tsx:134`; kaynak `mini school.mp4` |
| M4 | Video altına **"Mini school serisi içerik videosu"** yazısı | Yeni `pageUi` anahtarı, 10 dil |
| M5 | Seviye bölümü **Okul Serisi'ndekiyle aynı** (gerçek PRESCHOOL kutu görselleri) | `workshop.json` → `sections[0].items` ↔ `preschool.json` |
| M6 | "Fiyat Teklifi Al"+"Teklif Formu" yerine **tek "Satın Al" butonu** | Buton mantığı + PayTR akışı (§7) |

### Sayfa 3 — Ev & Özel Ders sayfası (`/[locale]/home-tutor`)

| # | Talep | Kod karşılığı |
|---|---|---|
| E1 | "Ev ve özel ders modeli nasıl ilerler?" bloğu **kaldırılacak** | `home-tutor.json` → `guide` |
| E2 | 2 coming-soon kartı yerine **3 video** (Basic/Junior/Senior) | `HomeTutorPageClient.tsx` |
| E3 | Seviye bölümü **Okul Serisi düzeniyle aynı** | `home-tutor.json` → `sections[0]` |
| E4 | **Tek "Satın Al" butonu** | Buton + PayTR |

### Sayfa 4 — Store: hero + Ev Serisi

| # | Talep | Not |
|---|---|---|
| S1 | Filtre şeridi altı **beyaz**, başlıklar yumuşasın | Stil; `WoodyStoreShowcase.tsx` |
| S2 | Ev Serisi **3 kart yan yana** | Yeni düzen |
| S3 | Fiyatlar: **Basic 3.000 / Junior 3.750 / Senior 4.250 TL** | Mevcut: ₺1.499/1.699/1.899 — güncellenecek |
| S4 | "Ürün Videosu" tıklanınca **ev serisi videoları** | `products` tablosuna `video_url` gerekiyor (§4.4) |
| S5 | Kart görselleri = teslim edilen 3 PNG | `ev serisi kartları.zip` |

### Sayfa 5 — Store: Mini School + Okul Serisi

| # | Talep | Not |
|---|---|---|
| S6 | **Okul Serisi ürünleri store'dan kaldırılacak** | Config id 1,2,3 + katalog seed |
| S7 | Mini School: **üstte 3 öğretmen, altta 3 öğrenci** | 6 kart |
| S8 | Fiyatlar: Öğretmen **1.500/2.750/3.750**, Öğrenci **2.500/2.500/2.500** | §6.4 teyit bekliyor |
| S9 | "en az 3 adet alınır" not şeridi **aynen kalacak** | İlk aşamada bilgilendirme metni (§6.6) |
| S10 | Kart görselleri = teslim edilen 6 PNG | `mini school kartları.zip` |

---

## 4. Teknik bulgular

### 4.1 Videolar — yayına hazır değil

Ölçülen değerler (`ffprobe`):

| Dosya | Çözünürlük | fps | Süre | Boyut | Bitrate |
|---|---|---|---|---|---|
| `mini school.mp4` | 2160×3840 | 60 | 109 s | 128 MB | 9,1 Mbps |
| `HOME & TUTOR basıc SERİES.mp4` | 2160×3840 | 60 | 102 s | 215 MB | 16,6 Mbps |
| `HOME & TUTOR junıor SERİES Kopyası.mp4` | 2160×3840 | 60 | 121 s | 194 MB | 12,5 Mbps |
| `HOME & TUTOR senior SERİES ...mp4` | 2160×3840 | 60 | 120 s | 202 MB | 13,1 Mbps |
| **Toplam** | | | **7,5 dk** | **739 MB** | |

**Transcode ölçümü** (Basic videosu, 102 s, gerçek dönüştürme — tahmin değil):

| Hedef | Boyut | Kazanç |
|---|---|---|
| Orijinal 2160×3840 @60fps | 205 MB | — |
| 1080×1920 @30fps, CRF 24, AAC 128k | **26,8 MB** | %87 |
| 720×1280 @30fps, CRF 27, AAC 96k | **10,3 MB** | %95 |

4 video toplam: **739 MB → ~119 MB (1080p)**. Komut:

```bash
ffmpeg -i girdi.mp4 -c:v libx264 -preset slow -crf 24 \
  -vf "scale=1080:1920,fps=30" -c:a aac -b:a 128k \
  -movflags +faststart cikti.mp4
```

- 60 fps gereksiz (konuşan kişi + ürün çekimi); 30 fps bitrate'i yarılıyor.
- `-movflags +faststart` şart — yoksa oynatma öncesi tüm dosya iner.
- Her videoya **poster karesi** + `preload="none"` — ev sayfasında 3 video yan yana duracak.
- Mevcut `frontend/public/media/` zaten 1,2 GB (git dışı, VPS'e ayrı senkron).

### 4.2 Dikey video / yatay konteyner uyumsuzluğu

Videolar 9:16 dikey; mevcut oynatıcı kapları 16:9 (`aspect-video`):
`WorkshopPageClient.tsx:136,204` ve `HomeTutorPageClient.tsx:120,188`. Ev sayfasında 3 dikey video için düzen yeniden kurgulanacak (9:16 kart, mobil tek sütun / masaüstü 3'lü grid).

### 4.3 Video yolları koda gömülü — dinamik içerik kuralına aykırı

```
WorkshopPageClient.tsx:19   HERO_VIDEO  = '/media/woody/reference/7ieerlri_...mp4'
WorkshopPageClient.tsx:21   MODAL_VIDEO = '/media/woody/reference/g3olv4um_...mp4'
HomeTutorPageClient.tsx:18  HERO_VIDEO  = '/media/woody/reference/iztyqa5u_...mp4'
```

Revizyon sırasında bu sabitler içerik katmanına (config/DB `pageUi`/`media` anahtarları) taşınacak; yeni sabit eklenmeyecek.

### 4.4 Veri modeli eksikleri

`products` tablosu (`022_products.sql:7`): `purchase_mode ENUM('online','quote')`, `price`, `image_url`, `images JSON`, `stock_quantity` var. Eksikler:

| İhtiyaç | Gereken |
|---|---|
| "Ürün Videosu" (S4) | `video_url` kolonu (+ tercihen `video_storage_asset_id`) — **CREATE TABLE içine, ALTER yasak** |
| "en az 3 adet" (S9) | İlk aşama bilgilendirme metni; kural olacaksa `min_order_quantity` + sepet doğrulaması |
| Frontend tipi | `load-store-products.server.ts` `ApiProduct` + API'ye video alanı |
| PayTR callback log | Yeni `paytr_callback_logs` tablosu (§7.3) |

### 4.5 Fiyat tutarsızlığı

PDF "doğru fiyatlar" ile koddaki değerler örtüşmüyor (kod: ₺1.499–2.399 aralığı; PDF: 1.500–4.250 TL). PDF esas alınacak. Biçim kararı: kod `₺1.999`, PDF `3.000 TL` — tek biçime bağlanacak (öneri: `3.000 TL`).

### 4.6 SEO / URL riski

- **Route değişmiyor:** `/workshop` 10 dilde indeksli; yalnız görünen etiket "Mini School Serisi" olacak. Route değişikliği (301+sitemap+hreflang) bu kapsamda değil.
- `seo.keywords`'te "atölye/workshop" terimleri korunacak ("Mini School" TR arama hacmi yok); görünen başlık Mini School.
- "Atölye/Workshop" geçen yerler: `config/pages/*` 48 dosya, `020_woody_site_settings.sql` 54 satır, `030_woody_catalog_schema.sql` 254 satır, `021_categories.sql` 12, `034_menu_i18n_translations.sql` 2.

### 4.7 Repo hijyeni

Üç kaynak klasör `.gitignore`'a eklendi (yapıldı). Ham videolar commit edilmeyecek; işlenmiş medya `frontend/public/media/woody/` (git dışı) + VPS senkron.

### 4.8 Dosya adları

Kaynak videolarda boşluk, Türkçe karakter, "Kopyası Kopyası", macOS NFD kodlaması var (bu inceleme sırasında araçları da kırdı). Yayın adları:

```
mini-school-tanitim.mp4 / home-tutor-basic.mp4 / home-tutor-junior.mp4 / home-tutor-senior.mp4
```

---

## 5. Kaynak materyaldeki kusurlar (müşteriye bildirilecek)

### 5.1 Tüm kartlarda kutu rozeti "JUNIOR LEVEL 2" — kritik

9 kartın (3 ev + 6 mini school) **hepsinde** kutu üzerindeki sarı seviye rozeti `JUNIOR LEVEL 2`. Yalnızca alt banttaki büyük yazı değişiyor. Basic kartında müşteri kutuda "JUNIOR LEVEL 2" görecek. Görseller kaynak dosyadan yeniden üretilmeli.
Kanıt: `docs/revize-2026-08-30/KUSUR-rozet-uyumsuzlugu.png`

### 5.2 Ev kartlarında yazım hatası

Üçünde de **"For Individual Studetns"** → doğrusu **"Students"**.

### 5.3 Mini School kartlarında kutu hâlâ "WORKSHOP"

Kart başlığı "MINI SCHOOL SERİSİ", kutu sırtı `WORK SHOP Series / FOR MINI-GROUP`. Fiziksel ambalaj gerçekten Workshop ise sorun değil — müşteri teyidi gerekli.

### 5.4 Junior ev videosunda oyuncak sayısı çelişkisi

Açılışta "4 Oyuncak", ortada "9 Farklı Oyuncak" (Senior'da ikisi de 11 — tutarlı). Hangisi doğru?
Kanıt: `docs/revize-2026-08-30/KUSUR-junior-oyuncak-sayisi.png`

### 5.5 Mini School videosunda "atölyeler" kelimesi

Açılış alt başlığı: "Kurs merkezleri, **atölyeler** ve küçük grup eğitimleri için." Videoya gömülü; düzeltme müşterinin render kararı.

### 5.6 Kart dosyası eşlemesi (içerikten doğrulandı)

| Dosya | Set | Seviye |
|---|---|---|
| `mini/10.png` | Öğretmen | Basic |
| `mini/11.png` | Öğrenci | Basic |
| `mini/12.png` | Öğrenci | Junior |
| `mini/13.png` | Öğretmen | Junior |
| `mini/14.png` | Öğrenci | Senior |
| `mini/15.png` | Öğretmen | Senior |
| `ev/1.png` | — | Basic |
| `ev/2.png` | — | Junior |
| `ev/3.png` | — | Senior |

### 5.7 Görsel boyutları

3000×4500 / 3600×5400 PNG (toplam 84 MB) → yayında ~800×1200 WebP (~40–80 KB/adet).

---

## 6. Kararlar ve açık sorular

| # | Soru | Durum |
|---|---|---|
| 6.1 | "Satın Al" ne demek? | **KARAR (2026-08-30): Gerçek ödeme, PayTR.** Mimari QuickEcommerce'ten port edilecek — §7 |
| 6.2 | PRO seviyesi | **Açık.** Varsayım: seri sayfalarındaki seviye bölümünde PRO kartı kalır (okul serisiyle aynı düzen); store'a PRO ürünü eklenmez (kart/fiyat gelmedi) |
| 6.3 | Ürün adı çakışması (ev ↔ okul) | **Açık.** Varsayım: okul serisi store'dan kalkınca çakışma çözülür; ev ürünleri PDF'teki adlarla gider ("Basic Level Set Öğrenci Seti" vb.), slug'lar `home-` önekiyle ayrışır |
| 6.4 | Mini School fiyatları (Basic öğretmen 1.500 < öğrenci 2.500) | **Açık.** Varsayım: PDF aynen uygulanır; müşteriye tek satırlık teyit sorusu iletilir |
| 6.5 | Mini School kartlarında video | **Açık.** Varsayım: 6 kartın "Ürün Videosu" butonu aynı mini school videosunu açar |
| 6.6 | "En az 3 adet" kural mı metin mi? | **Açık.** Varsayım: ilk aşamada bilgilendirme metni; PayTR canlıya çıkmadan kurala çevrilebilir (`min_order_quantity`) |

---

## 7. PayTR ödeme mimarisi (QuickEcommerce portu)

### 7.1 Kaynak mimari (QuickEcommerce, Laravel)

İncelenen dosyalar:

- `backend-laravel/app/Services/PayTRService.php` (216 satır) — token üretimi + callback doğrulama
- `backend-laravel/app/Http/Controllers/Api/V1/PayTRPaymentController.php` (746 satır) — session + callback + log
- `backend-laravel/app/Models/PayTRCallbackLog.php` — callback denetim kaydı
- `admin-panel/.../paytr-logs/` — admin log ekranı

Akış (iFrame API):

```
1. POST orders/create-paytr-session
   → sipariş doğrula → merchant_oid üret (SP{id}T{ts} deseni)
   → HMAC-SHA256 token: merchant_id+user_ip+merchant_oid+email+amount(kuruş)
     +basket(base64)+no_installment+max_installment+currency+test_mode + SALT, KEY ile imza
   → POST https://www.paytr.com/odeme/api/get-token
   → dönen token ile iframe_url: https://www.paytr.com/odeme/guvenli/{token}
2. Frontend: iframe embed + iframeResizer; ok/fail URL'lerine dönüş
3. PayTR → POST /paytr/callback (server-to-server, auth YOK, form-encoded)
   → her denemeyi paytr_callback_logs'a yaz (admin panelden izlenir)
   → HMAC doğrula: hash_equals(base64(hmac(merchant_oid+SALT+status+total_amount, KEY)))
   → doğrulanmasa bile HTTP 200 "OK" dön (PayTR tekrar denemesin diye; sipariş güncellenmez)
   → doğrulandıysa: status success → paid; değilse failed. Idempotent (zaten paid → OK)
4. Kimlik bilgileri DB'deki gateway kaydından (env fallback); test_mode bayrağı
```

Kritik PayTR sözleşme detayları:

- `merchant_oid` **yalnızca alfanumerik** — UUID'deki tireler kabul edilmez
- Tutar **kuruş cinsinden int** (10,00 TL → 1000)
- `user_basket` = base64(JSON `[[ad, fiyat, adet], ...]`)
- Para birimi eşlemesi: TRY→TL
- Callback yanıtı **düz metin "OK"** olmalı — JSON değil
- Callback **form-encoded** gelir

### 7.2 Woody'de mevcut olan (yeniden kullanılacak)

| Parça | Durum |
|---|---|
| `orders` + `order_items` + `payment_attempts` tabloları | **Var** (`023_orders_payments.sql`) — `payment_method`, `payment_status`, `payment_ref` kolonlarıyla |
| `POST /checkout/orders` — misafir sipariş oluşturma (`ensureCustomer` e-postadan kullanıcı üretir), fiziksel ürün için adres doğrulaması | **Var** (`checkout/router.ts`) |
| İyzico initiate + callback akışı (feature-flag'li, yapılandırılmamışsa 503) | **Var** — PayTR aynı kalıba oturacak |
| `purchase_mode ENUM('online','quote')` ürün ayrımı | **Var** |
| Ödeme sağlayıcı kütüphanesi | `packages/shared-backend/modules/payments/` → `iyzico.ts`, `craftgate.ts`, `ziraatpay.ts` — **`paytr.ts` buraya eklenecek** |
| `/store/checkout` sayfası | **Var** — iframe adımı eklenecek |
| Admin panel (Next.js, QE admin ile aynı teknoloji) | **Var** — `paytr-logs` ekranı port edilecek |

> Not: `packages/shared-backend` tarım monoreposunun Jun-2 snapshot'ı (vendored). `paytr.ts` woody kopyasına eklenir; drift bilinen bir durum.

### 7.3 Port planı (Laravel → Fastify/TS)

| QuickEcommerce | Woody karşılığı |
|---|---|
| `PayTRService::createPaymentToken` | `packages/shared-backend/modules/payments/paytr.ts` → `createPaytrToken()` (fetch, form-encoded) |
| `PayTRService::verifyCallback` | `verifyPaytrCallback()` — `crypto.timingSafeEqual` ile |
| `PayTRService::encodeBasket` | `encodePaytrBasket()` |
| `createCheckoutSession` | `POST /checkout/orders/:id/paytr/initiate` (iyzipay/initiate kalıbı) |
| `callback` | `POST /checkout/paytr/callback` — public, düz metin "OK", idempotent |
| `paytr_callback_logs` tablosu | `023_orders_payments.sql` içine **CREATE TABLE** (ALTER yasak) |
| Admin `paytr-logs` ekranı | `admin_panel` → PayTR callback log listesi + istatistik |
| Gateway kaydı (DB) + env fallback | Woody'de env esas: `PAYTR_MERCHANT_ID/KEY/SALT`, `PAYTR_TEST_MODE`, `FEATURE_PAYTR_PAYMENT` |

`merchant_oid` üretimi: `'WD' + uuid.replace(/-/g,'')` = 34 karakter (alfanumerik, `payment_ref CHAR(36)`a sığar). Sipariş eşleşmesi `payment_ref` üzerinden — QE'deki `SP{id}T{ts}` çözümlemesine gerek kalmaz.

### 7.4 Güvenlik gereksinimleri (pazarlık dışı)

- **Secret fallback YOK**: `PAYTR_MERCHANT_KEY`/`SALT` env'de yoksa özellik **kapalı** (503) — asla varsayılan değer. `.env.example` satırları boş.
- Callback'te **HMAC doğrulaması + `timingSafeEqual`**; doğrulanamayan istek siparişe dokunmaz ama yine "OK" döner ve loglanır.
- **Tutar sunucudan**: sepet/fiyat client'tan değil DB'den okunur (mevcut `/checkout/orders` zaten böyle).
- Callback **idempotent**: `payment_status='paid'` ise tekrar işlenmez.
- `debug_on`/`test_mode` yalnız `PAYTR_TEST_MODE=true` iken.
- Fastify'da form-encoded body için `@fastify/formbody` gerekli (kontrol edilecek).
- Nginx: `/api/v1/checkout/paytr/callback` dışarıdan erişilebilir olmalı (PayTR sunucuları POST atar); PayTR panelinde bildirim URL'i tanımlanır.

### 7.5 PayTR hesap gereksinimleri (dış bağımlılık — müşteri/Orhan)

- PayTR mağaza hesabı: `merchant_id`, `merchant_key`, `merchant_salt`
- PayTR panelinde bildirim (callback) URL tanımı
- Test kartıyla uçtan uca deneme → sonra `PAYTR_TEST_MODE=false`

---

## 8. İş sırası

Ayrıntılı, işaretlenebilir liste: [WOODY-REVIZE-CEKLIST.md](WOODY-REVIZE-CEKLIST.md)

- **Faz 1 — Medya** (bağımsız, başladı): transcode, poster, WebP, adlandırma, VPS senkron
- **Faz 2 — Sayfa revizyonları** (bağımsız, başladı): guide kaldırma, Mini School adlandırma, video bölümleri, seviye bölümü eşitleme
- **Faz 3 — Store revizyonu**: `video_url` kolonu, okul serisi çıkarma, ev 3 kart + mini school 6 kart, fiyatlar, stil
- **Faz 4 — PayTR**: `paytr.ts` + checkout uçları + callback log + admin ekranı + iframe sayfası + env/nginx
- **Faz 5 — Doğrulama**: marka denetimi, 10 dil, Lighthouse, sitemap/hreflang, uçtan uca test ödeme

## 9. Bu incelemede yapılmayanlar

- Canlı site karşılaştırması yapılmadı (PDF'teki "Ürün Videosu / Şimdi Satın Al" düzeni yerel kodda yok; canlı yereldekinden ilerideyse §3 eşlemeleri gözden geçirilmeli).
- Videoların tamamı izlenmedi; içerik doğrulaması örnek karelerle yapıldı.
- QuickEcommerce'ten kod kopyalanmadı; yalnız mimari çıkarıldı (farklı teknoloji, yeniden yazım).
