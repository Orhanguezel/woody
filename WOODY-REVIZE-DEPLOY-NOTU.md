# Woody Revize Deploy Notu — 2026-08-30

Kapsam: Mini School/Ev sayfa revizyonlari + Store satisi + PayTR.
Çeklist: [WOODY-REVIZE-CEKLIST.md](WOODY-REVIZE-CEKLIST.md) · Rapor: [WOODY-REVIZE-RAPORU-2026-08-30.md](WOODY-REVIZE-RAPORU-2026-08-30.md)

> Sunucu erişimi: `ssh root@46.202.194.115` (bkz. hafıza `[[vps-server-access]]` / `[[woody-deployment]]`).
> Aşağıdaki yollar VPS'teki mevcut woody dizin düzenine göre uyarlanır.

## 1. Ön koşullar (deploy'dan ÖNCE)

- [ ] **PayTR mağaza hesabı**: `merchant_id`, `merchant_key`, `merchant_salt` (müşteri/Orhan)
- [ ] Müşteriden düzeltilmiş kart görselleri (rozet hatası — şimdilik mevcut görsellerle çıkılabilir, karar müşterinin)
- [ ] Bu branch'in build'i lokalde yeşil (frontend + backend + admin) — 2026-08-30 doğrulandı

## 2. Medya senkronu (git dışı — rsync şart)

`frontend/public/media/` gitignore'lu; yeni dosyalar repo çekmekle GELMEZ:

```bash
rsync -avz --progress \
  frontend/public/media/woody/revize-2026-08/ \
  root@46.202.194.115:/var/www/woody/frontend/public/media/woody/revize-2026-08/
```

İçerik: 4 video (~93 MB toplam) + 4 poster + 9 WebP kart. Doğrulama:

```bash
ssh root@46.202.194.115 'ls -la /var/www/woody/frontend/public/media/woody/revize-2026-08/ | wc -l'  # 17 satir beklenir
curl -sI https://woodyvearkadaslari.com/media/woody/revize-2026-08/mini-school-tanitim.mp4 | head -3  # 200 + video/mp4
```

## 3. Backend env (VPS `.env`)

```bash
# PayTR — gercek degerler; secret'lar 32+ byte, baska projeyle PAYLASILMAZ
FEATURE_PAYTR_PAYMENT=true
PAYTR_MERCHANT_ID=<paytr panelinden>
PAYTR_MERCHANT_KEY=<paytr panelinden>
PAYTR_MERCHANT_SALT=<paytr panelinden>
PAYTR_TEST_MODE=true          # ilk deploy TEST modunda; uctan uca test sonrasi false
```

