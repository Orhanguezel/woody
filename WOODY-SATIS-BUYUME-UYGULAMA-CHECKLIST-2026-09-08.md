# Woody — Satış büyümesi uygulama checklist’i

**Dayanak:** [8 Eylül ayrıntılı rapor](WOODY-SATIS-BUYUME-ANALIZ-RAPORU-2026-09-08.md)

**Durum (8 Eylül uygulama güncellemesi):** İlk düzeltme paketi uygulandı. Kullanıcı commit ve deploy izni verdi. Woody paketi eşzamanlı Woody oturumu tarafından `0acaf2e` commit’iyle yayımlandı; canlı frontend build’i `7gf8P0hLaQzNqMAwsG3YJ`. Aşağıdaki açık kutular tamamlandı sayılmaz. Reklam bütçesi/kampanyası ve gerçek ödeme testi yapılmadı.

**Tamamlanan ilk paket:** erken analytics başlangıcı; teklif formunda sunucu kabulünden sonra tek lead olayı ve gönderim kilidi; üç ev seviyesi için doğru checkout bağlantısı, PRO bilgi alternatifi; minimum sipariş toplamı; ev/okul ilk CTA hedefleri; üç blogda ilgili satış adımı. Ölçüm kuyruğuna izin/client ID, doğrulanmış ödeme durumu, test ayrımı, 72 saat sınırı ve güvenli yeniden deneme kontrolleri eklendi. Beş kuyruk testi geçti; gerçek ödeme uçtan uca testi henüz yapılmadı.

**Canlı kabul:** mobil `/tr/home-tutor` HTTP 200; Basic `home-basic-000d`, Junior `home-junior-000e`, Senior `home-senior-000f` ödeme bağlantıları; JavaScript hatası ve yatay taşma yok. Üç Woody PM2 servisi online. Tanitio’da 11 izlenen rakibin 11’inde rapor doğrulandı; hatalı hafıza kaydı silinmeden pasifleştirildi. Ayrıntılı Tanitio yayın kaydı kardeş deponun kökündeki `WOODY-UYGULAMA-VE-YAYIN-2026-09-08.md` dosyasındadır.

**Açık kritik konu:** yayından sonraki read-only kontrolde `GA4_API_SECRET` hâlâ yapılandırılmamıştı. PayTR aktif ve test modu kapalı. Eski siparişlerde attribution yok; 4 Eylül tarihli bir refund outbox kaydı bekliyor. Bu eski olay bugünün satışı/iadesi olarak yeniden gönderilmez. Kısmi iade tutarı, Measurement Protocol bağlantısı ve izinli yeni ödeme için tek olay kabulü henüz tamamlanmadı. Ticari hedef, reklam tavanı ve gerçek test ödeme tutarı ayrıca somutlaştırılmalı.

Bu durum güncellemesi, diğer oturumun yayımladığı commit’i yeniden yazmamak için yerel belge güncellemesi olarak bırakıldı.

## Başlangıç ve korunacak kararlar

- [x] Woody tenant kapsamıyla GA4/GSC/GTM/Ads/strateji/hafıza/keşif verileri okundu.
- [x] Finans kaynağı imzalı Commerce API’sinden doğrulandı; sır ve müşteri kişisel bilgisi rapora alınmadı.
- [x] Kamuya açık site masaüstü/mobil ve iki gerçek checkout adresinde incelendi.
- [x] Audit ve checklist Woody repo köküne yazıldı.
- [x] **S0 — Uygulama başlangıcı:** Güncel `git status` ve kullanıcı değişiklikleri kaydedilsin; mevcut dosyalara eşzamanlı çalışan iş var mı kontrol edilsin. Bu rapordaki eski snapshot canlı karar öncesi yenilensin.
- [x] **S1 — Ortam:** Woody güncel production host/PM2 cwd/build kimliği doğrulansın. Uygulamada `woody` SSH takma adı ve `/var/www/woody` doğrulandı. Tanitio hostuyla Woody hostu karıştırılmasın.
- [ ] **S2 — İş hedefi:** İlk testin ana hedefi kurum anlaşması veya ev seti satışı olarak işletmeyle seçilsin; demo kapasitesi ve reklam tavanı yazılsın.

