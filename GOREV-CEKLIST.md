# Woody — Müşteri Talepleri Görev Çeklisti (Dinamik / DB + Admin)

**Kaynak:** [MUSTERI-NOTLARI.md](MUSTERI-NOTLARI.md) · **Talep tarihi:** 2026-06-05 · **Branch:** `woody-icerik-i18n`
**İş bölümü:** Claude (mimar + ayar DB/seed + layout + QA + deploy) ↔ Codex (sayfa-içerik DB/admin altyapısı + ağır component)

> **OLMAZSA OLMAZ MİMARİ KURAL:** Hiçbir içerik (sosyal medya, WhatsApp, iletişim, sayfa metinleri, fiyat, başlık, hero) koda/JSON'a **sabit gömülmez**. Her şey **DB'de saklanır** (`site_settings` tablosu) ve **admin panelden** yönetilir. `frontend/src/config/**.json` dosyaları yalnızca **fallback** olarak kalır; gerçek kaynak DB'dir.

---

## 0. Mimari (mevcut altyapı — DOĞRULANDI)

**Saklama modeli:** `site_settings` tablosu — `key` / `locale` / `value`(JSON). Locale fallback zinciri + `'*'` global desteği var.
- Backend modülü: `packages/shared-backend/modules/siteSettings/` (schema, service, router, admin.routes, controller)
- Seed: `backend/src/db/seed/sql/020_woody_site_settings.sql`
- Public API: `GET /api/v1/site_settings`, `/api/v1/site_settings/:key`, `/api/v1/site_settings/homepage`
- Admin API: `PUT /api/v1/admin/site-settings` (toplu), `PUT /api/v1/admin/site-settings/:key`, bulk-upsert
- Admin UI: `admin_panel/src/app/(main)/admin/(admin)/site-settings/` → tabs (general, branding, brand-media, design-tokens, seo)
- Frontend tüketim: RTK `useGetSiteSettingByKeyQuery({ key, locale })` → DB değeri + `site-defaults.json` fallback merge (`Footer.tsx:48-72`, `site-config.ts`)

