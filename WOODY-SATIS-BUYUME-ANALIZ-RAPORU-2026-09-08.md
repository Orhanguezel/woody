# Woody — Satış büyümesi, ölçüm ve reklam analizi

**Tarih:** 8 Eylül 2026 · **Tenant:** `woody` · **Durum:** İnceleme ve uygulama planı; uygulama başlamadı.

**Ana karar:** Reklam bütçesini artırmadan önce gerçek ödeme, nitelikli müşteri adayı ve basit tıklama birbirinden ayrılmalı. Ardından okul/atölye satışı ile evde kullanım satışı ayrı yollarla yönetilmeli. Trafik artıyor; mevcut ölçüm bunu güvenilir satış başarısına çevirdiğimizi göstermiyor.

[Uygulama checklist’i](WOODY-SATIS-BUYUME-UYGULAMA-CHECKLIST-2026-09-08.md) · [Tarihli veri kanıtı](reports/woody-satis-audit-2026-09-08/evidence.json) · [Mobil mağaza](reports/woody-satis-audit-2026-09-08/mobile-tr-store.png) · [Ödeme ekranı](reports/woody-satis-audit-2026-09-08/follow-2.png)

## 1. Yönetici özeti

1. **Reklamdaki 23 dönüşüm satış değil:** 22 WhatsApp tıklaması + 1 iletişim formu dönüşümü. 4.400 TL dönüşüm değerinin tamamı WhatsApp eylemlerinden geliyor. Bu tutar ciro olarak kullanılamaz. Mevcut kampanya bu eylemlerle optimizasyon yapıyor.
2. **Gerçek finans kaydı ile GA4 uyuşmuyor:** İmzalı Woody Commerce API’si, test siparişleri hariç, 3 Eylül’de 1 ödenen sipariş/3.000 TL ve 4 Eylül’de 1 iade/1.500 TL gösteriyor. Dönem net tahsilatı 1.500 TL. GA4’te satın alma ve gelir sıfır. İadenin aynı siparişe ait olduğu günlük toplamlardan kanıtlanamaz; bu nedenle sipariş bazlı eşleme gerekli.
3. **Organik talep büyüyor:** GSC tıklamaları önceki eşit dönemde 127 iken 275 olmuş (+%116,5). Ders planı içeriği somut giriş noktası. Bunu okul demo talebine ve uygun sete bağlamak, sadece yeni blog sayısı artırmaktan daha öncelikli.
4. **Reklam niyeti dağınık:** İncelenen en yüksek maliyetli 40 arama teriminde “2 sınıf” içeren 7 terim 272,02 TL/40 tıklama üretmiş. Woody’nin okul öncesi teklifine uyumu zayıf; otomatik toplu negatifleme yerine tek tek niyet denetimi gerekli.
5. **Tanitio sosyal bağlantıları kapalı:** Facebook/Instagram/YouTube hesap satırları pasif; ilgili dönemde hesap analitiği yok. 38 içerik taslak. Bu, gerçek sosyal hesaplarda hiç paylaşım olmadığı anlamına gelmez. GA4’te Instagram kaynakları ziyaret ve WhatsApp ilgisi getiriyor.
6. **Satın alma yolu iyileştirilebilir:** Ev & Özel Ders seviye düğmeleri seçilen ürünü korumuyor. PRO’nun satış karşılığı belirsiz. Mobil mağazada ebeveynin ürünü, uzun Mini School bölümünün altında kalıyor.
7. **AI karar kalitesi sorunu var:** 30 hafıza kaydı içinde “son 30 gün” başlığı altında 9 günlük eksik snapshot özeti ve tutarsız CPC/CTR hesabı bulunuyor. Küçük örneklemli yaş/saat “kazananları” çok yüksek güvenle yazılmış; reklam kararına doğrudan taşınmamalı.

**Önerilen sıra:** P0 ölçüm/finans/hafıza → P1 satış yolu ve lead operasyonu → P2 kontrollü reklam/SEO → P3 yeterli kanıtla büyütme. Aşağıdaki süreler iş sırası tahminidir; ekip ve onaylara bağlıdır.

## 2. İnceleme yöntemi, kapsam ve veri sınırları

Tanitio’nun aşağıdaki sayfalarını besleyen **canlı backend modülleri, Google API’leri ve tenant kapsamlı veritabanı kayıtları** okundu. Panelde oturum açılarak her sekmenin görsel doğrulaması yapılmadı; sayfa verisi ve yerel arayüz kodu incelendi. Woody’nin kamuya açık sitesi ise gerçek Chromium ile 1440 px masaüstü ve 390 px mobil görünümde açıldı. Form gönderilmedi, sipariş/ödeme başlatılmadı. QA sırasında belirli analitik toplama hedefleri engellendi; uzun beklemeli doğrulamada `analytics.google.com` toplama isteği de oluştu. Bu tek test ziyareti güncel güne yansıyabilir; raporun sayısal snapshot’ları bu testten önce alındı.