**Değişmeyecekler:** Mağazanın onaylı Mini School / Ev sırası, mobil iki sütun ve sade filtre yaklaşımı korunur; hedefe odaklı giriş eklenebilir. Mini School öğrenci minimum 3 kuralı kaldırılmaz. Okul serisinin teklif modeli ve 30 öğrenci açıklığı korunur. Cambridge logosu geri eklenmez. Storybook/pasif ürünler topluca açılmaz. Güncel canlı Senior fiyatları eski seed’e göre geri alınmaz. Full/nodrop seed, canlı blog içeriklerini ezebileceği için kullanılmaz. Mevcut ödeme/erişim/tenant izolasyonu korunur.

## P0 — Ölçüm ve finans güvenilirliği

### G01 — GÜVENLİK: sızan Google Ads kimlikleri (8 Eylül — açık borç)

Ölçüm incelemesi sırasında bulundu: **kimlik doğrulaması olmayan** `GET /api/v1/site_settings` ucu tüm ayarları döndürüyordu ve içinde `google_ads_client_id`, `google_ads_client_secret`, `google_ads_refresh_token` vardı. Bu üçü birlikte **reklam hesabına tam erişim** demektir (para harcama, kampanya değiştirme, veri dışarı çıkarma). `GET /site_settings/:key` ile tek tek de okunabiliyordu.

- [x] Sızıntı kapatıldı ve canlıya alındı. `packages/shared-backend/modules/siteSettings/publicSafety.ts` — fail-closed süzgeç; sır taşıyan anahtar listeden elenir, tekil uçta **404** döner (varlığı bile bildirilmez). `design_tokens` adında "token" geçtiği için açık istisna listesinde (kör desen siteyi bozardı). 6 test.
- [x] Canlı doğrulandı: ayar sayısı 65 → 61; iki kimlik doğrudan sorulunca `not_found`; `design_tokens` yerinde; site 200.
- [x] Düzeltme **ortak pakete** yazıldı: `shared-ecosystem-packages` deposu, dal `guvenlik/site-settings-sir-sizintisi`. Kardeş Ensotek siteleri test edildi, onlarda sızıntı yok.
- [ ] **KİMLİKLERİ ROTATE ET (acil, sahibinde).** Kod sızıntıyı durdurur, geçmişi geri almaz — açıkta kalmış kimlik **ele geçmiş sayılmalıdır**. Ne kadar süredir açık olduğu bilinmiyor.
- [ ] Rotasyon sonrası **Tanitio'daki `tenant_settings` kayıtları da güncellenmeli** (`google/oauth_client_id`, `oauth_client_secret`, `oauth_refresh_token`, `google_ads/developer_token`). Yapılmazsa woody'nin Ads ve GA4 veri akışı **durur** — panel "bağlı" görünürken veri gelmez.
- [ ] Reklam hesabında yetkisiz değişiklik (kampanya, bütçe, dönüşüm) olup olmadığı gözden geçirilsin.

### W01 — Gerçek ödeme → purchase / iade → refund (Woody)

**Kanıt:** Commerce API 1 ödeme/3.000 TL, 1 iade/1.500 TL; GA4 purchase=0. Bu, ödeme alınamadığı değil ölçüm mutabakatının eksik olduğu anlamına gelir.

**Mevcut dosyalar:**

- `backend/src/modules/checkout/commerceMeasurement.ts`
- `backend/src/modules/checkout/router.ts`
- `backend/src/modules/checkout/paytrRefund.ts`
- `backend/src/modules/checkout/paytrConfig.ts`
- `frontend/src/components/woody/store/CheckoutResultTracker.tsx`
- `frontend/src/lib/ecommerce-events.ts`

**İş adımları:**

