# Woody Blog SEO İçerik Checklist

Ana standart: `SEO_ICERIK_KALITE_STANDARDI.md`

Kaynak içerik: `anaokulu_ingilizce_egitim_seti_blog.pdf`

Google referansları:
- SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Image SEO Best Practices: https://developers.google.com/search/docs/appearance/google-images

## Zorunlu Kalite Kapısı

- [x] A1: İçerik boş değil.
- [x] A2: Odak kelime başlık, özet veya gövdede doğal şekilde geçiyor.
- [x] A3: Blog içeriği en az 700 kelime.
- [x] A4: Odak kelime yoğunluğu Woody blogları için %0.4-%1.5 aralığında.
- [x] Toplam kalite skoru en az 80 veya editör gerekçesi var.

## Woody Blog Yayın Standardı

- [x] Meta title 35-65 karakter.
- [x] Meta description 120-170 karakter.
- [x] En az 4 H2 var.
- [x] En az 2 ilgili iç link var.
- [x] En az 1 yerel görsel var: `/assets/woody/blog/...`
- [x] Featured image alt metni açıklayıcı.
- [x] FAQ bölümü 4-6 soru içeriyor.
- [x] Temiz HTML kullanılıyor: `p`, `h2`, `h3`, `ul`, `li`, `a`; stil taşıyan `span` yok.
- [x] Article/Breadcrumb/FAQ schema üretimi destekleniyor.
- [x] Fallback JSON ve seed SQL aynı slug/içerik/meta bilgisini taşıyor.
- [x] Seed kategorisi backend validation enum listesinde var.

## Makale Konu Planı

| Durum | Slug | Odak konu | Görsel | Seed | Not |
| --- | --- | --- | --- | --- | --- |
| [x] | `anaokulu-ingilizce-egitim-seti-nasil-secilir` | Anaokulu İngilizce eğitim seti seçimi | `01-kitap-okuma-sinifi.png` | [x] | 1033 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `3-6-yas-ingilizce-egitimi-nasil-olmali` | 3-6 yaş kademeli İngilizce eğitimi | `05-hikaye-saati.png` | [x] | 709 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `ingilizce-sarkilarla-egitim` | Şarkı, ritim ve tekrar | `04-muzik-etkinligi.png` | [x] | 713 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `oyun-temelli-ingilizce-egitimi-neden-etkili` | Oyun temelli öğrenme | `03-interaktif-oyun-aktivitesi.png` | [x] | 702 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `anaokulunda-ingilizce-nasil-ogretilir` | Öğretim yöntemleri | `02-ingilizce-flashcard-dersi.png` | [x] | 710 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `anaokulu-ingilizce-ders-plani-nasil-hazirlanir` | Haftalık ders planı | `08-odev-planlama-flashcard.png` | [x] | 770 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `anaokulu-ingilizce-mufredati-nasil-hazirlanir` | Yıllık müfredat | `10-egitim-malzemeleri-planlama.png` | [x] | 720 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `okul-oncesi-ingilizce-ogrenme-yontemleri` | Çok kanallı öğrenme | `09-akilli-tahta-aktivitesi.png` | [x] | 700 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `anaokulu-ingilizce-egitim-sistemi-nedir` | Sistem bileşenleri | `07-maskot-karakteri-dersi.png` | [x] | 706 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |
| [x] | `4-5-6-yas-ingilizce-egitimi` | Yaşa göre seviye yaklaşımı | `06-tahta-oyunu.png` | [x] | 705 kelime, FAQ, iç linkler, meta, seed ve `seo_quality=100` tamam. |

## Görsel Alt Metin Kuralı

İyi örnek:

`Anaokulu İngilizce eğitim setiyle kitap, kart ve dijital içerik kullanan öğretmen ve çocuklar`

Kötü örnek:

`anaokulu ingilizce eğitim seti okul öncesi ingilizce seti çocuk ingilizce`

## Teknik Kontrol

- [x] `packages/shared-backend/modules/blog/seo-quality.ts` skoru beklenen sonucu üretiyor.
- [x] Public blog detay cevabında `seo_quality` alanı var.
- [x] Admin blog detay/create/update cevaplarında `seo_quality` alanı var.
- [x] `packages/shared-backend/modules/blog/validation.ts` kategori enumları Woody konu planıyla uyumlu.