| Kanıt | Kapsam / dönem | Kullanım sınırı |
|---|---|---|
| GA4 canlı derin rapor | 12 Ağustos–8 Eylül; önceki 15 Temmuz–11 Ağustos; 28 gün | Bugün eksik; 90 günlük kontrol de alındı. Kullanıcı/oturum/olay birbirine eşit değildir. |
| GSC canlı API | 9 Ağustos–5 Eylül; önceki 12 Temmuz–8 Ağustos | 3 günlük gecikme; mülk toplamı ile görünür sorgu toplamı ayrı. |
| Google Ads canlı API | 11 Ağustos–7 Eylül, kapanmış 28 gün | Dönüşümler eylem bazında ayrıştırıldı; gerçek gelir atfı yok. |
| Woody Commerce imzalı API | 11 Ağustos–7 Eylül, Europe/Istanbul; HTTP 200 | `testOrdersExcluded=true`; günlük toplulaştırma. Banka mutabakatı ve tüm offline satışlar bu raporda yok. |
| GTM canlı API | 8 Eylül anlık | Sürüm/kurulum bilgisi, tek başına tarayıcı çalışmasının kanıtı değildir. |
| Rakip keşfi | 8 Eylül Yandex, 30/30 sorgu | Google sıralaması veya rakip trafiği değildir. |
| Strateji, hafıza, sosyal kayıtları | 8 Eylül canlı tenant kayıtları | AI çıkarımları bağımsız kaynak sayılmaz. |
| Site / repo | 8 Eylül tarayıcı + mevcut çalışma ağacı | Repo değişiklikleri olabilir; yerel kodun tamamının canlı olduğu varsayılmadı. |

Woody sunucusuna eski deploy notundaki SSH bilgileriyle erişim doğrulanamadı. Bu yüzden güncel PayTR test modu, ölçüm outbox durumu ve sipariş bazlı veritabanı satırları doğrudan okunamadı. Finansal sonuç, çalışan imzalı entegrasyonun döndürdüğü doğrulanmış ödeme toplamlarına dayanıyor. Başarılı ödeme düğmesi görüntüsü, ödeme sağlayıcısının tüm uçtan uca akışının test edildiği anlamına gelmez.

GA4 / Ads / GSC dönemleri aynı değil; aşağıdaki farklı kaynak sayıları birebir dönüşüm oranı hesaplamak için birleştirilmedi. Gelir ile reklam değeri, Yandex konumu ile Google konumu birleştirilmedi.

## 3. Sayfa bazında Woody durumu

### 3.1 `/analytics-ga4` — ziyaret büyüyor, satış ölçümü eksik

Mülk `500518307`, ölçüm kimliği `G-0D7LYLF51K`; izinli hostlar kök domain ve www. Tenant profili hâlâ `lead`. Artık hem kurumsal lead hem e-ticaret olduğu için tek hedefli tanım eksik kalıyor.

| Metrik | Son 28 gün | Önceki 28 gün | Yorum |
|---|---:|---:|---|
| Aktif kullanıcı | 170 | 100 | +%70; müşteri sayısı değildir. |
| Oturum | 269 | 115 | +%133,9; test/izin etkileri ayrıca incelenmeli. |
| Sayfa görüntüleme | 1.319 | 480 | Daha fazla dolaşım; tek başına satın alma niyeti değil. |
| Önemli olay | 34 | 15 | Tamamı `whatsapp_click`; gerçek görüşme/satış değil. |
| Etkileşim oranı | %70,26 | %79,13 | 8,87 yüzde puan düşüş. Trafik karışımı da değişmiş. |
| Satın alma / satın alma geliri | 0 / 0 TL | 0 / 0 TL | Finans kaynağıyla uyumsuz. |

Kaynak örnekleri: Google organik 77 oturum/9 önemli olay; Instagram referral 60/15; `ig / social` 16/2; Google CPC 41/4; doğrudan 54/4. API satırları toplamının mülk oturumuyla birebir eşit olması beklenmez; bu tablo bir kaynak sıralamasıdır.

Ödeme olayları: `view_item=12`, `add_to_cart=4`, `begin_checkout=18`, `add_payment_info=9`, `purchase=0`. **Bunlar sıralı kullanıcı hunisi değildir.** Doğrudan satın al akışı, olayların yakın zamanda eklenmesi ve test trafiği nedeniyle checkout sayısı sepet sayısından büyük olabilir. “Sepetin %100’ü terk edildi” sonucu çıkarılamaz.

**Yapılacaklar:**

- Satın alma/iade ile ödeme kaynağı mutabakatı; izne uygun ölçüm, tek transaction ID, test siparişi ayrımı.
- `whatsapp_click` → görüşme başladı → nitelikli lead → teklif → kazanılan satış aşamalarını ayrı kaydetme.
- `quote_form_submit` ve `generate_lead` isimlerini mevcut iki form akışında denetleme; yalnız başarılı sunucu kaydından sonra olay.
- PayTR referral kaynaklı 17 oturum için istenmeyen yönlendirme ve önceki kampanya atfını test etme. Kodda return sayfasına `ignore_referrer` eklenmiş olması geçmiş veriyi düzeltmez.
- Reklamdaki 621 tıklama ile GA4’te 41 CPC oturumu büyük bir tanı farkı. Dönem farkı, izin, reklam engelleyici, yönlendirme, etiketin geç yüklenmesi ve GCLID korunması ayrı kontrol edilmeli; aradaki fark “boşa giden bütçe yüzdesi” değildir.