- [x] Güncel canlı `GA4_MEASUREMENT_ID`, Measurement Protocol erişimi ve PayTR enabled/testMode durumu yalnız varlık/boolean olarak kontrol edilsin; değerler log/rapora yazılmasın.
- [x] `commerce_measurement_outbox` pending/failed/sent sayıları, hata nedenleri ve worker çalışması okunsun; neden kanıtlanmadan yeni boru hattı kurulmasın.
- [ ] Başarılı ödeme, callback, order_attribution, outbox ve GA4 olayının kimlik/durum eşlemesi yapılsın. Gerçek ödeme ile test/veri taşıma kayıtları ayırılsın.
- [ ] Browser/server teslim sahibi tek olsun; aynı sipariş iki yoldan sayılmasın. Callback tekrarında idempotency korunsun.
- [ ] Kısmi iade `order.total` yerine gerçekten iade edilen tutarla ölçülsün. Mevcut `loadCommerceMeasurement` refund yolunun tam/parsiyel durum ve tutar davranışı incelensin.
- [ ] Analytics/ad consent ve izinle toplanan client/session ID taşıma mantığı denetlensin. Hash/sunucu ID’si kullanmak tek başına izin yerine geçmez.
- [ ] Test siparişleri finans entegrasyonu ve analitikten tutarlı ayrıştırılsın. Eski ölçülemeyen ödeme bugünün satışı diye tekrar gönderilmesin; tarih/teslim sınırına uygun mutabakat notu tutulsun.

**Kabul:** Kontrollü testte başarılı ödeme tek purchase; yenilenen dönüş sayfası/tekrar callback ilave purchase üretmez. Başarısız/iptal/test ödeme gerçek satışa karışmaz. Kısmi iade kendi tutarıyla tek refund. Doğrulanmış günlük ödeme toplamı finans kaynağıyla eşleşir; izin nedeniyle raporlanmayan olay ayrı sınıflanır. Finans kaynağı GA4’e bağımlı olmaz.

**Kapı:** Gerçek para içeren uçtan uca ödeme/iade testi için somut test senaryosu ve tutar ayrıca onaylanır. Önce lokal/staging ve read-only inceleme tamamlanır.

### W02 — Etiket başlangıcı, consent ve kanal atfı (Woody)

**Dosyalar:** `frontend/src/app/ClientLayout.tsx`, `frontend/src/features/analytics/AnalyticsScripts.tsx`, `GAViewPages.tsx`, `useAnalyticsSettings.ts`, `AdsConversionClicks.tsx`, `frontend/src/lib/ads-conversion.ts`.

- [ ] Canlı doğrudan gtag seçimi ve yerel GTM öncelik kuralı birlikte kaydedilsin. Tek sahip seçimi açık ayar olsun; boş GTM yanlışlıkla etkinleştirilmesin.
- [x] 5 saniye + idle başlangıcının ölçüm kaybı riski azaltılsın; performansı bozmayacak erken consent kurulumu ve güvenilir olay kuyruğu kullanılsın.
- [ ] Sayfa açıldıktan sonraki ilk 1–3 saniyede CTA/route geçişi senaryosu test edilsin; olay doğru sayfa/kaynakla tam bir kez teslim edilsin.
- [ ] İlk sayfa ile SPA geçişinde çift page_view olmadığını kanıtlayan ağ kaydı alınsın.
- [x] **Consent Mode v2 modellemesi açıldı (8 Eylül, Tanitio oturumu).** `gtag('set','ads_data_redaction',true)` ve `gtag('set','url_passthrough',true)` eklendi (`AnalyticsScripts.tsx`). Rıza varsayılanı `analytics=false, marketing=false` **DEĞİŞTİRİLMEDİ** — KVKK açısından doğru. Eksik olan bu iki ayardı: onlar olmadan reddeden ziyaretçi tamamen kayboluyor, Google dönüşüm modellemesi yapamıyordu. `url_passthrough` çerez yazılamadığında gclid/wbraid'i adres satırından taşır — aşağıdaki UTM/GCLID maddesinin izin uyumlu ayağı budur.
- [ ] UTM/GCLID/GBRAID/WBRAID uygun parametreleri izin ve veri politikasıyla uyumlu olarak yönlendirme/checkout boyunca korunsun; kişisel bilgi event parametresi yapılmasın.
- [ ] PayTR dönüşünde referral atfı test edilsin; GA4 istenmeyen referral ayarı gerekiyorsa change-set hazırlansın.
- [ ] Test tarayıcısının tüm GA4/Ads toplama domainleri engellensin veya test mülkü kullanılsın; gerçek müşteri verisiyle QA ayrıştırılsın.

