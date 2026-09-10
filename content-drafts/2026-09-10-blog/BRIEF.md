# Woody and Friends — blog taslak yazım brief'i (10 Eylül 2026)

## Marka ve gerçekler (yalnız bunları kullan; verilmeyen ürün detayı UYDURMA)
- Marka adı daima "Woody and Friends" (çevrilmez, "Woody ve Arkadaşları" YAZMA). Site: woodyvearkadaslari.com. Satıcı: Mina Yayınevi (Mersin).
- Ürün modeli: fiziksel materyal (kitap, kartlar, oyun materyali) + dijital içerik (365 gün dijital erişim) + öğretmen/veli planı. Okul öncesi (3–6 yaş) İngilizce. Karakterli, oyun ve hikâye temelli.
- Seriler ve fiyatlar (KDV dahil, canlı katalog):
  - Ev & Özel Ders serisi (1–2 çocuk, evde veya özel ders): Basic Level Set Öğrenci Seti 3.000 TL (temel kelimeler ve basit cümleler, başlangıç), Junior Level Set 3.750 TL (cümle kurma, kendini ifade), Senior Level Set 4.750 TL (daha akıcı kullanma ve anlama). Sayfa: /tr/home-tutor ve /tr/store/home-basic-000d, /tr/store/home-junior-000e, /tr/store/home-senior-000f
  - Mini School serisi (3–5 kişilik küçük grup; öğrenci seti en az 3 adet): Basic/Junior/Senior Öğrenci Seti 2.500 TL/adet → 3 öğrenci için 7.500 TL. Sayfa: /tr/store/mini-school-basic-ogrenci-seti-0013 (…junior-0014, …senior-0015)
  - Atölye / Öğretmen setleri: Basic Öğretmen Seti 1.500 TL, Junior 2.750 TL, Senior 4.650 TL. Sayfa: /tr/store/atolye-basic-0007, -junior-0008, -senior-0009
  - Okul serisi (kurumlar, 30+ öğrenci): fiyat yok, teklif alınır → /tr/preschool#quote-form
- Seviye eşlemesi (kaba): Basic ≈ 3–4 yaş / başlangıç, Junior ≈ 4–5 yaş, Senior ≈ 5–6 yaş. "PRO Level" satışta değil; bahsetme.
- Araçlar: Seviye Bulucu /tr/level-finder (birkaç soruyla seviye önerir), Dijital Kütüphane (kitapları dijital inceleme) /tr/library, mağaza /tr/store, ana sayfa /tr, iletişim /tr/contact.
- Cambridge: "Cambridge yaklaşımı/hazırlık" denebilir; "sertifika alır", "garanti", "resmî yetkili" YAZMA. Sınav ayrı kurumun işi.
- Yasal/güven: Teslimat ve kargo /tr/teslimat-ve-kargo, iade /tr/iade-cayma. Ücretsiz kargo, ücretsiz demo, sonuç garantisi VAAT ETME.
- Rakip adı yazma, rakip fiyatı yazma, uydurma istatistik/araştırma/yüzde yazma. "Araştırmalar gösteriyor ki" gibi kaynaksız cümle yok.

## Mevcut blog yazıları (iç bağlantı için, /tr/blog/<slug>)
anaokulu-ingilizce-konulari · 4-yas-ingilizce-etkinlikleri · 5-yas-ingilizce-ders-programi · 6-yas-ingilizce-egitimi · cambridge-egitim-sistemi-nedir · dijital-icerik-okulda-nasil-guvenli-acilir · evde-ingilizce-rutini-nasil-kucuk-kalir · okul-oncesi-ingilizcede-hikaye-neden-ise-yarar · anaokulu-ingilizce-ders-plani-nasil-hazirlanir · ingilizce-sarkilarla-egitim · oyun-temelli-ingilizce-egitimi-neden-etkili · okul-oncesi-ingilizce-ogrenme-yontemleri · 3-6-yas-ingilizce-egitimi-nasil-olmali · anaokulu-ingilizce-mufredati-nasil-hazirlanir · anaokulunda-ingilizce-nasil-ogretilir · anaokulu-ingilizce-egitim-sistemi-nedir · 4-5-6-yas-ingilizce-egitimi · anaokulu-ingilizce-egitim-seti-nasil-secilir
Her yazıda 2–4 ilgili iç bağlantı + 1 ürün/sayfa CTA bağlantısı kullan. Aynı yazıya iki kez bağlanma.

## Biçim (mevcut yazılarla birebir aynı yapı)
- Dil: Türkçe, "siz" hitabı, kısa cümleler, somut örnek. Hedef okur başlıkta belirtilir (veli / öğretmen / kurum).
- Uzunluk: 850–1.100 kelime gövde. Hedef sorgu ifadesi başlıkta, ilk paragrafta ve bir H2'de doğal biçimde geçer; anahtar kelime yoğunluğu %0,5–1,5 arası (zorlamadan).
- HTML: tek kök `<article data-seo-block="<slug>-20260910">`. İlk paragraf `<p><strong>Sorunun kısa cevabı.</strong> devam…</p>`. 4–6 adet `<h2>`, gerekirse `<h3>`. En az bir `<table>` (thead/tbody) veya `<ul>`/`<ol>`. Bağlantılar `<a href="/tr/...">`. `<em>` İngilizce ifadeler için. Görsel etiketi koyma. Sonda "Sık sorulan sorular" H2 altında 3 soru (`<h3>` soru + `<p>` cevap). Son paragraf CTA (ilgili sayfaya bağlantı).
- Bölüm başlıklarında "Woody and Friends ile uygulama akışı" gibi kalıp tekrarları YOK; her yazı kendi özgün örneğini verir.
- Materyal/PDF vaadi: "indirilebilir" deme; hazır değil. Onun yerine tablo/liste olarak yazının içinde ver.

## Çıktı
Her yazı için iki dosya: `<slug>.html` (yalnız article HTML, tek satır olması şart değil) ve `<slug>.json`:
{"slug":"...","title":"... (≤70 karakter)","excerpt":"1–2 cümle, ≤200 karakter","meta_title":"... | ... (≤60)","meta_description":"≤155 karakter","category":"<kategori>","target_queries":["..."]}
Kategori değerleri (aynen): yas-gruplari, aile, ogrenme-yontemleri, ders-plani, mufredat, egitim-setleri, okul-oncesi, cambridge-sistemi, ogretim-teknikleri.