### 3.2 `/search-console` — büyüyen girişleri satışa bağlama

Mülk URL-prefix olarak doğru domain/protokolle eşleşiyor.

| Metrik | Güncel | Önceki |
|---|---:|---:|
| Tıklama | 275 | 127 |
| Gösterim | 5.429 | 5.840 |
| CTR (tıklama/gösterim) | %5,07 | %2,17 |
| Ortalama konum | 9,46 | 10,48 |

Mobil 180/275 tıklama (%65,5); Türkiye 194/275 (%70,5). Yabancı dil trafiğinin tamamı Türkiye satış hedefiyle aynı değerde değil. Yeni ülke sayfası üretmek yerine mevcut ülkelerin distribütör/teslimat hedefleri tanımlanmalı.

Öncelikli giriş sayfaları:

| Sayfa | Tıklama / gösterim | Satışa bağlama önerisi |
|---|---:|---|
| `/tr` | 94 / 2.010 | İlk görünümde “Okulum için” ve “Evde kullanım için” yolları. |
| `/tr/blog/anaokulu-ingilizce-ders-plani-nasil-hazirlanir` | 54 / 435 | İçerikle uyumlu örnek ders planı, ardından kurum demo talebi. |
| `/tr/store` | 11 / 227 | Ürün/seviye seçimini koruyan doğrudan giriş. |
| `/tr/blog/4-5-6-yas-ingilizce-egitimi` | 7 / 346 | Yaş + mevcut İngilizce düzeyi üzerinden uygun set. |
| `/tr/blog/anaokulu-ingilizce-egitim-seti-nasil-secilir` | 7 / 170 | Set içeriği / kullanım biçimi / fiyat karşılaştırması. |

“woody” tek kelimesi 1.533 gösterim/0 tıklama almış. Belirsiz marka adı farklı arama niyetlerini içerir; sırf gösterimi yüksek diye ilk ticari SEO hedefi yapılmamalı. Açık marka sorguları “woody and friends” 42 ve “woody ve arkadaşları” 13 tıklama getiriyor.

Görünür sorgular toplamı yalnız **69 tıklama**; mülk toplamı 275. Görünür sorgulardaki markalı 58 / markasız 11 sayılarından tüm organik trafiğin marka payı hesaplanamaz. GSC anonimleştirilmiş sorguları gizleyebilir.

**Teknik plan:** Mevcut URL/redirect/hreflang iyileştirmelerini koru; öncelikli 5 sayfada güncel canonical, HTTP, sitemap ve URL Inspection kontrolü yap. Geçmiş rapordaki yüzlerce indeks sorununun hâlâ açık olduğunu varsayma. Ürün yapılandırılmış verisinde güncel fiyat/stok/para birimi ve gerçek ürün URL’si tutarlı olsun. Yapay değerlendirme veya yıldız eklenmesin.

### 3.3 `/tag-manager` — boş kapsayıcı ile çalışmayan ölçümü karıştırmayalım

`GTM-NLFVCDZW` canlı sürüm 4; etiket, tetikleyici ve özel değişken sayısı sıfır. Çalışma alanında bekleyen değişiklik yok. Uzun beklemeli canlı tarayıcı kontrolü `G-0D7LYLF51K` için doğrudan gtag yüklemesini ve `AW-17456893817` Ads yapılandırmasını doğruladı. Bu kontrolde GTM yüklenmedi; ölçüm tamamen kapalı değil.

Yerel `AnalyticsScripts.tsx`, geçerli GTM varsa GTM’yi; yoksa GA4/Ads gtag’ini seçiyor. Bu nedenle canlı sitedeki **gerçekte çözümlenen ayar** kontrol edilmeden Tanitio’daki GTM numarasına bakarak etiket eklemek tehlikeli: yanlış yapılandırmada boş GTM ölçümü kesebilir, paralel kurulumda çift sayım olabilir.

Yerel `ClientLayout.tsx` analitiği 5 saniye sonra, ardından idle callback ile başlatıyor (ek 2,5 saniyeye kadar zamanlama). Kısa ziyaret ve hızlı CTA için kayıp riski var. Bu bir kod bulgusudur; kaybın büyüklüğü ölçülmedi. İlk hızlı tarayıcı kontrollerinde etiket görünmedi; uzun beklemeli kontrolde ilk GA4 page_view isteğinin `tfd` değeri yaklaşık 6,6 saniyeydi. Bu tek tarayıcı gözlemidir, tüm kullanıcılar için performans ortalaması değildir. [Etiket kanıtı](reports/woody-satis-audit-2026-09-08/measurement-summary.json).

**Hedef:** Tek ölçüm sahibi seçimi, izin verilmiş/verilmemiş iki yolun doğrulanması, ilk yükleme ve SPA geçişinde tek page_view, başarılı formda tek lead, onaylı ödemede tek purchase. Önce çalışma kanıtı; sonra gerekiyorsa GTM’ye kontrollü geçiş. GTM’yi doldurmak başlı başına başarı ölçütü değildir.

