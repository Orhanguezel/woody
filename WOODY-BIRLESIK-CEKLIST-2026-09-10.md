# Woody — Birleşik uygulama çeklisti (10 Eylül 2026)

Kaynak dört belge: [Analiz raporu](WOODY-SATIS-BUYUME-ANALIZ-RAPORU-2026-09-08.md) · [Uygulama checklist'i](WOODY-SATIS-BUYUME-UYGULAMA-CHECKLIST-2026-09-08.md) · [Son kontrol ve yayın](WOODY-SON-KONTROL-VE-YAYIN-2026-09-08.md) · [Strateji/hafıza/öneri uyumu](WOODY-STRATEJI-HAFIZA-ONERI-UYUMU-2026-09-08.md). Bağlı devam raporları: [Kalan uygulama](WOODY-KALAN-UYGULAMA-2026-09-08.md), [GA4 anahtar](WOODY-GA4-ANAHTAR-DOGRULAMA-2026-09-08.md), [Ödeme testleri](WOODY-ODEME-TEST-VE-GECMIS-KONTROL-2026-09-08.md), [Reklam deneyi](WOODY-REKLAM-DENEYI-VE-KALAN-KARARLAR-2026-09-08.md).

Bu belge, 8 Eylül belgelerindeki tüm açık maddeleri tek listede toplar; her maddede **sahip** ve **kanıt** vardır. Kutu yalnız canlıda doğrulanmış işte işaretlidir.

## 0. 10 Eylül'de canlıya alınanlar

| # | İş | Kanıt | Commit / kaynak |
|---|---|---|---|
| 1 | **Canonical/hreflang/sitemap localhost regresyonu düzeltildi.** 8 Eylül 15:02 UTC build'i (`DZfj5kN2…`) `NEXT_PUBLIC_SITE_URL`/`APP_URL` değerlerini `http://localhost:3101` gömmüştü; iki gün tüm sayfalar canonical, hreflang, og:url ve sitemap'te localhost gösterdi. | Canlı: `/tr`, `/tr/home-tutor`, ürün, blog, `/en/store`, `/de` canonical `https://woodyvearkadaslari.com/...`; sitemap 511 URL, 0 localhost; build `6wPF4Jsp…`, derlenmiş çıktıda 0 `localhost:3101` | `81c897b` — production'da localhost origin yok sayılır (site-config, serverMetadata, alternates) + `deploy/build-next.sh` kapısı: localhost gömülü build aktive edilmez |
| 2 | Blog "Anaokulu İngilizce eğitim seti nasıl seçilir" yazısındaki üç ölü ürün bağlantısı (`*-level-set-ogrenci-seti-0001/2/3`, 404) aktif ev setlerine (`home-basic-000d/junior-000e/senior-000f`) çevrildi. Başlıklar birebir aynı ürünler. | Canlı sayfa yalnız aktif slug'lara bağlanıyor; DB'de eski slug 0 | Canlı DB `blog_posts_i18n` (yedek `/root/yedek-blog-links-20260910.sql`) |
| 3 | Satılan ürünlerde **Product JSON-LD** (name, description, image, sku, brand, offers: fiyat/TRY/stok/url). Yorum/puan bilerek yok. | İkinci frontend deploy'u ile yayında — doğrulama aşağıda "Yayın sonucu" | `d237441` |
| 4 | Admin "Ödeme başarısız" e-postasına PayTR neden mesajı/kodu; kod 6 (müşteri ödeme sayfasından ayrıldı) ayrı başlık ⏸️ + "teknik sorun değil" notu | Backend canlı; ilk gerçek başarısız callback'te uçtan uca görülecek | `ce7e74f` |
| 5 | PM2: frontend `max_memory_restart` 450M→1G (ortak 700M). 450M sınırı Next 16 tabanının (~400 MB) altındaydı; frontend her 2-3 saatte yeniden başlayıp birkaç saniye 502 üretiyordu. Sızıntı değil (2,5 saatte 404→412 MB). | Frontend yeni sınırla online; nginx "connection refused" tekrarı beklenmiyor | `ce7e74f` |
| 6 | `pm2-logrotate` (100M, 14 gün, gzip, günlük). 3,1 GB backend logu küçültüldü; son 300 MB `woody-backend.out.log.prev.gz` | Disk %20→%17 | VPS |
| 7 | 10 Eylül 07:27 "ödeme hatası" incelemesi: sistem hatası yok; Google Ads ziyaretçisi uydurma form verisiyle PayTR ekranını yarım bıraktı (kod 6). 9 Eylül 19:58 gerçek müşteri 4.750 TL canlı modda başarıyla ödedi. | `paytr_callback_logs`, nginx, PM2 log zaman çizgisi | Hafıza `woody-paytr-log-analizi` |

## 1. P0 — Ölçüm, finans, güvenlik

### G01 Sızan Google Ads kimlikleri — **sahip: hesap sahibi (Yalçın / minayayinevi)**
- [x] Sızıntı kodda kapatıldı, ortak pakete yazıldı (8 Eylül).
- [ ] **Kimlikleri rotate et** (OAuth client secret, refresh token, developer token). Kod geçmişi geri almaz; açıkta kalan kimlik ele geçmiş sayılır.
- [ ] Rotasyon sonrası Tanitio `tenant_settings` (google/oauth_*, google_ads/developer_token) güncelle; yoksa Woody Ads/GA4 verisi durur.
- [ ] Reklam hesabında yetkisiz kampanya/bütçe/dönüşüm değişikliği incele.

### W01 Gerçek ödeme → purchase, iade → refund — **sahip: Claude (kod) + işletme (karar)**
- [x] GA4 Measurement Protocol anahtarı bağlandı, purchase/refund debug doğrulandı (8 Eylül).
- [x] Callback idempotency, kısmi iade defteri, test ayrımı, tek teslim sahibi (8 Eylül; 19 kabul senaryosu).
- [x] **Sipariş bazlı eşleme yapıldı (10 Eylül):** 9 Eylül gerçek ödeme (4.750 TL) → callback `success` → sipariş `paid` → outbox `purchase` **`failed: measurement_ineligible_consent_payment_or_test`**. Neden: `order_attribution.consent_state=denied`, `ga_client_id` NULL. 3 Eylül ödemesinde attribution kaydı hiç yok (özellik sonradan geldi).
- [ ] **Karar (işletme):** Çerezi reddeden müşterinin satışı GA4/Ads'e gitmiyor (KVKK açısından mevcut davranış doğru). Seçenek: onaysız müşteride yalnız gclid+tutar ile sunucudan "onaysız dönüşüm" (Consent Mode) göndermek. Onay gelirse Claude uygular; gelmezse GA4'te satış sayımı yalnız çerezi kabul edenlerde kalır ve raporlarda böyle etiketlenir.
- [ ] Gerçek uçtan uca kabul: çerezi **kabul eden** bir müşterinin ödemesi GA4 raporunda purchase olarak görülmeli. Şu ana kadar tüm gerçek müşteriler reddetmiş (2/2). Bekleniyor; sentetik ödeme yapılmayacak.

### W02 Etiket, consent, kanal atfı — **sahip: Claude + GA4 yöneticisi**
- [x] Erken consent kurulumu, tek page_view, Consent Mode v2 (`ads_data_redaction`, `url_passthrough`), UTM/GCLID taşıma (8 Eylül).
- [ ] **GA4 istenmeyen yönlendirme (unwanted referrals) listesine `paytr.com` ekle** — GA4 Yönetici > Veri akışı > Etiket ayarları > İstenmeyen yönlendirmeleri listele. Kanıt: 9 Eylül müşterisi ödeme sonrası siteye `referer: https://www.paytr.com/` ile döndü; kodda `ignore_referrer` var ama GA4 tarafı ayrıca ayarlanmalı. Hesap erişimi olan yapar (Tanitio Admin API ile de mümkün).
- [ ] 621 Ads tıklaması / 41 GA4 CPC oturumu farkı: yeni consent kurulumundan sonraki kapalı 7 günde yeniden ölç (Tanitio).

### W03 Lead ölçümü — **sahip: Claude**
- [x] Sunucu kabulünden sonra tek `generate_lead`, request_id ile tekrar koruması, lead ID olayda, e-posta/telefon yok (8 Eylül).
- [x] Kariyer/öğretmen başvurusu `purpose=career` ile satış lead'inden ayrı (8 Eylül).
- [ ] Olay sözleşmesi belgesi: teklif formu, iletişim formu, WhatsApp tıklaması, telefon tıklaması — hangi olay adı, hangi Ads dönüşümü, hangisi "lead" sayılır. Kod var, belge yok. Bir sonraki turda `docs/woody-olay-sozlesmesi.md` olarak yazılacak.

### W07 Admin lead/satış takibi — **sahip: Claude (kod) + işletme (SLA)**
- [x] `lead_followups` aşama/sorumlu/sonraki işlem/kayıp nedeni; admin ekranı; 12 kabul kontrolü (8 Eylül).
- [ ] Kurum ve ev talebi ayrımı raporda (kullanım tipi alanı var; listede filtre/özet eksik).
- [ ] Yanıt SLA'sı ve demo kapasitesi — **işletme girdisi**; girilmeden hedef uydurulmaz.
- [ ] Ödeme sonrası dijital erişim + kargo + ilk kullanım bilgisi tek ekranda — `orders` kargo alanları var, müşteri tarafında "siparişim" görünümü doğrulanmalı.

### T01/T02 Tanitio finans kartları ve AI hafıza — **sahip: Tanitio oturumu** — 8 Eylül'de kapatıldı; T02'de sayısal kayıtlara sourceRunId/dönem/formül zorunluluğu açık.

## 2. P1 — Satış deneyimi

### W04 Seviye → ürün — **Claude**
- [x] Basic/Junior/Senior CTA'ları doğru `checkout?product=` ile (canlı doğrulandı 10 Eylül).
- [x] PRO'da "Satın Al" yok, "Bilgi alın" var (canlı doğrulandı).
- [x] Level finder → aktif ürün / bilgi yolu (8 Eylül).
- [ ] PRO ticari kararı (temin, fiyat) — **işletme**.

### W05 Katalog, içerik, fiyat açıklığı — **işletme girdisi + Claude**
- [x] Mini School kartında "3 öğrenci: 7.500 TL" örneği görünür (canlı, 3 kart).
- [x] Min 3 kuralı arayüz + backend (8 Eylül).
- [x] Ürün sayfası Product schema fiyat/stok/URL ile tutarlı (10 Eylül, `d237441`).
- [ ] Her set için kutu içeriği / uygulayıcı / dijital erişim süresi / destek kapsamı — **işletme metni** gerekli; `product_contents` tablosu hazır, admin panelden girilir.
- [ ] Teslimat/kargo/aktivasyon bilgisi ürün kartına yakın (şu an yalnız footer'da "Teslimat ve Kargo"). Claude: ürün detayına mevcut CMS sayfasına bağlanan kısa satır ekleyecek (10 dil `ui` anahtarı).
- [ ] Senior fiyat farkı (4.650/4.750 TL) ticari teyit — **işletme**.
- [ ] Video kapakları: hero düzeltildi (8 Eylül); reklam/Reel kapakları içerik seçildiğinde.

### W06 İki hedef kitle, mobil — **Claude + işletme**
- [x] home-tutor/preschool hedef CTA'ları (8 Eylül).
- [ ] Ebeveyn trafiği için Ev bölümüne ankraj (`/tr/home-tutor#home-levels` reklam hedefi hazır; mağazada ankraj yok).
- [ ] Kurum akışında 30+ öğrenci koşulu ve Mini School alternatifi metni preschool sayfasında **görünmüyor** (10 Eylül kontrol) — işletme metni onaylayınca eklenecek.
- [ ] **Cambridge iddiaları:** ana sayfada "Öğrenciler 160'tan fazla ülkede geçerli Cambridge English sertifikası alır" ve "Cambridge Sertifika Sistemine Geçiş" cümleleri duruyor. Belge/kapsam olmadan kesin dil riskli. **İşletme**: British Side anlaşması ve sertifika koşulunu yazsın; Claude metni "sertifika sınavına hazırlık, sınav ayrı ücret/koşul" biçimine getirsin. Logo zaten yok.
- [ ] Mobil sipariş formu klavye erişimi gözden geçirme (Codex UI doğrulama).

## 3. P2 — SEO, içerik, reklam

### W08 Organik girişleri dönüştür — **Claude**
- [x] Ders planı yazısı → `preschool#quote-form` CTA; yaş yazısı → level-finder; set seçimi yazısı → **aktif** ürünler (10 Eylül düzeltildi).
- [x] Canonical/hreflang/sitemap **10 Eylül'de yeniden doğrulandı ve düzeltildi** (bkz. bölüm 0). 8 Eylül "[x]" işareti bozuk build'den ÖNCE alınmıştı.
- [x] Product schema (10 Eylül).
- [ ] **GSC'de sitemap'i yeniden gönder + öncelikli 5 URL için URL Inspection "indekslenmesini iste"** — Google iki gün localhost canonical gördü. Hesap erişimi olan yapar (Tanitio GSC API ile de mümkün). IndexNow ping'i Claude bu turda atıyor (Bing/Yandex).
- [ ] Mobil LCP 4,1 sn / TBT 1.170 ms — JS azaltma ayrı iş (P2, ticari onay sonrası).

### A01/A02 Google Ads — **Tanitio + işletme onayı**
- [x] Hidden purchase dönüşümü ENABLED/primary (8 Eylül).
- [ ] İlk deney yolu seçimi (kurum `preschool#quote-form` / ev `home-tutor#home-levels`) — **işletme**.
- [ ] 14 EXACT negatif aday + 2 RSA taslağı apply — **işletme onayı**; validateOnly geçti.
- [ ] Bütçe tavanı 150 TL/gün teyit — **işletme**.

### T03–T05 Sosyal/rakip/strateji — **kapsam dışı (social=[], meta=false)**; strateji rev.3 kayıtlı, işletme onayı bekliyor.

## 4. P3 — Büyütme kapısı — **işletme girdileri**
- [ ] SKU maliyeti, kargo, komisyon, iade payı, hedef katkı → CAC/tROAS ancak bundan sonra.
- [ ] Haftalık rapor çerçevesi (aynı kapalı 7 gün + 28 gün) — Tanitio'da hazır, ilk dönem 15 Eylül'den itibaren.

## 5. Sahibe göre özet

**Claude (sonraki tur):** olay sözleşmesi belgesi (W03); ürün detayında teslimat/iade satırı (W05); kurum/ev filtre özeti (W07); mağaza Ev ankrajı (W06).

**İşletme (Yalçın / Ayşe):** Google kimlik rotasyonu (G01, acil); GA4 unwanted referral `paytr.com`; GSC sitemap yeniden gönder; onaysız dönüşüm kararı (W01); PRO/Senior fiyat/kutu içeriği/Cambridge kapsamı/30+ metni (W04–W06); Ads deney yolu + negatif paket + bütçe onayı (A01–A02); maliyet girdileri (P3).

**Tanitio oturumu:** rotasyon sonrası tenant_settings; 7 günlük Ads/GA4 mutabakat; GSC/GA4 admin işlemleri hesap yetkisiyle.

## 6. Deploy tuzakları (10 Eylül eklemesi)

3. **Build ortamı env'i canlı canonical'ı belirler.** `NEXT_PUBLIC_SITE_URL` build anında gömülür; 8 Eylül'de yan oturumun build'i `http://localhost:3101` ile derlendi ve aktive edildi. Artık `deploy/build-next.sh` derlenmiş çıktıda localhost origin bulursa aktivasyonu iptal eder; kod da production'da localhost'u yok sayar. Yine de her deploy sonrası `curl -s https://woodyvearkadaslari.com/tr | grep canonical` bakılır.
4. PM2 ecosystem'i yeniden okutmak için `pm2 restart ecosystem.config.cjs --only <app> --update-env` yeterlidir; `pm2 delete` gerekmez.
