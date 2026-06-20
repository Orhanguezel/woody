# Store Sayfası Yeniden Düzenleme — Plan & Checklist

> Hedef: `/[locale]/store` sayfasını **filtreli, tek birleşik ürün listesi** haline getirmek; site geneliyle (blog/preschool krem teması) aynı görünüm. Filtreler gerçekten ürünleri daraltmalı.
>
> İlgili dosyalar:
> - [frontend/src/app/[locale]/store/page.tsx](frontend/src/app/[locale]/store/page.tsx)
> - [frontend/src/components/woody/store/WoodyStoreShowcase.tsx](frontend/src/components/woody/store/WoodyStoreShowcase.tsx)
> - [frontend/src/components/woody/store/load-store-products.server.ts](frontend/src/components/woody/store/load-store-products.server.ts)
> - [frontend/src/components/woody/store/types.ts](frontend/src/components/woody/store/types.ts)

---

## Faz 0 — Tamamlananlar (ilk redesign)

- [x] `WoodyStoreShowcase` baştan yazıldı (krem tema `#fff9ee` + marka turuncu/yeşil)
- [x] Ortak `WoodyPageLogoHeader` kullanımı (logo + geri linki + aktif filtre rozeti)
- [x] Per-kategori dev bölümler kaldırıldı → **tek birleşik ürün ızgarası** (`sm:2 / lg:3 / xl:4`)
- [x] Filtre pill'leri iki satıra ayrıldı: üst = kategoriler, alt = seri + seviye + ücretsiz
- [x] Seri/seviye/ücretsiz pill'leri toggle (tekrar tıkla → kalkar)
- [x] Aktif kategori bağlam başlığı (ad + not + "seriye git" linki)
- [x] Boş kategoriler yalnızca filtresiz görünümde kompakt "yakında + bekleme listesi" kartı
- [x] Teklif/online/ücretsiz CTA, WhatsApp teklif, `QuoteRequestForm` korundu
- [x] Type-check temiz (0 hata)

---

## Faz 1 — Görsel Doğrulama (canlıda kontrol) ✅ TAMAM

- [x] Backend'i lokalde başlat (MySQL + seed, port **8101**) — ayakta, MySQL bağlı
- [x] `frontend` dev başlat (`bun run dev`, port **3077**) — ayakta
- [x] `/tr/store` aç → ekran görüntüsü al, eski hâliyle kıyasla — yeni krem tema render oldu
- [x] Gerçek taksonomiyle pill gruplaması doğru mu? — üst: 3 kategori, alt: 2 seri + 4 seviye + ücretsiz; karışmıyor
- [x] Filtre tıklamaları gerçekten listeyi daraltıyor mu? — category=atolye→4, level=pro→2, series=ogrenci→3 ✓
- [x] Boş kategori sayısı kaç? — **0** (3 kategorinin hepsinde ürün var, "yakında" bloğu hiç çıkmıyor)
- [ ] Mobil görünüm (pill wrap + ızgara kolon) kontrolü — masaüstü ✓, mobil ekran görüntüsü alınacak

### Faz 1 Bulguları (gerçek veri)
- Taksonomi artık **3 kategori** (Okul/Atölye/Ev-Özel Ders Serisi) + **2 seri** (Öğrenci/Öğretmen) + **4 seviye** (Basic/Junior/Senior/Pro). Screenshot'taki eski pill'ler (Hikaye Kitapları, Etkinlik Kartları…) **artık yok**.
- **11 ürün**: 8 `online` (link → /store/slug) + 3 `quote` (WhatsApp teklif). Hepsi kategorili.
- Bazı ürünlerin **görseli yok** (ör. Atölye PRO) → marka temalı **placeholder eklendi** (GraduationCap + kategori adı). ✅
- **"Ücretsiz" filtresi 0 sonuç döndürür** (hiç ücretsiz ürün yok) → tıklanınca yanıltıcı "yakında" kartı çıkar. → Açık karar #4.
- `quoteWhatsApp` `content/pages/store` endpoint'inde boş görünüyor; teklif butonları yine de render oldu (numara fallback'ten geliyor olabilir) → Faz 5'te doğrula.

## Faz 2 — Filtre UX İyileştirmeleri ✅ TAMAM