**Kabul:** Reddetme ve kabul senaryoları ayrı kanıtlanır; izin tercihleri korunur. Uzun bekleme gerektirmeyen doğru tek olay teslimi; kontrolsüz GTM+gtag ikilemesi yok. 621 Ads tıklaması/41 GA4 CPC oturumu farkının nedenleri aynı tarihli örneklemle raporlanır; birebir eşitlik zorunlu kabul ölçütü yapılmaz.

### W03 — Başarılı lead ölçümü (Woody)

**Dosyalar:** `frontend/src/components/woody/quote/QuoteRequestForm.tsx`, `frontend/src/lib/ads-conversion.ts`; mevcut contact formu ve quote/contact backend uçları uygulama başında bulunacak.

- [ ] Teklif formu, iletişim formu, WhatsApp ve telefon olay sözleşmesi çıkarılsın; `quote_form_submit`/`generate_lead` farkı giderilsin.
- [ ] Yalnız sunucunun kabul ettiği form için `generate_lead`/uygun dönüşüm; hata/çift tıklama/sayfa yenilemede tekrar yok.
- [ ] `lead_id`, kaynak, kullanım tipi ve form tipi operasyon kaydına eklensin; e-posta/telefon GA4’e gönderilmesin.
- [ ] Kariyer/öğretmen başvurusu satış lead’inden ayrı sınıflansın.
- [ ] WhatsApp tıklaması görüşme başladı veya qualified lead olarak işaretlenmesin.

**Kabul:** 1 başarılı başvuru = 1 kayıt/1 uygun olay; başarısız başvuru = 0 lead olayı; kopya gönderim kontrolü; gerçek müşteri kaydıyla karışmayan test kaydı.

### T01 — Tarih, finans ve ölçüm kartları (Tanitio oturumuna devir)

**Repo:** `/home/orhan/Documents/Projeler/ekosistem-sosyal-medya`

**Dosyalar:** `dashboard/src/app/analytics/page.tsx`, `backend/src/modules/ecommerce/woody.ts`, `backend/src/modules/ecommerce/service.ts`; GA4 sayfası/API profil tanımı.

- [ ] Woody lead+ecommerce hedefleri ayrı gösterilsin; “dönüşüm” etiketi hangi olayı anlattığını açıklasın.
- [ ] Kullanıcı tarih filtresi GA4/Commerce kapsamlarına doğru taşınsın veya sabit dönem görünürce ayrı belirtirsin.
- [ ] Commerce cache doldurma/güncellik/hata durumu canlı oturumda doğrulansın; hata “0 satış” olarak gösterilmesin.
- [ ] Net tahsilat, Ads dönüşüm değeri ve kâr ayrı; `adSpend:0` ile hesaplanan değer kâr diye sunulmasın.
- [ ] Ödeme/iade/GA4 farkı için kaynak ve kapsam açıklaması gösterilsin.

**Kabul:** 8 Eylül baseline’ı aynı tarihlerde yeniden okunduğunda 3.000 ödeme/1.500 iade görünür; GA4 sıfır sonucu finans kaydını gizlemez. GSC gecikmesi ayrı. Başka tenant’a veri sızmaz. Canlıdan okunan kaynak güncelliği görünür.

### T02 — AI hafıza kalite kapısı (Tanitio)

- [x] Rapordaki sorunlu fact ID’leri öneri motorundan geçici çıkarılsın; silmeden audit izi korunsun.
- [ ] Her sayısal kayıt sourceRunId, mutlak dönem, örneklem, hesap formülü ve metric türü taşısın.
- [ ] CPC=cost/clicks; CTR=clicks/impressions; ROAS yalnız gelir tanımı uygunsa. Dönem oranlarının basit ortalaması kullanılmasın.
- [ ] Inference güven skoru ile istatistiksel kanıt ayrışsın; birkaç olayla yaş/saat/şehir otomatik karar üretilmesin.
- [ ] Çelişki ve eski dönem denetimi; düzeltilen kayda superseded bağlantısı.

**Kabul:** Sorunlu örnek 128,65/11 hesabını 9,63 olarak kaydedemez; 9 günlük kanıt 30 günlük diye sunulamaz; WhatsApp değeri satış getirisi diye öneriye girmez. 30 hafıza kaydı topluca silinmez.