### 3.4 `/analytics` — sosyal, ölçüm ve finans kaynakları

Canlı Tanitio kayıtlarında Facebook, Instagram ve YouTube hesapları pasif. Son 28 gün için `account_analytics` satırı yok. Gönderi havuzu: Facebook 12, Instagram 16, YouTube 10 taslak; bu tenant kapsamında yayınlanmış kayıt görünmüyor. Meta özet çağrısı page/access token bulunamadı hatası verdi. **Bu bulgu dışarıdan yürütülen sosyal faaliyeti kapsamaz.** Instagram kaynaklı GA4 ilgisi zaten mevcut.

Woody Commerce günlük API’si çalışıyor; buna karşılık inceleme anında Tanitio `ecommerce_orders_daily` Woody önbelleğinde satır yok. Yerel sayfa kodu açılışta senkronizasyon çağırıyor; bu yüzden boş cache tek başına canlı ekranın da boş kaldığını ispatlamaz. Panelde taze veri ve hata görünümü ayrıca doğrulanmalı.

Yerel arayüzde tarih seçimiyle ticaret günleri değişirken GA4 funnel çağrısı sabit 28 gün. `adSpend:0` ile kâr servisi çağrılıyor; görünür kart “net gelir” olarak etiketlenmiş, kâr iddiası yapmıyor. Gelecekte kâr kartı eklenirse bu değer gerçek reklam gideri, maliyet, kargo, komisyon ve iadeler olmadan kullanılmamalı.

**Hedef:** Kaynağı/tarihi açık dört ölçü: ziyaret ve lead; doğrulanmış ödeme; iade sonrası tahsilat; maliyetler tamamlanınca katkı kârı. Sosyal bağlantı kurulunca gerçek hesap metrikleri ayrı gösterilmeli. Taslak sayısı yayın veya erişim başarısı diye sunulmamalı.

### 3.5 `/rakip-kesfi` — 181 alan adı var, hepsi doğrudan rakip değil

Son Yandex keşfi 30/30 sorguda tamamlanmış; 593 sonuç, 181 alan adı. Woody taramada 30 sorgunun 17’sinde görünmüş. Önceki Brave koşusu da var. Kaynaklar arasında konum farkı Google performans değişimi sayılmaz.

| Alan adı | Göründüğü sorgu | Ortalama tarama konumu | Yorum |
|---|---:|---:|---|
| novakidschool.com | 28 | 4,1 | Ebeveynin İngilizce çözümü bütçesi için alternatif; fiziksel setle aynı ürün değil. |
| flalingo.com | 19 | 2,8 | Yaş bazlı kurs çözümü; mesaj/ilk deneme deneyimi açısından incelenebilir. |
| multibem.com.tr | 15 | 7,2 | Eğitim materyali/içerik rekabeti; ürün bazında uygunluk kontrolü gerekir. |
| touchenglish.com.tr | 9 | 8,6 | Basılı+dijital eğitim seti açısından daha yakın karşılaştırma. |

YouTube, Wordwall, sözlük ve eğitim kaynağı siteleri ayrı “içerik/kanal” sınıfında tutulmalı. Keşifte İtalyanca sorgu da var; Türkiye ticari sorguları ile çok dilli araştırma aynı fırsat sıralamasında karışmamalı. `impressions` alanı ilgili Woody GSC sorgularından gelen kapsam bilgisidir; rakibin gerçek Google gösterimi değildir ve domainler arasında toplanamaz.

11 izlenen kayıt var: 4’ünde rapor mevcut (Touch English, Kidsnook Class, Pingu’s English Turkey, English Home PRE-K); 7 yeni kayıtta rapor henüz yok (Novakid, Flalingo, Cambly, American Life, Konuşarak Öğren, TAA Ankara, Twinkl). Bu inceleme yeni rapor üretim işini tetiklemedi. Yeni raporlar aynı kanıt sözleşmesiyle ayrı iş olarak sıraya alınmalı.

**Rakipten çıkarılacak satış dersleri:** Yaş/kullanım biçimini net anlatmak; içerikten ürüne açık geçiş; ebeveyn için kısa demo, öğretmen için uygulanabilir ders örneği. Novakid’in resmi okul öncesi sayfasındaki oyun/fiziksel etkinlik anlatımı kategori için bir mesaj örneği; Woody’nin özgün fiziksel set + ders planı + dijital destek vaadi kendi gerçek materyaliyle ispatlanmalı. Rakiplerin fiyatı, satış adedi veya ROAS’ı bu keşiften bilinemez.

Önizlemeler tarihli önbellekten gösterilmeli; firma kartının her açılışında rakip site tekrar çağrılmamalı. İlk alma / açık yenileme / süreli arka plan güncellemesi ayrılmalı; rakip verisi Woody finans/GA4 tablolarına yazılmamalı.

### 3.6 `/strateji` — lead stratejisinden iki satış yoluna