Ayrıca kontrol: `NEXT_PUBLIC_APP_NAME` **"Woody and Friends"** olmalı ("Woody ve Arkadaşları" YANLIŞ — lokalde bu hata bulunup düzeltildi, VPS'te de bak).

## 4. DB şeması + veri

`video_url` kolonu ve `paytr_callback_logs` tablosu seed ile geliyor; **ALTER yok**.

- Canlıda veri kaybını göze alma kararı YOKSA: `bun run db:seed:nodrop`
  - `CREATE TABLE IF NOT EXISTS paytr_callback_logs` → tabloyu ekler ✓
  - **DIKKAT**: `products.video_url` kolonu mevcut tabloya `IF NOT EXISTS` ile GELMEZ (CREATE TABLE atlanır). Canlıda sipariş/kullanıcı verisi korunacaksa tek seferlik manuel kolon eklenmeli:
    `ALTER TABLE products ADD COLUMN video_url LONGTEXT DEFAULT NULL AFTER image_url;`
    (İstisnai canlı operasyonu — seed dosyası zaten güncel olduğundan drift oluşmaz; yine de CLAUDE.md ALTER kuralı gereği bu satır Orhan onayıyla çalıştırılır.)
  - Ardından `bun run db:seed:nodrop` ürün fiyat/aktiflik/i18n güncellemelerini `ON DUPLICATE KEY UPDATE` ile uygular.
- Sıfırdan kurulum kabulse: `bun run db:seed` (drop + fresh) — sipariş/kullanıcı verisi gider.

Doğrulama:

```bash
mysql woody_db -e "SELECT product_code, price, is_active FROM products WHERE purchase_mode='online' AND is_active=1;"
# 9 satir: 3 ogretmen (1500/2750/3750) + 3 ogrenci (2500) + 3 ev (3000/3750/4250)
```

## 5. Uygulama build + restart

```bash
cd /var/www/woody/backend  && bun install && bun run build
cd /var/www/woody/frontend && bun install && bun run build
cd /var/www/woody/admin_panel && bun install && bun run build
pm2 restart woody-backend woody-frontend woody-admin   # calisma saati disinda
```

## 6. Nginx — PayTR callback

PayTR sunucuları `POST https://woodyvearkadaslari.com/api/v1/checkout/paytr/callback` çağırır:

- [ ] Route dışarıdan erişilebilir (mevcut `/api/` proxy'si kapsıyorsa ek iş yok — doğrula)
- [ ] Rate-limit bu path'i kesmesin (backend'de 300/dk global limit var; nginx'te ayrıca limit varsa muafiyet)
- [ ] Doğrulama: `curl -s -X POST https://woodyvearkadaslari.com/api/v1/checkout/paytr/callback -d 'merchant_oid=X&status=success&total_amount=1&hash=x'` → çıplak `OK` + admin panelde `hash_mismatch`* kaydı
  (*feature açık ve env doluysa hash_mismatch; kapalıysa feature_disabled)

## 7. PayTR panel ayarları

- [ ] Bildirim (callback) URL: `https://woodyvearkadaslari.com/api/v1/checkout/paytr/callback`
- [ ] Mağaza domain doğrulaması: `woodyvearkadaslari.com`
- [ ] Test modunda test kartıyla uçtan uca ödeme:
  1. `/tr/store` → Şimdi Satın Al → form → iframe → test kartı
  2. Başarı sayfası (`?payment=success&order=...`) + GA4 `purchase` olayı (DebugView)
  3. Admin → Siparişler: `payment_status=paid`, `payment_method=paytr`
  4. Admin → PayTR Kayıtları: `processed` kaydı
  5. Aynı callback'i elle tekrarla → `duplicate` (idempotency)
- [ ] Testler geçince `PAYTR_TEST_MODE=false` + pm2 restart + düşük tutarlı gerçek doğrulama

## 8. Deploy sonrası kontrol listesi

- [ ] `/tr/workshop` → "Mini School Serisi", tek video + caption, guide metni YOK
- [ ] `/tr/home-tutor` → 3 dikey video, guide YOK
- [ ] `/tr/store` → 9 ürün, fiyatlar görünür, Okul Serisi ürünü YOK, not şeridi var
- [ ] `/ar/store` → RTL + "اشترِ الآن"
- [ ] `sitemap.xml` / GSC hata yok (route değişmedi — sorun beklenmez)
- [ ] Lighthouse mobil: store + workshop + home-tutor (videolar `preload="none"` — LCP etkilenmemeli)
- [ ] GA4 e-ticaret: `begin_checkout` → `add_payment_info` → `purchase` zinciri DebugView'da

## Bilinen sınırlar

- PayTR iframe'i iframeResizer olmadan sabit yükseklikte (`80vh`, min 640px) — v1 için yeterli; gerekirse PayTR'nin `iframeResizer.min.js`'i sonra eklenir.
- Mini school 6 kartın "Ürün Videosu" butonu aynı tanıtım videosunu açar (video tek — varsayım §6.5).
- "En az 3 adet" şimdilik bilgilendirme; sepet kuralına çevrilecekse `min_order_quantity` işi ayrıca planlanır.
