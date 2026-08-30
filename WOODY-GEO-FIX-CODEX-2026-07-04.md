# Woody GEO/AI-SEO Düzeltme — Codex Görev Listesi

> **Tarih:** 2026-07-04 · **Mimar:** Claude Code · **Uygulayıcı:** Codex
> **Kaynak:** GeoSerra GEO Analiz Raporu (`reports/woodyvearkadaslari-geo-raporu-2026-07-04.pdf`) — **GEO Skoru 54/100** (Ortalamanın Altında)
> **Hedef:** 90 günde ~70/100. Teknik iskelet güçlü (86/100); sorun içeriğin AI'ya görünmemesi + marka otoritesi + güven katmanı.
>
> Canlı doğrulandı (2026-07-04): og:image **404**, llms-full.txt **text/html 141KB**, **HTTP/1.1**, ana H1 **"Welcome To Woody World"** (İngilizce), FAQ client-side.

## Sahip etiketleri
- **[CODEX]** = frontend/backend kod işi
- **[DEVOPS]** = VPS/nginx/DNS (Orhan uygular, komut verildi)
- **[İÇERİK]** = admin panel / DB içeriği (dinamik içerik kuralı — koda gömme)
- **[HARİCİ]** = pazarlama/PR/hesap açma — kod DEĞİL (Orhan/müşteri), çekliste tamlık için var

## ⚠️ Önce oku — bugünkü düzeltmelerle uyum
Bugün ayrı bir işte (GSC index fix) şunlar yapıldı: locale-siz→308 redirect, sitemap 651→521, www→apex 301, **geçersiz Product JSON-LD kaldırıldı** (ürünlerde fiyat yok). GEO raporu "Product şeması eksik" diyor — bu ÇELİŞKİ DEĞİL: fiyat verisi olmadan geçerli Product/Offer üretilemez. Doğru aksiyon: **llms.txt'teki yanlış "Product+offers" iddiasını düzelt** (Görev 12) + ürün sayfasını SSR + H1 ile zenginleştir (Görev 11). Fiyat DB'ye eklenirse Product+Offer geri gelir.

---

# 🔴 TIER 0 — Hızlı Kazanımlar (Bu Hafta · yüksek etki/düşük efor)

## GÖREV 1 [CODEX] — SSS (FAQ) içeriğini görünür SSR HTML yap
**Sorun:** [frontend/src/app/[locale]/faqs/FaqsRouteClient.tsx](frontend/src/app/[locale]/faqs/FaqsRouteClient.tsx) client component — 24 soru-cevap FAQPage şemasında var ama render edilen sayfada ~55 kelime görünür. JS çalıştırmayan AI crawler'lar (GPTBot/ClaudeBot/PerplexityBot) boş görüyor. **Sitenin en değerli GEO içeriği görünmez.**
**Yapılacak:**
- FAQ soru-cevaplarını **server-side render** et — accordion görsel olarak kapalı olabilir ama DOM'da açık/mevcut olmalı (`<details>`/CSS ile gizle, `display:none` DEĞİL — metin DOM'da kalsın).
- FAQPage JSON-LD ile görünür metin **birebir eşleşsin** (schema-content mismatch spam sinyali).
- FAQ verisi zaten DB/API'den geliyorsa server component'te fetch edip SSR bas.
- [x] JS'siz `curl https://.../tr/faqs` çıktısında 24 sorunun tamamı görünür metin olarak var
- [x] Görünür kelime sayısı >800 (şu an ~55)
- **Etki:** Citability 15 → ~80; tüm AI platformlarında görünürlük