- [x] Alt satır filtrelerine küçük etiket ("SERİ", "SEVİYE") — `STATIC_UI`'ye 'Series'/'Clear filters'/'products' 10 dilde eklendi ('Level' zaten vardı)
- [x] "Filtreleri temizle" linki + sonuç sayacı ("4 ürün") — aktif filtre varken görünür, "Tümü"de sayaç-only
- [x] "Ücretsiz" pill yalnızca gerçekten ücretsiz ürün varsa gösterilir (page.tsx `hasFreeProducts` global probe, cache'li)
- [x] Çoklu filtre kombinasyonu: seri/seviye toggle, kategori değişince diğerleri korunur — doğrulandı (atölye+pro vb.)
- [ ] Pill satırı uzunsa mobilde yatay kaydırma vs wrap — şu an wrap; mobil ekran görüntüsüyle kontrol edilecek
- [ ] (Opsiyonel) Aktif filtre rozetinde "×" ile tek tıkla kaldırma — ertelendi (Temizle linki yeterli)

## Faz 3 — Liste/Kart İçeriği ✅ TAMAM (mevcut veriyle)

- [x] Kart görselleri `object-contain` — set kapakları kırpılmadan görünüyor ✓
- [x] Sayfalama gerekli mi? — 11 ürün, **gerek yok**
- [x] "Yeni" rozet (NEW!) — görselin içine gömülü; ayrı işlem gerekmez
- [x] Görselsiz ürün placeholder'ı (GraduationCap + kategori) — doğrulandı
- [ ] (Opsiyonel) Sıralama (yeni/kategori) — 11 ürün için ertelendi
- [x] Mobil görünüm — pill wrap + tek kolon ızgara temiz ✓

## Faz 4 — i18n & İçerik (dinamik içerik kuralı) ✅ TAMAM

- [x] Tüm yeni metinler `ui.*` (DB) veya `tUi`/`STATIC_UI` üzerinden — koda gömülü tr/en yok (yalnızca "Woody Store" marka adı, sabit)
- [x] Yapısal etiketler için 10-dil `STATIC_UI`: 'Series', 'Clear filters', 'products' eklendi
- [ ] `ui` anahtar eksikleri (heroSubtitle, comingSoon, goToSeries…) 10 dilde DB'de dolu mu — TR'de doğrulandı, diğer diller deploy öncesi gözden geçirilebilir

## Faz 5 — Edge Case & Kalite ✅ TAMAM

- [x] Hiç ürün yokken / backend down iken `WoodyFallback` — page.tsx kod yolu değişmedi, build OK
- [x] Filtre sonucu boş → "yakında + bekleme listesi" tek kart, `productKey = activeCategory?.id || 'store'`
- [x] Teklif-bazlı: fiyat HTML/payload'a sızmıyor — page.tsx `price=undefined` map'i korundu
- [x] SEO: `woodyStoreListingGraph` / metadata dokunulmadı
- [x] A11y: `FOCUS_RING` tüm tıklanabilir öğelerde, görsel `alt`, `h1/h2/h3` hiyerarşisi korundu

## Faz 6 — Deploy

- [x] `bun run build` lokalde başarılı (exit 0; `/[locale]/store` → ƒ Dynamic)
- [ ] Branch commit + push — **kullanıcı onayı bekliyor**
- [ ] VPS / GitHub Pages hedefine deploy + canlı `/tr/store` son kontrol — **kullanıcı onayı bekliyor**

---

## Açık Kararlar (kullanıcı onayı bekleyen)

1. Filtre etiketleri ("Seri"/"Seviye") eklensin mi, yoksa sadece görsel ayraç mı?
2. Boş kategoriler alt blokta mı kalsın, yoksa tamamen gizlensin mi? → _Şu an 0 boş kategori var, pratikte konu değil._
3. Sayfalama gerekli mi? → _11 ürün; gerek yok._
4. **"Ücretsiz" filtre pill'i** — hiç ücretsiz ürün yokken gösterilmesin mi? (tıklanınca boş "yakında" çıkıyor)
5. Görseli olmayan ürünler için placeholder yerine **gerçek görsel** DB'ye eklensin mi (admin panel)?
