# Woody SEO İçerik Kalite Standardı

> Amaç: Woody and Friends blog içeriklerini "yazı var" seviyesinden çıkarıp ölçülebilir,
> yayınlanabilir ve arama motorlarında anlaşılır bir kalite standardına bağlamak.
>
> Kapsam: Blog yazıları, blog seed içerikleri, fallback JSON içerikleri ve admin panelden girilecek
> yeni Woody eğitim içerikleri.
>
> Sürüm: 1.1 Woody uyarlaması · 2026-06-14

## 1. İçerik İlkesi

Woody içerikleri anahtar kelime doldurmak için değil, anaokulu kurucusu, öğretmen ve veli adayının
gerçek sorusunu yanıtlamak için yazılır.

Her blog yazısı şu üç soruya cevap vermelidir:

- Bu konu anaokulu İngilizce eğitimi için neden önemli?
- Okul/öğretmen bunu sınıfta nasıl uygular?
- Woody and Friends sistemi bu ihtiyaca hangi bileşenlerle cevap verir?

## 2. Yayın Eşiği

Her yazı 100 puan üzerinden değerlendirilir.

| Puan | Durum |
| --- | --- |
| 0-59 | Yayınlanamaz |
| 60-79 | Yayınlanabilir ama iyileştirilmeli |
| 80-100 | Hedef kalite, yayına hazır |

Sert kapı: A1-A4 maddeleri geçmeden içerik yayınlanmış kabul edilmez.

## 3. Puanlama

| Boyut | Ağırlık | Ölçtüğü şey |
| --- | ---: | --- |
| A. Temel SEO | 40 | İçerik doluluğu, odak kelime, uzunluk, doğal yoğunluk |
| B. Yapı & Teknik | 25 | Başlık, H2 yapısı, schema hazırlığı, iç link, görsel, meta |
| C. İçerik Kalitesi | 20 | Temiz HTML, derinlik, okunabilirlik, deneyim sinyali, güncellik |
| D. GEO / AI Alıntılanabilirlik | 15 | Net cevap pasajı, FAQ, liste/tanım, marka/varlık tutarlılığı |

## 4. Boyut A: Temel SEO

| Kod | Kriter | Geçme şartı | Puan |
| --- | --- | --- | ---: |
| A1 | İçerik boş değil | HTML gövde metni dolu | 10 |
| A2 | Odak kelime geçiyor | Başlık, özet veya gövdede en az 1 doğal geçiş | 10 |
| A3 | Minimum uzunluk | Blog yazısı en az 700 kelime | 10 |
| A4 | Doğal yoğunluk | Woody bloglarında birebir odak kelime yoğunluğu %0.4-%1.5 | 10 |

Woody notu: Okul öncesi İngilizce bloglarında uzun odak kelimeleri %2-%3 oranında tekrar etmek
metni yapaylaştırır. Bu yüzden hedef aralık doğal blog dili için %0.4-%1.5 olarak belirlenmiştir.
Destekleyici kelimeler ve eş anlamlılar metne doğal biçimde dağıtılır.

## 5. Boyut B: Yapı & Teknik

| Kod | Kriter | Geçme şartı | Puan |
| --- | --- | --- | ---: |
| B1 | Başlık | H1/title odak kelimeyi veya ana konuyu net taşır | 5 |
| B2 | H2 yapısı | En az 4 H2; mantıklı sıra | 4 |
| B3 | Schema hazırlığı | Article + Breadcrumb; FAQ varsa FAQPage | 6 |
| B4 | İç link | En az 2 ilgili iç link | 3 |
| B5 | Görsel | En az 1 yerel görsel; açıklayıcı alt metin | 4 |
| B6 | Meta | Meta title 35-65, description 120-170 karakter | 3 |

Yerel görsel yolu tercih edilir: `/assets/woody/blog/...`

## 6. Boyut C: İçerik Kalitesi