Kayıt revizyon 1; birincil hedef WhatsApp/teklif lead’i. Kurum/öğretmen ana, 3–6 yaş ebeveyn ikincil kitle; Türkiye ve ileride Almanya/Rusya distribütör odağı var. E-ticaret eklenmişken strateji bu yeni yolu yeterince temsil etmiyor.

Önerilen güncelleme taslağı:

- **Kurum yolu:** 30+ öğrenci okul modeli → sınıf/öğrenci sayısı → örnek uygulama/demo → teklif → sözleşme/tahsilat. Öğretmen başvurusu müşteri lead’i olarak sayılmamalı.
- **Küçük grup yolu:** Mini School 3–5 kişilik kullanım; öğrenci setinde en az 3 adet; öğretmen setinin ayrı maliyeti. Ekranda toplam başlangıç maliyeti açık olmalı.
- **Ev/özel ders yolu:** 1–2 kişilik kullanım → mevcut düzey/yaş → örnek içerik → uygun set → ödeme → dijital erişim ve ilk hafta yönlendirmesi.
- **Ana vaat taslağı:** “Kitap, oyun, ders planı ve dijital içeriği birlikte kullanarak okul öncesi İngilizceye yapılandırılmış başlangıç.” Öğrenme sonucu/süre garantisi verilmemeli.
- Cambridge yaklaşımı/sertifika söylemi belge ve paket kapsamıyla netleştirilmeli. Ana sayfada sertifika alımını kesinmiş gibi anlatan metin var. Resmî yetki, sınav koşulu ve ek ücret açıklanmalı. Daha önce kaldırılan Cambridge logosu geri eklenmemeli.

### 3.7 `/ai-hafiza` — yanlış özet otomatik karar üretmemeli

30 kayıt mevcut. Somut örnek: `2181c537-464b-449d-9cc4-6f64f1ba6dab` kaydı “son 30 gün” diyor ama kanıtında 30 Ağustos–7 Eylül snapshot’ları var. 128,65 TL/11 tıklama ile yazılan 9,63 TL CPC aritmetik olarak tutarsız: aynı toplamlardan 11,70 TL çıkar. 11/795 CTR %1,38 iken metinde %0,55 denmiş. Canlı kapanmış 28 günlük toplam 4.278,56 TL/621 tıklama. Bu kayıt bütçe kararında kullanılmamalı.

45–54 yaş, 08:00 saati ve mikro şehir “kazanan” çıkarımları birkaç dönüşüm ve tahmini lead değerine dayanıyor. Yüksek confidence, istatistiksel kesinlik veya satış kanıtı değildir. 65+ dışlama, yalnız kadınlara yönelme veya dar saat kapatma bu kanıttan çıkarılamaz.

**Düzeltme planı:** Kayıtları silmek yerine şüpheli/eski işaretle; mutlak tarih, para birimi, örneklem, kaynak run kimliği, eylem adı ve hesap formülü ekle; yenisiyle ilişkilendir. “Gözlem” ve “öneri” ayrı; çelişen kayıt karar motoruna girmesin. Bu turda hafıza değiştirilmedi.

## 4. Web sitesinde somut satış iyileştirmeleri

### 4.1 Çalışan yapıyı koruyalım

Ana sayfa, mağaza, okul, ev/özel ders ve gerçek mağaza checkout bağlantıları HTTP 200. 390 px kontrolde ana sayfalarda yatay taşma görülmedi. Mağazada 9 ürün var. Mini School öğrenci checkout’u varsayılan 3 adet / minimum 3 / toplam 7.500 TL gösteriyor; Home Basic 1 adet / 3.000 TL. Minimum adet işlevi var; yeniden yazılmamalı, backend doğrulaması ayrıca test edilmeli.

Ödeme ekranı kişisel/adres alanları, sözleşme bağlantıları, PayTR düğmesi ve sipariş toplamı sunuyor. Canlı ödeme bu audit sırasında denenmedi. `/tr/checkout` 404; site bu URL’ye yönlendirmiyor, doğru yol `/tr/store/checkout?product=...`. Bu 404 ürün hatası olarak listelenmedi.

### 4.2 Öncelikli değişiklikler