## P1 — Ürün seçimi ve satış deneyimi (Woody oturumu)

### W04 — Seviye → doğru ürün geçişi

**Dosyalar:** `frontend/src/components/woody/home-tutor/HomeTutorPageClient.tsx`, `frontend/src/components/woody/store/WoodyStoreClient.tsx`, `WoodyStoreShowcase.tsx`, `WoodyStoreProductDetail.tsx`, `CheckoutPurchaseClient.tsx`, `frontend/src/components/woody/level-finder/LevelFinderClient.tsx`.

- [x] Basic/Junior/Senior CTA’sı mevcut aktif ürün ID’sini korusun; yalnız sabit mağaza URL’si kullanılmasın.
- [ ] Level finder sonucundan doğru kullanım tipi/seviyeye geçiş; satışı olmayan seviyede açıklayıcı alternatif.
- [ ] PRO için işletme kararı kaydedilsin; gerçek ürünü olmayan “Satın Al” düğmesi uygun bilgi/teklif adımına dönsün.
- [ ] Ürün bulunamadı/pasif/stoksuz durumda yanlış ürün veya boş checkout açılmasın.

**Kabul:** Masaüstü ve 390 px’de 3 aktif ev seviyesi doğru ürün/fiyatla açılır; geri dönüş seçimi kaybetmez; URL değiştirerek yanlış fiyat uygulanamaz; mevcut API fiyat otoritesi korunur.

### W05 — Katalog, içerik ve fiyat açıklığı

- [ ] Güncel katalog snapshot’ı alınsın; Senior fiyat farkı işletmeye doğrulatılsın. Seed/rapor fiyatı otomatik canlı fiyat yapmasın.
- [ ] Her set için kutu içeriği, hedef kullanım, seviye, dijital erişim süresi, uygulayıcı ve destek kapsamı gerçek katalogdan açıklansın.
- [ ] Mini School için 3 × 2.500 = 7.500 TL başlangıç tutarı ve öğretmen setinin dahil/değil durumu görünür olsun.
- [ ] Öğrenci minimum3 kuralı arayüz ve backend’de test edilsin; 1/2 adet isteği reddedilsin; öğretmen ve ev setleri yanlışlıkla min3 olmasın.
- [ ] Teslimat/kargo/aktivasyon bilgisi ürün kararına yakın; olmayan ücretsiz kargo veya destek vaadi yok.
- [ ] Video posterleri doğru içerikten; görsel kontrol ve HTTP 200/MIME doğrulaması. Tüm reklam/Reel kapakları ilgili nihai videoya ait olsun.

**Kabul:** Fiyatlar kart/ürün/checkout/ödeme isteğinde aynı; toplam sunucuda hesaplanır. Fiyat değişikliğinin kayıtlı ticari gerekçesi vardır. Ürün açıklaması video izlemeyen kullanıcı için de yeterlidir.

### W06 — İki hedef kitle için açılış ve mobil kolaylık

- [ ] Mevcut home-tutor/preschool sayfalarına hedefe uygun ana CTA; ikinci paralel site kurulmasın.
- [ ] Ebeveyn trafiği Ev ürünlerine odaklı giriş alsın; genel mağaza sırası değiştirilmeden ankraj/odak kullanılabilsin.
- [ ] Kurum akışında 30+ öğrenci modeli; daha küçük grup için Mini School alternatifi.
- [ ] İlk görünümde kısa ürün vaadi ve gerçek demo; uzun açıklamalar erişilebilir aç/kapa ile sadeleşsin.
- [ ] Mobil sipariş toplamı/form ilişkisi ve klavye ile erişim gözden geçirilsin. Zorunlu sözleşmeler saklanmasın.
- [ ] Cambridge kesin sertifika cümleleri belge/kapsama göre revize edilsin; logo geri gelmesin.

**Kabul:** Kullanıcı “benim için hangi set, ne alıyorum, ne ödeyeceğim, sonraki adım ne?” sorularını yardım almadan cevaplayabilsin. 390/768/1440 px taşma yok; mevcut iki sütun kararı korunur. Uydurma referans/rozet/sonuç garantisi yok.

### W07 — Mevcut admin’de lead ve satış takibi