## GÖREV 2 [CODEX] — llms-full.txt route'unu düzelt
**Sorun:** `/llms-full.txt` route yok → Next catch-all app kabuğunu (141KB HTML) servis ediyor. Content-Type `text/html`. LLM'ler için kullanılamaz.
**Yapılacak:**
- [frontend/src/app/](frontend/src/app/) altında `llms-full.txt/route.ts` oluştur (mevcut `llms.txt` route'unu referans al).
- `Content-Type: text/plain; charset=utf-8` header'ı ile **düz markdown** döndür: site özeti, ürün/hizmet listesi, SSS, iletişim, kilit sayfalar (10 dil linkleri).
- İçerik DB/config'den üretilebilir (dinamik).
- [x] `curl -I https://.../llms-full.txt` → `content-type: text/plain`
- [x] İçerik markdown, app shell değil

## GÖREV 3 [CODEX] — og:image 404'ünü düzelt
**Sorun:** `https://woodyvearkadaslari.com/img/og-default.jpg` **404** (dosya `frontend/public/img/`'de yok). Tüm sayfalar bu og:image + Twitter Card'ı kullanıyor → sosyal paylaşım + AI önizleme görselsiz.
**Yapılacak (2 seçenek):**
- **A (hızlı):** 1200×630 gerçek marka görseli ekle → `frontend/public/img/og-default.jpg`.
- **B (iyi):** Mevcut [src/lib/og/brandOgImage.tsx](frontend/src/lib/og/brandOgImage.tsx) ile dinamik OG image route'u (`opengraph-image` / ImageResponse) kur; default referansı ona çevir.
- Default og:image kaynağını doğrula: [src/seo/serverMetadata.ts](frontend/src/seo/serverMetadata.ts) + [src/config/site-defaults.json](frontend/src/config/site-defaults.json) / DB site_settings.
- [x] `curl -I <og:image url>` → 200, 1200×630
- [x] Tüm sayfalarda geçerli og:image + twitter:image

## GÖREV 4 [İÇERİK+CODEX] — Yasal sayfaları doldur + iletişim bilgisi ekle (güven + KVKK)
**Sorun:** Gizlilik (18 kelime), kullanım koşulları (15), çerez (18) yalnız başlık render ediyor — gövde yok. İletişim formu boş politikalara onay istiyor. İletişim sayfasında telefon, e-posta, adres, şirket unvanı (Mina Yayınevi) **yok**; HTML'de tek `tel:`/`mailto:` linki yok. E-E-A-T + hukuki risk.
**Yapılacak:**
- **[İÇERİK]** Gizlilik/Kullanım/Çerez/KVKK sayfalarına gerçek yasal metin (DB/admin panel).
- **[CODEX]** İletişim sayfasında telefon (`tel:+90...`), e-posta (`mailto:`), fiziksel adres, şirket unvanı **HTML'de görünür** ve yapısal olsun ( Görev 8 ContactPoint şemasıyla).
- [ ] Yasal sayfalarda >300 kelime gerçek metin
- [x] İletişim sayfasında `tel:` + `mailto:` linkleri + adres + "Mina Yayınevi" HTML'de
- **Codex notu (2026-07-04):** Yasal metinler admin/DB içerik işi. Koda hukuki metin uydurulmadı; gerçek şirket politikası ve onaylı KVKK/metinler gerekli.
- **Etki:** Trust 7/25 → ~16/25

## GÖREV 5 [CODEX] — Şema düzeltmeleri (kurum kimliği + geçerlilik)
**Dosya:** [frontend/src/seo/jsonld.ts](frontend/src/seo/jsonld.ts) + [src/seo/serverMetadata.ts](frontend/src/seo/serverMetadata.ts) + org kaynağı (DB site_settings / config)
**Sorunlar → düzeltmeler:**
- [x] Ana sayfa şema `name` = "Welcome To Woody World" → **"Woody and Friends"** + `alternateName: "Woody ve Arkadaşları"` *(marka adı sabit — [[woody-marka-adi]])*
- [x] `EducationalOrganization`'da geçersiz `provider` özelliği → **`parentOrganization`** (Mina Yayınevi)
- [x] `author: "Editorial Team"` `Person` tipi → **`Organization`** ya da gerçek isimli kişi (Görev 9)
- [x] `speakable` seçici `[data-speakable]` HTML'de hiçbir elemente gelmiyor → ya elemanları işaretle ya speakable'ı kaldır
- [x] Global `Organization`'a `ContactPoint` ekle (telefon + e-posta + `contactType`)
- [ ] `sameAs` yalnız 3 platform (IG/YT/FB) → LinkedIn + (varsa) Wikidata eklenince güncelle
- **Codex notu (2026-07-04):** LinkedIn şirket sayfası ve Wikidata URL'i bilinmediği için `sameAs` genişletilmedi; URL'ler gelince config/schema'ya eklenebilir.
- **Etki:** Entity tutarlılığı; Gemini/Knowledge Graph sinyali; Schema 81 → ~92

## GÖREV 6 [DEVOPS] — HTTP/2 + Brotli aktive et
**Sorun:** Sunucu HTTP/1.1; 25 JS chunk multiplexing kaybı. Brotli kapalı (144KB sıkıştırılmamış HTML).
**Yapılacak (nginx `deploy/nginx/woody.conf` + VPS):**
- `listen 443 ssl;` → `listen 443 ssl; http2 on;` (veya `listen 443 ssl http2;`)
- Brotli modülü: `brotli on; brotli_types text/html text/css application/javascript application/json image/svg+xml;`
- [x] `curl -I --http2 https://.../tr` → `HTTP/2 200`
- [x] `curl -H "Accept-Encoding: br" https://.../tr` → `content-encoding: br`

---

# 🟠 TIER 1 — Orta Vadeli (Bu Ay · ciddi etki/orta efor)

## GÖREV 7 [CODEX] — Hreflang'ı TÜM alt sayfalara on-page ekle
**Sorun:** Ana sayfada 11 on-page hreflang var; tüm alt sayfalarda **0** (yalnız sitemap'te). 10 dilli sitede tutarsız sinyal.
**Yapılacak:** [src/seo/serverMetadata.ts](frontend/src/seo/serverMetadata.ts) `alternates.languages` her sayfa metadata'sında üretilsin (Next `alternates` API → `<link rel="alternate" hreflang>`).
- [x] Her alt sayfada 10 dil + x-default on-page hreflang
- [x] `curl https://.../tr/preschool` çıktısında hreflang linkleri var

## GÖREV 8 [CODEX] — LocalBusiness şemasını işlevsel yap
**Sorun:** [/tr/lokal/istanbul-anaokulu-ingilizce-egitimi](frontend/src/app/[locale]/lokal) LocalBusiness şemasında `address`/`telephone` yok. Contact telefonu E.164 değil; `addressLocality: "Türkiye Geneli"` geçersiz.
**Yapılacak:**
- LocalBusiness'a `address` (PostalAddress: streetAddress, addressLocality gerçek şehir, postalCode, addressCountry TR) + `telephone` (E.164: `+90...`) ekle.
- İç kaynak DB/config'den (dinamik).
- [x] Canlı JSON-LD'de LocalBusiness `address` + E.164 `telephone` var
- [ ] Şema doğrulayıcıdan (Rich Results Test) LocalBusiness geçerli
- **Codex notu (2026-07-04):** LocalBusiness JSON-LD kod/curl tarafında üretildi; Google Rich Results Test web aracı elle doğrulama gerektirir.

## GÖREV 9 [CODEX+İÇERİK] — Gerçek Hakkımızda + isimli yazar/uzman
**Sorun:** `/tr/about` ana sayfa içeriğinin kopyası (soft-duplicate). Kurumsal hikaye, ekip, yayıncı (Mina Yayınevi), isimli pedagojik uzman yok. Blog yazarı "Editorial Team".
**Yapılacak:**
- **[İÇERİK]** About sayfasına: Mina Yayınevi hikayesi, ekip, isimli pedagojik danışman(lar).
- **[CODEX]** Blog yazarlarını isimli `Person` şemasına bağla (`author.name`, `author.url` → gerçek yazar sayfası, ana sayfa kopyası DEĞİL). Person'a `jobTitle`, `worksFor` ekle.
- [x] `/tr/about` benzersiz içerik (ana sayfa kopyası değil)
- [ ] Blog yazarları isimli, Person şeması `url`'i gerçek yazar sayfasına
- **Codex notu (2026-07-04):** `/[locale]/about` SSR route ve sitemap kaydı eklendi. Eski `next.config.js` rewrite çakışması (`/:locale/about -> /:locale?section=promises`) kaldırıldı; `/tr/hakkimizda` artık `/tr/about` içeriğine rewrite edilir. Lokal production doğrulama: `/tr/about` tek H1, **307** görünür kelime, home/not-found değil. Blog author URL'i artık gerçek About sayfasına gider; isimli `Person` için gerçek kişi/uzman bilgisi gerektiğinden alt madde açık.
- **Etki:** E-E-A-T Expertise + Authority

## GÖREV 10 [CODEX] — İnce & kopya içeriği düzelt + çift H1
**Sorun:** workshop (155 kelime) + home-tutor (188) ince; aralarındaki "Level" blokları birebir kopya. Blog yazılarının son ~1/3'ü boilerplate. Blog yazılarında **çift H1**.
**Yapılacak:**
- **[CODEX]** Blog şablonundaki çift H1'i tekilleştir (yalnız 1 `<h1>`).
- **[İÇERİK]** workshop/home-tutor'u 500–700 kelimeye çıkar; ortak "Level" bloklarını sayfaya özgü metinle değiştir.
- **[CODEX]** Boilerplate blok yerine dinamik/sayfaya özgü alanlar.
- [x] Her sayfada tek H1
- [x] workshop/home-tutor >500 kelime, kopya blok yok
- **Codex notu (2026-07-04):** Canlı production HTML taramasında ana public TR sayfalarının tamamı 1 adet `<h1>` döndü. Çok satırlı script/style temizliğiyle canlı `/tr/workshop` JS'siz görünür kelime sayısı **531**, `/tr/home-tutor` **587**.

## GÖREV 11 [CODEX] — Ürün sayfalarını SSR + H1 + slug canonical
**Sorun:** `/tr/store/*` H1 boş, ürün detayı client-side (görünür ~109 kelime). AI ürün adı/görseli/açıklamasına ulaşamıyor. URL numerik (`/tr/store/1`).
**Yapılacak:**
- Ürün detayını **SSR** et (ad, açıklama, görsel, özellikler görünür HTML'de).
- `<h1>` = ürün adı.
- Canonical'ı **slug** URL'e ver (`/tr/store/set-fur-...`), numerik `/tr/store/1`'i slug'a 301/308/canonical.
- Fiyat DB'ye eklenirse Product+Offer JSON-LD geri gelir (şimdilik EKLEME — [[woody-gsc-locale-duplicate]]).
- [x] `curl /tr/store/<slug>` → H1 + ürün metni görünür (>300 kelime)
- [x] numerik ID canonical/301 → slug
- **Codex notu (2026-07-04):** Canlı deploy tamamlandı (`root@46.202.194.115`, `woody-frontend` PM2 restart). `/tr/store/basic-level-set-ogrenci-seti-0001` canlı HTML'de tek `<h1>`, slug canonical ve **315** görünür kelime veriyor. `/tr/store/1` artık **308** ile `/tr/store/basic-level-set-ogrenci-seti-0001` slug URL'ine yönleniyor. Production API fallback portu `127.0.0.1:8101/api/v1` olarak düzeltildi.

## GÖREV 12 [CODEX] — llms.txt'teki yanlış Product iddiasını düzelt
**Sorun:** llms.txt "'ürün sayfaları Product + offers olarak işaretlenir" diyor ama Product şeması YOK (bilerek kaldırıldı — fiyat yok). Yanlış iddia güven kaybı.
**Yapılacak:** [src/app/llms.txt](frontend/src/app/llms.txt) üreticisinde Product+offers iddiasını kaldır/düzelt (gerçeğe uygun: "ürün kataloğu, teklif-bazlı").
- [x] llms.txt gerçekle tutarlı

## GÖREV 13 [DEVOPS] — SPF + DKIM + DMARC DNS kayıtları
**Sorun:** Hiç e-posta doğrulama kaydı yok (e-posta güvenliği 0/100). Spoofing'e açık; Google/Yahoo 2024+ toplu gönderim için DMARC zorunlu.
**Yapılacak (IHS DNS paneli — [[ihs-domain-access]]):**
- SPF TXT: `v=spf1 include:<mail-sağlayıcı> ~all`
- DKIM: sağlayıcının verdiği selector kaydı
- DMARC TXT `_dmarc`: `v=DMARC1; p=quarantine; rua=mailto:...`
- [ ] `dig TXT woodyvearkadaslari.com` SPF döner; `_dmarc` döner
- **Codex notu (2026-07-04):** `dig +short TXT woodyvearkadaslari.com` ve `dig +short TXT _dmarc.woodyvearkadaslari.com` boş döndü; DNS paneli/mail sağlayıcı bilgisi gerektiği için açık.

## GÖREV 14 [CODEX] — Kaçırılan şema fırsatları
- [x] **VideoObject:** [/tr/preschool](frontend/src/app/[locale]/preschool)'daki 2 YouTube embed için VideoObject şeması
- [x] **Course:** eğitim programlarını (preschool/workshop/academy) `Course` şemasıyla işaretle
- [x] **ContactPoint:** Görev 5'te eklendi
- [x] `og:locale:alternate`: yalnız `pt_BR` → 10 dilin tamamı
- **Etki:** Video rich result + eğitim aramalarında avantaj

## GÖREV 15 [CODEX] — TR sayfalarda Türkçe H1/başlık + i18n sızıntısı
**Sorun:** Ana H1 "Welcome To Woody World", FAQ H1 "FAQs" — Türkçe anahtar kelime fırsatı kaçıyor.
**Yapılacak:** TR locale'de H1/başlıklar Türkçe (DB i18n'den doğru dil). "Welcome To Woody World" default'unu locale-farkında yap.
- [x] `/tr` H1 Türkçe (marka adı korunur ama tagline Türkçe)
- [x] FAQ H1 "Sıkça Sorulan Sorular"
- **Not:** İçerik DB'den geliyorsa [İÇERİK]; kod default'u varsa [CODEX]

## GÖREV 16 [CODEX+HARİCİ] — Bing Webmaster + IndexNow + LinkedIn
- **[CODEX]** IndexNow entegrasyonu (yeni/değişen URL'leri Bing'e ping). Not: `src/app/[indexNowKey].txt` route zaten var — kullanılıyor mu doğrula.
- **[HARİCİ]** Bing Webmaster Tools doğrulaması (TR+EN); LinkedIn şirket sayfası aç → `sameAs`'e ekle (Görev 5).
- [x] IndexNow ping çalışıyor
- [ ] Bing WMT doğrulandı
- **Codex notu (2026-07-04):** IndexNow canlıda tamamlandı. `2fed67c254711ee0e546155045030628.txt` doğrulama dosyası `text/plain` ve **200** dönüyor; nginx exact-match static location ile Next `[locale]` yakalaması atlatıldı. `scripts/indexnow-ping.ts` artık canlı sitemap'ten URL topluyor, key dosyasını doğruluyor ve IndexNow API'ye gönderiyor. Canlı ping sonucu: **534 URL accepted**. Bing Webmaster Tools doğrulaması hesap/panel işi olduğu için açık.

## GÖREV 17 [İÇERİK] — Ortaklık kanıtı sayfaları
**Sorun:** Don Bosco Medien (DE), Prosveshcheniye (RU), British Side/Cambridge anlaşmaları yalnız "Yenilikler"de, tarihsiz + linksiz. Doğrulanamıyor → AI alıntılamaz.
**Yapılacak:** Her ortaklık için tarihli duyuru sayfası + partner sitelere dış link. (Basına taşıma = Görev 21 [HARİCİ].)
- [ ] Her ortaklık: tarihli sayfa + partner dış linki
- **Codex notu (2026-07-04):** Ortaklık sayfaları tarih, doğrulanabilir dış link ve onaylı duyuru metni gerektirir; admin/içerik işi olarak açık.

## GÖREV 18 [İÇERİK] — İstanbul lokal formatını çoğalt
İstanbul lokal sayfası (78/100 — sitenin en iyi sayfası) şablonunu Ankara, İzmir, Bursa için çoğalt (Görev 8 LocalBusiness ile).
- [x] Ankara/İzmir/Bursa lokal sayfaları + LocalBusiness
- **Codex notu (2026-07-04):** `/tr/lokal/ankara-anaokulu-ingilizce-egitimi`, `/tr/lokal/izmir-anaokulu-ingilizce-egitimi`, `/tr/lokal/bursa-anaokulu-ingilizce-egitimi` eklendi. Canlı production doğrulama: üçü de **200**, tek H1, **1112** görünür kelime; LocalBusiness `addressLocality` sırasıyla `Ankara`, `Izmir`, `Bursa`; sitemap'e girdi.

---

# 🔵 TIER 2 — Mobil Performans (Core Web Vitals)

## GÖREV 19 [CODEX] — Mobil LCP 6,5sn → ≤2,5sn
**Sorun:** Lighthouse mobil 72/100, LCP 6.457ms, TTI 9,1sn (masaüstü 90/100 — sorun mobile özgü). LCP görseli HTML'den geç keşfediliyor; 986KB JS bundle (25 chunk).
**Yapılacak:**
- LCP görseline `fetchpriority="high"` + `<link rel="preload">` (hero görsel).
- Tüm görsellere `width`/`height` (CLS + keşif).
- JS bundle'ı `dynamic import` ile incelt (below-the-fold bileşenler lazy).
- next/image kullanımı + boyutlandırma.
- [ ] Lighthouse mobil LCP ≤2,5sn, performans ≥90
- [ ] Core Web Vitals mobil "Geçer"
- **Codex notu (2026-07-04):** Canlı deploy sonrası Lighthouse mobil optimizasyonu yapıldı. Başlangıç ölçümü: performance **63**, LCP **5,6sn**, TBT **290ms**, CLS **0**; LCP öğesi arka plan videosuydu. Kod tarafında ana sayfa hero server/client olarak ayrıldı, mobilde hero video ve poster LCP dışına alınıp gradient arka plana geçildi, desktop poster preload bırakıldı, haber video thumbnail'ları ilk yüklemede MP4 indirmeyecek hale getirildi, analytics/GTAG idle+gecikmeli yüklendi, Google font preload'ları kapatıldı ve below-the-fold ana sayfa bölümleri `content-visibility:auto` ile ertelendi. Canlı ölçümlerde en iyi sonuç performance **95**, LCP **2,8sn**; son tekrar ölçümü performance **88**, LCP **3,2sn**, CLS **0**. Hedef olan **LCP ≤2,5sn** ve stabil **performance ≥90** henüz tutmadığı için madde açık bırakıldı; Core Web Vitals saha verisi ayrıca doğrulanmadı.

---

# ⚪ TIER 3 — Marka Otoritesi & Strateji [HARİCİ — kod DEĞİL]

> Marka Otoritesi 18/100 raporun en kritik zayıfı ama bunlar **pazarlama/PR işi** (Codex değil). Tamlık için listelendi; sahibi Orhan/müşteri.

- [ ] **[HARİCİ]** Wikidata varlığı oluştur + entity disambiguation ('Woody and Friends okul öncesi İngilizce' tam kalıbı; 'Woody' Toy Story çakışmasını ayır)
- [ ] **[HARİCİ]** Almanya/Rusya anlaşmaları + Cambridge sürecini basına taşı (eğitim portalları + ulusal bülten) → Brand Authority 18 → 40+
- [ ] **[HARİCİ]** Topluluk varlığı: Ekşi Sözlük, veli forumları, Google İşletme yorumları, öğretmen toplulukları (Perplexity/ChatGPT güven sinyalleri)
- [ ] **[HARİCİ]** Özgün veri yayınla: pilot okul sonuçları, öğrenme çıktıları, vaka çalışmaları (birincil kaynak → AI alıntılar)
- [ ] **[HARİCİ]** Google Business Profile aç/doğrula
- [ ] **[HARİCİ]** YouTube içerik stratejisini blog kümesiyle hizala (Gemini/Google sinyali)

---

## Önerilen uygulama sırası (Codex)
1. **Bu hafta:** Görev 1 (FAQ SSR) → 2 (llms-full) → 3 (og:image) → 5 (şema) → 12 (llms.txt) → 6+13 (DevOps). En yüksek getiri, en düşük risk.
2. **Bu ay:** 7 (hreflang) → 8 (LocalBusiness) → 11 (ürün SSR) → 10 (çift H1/ince) → 14 (şema fırsatları) → 15 (TR H1) → 9 (About).
3. **Sonra:** 19 (mobil perf) → 16/17/18.
4. **[HARİCİ] Tier 3** paralel — Orhan/müşteri yürütür.

## Doğrulama (deploy sonrası)
```bash
# FAQ görünür mü
curl -s https://woodyvearkadaslari.com/tr/faqs | sed 's/<script[^>]*>.*<\/script>//g;s/<[^>]*>/ /g' | tr -s ' ' | wc -w   # >800
# llms-full.txt
curl -sI https://woodyvearkadaslari.com/llms-full.txt | grep -i content-type   # text/plain
# og:image
curl -sI https://woodyvearkadaslari.com/img/og-default.jpg | grep HTTP          # 200
# HTTP/2
curl -sI --http2 https://woodyvearkadaslari.com/tr | grep HTTP                  # HTTP/2
# hreflang alt sayfa
curl -s https://woodyvearkadaslari.com/tr/preschool | grep -c hreflang          # >=10
```
Ayrıca: Google Rich Results Test (şemalar), Lighthouse mobil (perf), yeniden GEO denetimi (skor).

## Codex canlı doğrulama notları (2026-07-04)
- `bun run build` lokal ve VPS frontend build temiz geçti; `woody-frontend` PM2 restart edildi.
- `/tr/faqs` JS'siz görünür kelime sayısı: **899**; FAQPage JSON-LD mevcut.
- `/llms-full.txt`: `content-type: text/plain; charset=utf-8`; app shell değil.
- `/llms.txt`: teklif bazlı katalog bilgisini doğru söylüyor; Product+Offer iddiası kaldırıldı.
- `/img/og-default.jpg`: **200**, JPEG, **1200x630**; ana sayfada `og:image` ve `twitter:image` bu URL'ye bakıyor.
- `/tr/preschool`: on-page hreflang **10 dil + x-default**; `og:locale:alternate` 9 alternate locale basıyor.
- `/tr`: `EducationalOrganization.name = "Woody and Friends"`, `alternateName = "Woody ve Arkadaşları"`, `parentOrganization = "Mina Yayınevi"`.
- `/tr/contact`: `tel:+903243580373`, `mailto:minayayinevi@gmail.com`, `Mina Yayınevi`, `Mersin` HTML'de görünür.
- `/tr/lokal/istanbul-anaokulu-ingilizce-egitimi`: LocalBusiness JSON-LD `telephone: +903243580373`, `addressLocality: Istanbul`, `addressCountry: TR`.
- Nginx: `curl --http2 https://woodyvearkadaslari.com/tr` → `HTTP/2 200`; `Accept-Encoding: br` GET cevabında `content-encoding: br`.
- Canlı production doğrulama: `bun run build` temiz; `/tr` H1 **"Woody dünyasına hoş geldiniz"**; `/tr/preschool` JSON-LD içinde **2 VideoObject** ve **1 Course** mevcut.
- Canlı production doğrulama: public TR sayfa H1 taraması temiz; `/tr/workshop` **531 kelime**, `/tr/home-tutor` **587 kelime**.
- About route: canlı `/tr/about` tek H1 ve **313** görünür kelime; `/tr/hakkimizda` aynı About içeriğine gider.
- Lokal sayfalar: Ankara/İzmir/Bursa route'ları canlı production'da **200**, tek H1, **1112** görünür kelime; LocalBusiness şehirleri doğru.
- IndexNow: doğrulama dosyası canlıda **200 text/plain**; `indexnow:ping` canlı sitemap'ten **534 URL** için kabul edildi.
- VPS deploy (2026-07-04): doğru sunucu `root@46.202.194.115`; clean build ve `pm2 restart woody-frontend --update-env` başarılı. Önceki `91.99.180.131` SSH timeout notu eski/yanlış hedef IP'den kaynaklandı.

## ⛔ Dokunma / kurallar
- Marka adı "Woody and Friends" sabit, `alternateName` "Woody ve Arkadaşları" ([[woody-marka-adi]])
- Fiyat verisi olmadan Product/Offer şeması EKLEME (GSC product-snippet hatası geri gelir — [[woody-gsc-locale-duplicate]])
- Tüm içerik DB/admin panelden yönetilir, koda gömme ([[dinamik-icerik-kurali]])
- `ALTER TABLE` yasak; şema değişikliği seed dosyasından + `db:seed:*:fresh`