**Halihazırda dinamik (DB+admin VAR):** `socials`, `contact_info`, `company_brand`, `app_name`, `businessHours`, `design_tokens`, SEO, logo/favicon, `home_sections` (sıralama).
**Henüz statik (JSON — DB'ye taşınacak):** `store.json`, `preschool.json`, `workshop.json`, `home-copy.ts` (hero/seri başlıkları).

**DB Schema kuralı (CLAUDE.md):** `ALTER TABLE` YASAK. `site_settings` zaten `CREATE TABLE`; yeni içerik = sadece seed SQL'e **yeni INSERT satırı**. Değişiklik sonrası `bun run build && bun run db:seed:*:fresh`.

---

## 1. Faz 1 — AYARLAR (altyapı hazır, hemen) — Sahip: **Claude**

> Sosyal/WhatsApp/iletişim için DB+admin zaten var. İş = **seed verisini düzelt + admin'de düzenlenebilir olduğunu doğrula + frontend DB'den okuyor**. JSON fallback'i de güncel tut ama kaynak DB.

### ☐ Madde 6 — Sosyal medya linkleri (kullanıcı adı: `woodyvearkadaslari`)
**Mevcut (YANLIŞ):** seed `socials` = `{instagram: woodyandfriends_official, youtube: @Woodyvearkadaslari}`, facebook YOK.
- ☐ `020_woody_site_settings.sql` → `socials` (locale `'*'`) JSON değerini güncelle:
  - `instagram`: `https://www.instagram.com/woodyvearkadaslari/`
  - `youtube`: `https://www.youtube.com/@woodyvearkadaslari`
  - `facebook`: `https://www.facebook.com/woodyvearkadaslari` (yeni)
- ☐ `db:seed:*:fresh` ile yeniden seed (veya admin'den canlıda gir — kalıcı için seed de güncel olmalı).
- ☐ Admin "Genel Ayarlar" sekmesi `socials` editöründe instagram/youtube/**facebook** alanlarının olduğunu doğrula (`general-settings-tab.tsx`). Eksikse facebook alanını ekle.
- ☐ Frontend `SocialLinks.tsx:51-63` facebook anahtarını render ediyor mu doğrula; `target="_blank" rel="noopener"`.
- ☐ `site-defaults.json` `socials` fallback'ini de aynı değerlerle güncelle (sadece fallback).
- **DoD:** Footer'daki IG/YT/FB butonları DB'den gelen doğru `woodyvearkadaslari` hesaplarına gidiyor; müşteri admin'den değiştirebiliyor.

### ☐ Madde 7 — WhatsApp numarası `0533 157 03 73`
**Mevcut:** `contact_info` DB anahtarında `whatsapp` var; kodun çoğunda numara zaten doğru.
- ☐ `020_woody_site_settings.sql` `contact_info` → `whatsapp`/`whatsappNumber` = `0533 157 03 73` / `905331570373` doğrula/düzelt.
- ☐ Admin "Genel Ayarlar" `contact_info` editöründe whatsapp alanı düzenlenebilir mi doğrula.
- ☐ Frontend tüketicileri DB `contact_info`'dan okuyor mu: `WhatsAppFloatingButton.tsx`, `Footer.tsx:97-98`, `WoodyStoreShowcase.tsx:44`, `LevelFinderClient.tsx`, `PreschoolPageClient.tsx`. Sabit numara kalmışsa `getDefaultContactInfo()`/DB değerine bağla.
- ☐ Eski numara (`0531 305 38 42`) hiçbir yerde kalmamış doğrula.
- **DoD:** Tüm WhatsApp linkleri DB `contact_info`'dan tek/doğru numarayı çekiyor; müşteri admin'den değiştirebiliyor.

### ☐ Madde 8 — "Neden Woody?" bölümünü yukarı çek (home_sections — dinamik)
**Mevcut:** `WoodyHomePage.tsx:13-20` `DEFAULT_SECTION_KEYS` (kod fallback) + `home_sections` DB tablosu (orderIndex, admin endpoint var). Mevcut sıra: Hero → GrayBanner → SetZigzag → Certification(Cambridge) → WhyCambridge(Neden Woody) → News.
- ☐ DB `home_sections`'ta `WoodyWhyCambridge`'i `CertificationSection`'ın **üstüne** al (orderIndex güncelle — seed `home_sections` SQL'de veya admin'den).
- ☐ Kod fallback `DEFAULT_SECTION_KEYS` sırasını da DB ile tutarlı yap.
- ☐ Müşteri admin'den bölüm sırasını değiştirebiliyor mu doğrula (admin home-sections UI varsa).
- **DoD:** İlk girişte "Neden Woody?" Cambridge'den önce; sıralama DB'den geliyor.

---

## 2. Faz 2 — SAYFA İÇERİĞİ DB+ADMIN ALTYAPISI — Sahip: **Codex**

> En ağır iş. Statik JSON sayfa metinlerini `site_settings` anahtarlarına taşı, admin editörü yaz, frontend'i DB'den okut. Sonra müşteri içerik talepleri (2, 5, 9, 4-başlık) bu altyapıdan uygulanır.

### ☑ 2.0 — Altyapı: page_* anahtarları + admin editör + frontend okuyucu `[ÖNCE BU]`
- ☑ **Seed:** `020_woody_site_settings.sql`'e yeni `site_settings` anahtarları ekle (per-locale: tr/en/de): `page_store`, `page_preschool`, `page_workshop`. `value` = ilgili JSON dosyasının içeriği (mevcut `config/pages/<locale>/*.json`'dan kopyala). **ALTER yok — sadece INSERT.**
- ☑ **Admin UI:** site-settings altında yeni "Sayfa İçerikleri" sekmesi/sayfası — bu anahtarları locale bazlı düzenleyen form (JSON-aware editör; alanlar: başlık, açıklama, CTA, ürün/section listeleri, fiyat metni vb.).
- ☑ **Frontend okuyucu:** sayfaların statik `import store from '.../store.json'`'unu RTK `useGetSiteSettingByKeyQuery({ key:'page_store', locale })`'a çevir; DB boşsa JSON dosyasına **fallback**. (Pattern: `Footer.tsx` merge mantığı.)
- ☑ Build temiz, TS hatasız, SSR uyumlu.
- **DoD:** Store/Preschool/Workshop sayfa metinleri DB'den geliyor, admin'den düzenlenebiliyor, DB boşsa JSON fallback çalışıyor.

### ☑ Madde 2 — Store: "Teklif Al" + fiyat metni (admin'den yönetilebilir/kaldırılmış)
**Konumlar:** `WoodyStoreShowcase.tsx:9` ("Teklif Al"), `store.json:9` `primaryCTA`, `store.json:17-19` + `store-products.json:10-12` "2250 TL'den başlayan fiyatlarla".
- ☑ `page_store` DB değerinde `primaryCTA`'yı boşalt ve fiyat metinlerini kaldır (müşterinin isteği). Bu artık admin'den yönetilebilir alan.
- ☑ `WoodyStoreShowcase.tsx` → CTA ve fiyat değerleri DB içerikten geliyor; boşsa o eleman render edilmiyor (koşullu render). Buton/fiyat olmayınca kart hizalaması bozulmasın.
- ☑ JSON fallback dosyalarından da bu değerleri kaldır.
- **DoD:** Store'da "Teklif Al"/fiyat görünmüyor; müşteri admin'den geri ekleyebilir/değiştirebilir; düzen sağlam.

### ☑ Madde 5 — Store altı: "İçerikler" + "Sepete Ekle"/checkout kaldır
**Konumlar:** `WoodyStoreClient.tsx:45` cart state, `:92-114` checkout API, `:128` Iyzipay, `:171-174` "Sepete ekle", `:231` boş sepet metni.
- ☑ "Sepete ekle" + sepet sidebar + checkout (Iyzipay) akışı + "İçerikler" bölümü görünmesin. (Görünürlüğü `page_store` içinde bir bayrakla — örn. `showCart:false` — yönet ki müşteri ileride açabilsin.)
- ☑ Kullanılmayan cart state/import/API temizle; build kırılmasın.
- **DoD:** Store altında içerik/sepet/checkout yok; davranış `page_store` bayrağıyla yönetilebilir; build temiz.

### ☑ Madde 4 — Başlıkları sadeleştir + seri fontu (Baloo 2) `[BAĞIMLILIK: Madde 1-font]`
**Konumlar:** appName `site_settings.app_name` / `site-defaults.json:7` = "Woody ve Arkadaşları" (**DEĞİŞTİRME**). Seri başlıkları: `WoodySetZigzag.tsx:11`, `home-copy.ts:37-56` `SET_SERIES_MEDIA.ribbonTr`, `workshop.json`.
- ☑ Seri başlıkları metnini `page_*` / `home_*` DB içeriğine taşı (admin'den düzenlenebilir): değerler "Okul Serisi" / "Atölye Serisi" (ön ek yok).
- ☑ "Woody ve Arkadaşları X Serisi" şablonundan ön eki çıkar; `app_name`'in kendisine dokunma.
- ☑ Başlıklara `.font-series` class'ı uygula (Madde 1'de Baloo 2 olarak hazır).
- **DoD:** Başlıklar "Okul Serisi"/"Atölye Serisi", Baloo 2 (`.font-series`) fontunda, DB'den düzenlenebilir; marka adı bozulmadı.

### ☑ Madde 9 — Hero giriş metinlerini sil (DB hero içeriğinden)
**Konumlar:** `WoodyGrayBanner.tsx:2-3` dizileri: "Oyun Tabanlı Öğrenme", "Dijital İçeriklerle Desteklenen Sistem", "Her Yaş İçin Uygun Setler".
- ☑ Bu banner öğelerini DB içeriğe taşı (`homepage_hero`/`page_home` veya yeni `home_banner` anahtarı — liste şeklinde).
- ☑ "Oyun Tabanlı Öğrenme" ve "Dijital İçeriklerle Desteklenen Sistem" öğelerini kaldır (TR/EN/DE). Kalan öğe dengeli (divider/hizalama).
- ☑ `WoodyGrayBanner.tsx` listeyi DB'den okusun, boşsa JSON/kod fallback.
- **DoD:** Banner'da bu iki ifade yok; öğeler DB'den geliyor; müşteri admin'den ekleyip çıkarabiliyor.

### ☑ Madde 10 — Dijital İçerikler: Basic/Junior/Senior → belirgin buton (sunum — kodda)
**Konumlar:** `digital-content-data.ts:19-23` `DIGITAL_LEVELS` (renkler `var(--level-*)`), `DigitalContentHubClient.tsx:39-77`, `globals.css:81-84`.
- ☑ Basic/Junior/Senior net **tıklanabilir buton** (`<button>`/`role`, hover+focus, klavye odağı). Renk `--level-*`. Etiket metinleri DB `page_*`'ten gelebilir (opsiyonel), stil kodda.
- **DoD:** Basic/Junior/Senior renk kodlu, erişilebilir, basılabilir buton.

### ☐ Madde 3 — Öğretmen + Öğrenci Seti'ne dikey video `[VİDEO BEKLENİYOR — BLOK]`
**Konumlar:** `PreschoolPageClient.tsx:21-49` `LEVEL_MEDIA`, `:113-114` "Öğretmen/Öğrenci Seti". `preschool.json:17-18`.
- ☐ WeTransfer videolarını `public/media/woody/...` altına koy (dikey/portre). **Video URL'leri `page_preschool` DB içeriğinde tutulmalı** (admin'den değiştirilebilir/yüklenebilir), kodda sabit yol değil.
- ☐ "Öğretmen Seti" ve "Öğrenci Seti"ne dikey 9:16 player (`aspect-[9/16]`, max-width, mobil uyumlu).
- **DoD:** İki bölümde dikey video oynar; video kaynağı DB'den; responsive.
- **⚠ Blok:** Videolar gelmeden başlanamaz. Claude videoları teslim alınca haber verir.

---

## 3. Faz 1.5 — FONT (branding/design — kodda altyapı) — Sahip: **Codex**

### ☑ Madde 1 — Font: Quicksand (gövde) + Baloo 2 (başlık) `[Madde 4'ten ÖNCE]` `[KARAR VERİLDİ]`
**Karar (Claude):** Müşterinin istediği Montessori/Magic English lisans+teknik nedenle uygunsuz (Magic English = kişisel-kullanım Disney fontu + Türkçesiz; ücretsiz Montessori = tracing fontu). Yerine **lisans-güvenli (SIL OFL), tam Türkçe Google Fonts:** gövde **Quicksand**, başlık **Baloo 2**.
**Mevcut:** `brand-fonts.ts` `next/font/google` (Inter/Fredoka/Source Serif/IBM Plex Mono). `layout.tsx:120` html'e bağlı.
- ☑ `brand-fonts.ts`: Quicksand (`--font-quicksand`, 400/500/600/700) + Baloo 2 (`--font-baloo`, 700/800) ekle, `subsets:['latin','latin-ext']` (**latin-ext TR için zorunlu**); `brandFontVariableClassName`'e ekle. **woff2 GEREKMEZ.**
- ☑ `globals.css`: body varsayılan → Quicksand. **TR karakter testi:** ğ ı ş İ ö ü ç Ğ Ş.
- ☑ Utility class `.font-series` → Baloo 2 (Madde 4 kullanacak); `.font-quicksand` opsiyonel.
- ☑ (İleride dinamik) font tercihi `design_tokens.typography`'ye bağlanabilir — şimdilik kod.
- **DoD:** Body Quicksand, TR karakterler sağlam, `.font-series` (Baloo 2) hazır, build temiz.

---

## 4. CLAUDE — Koordinasyon + QA + Deploy

- ☐ Faz 1 ayar maddeleri (6, 7, 8) — Claude uygular (seed + admin doğrulama).
- ☐ Müşteriden videolar gelince Codex'e haber ver (Madde 3 bloğu).
- ☐ Font lisansı (Madde 1) belirsizse karar ver / kaynak sağla.
- ☐ **QA (her madde):** `bun run build` temiz mi, TS hatasız mı; DB seed (`db:seed:*:fresh`) sonrası anahtarlar doğru mu; **admin'den her içerik düzenlenebiliyor mu** (dinamik kuralı doğrulaması); frontend DB'den okuyup boşta JSON fallback yapıyor mu; TR/EN/DE + mobil/masaüstü görsel; **TR karakter regresyonu** (Montessori).
- ☐ Branch'te commit'leri topla, çakışma çöz, final `bun run build`.
- ☐ VPS deploy (`ssh root@46.202.194.115` — memory `woody-deployment`); seed çalıştır; canlıda 10 maddenin + admin düzenlenebilirliğinin smoke testi; müşteriye bilgi.

---

## 5. Dosya Sahipliği (çakışma önleme)

| Dosya / alan | Sahip | Madde |
|---|---|---|
| `backend/src/db/seed/sql/020_woody_site_settings.sql` (socials, contact_info, home_sections) | **Claude** | 6, 7, 8 |
| `admin_panel/.../site-settings/tabs/general-settings-tab.tsx` (facebook alanı doğrulama) | **Claude** | 6 |
| `frontend/src/config/site-defaults.json` (fallback) + `WoodyHomePage.tsx` | **Claude** | 6, 7, 8 |
| `frontend/src/layout/footer/Footer.tsx`, `SocialLinks.tsx`, `WhatsAppFloatingButton.tsx` (doğrulama) | **Claude** | 6, 7 |
| `020_woody_site_settings.sql` (yeni `page_*` anahtarları) | **Codex** | 2.0, 2, 4, 5, 9 |
| `admin_panel/.../site-settings/` (yeni "Sayfa İçerikleri" sekmesi) | **Codex** | 2.0 |
| `frontend/.../store/WoodyStoreShowcase.tsx`, `WoodyStoreClient.tsx` | **Codex** | 2, 5 |
| `frontend/.../preschool/PreschoolPageClient.tsx` + `public/media/woody/**` | **Codex** | 3 |
| `frontend/.../home/home-copy.ts`, `WoodySetZigzag.tsx`, `WoodyGrayBanner.tsx` | **Codex** | 4, 9 |
| `frontend/.../digital-content/*` | **Codex** | 10 |
| `frontend/src/config/pages/**/*.json` (fallback) | **Codex** | 2.0, 2, 4 |
| `frontend/src/lib/fonts/brand-fonts.ts`, `app/layout.tsx`, `app/globals.css`, `public/fonts/**` | **Codex** | 1, 10 |

> ⚠ `WoodyGrayBanner.tsx` ve `WoodyHomePage.tsx` ikisi de home altında ama farklı sahipler (Madde 8=Claude home order, Madde 9=Codex hero metni). Çakışmamak için: Claude sadece `WoodyHomePage.tsx` section sırasına, Codex sadece `WoodyGrayBanner.tsx` içeriğine dokunur. `home-copy.ts`'i Codex sahiplenir.

**Git:** Aynı `woody-icerik-i18n` branch; push öncesi `git pull --rebase`; küçük+sık commit; mesajda madde no.

---

## 6. İlerleme Özeti

| # | Madde | Faz | Sahip | Dinamik kaynağı | Durum |
|---|---|---|---|---|---|
| 1 | Font: Quicksand (gövde) + Baloo 2 (başlık) | 1.5 | Codex | kod (ileride design_tokens) | ☑ |
| 6 | Sosyal medya linkleri | 1 | Claude | `socials` (DB) | ✅ commit 564acd8 |
| 7 | WhatsApp 0533 157 03 73 | 1 | Claude | `contact_info` (DB) | ✅ doğrulandı (564acd8) |
| 8 | "Neden Woody?" yukarı | 1 | Claude | `home_sections` (DB) | ✅ commit 564acd8 |
| 2.0 | page_* DB+admin altyapısı | 2 | Codex | `page_*` (DB) | ☑ |
| 2 | Store "Teklif Al" + fiyat sil | 2 | Codex | `page_store` (DB) | ☑ |
| 5 | Store "İçerikler"/"Sepet" sil | 2 | Codex | `page_store` (DB) | ☑ |
| 4 | Başlık sadeleştir + seri fontu (Baloo 2) | 2 | Codex | `page_*`/`home_*` (DB) | ☑ |
| 9 | Hero 2 ifadeyi sil | 2 | Codex | `home_banner` (DB) | ☑ |
| 10 | Basic/Junior/Senior → buton | 2 | Codex | kod (sunum) | ☑ |
| 3 | Öğretmen/Öğrenci dikey video | 2 | Codex | `page_preschool` (DB) | ☐ (video bekleniyor) |
| — | QA + Merge + Deploy | — | Claude | — | ☐ |

**Engeller:** Madde 3 (videolar gelmedi). ~~Madde 1 font lisansı~~ → çözüldü (Quicksand + Baloo 2). ~~Faz 2 altyapı bağımlılığı~~ → tamamlandı.
**Müşteri onayı bekleyen:** Font değişimi (Montessori/Magic English yerine Quicksand/Baloo 2) — uygulandıktan sonra ekran görüntüsüyle müşteriye sun.