**Mevcut alanlar:** `admin_panel/.../contacts`, `quote-requests`, `orders`; backend karşılıkları. Mevcut eşzamanlı admin çalışmasıyla çakışma kontrolü şart.

- [ ] Yeni/ulaşıldı/nitelikli/demo/teklif/kazanıldı/kaybedildi aşamaları mevcut yapılara uygulanabilir mi incelensin.
- [ ] Kaynak, sorumlu, sonraki işlem tarihi, ürün/kullanım biçimi, kayıp nedeni; basit rapor.
- [ ] Kurum ve ev talebi ayrımı; mesai/yanıt SLA’sı işletmeyle belirlenip ölçülsün.
- [ ] Reklamdan gelen lead’in nitelikli/kazanıldı durumu için izinli offline conversion sözleşmesi hazırlansın; ilk turda otomatik gönderim açılmasın.
- [ ] Ödeme sonrası dijital erişim/kargo/ilk kullanım bilgisi var olan akışta doğrulansın.

**Kabul:** Bir örnek test lead’inin kaynaktan son duruma izi görülebilir. Tenant/müşteri yetkileri korunur. Takip görevi oluşması otomatik mesaj göndermez. Offline satışlar ödeme kaynağına çift yazılmaz.

## P2 — SEO, içerik ve reklam deneyleri

### W08 — Mevcut organik girişleri dönüştür (Woody)

- [ ] Ders planı yazısına mevcut içeriğe uygun örnek plan/demo CTA’sı.
- [ ] 4–5–6 yaş yazısına level finder/ev seti CTA’sı.
- [ ] Set seçimi yazısına gerçek içerik/kullanım/fiyat karşılaştırması; kurum ve ev yolları ayrı.
- [ ] Başlık/meta, canonical/hreflang/sitemap ve ilk 5 URL’nin güncel indeks kontrolü; eski hata sayılarını yeniden kullanma.
- [ ] Ürün schema fiyat/stok/URL ile sayfa tutarlı; sahte review yok.
- [ ] Mobil Lighthouse/CWV başlangıcı yeniden ölçülsün; eski 4,1 saniyeyi güncel sonuç sayma. Medya yüklemesi, JS ve tıklama hedeflerini gerçek bulguya göre düzelt.

**Kabul:** Ticari CTA’lar doğru yola gider ve izinli ölçülür. Eski SEO düzeltmeleri/çeviri URL’leri bozulmaz. Site performansı önce/sonra aynı koşullarda kaydedilir; yalnız puan yükseltmek için analitik 5 saniye geciktirilmez.

### A01 — Google Ads dönüşüm hedefi (Ads / Tanitio)

- [ ] Canlı conversion action + account/campaign/custom goal snapshot’ı al; geri dönüş planı hazırla.
- [ ] WhatsApp/telefon tıklamaları ile gerçek form/qualified lead/satışı ayır.
- [x] **Hidden purchase nedeni bulundu ve çözüldü (8 Eylül, Tanitio oturumu).** Hesapta `Woody Landing Page (web) purchase` (tür `GOOGLE_ANALYTICS_4_PURCHASE`, kategori PURCHASE) **zaten vardı** ama `status=HIDDEN`, `primaryForGoal=false`, `includeInConversionsMetric=false` idi. Ads'in 30 günde 4.521 TL harcayıp sıfır dönüşüm raporlamasının sebebi buydu. `status=ENABLED` + `primaryForGoal=true` yapıldı; hesaptan geri okunarak doğrulandı (artık 4 etkin dönüşüm: 3 lead + 1 purchase).
  **Yeni dönüşüm eylemi OLUŞTURULMADI** — GA4 içe aktarımı dururken ikinci bir site-etiketi dönüşümü aynı satışı iki kez sayardı. Aynı sebeple `site-defaults.json > analytics.googleAdsConversionLabels.purchase` bilerek BOŞ bırakıldı; koddaki `reportAdsPurchase()` hazır ama uykuda.
- [x] **Primary/secondary geçişi validate edildi.** Sıra korundu: read-only snapshot → `validateOnly:true` (temiz geçti) → kullanıcı onayı → apply. Uygulama yanıtı ve sonrasındaki durum sorgusu kayıt altında.
  ⚠️ **Geriye dönük doldurma YOK:** geçmiş 30 günün sıfırı olduğu gibi kalır; sayım bu tarihten sonraki satışlarda başlar.