| Kod | Kriter | Geçme şartı | Puan |
| --- | --- | --- | ---: |
| C1 | Temiz HTML | Stil taşıyan span/style yok; sade p, h2, ul, a kullanımı | 5 |
| C2 | Derinlik | 900+ kelime hedef veya 6+ güçlü H2 | 4 |
| C3 | Okunabilirlik | Kısa paragraflar, liste/akış, duvar metin yok | 4 |
| C4 | Deneyim sinyali | Sınıf, öğretmen, yaş grubu, kazanım veya uygulama örneği | 4 |
| C5 | Güncellik | 2026/güncel bağlam veya tarihli yayın bilgisi | 3 |

## 7. Boyut D: GEO / AI Alıntılanabilirlik

| Kod | Kriter | Geçme şartı | Puan |
| --- | --- | --- | ---: |
| D1 | Net cevap pasajı | İlk 500 karakter içinde konuyu bağımsız açıklayan cevap | 5 |
| D2 | FAQ bloğu | 4-6 gerçek soru-cevap | 4 |
| D3 | Liste/tanım | Kontrol listesi, adım listesi veya "nedir/nasıl" açıklığı | 3 |
| D4 | Varlık tutarlılığı | Woody and Friends, MusicLand, StoryLand gibi varlıklar tutarlı | 3 |

## 8. Woody Blog Yazı Şablonu

Her 700+ kelimelik blog yazısı şu iskeleti izler:

1. Giriş: Kullanıcı sorusunu net cevapla.
2. Yaş grubu veya problem bağlamı.
3. Sınıf içi uygulama örnekleri.
4. Woody sistem bileşeni bağlantısı: kitap, öğretmen planı, oyun, MusicLand, StoryLand, karakter.
5. Kontrol listesi veya adım adım öneri.
6. SSS: 4-6 soru.
7. İç linkler: en az 2 ilgili Woody sayfası veya blog yazısı.

## 9. Seed ve Fallback Eşitliği

Bir blog yazısı tamamlandı sayılması için:

- `frontend/src/config/pages/tr/blog-fallback-posts.json` içinde içerik, meta ve görsel alanları dolu olmalı.
- `backend/src/db/seed/sql/024_blog.sql` içinde aynı slug ve HTML içerik yer almalı.
- Seed kategorisi `packages/shared-backend/modules/blog/validation.ts` içindeki enumla uyumlu olmalı.
- Görsel dosyası `frontend/public/assets/woody/blog/` altında bulunmalı.
- DB şemasında alt metin kolonu olmadığı için alt metin fallback JSON ve frontend render tarafında korunmalı.

## 10. Otomatik Skor

Blog modülü `scoreBlogSeoQuality` ile detay içeriklere anlık kalite skoru üretir.

Dosya:

`packages/shared-backend/modules/blog/seo-quality.ts`

API detay cevaplarında alan:

`seo_quality`

Bu skor editör kararını tamamen değiştirmez; yayın öncesi hızlı kalite kapısı olarak kullanılır.

## 11. Yayın Öncesi Checklist

- [x] Odak kelime belli.
- [x] İçerik en az 700 kelime.
- [x] Odak kelime yoğunluğu %0.4-%1.5.
- [x] Meta title 35-65 karakter.
- [x] Meta description 120-170 karakter.
- [x] En az 4 H2 var.
- [x] En az 2 iç link var.
- [x] Yerel görsel ve açıklayıcı alt metin var.
- [x] FAQ bölümü var.
- [x] Article/Breadcrumb/FAQ schema destekleniyor.
- [x] Fallback JSON ve seed SQL aynı içeriği taşıyor.
- [x] `seo_quality.score >= 80` veya editör onaylı gerekçe var.

Tamamlanan kapsam: `blog/anaokulu_ingilizce_egitim_seti_blog.pdf` kaynaklı 10 TR blog yazısı,
fallback JSON ve `024_blog.sql` seed kayıtlarıyla birlikte bu checklistten geçmiştir.