| Öncelik | Gözlem | Önerilen değişiklik | Başarı kanıtı |
|---|---|---|---|
| P1 | Ev sayfasındaki dört seviye CTA’sı aynı `/tr/store` adresine gidiyor. | Aktif seviyeyi ilgili ürün detayı veya mevcut ürün-parametreli checkout’a taşı; kullanıcı seçimini kaybetmesin. | Basic/Junior/Senior doğru ürün ve fiyatla açılır. |
| P1 | PRO anlatımı ve Satın Al var, mağazada PRO yok. | Ticari karar: teklif/“bilgi al” veya satış dışı içerik. Olmayan ürüne satış vaadi verme. | PRO CTA’sı gerçek bir sonraki adımla eşleşir. |
| P1 | Ebeveyn ürünleri Mini School listesinden sonra geliyor. | Reklam/ev sayfasından Ev & Özel Ders bölümüne odaklı giriş veya ayrı açılış; genel mağazanın onaylı sırasını koru. | 390 px’de hedef ürün ilk anlamlı ekranda erişilebilir. |
| P1 | Kartların içeriği kısa, karar için video gerekiyor. | “Kutuda ne var / kim uygular / dijital erişim süresi / öğretmen desteği / teslimat” özetleri. | Kullanıcı demo izlemese de hangi ürünü aldığını anlar. |
| P1 | Mini School 2.500 TL birim fiyatın gerçek ilk ödeme karşılığı 7.500 TL. | Kartta mevcut min3 notuna ek “3 öğrenci: 7.500 TL” örneği; öğretmen seti dahil/değil netliği. | Fiyat sürprizi yok; tutar API’den hesaplanır. |
| P1 | B2B teklif formu uzun ve sayfa aşağısında. | İlk ekrandan mevcut forma ankraj; zorunlu alanları iş ihtiyacına göre azalt; kalan bilgiyi görüşmede topla. | Başarılı gerçek kayıt + lead ID; başarısızlıkta girilen alanlar korunur. |
| P2 | İçerik trafiği var; ticari sonraki adım zayıf. | Ders planı yazısına ilgili demo/kurum CTA’sı; yaş yazısına level finder/ev seti geçişi. | Kaynak içerik → ürün/lead geçişi ölçülür. |
| P2 | Mobil sayfa uzun, footer geniş. | İlk görünümde ürün ve kısa güven bilgisi; teslimat/iade gibi ayrıntıda erişilebilir aç/kapa. | Klavye/ekran okuyucu ve mobil hedef boyutları doğrulanır. |

Güncel canlı Senior fiyatları: Mini School öğretmen **4.650 TL**, Ev Senior **4.750 TL**. Ağustos raporundaki 3.750/4.250 TL ile farklı. Bu fark “yanlış fiyat” diye geri alınmamalı; ticari onaylı güncel katalog ve checkout tek kaynak olmalı. Eski seed fiyatlarıyla canlı katalog ezilmemeli.

### 4.3 Reklamdan gelecek iki açılış sayfası

**Ebeveyn:** kullanım biçimi/yaş → 30–45 saniyelik gerçek ürün demosu → hangi set uygun → içerik ve dijital erişim → güncel fiyat/teslimat → satın al → kısa SSS. İngilizce bilmeyen ebeveynin nasıl kullanacağını gerçek ürün olanaklarına göre açıkla. Eğitimci desteği yoksa varmış gibi vaat etme.

**Kurum:** 30+ öğrenci koşulu → öğretmen uygulama örneği → öğrenci ve öğretmen seti farkı → örnek ders planı → kısa demo/teklif talebi. Küçük kurum/atölye kullanıcılarını Mini School’a yönlendir; uygun olmayan talep tamamen kaybolmasın.

Seviye bulucu zaten var; yenisini kurmak yerine önerdiği seviye → aktif ürün eşlemesini tamamla. Mevcut katalogda bulunmayan veya uygun olmayan seviyeyi otomatik ödeme sayfasına gönderme.

## 5. Reklamları nasıl yönetelim?

### 5.1 Mevcut durum

Tek aktif Search-1 kampanyası: SEARCH, Maximize Conversions, 150 TL/gün. API bütçe kısıtlı durumunu bildiriyor. 28 günlük harcama 4.278,56 TL; 29.387 gösterim; 621 tıklama; CTR %2,11; CPC 6,89 TL. 23 lead eylemi için raporlanan CPA 186,02 TL. Bu **müşteri edinme maliyeti değildir**.

WhatsApp/form/telefon dönüşüm eylemleri primary. GA4 purchase içe aktarımı HIDDEN ve secondary. Bu kurgu, satış hacmi yerine tıklama/lead hacmini ödüllendiriyor. Secondary ayarı tek başına yeterli kontrol değil; kampanya özel hedeflerine dahil edilme de incelenmeli.

En yüksek maliyetli 40 terim toplam 1.489,97 TL; tüm hesabı kapsamaz. “ingilizce oyunu kelime öğren” tek başına 212,78 TL/27 tıklama/0 lead dönüşümü. “okul öncesi ingilizce eğitim seti” 149,03 TL/13 tıklama/1 lead eylemi. Bu örnekler ücretli set niyetini genel oyun arayışından ayırmak için yeterli işaret; kârlı kelime ilan etmek için yetersiz.

### 5.2 Uygulanacak yönetim modeli