- [ ] Mevcut Tanitio change-set: draft → validateOnly → somut kullanıcı onayı → apply. Yeni kampanya PAUSED. Silme gerekiyorsa ayrı çift onay.

**Kabul:** “23 satış” veya “4.400 TL ciro” şeklinde eski lead hesabı gösterilmez. Gerçek sipariş değeri ve transaction ID doğru; tekrar import çift değer üretmez.

### A02 — Arama niyeti ve ilk deney

- [ ] En yüksek maliyetli 40 terim ötesinde kapsama göre tüm görünür terimleri incele; harcama kapsama oranını yaz.
- [ ] 2. sınıf/Wordwall/genel ücretsiz oyun niyetlerini tek tek negatif aday listesine al; “oyun” genel negatif olmasın.
- [ ] İlk ticari hipotez seçilsin: kurum seti veya ev seti. Düşük bütçeyi gereksiz kampanyalara parçalama.
- [ ] Reklam/landing/aktif fiyat eşlemesini hazırla; metinler gerçek vaat içersin.
- [ ] Bütçe tavanı ve değerlendirme aralığı onaylansın; mevcut 150 TL/gün referansı otomatik bütçe artışı değildir.
- [ ] CPC kontrollü geçici trafik deneyi gerekiyorsa nedeni ve sonlandırma koşulu yazılsın; tCPA/tROAS uydurulmasın.

**Kabul:** Aynı kapanmış dönemde ticari niyetli tıklama, başarılı/nitelikli lead, kazanılan satış ve gider raporlanır. Sırf “bütçe kısıtlı” diye artış yok. Yaş/saat dışlaması küçük örneklemli hafızadan otomatik üretilmez.

### T03 — Sosyal bağlantı, seçilmiş taslaklar (Tanitio + işletme)

- [ ] Facebook/Instagram/YouTube gerçek hesap sahipliği ve OAuth bağlantısı doğrulansın; pasif yer tutucu doğrudan açılmasın.
- [ ] Meta reklam hesabı erişimi ayrı doğrulansın; bağlantı eksikliği sıfır performans diye gösterilmesin.
- [ ] 38 taslaktan ilk 3 içerik seçilsin: ürün demosu, öğretmen uygulaması, evde kullanım. Güncel fiyat/ürün/kapsam kontrolü.
- [ ] Doğru video kapağı, medya URL’si, tek CTA, standart UTM ve doğru ürün girişi.
- [ ] Yayın takvimi için somut önizleme ve ayrıca yayın onayı.

**Kabul:** Hesap analitiğinde güncel kaynak tarihi; taslak/yayın ayrımı; kullanıcı onayı olmadan paylaşım yok. Yeniden pazarlama yalnız izin ve gerçek uygun kitle varsa.

### T04 — Rakip kartı / rapor kapsamı (Tanitio)

- [ ] 7 yeni izlenen rakip için mevcut snapshot varsa onu kullanarak eksik raporları hazırla; gereksiz yeniden tarama yapma.
- [ ] 4 mevcut raporun kaynak tarihini göster; AI metnini yeni crawl sanma.
- [ ] Doğrudan set rakibi / alternatif kurs / içerik kaynağı / sosyal kanal sınıfları.
- [ ] Türkiye ticari sorgularını yabancı dil ve genel bilgi sorgularından ayır.
- [ ] Yandex/Brave konumu Google pozisyonu diye yazılmasın; GSC gösterimleri rakibe mal edilmesin.
- [ ] Firma kartı cache önizlemesi, alım tarihi ve açık yenileme; açılış başına tekrar site isteği yok.

**Kabul:** Önizleme tekrar açıldığında rakibe yeni istek atılmaz; eski snapshot tarihi görünür. Woody GA4/finans/tenant tabloları rakip içerikle kirlenmez. Rapor eksikse açık eksik durumu gösterilir.

### T05 — Strateji güncellemesi (Tanitio)

- [ ] Lead+ecommerce iki yol, öncelikli test ve gerçek ürün grupları strateji taslağına işlenir.
- [ ] Cambridge ve ürün sonuç iddiaları kanıt/kapsamla güncellenir.
- [ ] İçerik hedefi erişim değil ilgili ürün ziyareti/nitelikli lead; sosyal ve reklam kaynakları ayrılır.
- [ ] İşletme onayından sonra strateji yeni revizyon olarak kaydedilir; önceki revizyon korunur.

## P3 — Büyütme kapısı ve raporlama

- [ ] **R01:** SKU maliyeti, kargo, komisyon, iade ve hedef katkı belirlenmeden kâr/tROAS hedefi kurulmasın.
- [ ] **R02:** Haftalık rapor aynı kapanmış dönem; düşük hacimde 28 günlük ek görünüm; GSC gecikmesi ayrı.
- [ ] **R03:** Satın alma dönüşüm gecikmesi ve kurum satış kapanış süresi görülsün; erken kampanya kapatma yok.
- [ ] **R04:** Reklam artışı yalnız doğrulanmış ölçüm, yeterli ticari sonuç ve kabul edilen CAC ile; önceki bütçe/geri dönüş planı yazılı.
- [ ] **R05:** Sonuç çıkmazsa önce niyet → açılış → lead kalitesi → takip → fiyat/teklif sırasıyla neden analizi; yalnız tasarım veya bütçe suçlanmasın.

## Her uygulama fazının kapanış kaydı

Her faz sonunda aşağıdaki satır doldurulur; yapılmadan kutu işaretlenmez:

| Faz | Değişen dosya/ayar | Test ve kanıt | Canlı build/kaynak tarihi | Geri dönüş | Durum |
|---|---|---|---|---|---|
| Audit | Rapor + checklist + kanıt dosyaları | API/SQL/toplu veriler ve tarayıcı kontrolü | 8 Eylül 2026 | Uygulama değişikliği yok | Tamam |
| P0 | — | — | — | — | Başlamadı |
| P1 | — | — | — | — | Başlamadı |
| P2 | — | — | — | — | Başlamadı |
| P3 | — | — | — | — | Başlamadı |

**Deploy tuzakları (8 Eylül'de yaşandı, tekrarlamasın):**

1. `deploy/deploy.sh` frontend adımı `rm -rf .next` yapıyor; **çalışan Next sunucusu** aynı anda `.next/cache`'e yazdığı için `rm` "Directory not empty" veriyor ve **build tümden atlanıyor**. Üstelik çıktı bir boruya (`| tail`) bağlanırsa kabuk **`exit 0`** gösterir — deploy başarılı sanılır ama frontend eski build'de kalır, `.next` de yarı silinmiş olur. Doğru sıra: `pm2 stop woody-frontend` → `rm -rf .next` → build → `pm2 start`. Deploy çıktısını boruya bağlamayın, çıkış kodunu maskeler.
2. `packages/` hem `.gitignore`'da hem `deploy.sh`'ın rsync **exclude** listesinde. Yani paylaşılan paketteki (`shared-backend`) bir değişiklik **deploy.sh ile canlıya GİTMEZ**; VPS'e elle kopyalanıp backend yeniden derlenmelidir. Kaynağı ayrı depo: `Orhanguezel/shared-ecosystem-packages`.

Kod uygulamasında ilgili workspace’in mevcut typecheck/build ve hedefli checkout/measurement testleri çalıştırılır. Yazılı kabul senaryoları test verisiyle doğrulanır; finans/izin/idempotency gibi kritik davranışlar gerçek test ister. Belgeler için uygulama testi çalıştırılmış gibi rapor verilmez. Deploy ancak kullanıcı talimatı ve somut doğrulanmış kapsamla; tüm kirli çalışma ağacı topluca gönderilmez.

**Woody oturumuna başlangıç talimatı:** “Bu checklist ve ayrıntılı raporu oku. Güncel ortamı ve değişiklikleri doğrula. Önce W01–W03 için mevcut ödeme/ölçüm hattının gerçek sorununu kanıtla; W04–W07’yi mevcut yapıları kullanarak uygula. Tanitio ve Ads maddelerini ayrı repo/hesapta yönet. Canlı veri/seed/ödeme ve yayın kurallarını koru. Her faz sonunda gerçek test ve görünür sonucu bu belgeye işle.”