1. **Ölçüm hedeflerini onar:** E-ticaret kampanyası doğrulanmış purchase; kurum kampanyası başarılı başvuru ve mümkün olduğunda CRM’den qualified lead/kazanılmış satış. WhatsApp/telefon tıklamaları ayrı izleme metriği. Bidding hedefi değişimini doğrulama süreciyle kademeli yap; çalışan hedefi körlemesine kaldırma.
2. **Niyete göre yapılandır:** Marka koruma; kurum seti/anaokulu programı; ebeveyn ev seti. 150 TL/gün gibi sınırlı toplamı çok sayıda kampanyaya bölme. Önce tek ticari hipotezi iki reklam grubuyla test etmek ve marka talebini ayrı raporlamak daha yönetilebilir.
3. **Arama terimleri:** “2 sınıf”, Wordwall ve ücretsiz oyun beklentisini tek tek ele al. “Oyun” sözcüğünü genel negatif yapma; Woody’nin ana pedagojik vaadi oyun temelli. Ücretsiz örnek ders içeriğinin de üst huni değeri olabilir; satış kampanyasıyla ayrı ölç.
4. **Reklam → sayfa eşlemesi:** Ev seti reklamını okul teklifi sayfasına veya mağazanın başka bölümüne gönderme. Ürün fiyatı, kullanım biçimi ve paket içeriği reklamla aynı olsun.
5. **Bütçe kararı:** İlk kontrollü dönem için mevcut 150 TL/gün seviyesini üst sınır adayı kabul et; otomatik artış yapma. Google günlük harcaması dalgalanabilir; 150 × 30 = 4.500 TL yalnız planlama yaklaşımıdır, sağlayıcı fatura garantisi değil. Gerçek aylık hesap limitleri onay sırasında kontrol edilmeli.
6. **Teklif stratejisi:** Yanlış mikro hedeflerle Maximize Conversions devam etmesin. Doğru hedefte düşük hacim varsa süreli, CPC sınırı olan trafik deneyi değerlendir; kalıcı geçiş/tCPA/tROAS değeri doğrulanmış satış ve marj olmadan belirlenmesin. Her değişiklik sonrası dönüşüm gecikmesini kapsayan değerlendirme aralığı kullan.
7. **Kitle:** Çocuklara değil satın alma kararını veren yetişkinlere hitap et. Yalnız 2 dönüşümle yaş/saat/şehir kapatma yapma. Kurumsal rol ve ürün uygunluğunu form/CRM’de ölç.

**Örnek reklam metni taslakları (yayınlanmadı):**

- Kurum: “Anaokulunuz İçin İngilizce Seti” / “Ders Planı, Oyun ve Dijital İçerik” → mevcut `/tr/preschool`; CTA “Kurumunuza uygun demo ve teklif isteyin”.
- Ev: “Evde İngilizceye Oyunla Başlayın” / “Woody Ev & Özel Ders Setleri” → `/tr/home-tutor` iyileştirildikten sonra; CTA “İçeriği görün, uygun seviyeyi seçin”.
- Fiyat yalnız canlı katalogdan; sertifika, ücretsiz demo, sonuç garantisi ve destek kapsamı işletme onayı olmadan reklama eklenmez.

### 5.3 Meta / Instagram

Önce gerçek hesap ve reklam hesabı bağlantılarını doğrula. Bu audit Meta kampanya gideri/performansı verisine erişmedi; “Meta reklamı çalışmıyor” veya “şu bütçe kârlı” denemez.

Instagram referral + `ig/social` satırları toplam 76 oturum ve 17 önemli olay gösteriyor; attribution etiketleri standart değil, bunun hepsinin organik olduğu kesin değil. İlk içerik testi: gerçek set açılımı; öğretmenin bir oyunu uygulaması; evde ilk kullanım rehberi. Her birine doğru videodan kapak, belirgin tek CTA ve standart UTM.

38 taslağı topluca yayınlama. Önce güncel fiyat/ürün/kapak/dil/izin açısından seçilecek küçük bir paket incele; içerik başına hedef ürün/lead yolu tanımla. Yeniden pazarlama, izin ve yeterli kitle hacmi doğrulanınca değerlendir; bu trafik büyüklüğünde büyük ayrı bütçe önermiyorum.

### 5.4 Kârlılık kararını hangi hesapla verelim?

- Net tahsilat = ödeme toplamı − iadeler. Bu dönemde yalnız API kapsamındaki online akışta **1.500 TL**.
- Sipariş katkısı = KDV/muhasebe tanımı netleştirilmiş gelir − ürün maliyeti − kargo desteği − ödeme komisyonu − değişken destek/iade maliyeti.
- İzin verilebilir CAC = sipariş katkısı − istenen sipariş başına kâr.
- İzin verilebilir nitelikli lead maliyeti = izin verilebilir CAC × lead’den satışa kapanış oranı.
- Ürün marjı, offline satışlar ve kaynak atfı eksik; kâr, gerçek reklam ROAS’ı ve güvenilir bütçe artış tutarı bu verilerle hesaplanamaz. 4.400/4.278,56 = 1,03 **lead dönüşüm değeri oranıdır**, satış ROAS’ı değil.

## 6. Satış operasyonu: gelen ilgiyi siparişe çevirme

Woody admin’de mevcut contact/quote/order yapısını kullan; paralel müşteri listesi kurma. Önerilen aşamalar: yeni → ulaşıldı → uygun/nitelikli → demo → teklif → kazanıldı/kaybedildi. Minimum kayıt: kaynak/kampanya, kullanım tipi, kurum öğrenci sayısı veya uygun ürün, sorumlu, sonraki işlem tarihi, kayıp nedeni. İsim/telefon gibi kişisel bilgiler analitik olaya gönderilmez.

İşletmenin teyidiyle çalışma saatlerinde ilk yanıt hedefi belirle (örneğin 30 dakika **öneri**, mevcut performans değil). Kurum demo sonrası aynı gün teklif özeti; 2 ve 5 iş günü takip görevleri. Bunlar otomatik mesaj gönderim izni değildir; mevcut iletişim ve onay süreçleri korunur.

Satın alma sonrası: ödeme/dijital erişim/kargo durumunun tek ekranda açıklanması; ilk kullanım rehberi; uygun zamanda gerçek kullanım geri bildirimi. Memnuniyet veya tekrar satın alma oranı şu an bilinmiyor. Çocuk görselleri/yorumları yalnız izinli gerçek kanıttan kullanılmalı.

## 7. 30 günlük çalışma sırası ve ölçüm planı

| Dönem | Çıktı | Sorumlu ortam | Çıkış kapısı |
|---|---|---|---|
| Gün 1–3 | Ödeme/GA4 mutabakatı; etiket çözümleme; geçersiz hafıza karantinası | Woody + Tanitio | Test ve gerçek ödeme ayrımı; kaynak/tarih tutarlı. |
| Gün 4–7 | Seviye → ürün geçişi, PRO kararı, ürün açıklıkları, lead aşamaları | Woody | Mobil iki satış yolu ve başarılı lead kaydı doğrulanır. |
| Gün 8–14 | Tek kontrollü reklam hipotezi, terim temizliği, 3 içerik taslağı, öncelikli blog CTA’ları | Ads / Woody / Tanitio | Onaylı kapsam/bütçe; ölçüm çalışıyor; taslaklar gözden geçirilmiş. |
| Gün 15–30 | Kaynak bazlı qualified lead/satış, kayıp nedenleri, maliyetlerle haftalık değerlendirme | İşletme + Tanitio | Yeterli hacim ve kapanış gecikmesi görülünce büyüt/düzelt/durdur kararı. |

Haftalık rapor: kapanmış aynı 7 gün ve önceki 7 gün; düşük hacim için yanında 28 gün. GSC ayrı gecikmeli pencere. Gösterilecekler: harcama, ticari sorgu tıklaması, nitelikli lead, gerçek ödeme, iade, net tahsilat, marj tamamlanınca CAC/katkı. Paydası sıfır oranlar 0 başarı diye gösterilmez.

Bu trafik düzeyinde aynı anda çok değişkenli A/B testleri yerine ardışık, tarihli değişiklik ve kullanıcı görev testi daha uygulanabilir. 30 günde kesin satış artışı yüzdesi vaat edilmez. Ölçüm başarısı önce deterministik kabul testleriyle, ticari başarı gerçek müşteri sonucuyla değerlendirilir.

## 8. Uygulama öncesi işletmeden netleşmesi gerekenler

Bunlar raporu durduran sorular değil; ilgili uygulama maddesinin karar girdileridir:

- Öncelik kurum anlaşması mı, ev seti online satışı mı? İlk reklam deneyi hangisine ayrılacak?
- Güncel ürün maliyetleri, kargo, komisyon, iade ve hedef kâr; offline satışların kaynağı.
- PRO seviyesi nasıl temin ediliyor? Güncel fiyat ve ürün kapsamının yetkili onayı.
- Cambridge sertifika/ilişki belgeleri ve müşteriye sunulan gerçek kapsam.
- Lead’lere kim, hangi saatlerde dönecek? Demo kapasitesi nedir?
- Sosyal/reklam hesabı bağlantısı ve ilk testin harcama üst sınırı.

## 9. Kaynaklar ve yeniden çalışma notları

Birincil sayısal kanıt: [evidence.json](reports/woody-satis-audit-2026-09-08/evidence.json); tarayıcı metin/URL kanıtları: [ilk tarama](reports/woody-satis-audit-2026-09-08/browser-evidence.json), [ürünlü checkout](reports/woody-satis-audit-2026-09-08/browser-follow.json). Bu dosyalarda müşteri PII’si veya API sırrı yoktur.

Resmî ürün sayfaları: [Woody ana sayfa](https://woodyvearkadaslari.com/tr), [mağaza](https://woodyvearkadaslari.com/tr/store), [ev/özel ders](https://woodyvearkadaslari.com/tr/home-tutor), [okul](https://woodyvearkadaslari.com/tr/preschool). Rakip mesaj örneği: [Novakid okul öncesi](https://www.novakidschool.com/tr/education/preschool/).

Teknik referanslar: [Google Ads dönüşüm hedefleri](https://support.google.com/google-ads/answer/10995103?hl=en), [primary/secondary ve özel hedef istisnası](https://support.google.com/google-ads/answer/11461796), [GA4 e-ticaret olayları](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce), [transaction ID ile doğrulama](https://developers.google.com/analytics/devguides/collection/ga4/validate-ecommerce).

Mevcut repo kararları: `WOODY-REVIZE-CEKLIST.md`, `WOODY-REVIZE-RAPORU-2026-08-30.md`, `WOODY-REVIZE-DEPLOY-NOTU.md`. Güncel canlı fiyat bu eski belgelerden farklı olabilir. Çalışma ağacındaki eşzamanlı değişiklikler korunmuştur. Bu raporla kod, tenant ayarı, reklam, hafıza kaydı veya yayın durumu değiştirilmedi.
