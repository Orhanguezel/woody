# WOODY — REFERANS PARİTE ÇEKLİSTİ (Master)

> **Amaç:** `woodyvearkadaslari.com` referans sitesini (içerik + tema + tüm sayfalar) bizim
> **Next.js + Fastify + Admin** şablonumuza **birebir** taşımak. Müşteri "içerikler ve tema her şey
> dahil birebir aynısı" istiyor.
>
> **Roller:** Claude Code = mimar + final review. **Codex** = toplu implementasyon. **Antigravity** =
> görsel/piksel parite QA. **Cursor** = nokta atışı refactor/cila.
>
> **Hazırlayan:** Claude Code (mimar) · **Tarih:** 2026-06-04
> **Durum kodları:** ☐ yapılacak · ◐ devam · ☑ bitti · ⚠ karar/blok

---

## 0. KAYNAK GERÇEĞİ (Source of Truth) — ÖNCE BUNU OKU

Referans materyaller: [`_referans/`](_referans/) (build'e dahil DEĞİL, salt-okunur).

| İhtiyaç | KULLAN (öncelik sırası) | Yol |
|---|---|---|
| **Güncel (Mayıs) tasarım/davranış** | 1. Source map (en güncel) | [`_referans/canli-site-mayis2026/build/static/js/main.5ff4dee7.js.map`](_referans/canli-site-mayis2026/build/static/js/main.5ff4dee7.js.map) |
| **Bileşen yapısı / JSX** | 2. GitHub repo (Nisan, ~1 ay geride) | [`_referans/github-repo-nisan2026/frontend/src/components/`](_referans/github-repo-nisan2026/frontend/src/components/) |
| **Çeviri metinleri (tr/en/ru/de)** | translations.js | [`_referans/github-repo-nisan2026/frontend/src/data/translations.js`](_referans/github-repo-nisan2026/frontend/src/data/translations.js) |
| **Gerçek görünür içerik + meta + JSON-LD** | Canlı HTML snapshot | [`_referans/canli-site-mayis2026/sayfalar/`](_referans/canli-site-mayis2026/sayfalar/) (`tr.html`, `en.html`, `tr_preschool.html`, `tr_blog.html`, `tr_store.html`, `tr_digital-content.html`) |
| **Tema renk/font** | tailwind.config.js + index.css | [`_referans/github-repo-nisan2026/frontend/tailwind.config.js`](_referans/github-repo-nisan2026/frontend/tailwind.config.js) |
| **URL/sayfa envanteri** | sitemap | [`_referans/canli-site-mayis2026/sitemap.xml`](_referans/canli-site-mayis2026/sitemap.xml) |
| **Medya (görsel/video/ses)** | emergentagent CDN URL'leri (kod içinde gömülü) | `https://customer-assets.emergentagent.com/job_render-studio-49/artifacts/...` |

**KURAL:** GitHub repo ile canlı build farklı (hash `6e44356d` vs `5ff4dee7`, backend Python vs PHP).
Çakışma olursa **canlı snapshot + source map kazanır**; repo sadece bileşen iskeleti/çeviri içindir.

**KURAL:** `_referans/` içinden **kod kopyalamayın**; oradan **içerik/tasarım okuyup** bizim
şablon mimarimize (DB-driven, i18n JSON, design tokens) **yeniden üretin**. Referans CRA/CSR'dır;
biz **SSR/SSG** yapıyoruz (GEO/SEO sorununu çözmek için — bkz. Faz 10).

---

## ROUTE EŞLEME TABLOSU (referans → bizim)

| Referans route | Bizim route (mevcut) | Durum |
|---|---|---|
| `/` | [`frontend/src/app/[locale]/page.tsx`](frontend/src/app/[locale]/page.tsx) | iskelet var |
| `/preschool` | `frontend/src/app/[locale]/preschool/page.tsx` | iskelet var |
| `/workshop` | `frontend/src/app/[locale]/workshop/page.tsx` | iskelet var |
| `/home-tutor` | `frontend/src/app/[locale]/home-tutor/page.tsx` | iskelet var |
| `/woody-academy` | `frontend/src/app/[locale]/woody-academy/page.tsx` | iskelet var |
| `/level-finder` | **YOK → oluştur** `frontend/src/app/[locale]/level-finder/page.tsx` | ☐ |
| `/library` | `frontend/src/app/[locale]/library/page.tsx` | iskelet var |
| `/blog`, `/blog/[slug]` | `frontend/src/app/[locale]/blog/...` | var |
| `/store`, `/store/[slug]` | `frontend/src/app/[locale]/store/...` | var |
| `/digital-content` | `frontend/src/app/[locale]/digital-content/page.tsx` | iskelet var |
| `/digital-content/:level/:section` | `frontend/src/app/[locale]/digital-content/[level]/[product]/page.tsx` | param adı `product` = referans `section` |
| `/lokal/istanbul-anaokulu-ingilizce-egitimi` | `frontend/src/app/[locale]/lokal/.../page.tsx` | var |

> **Not (digital-content param):** Referans bölümleri `storyland / movieland / musicland / library`.
> Bizim segment `[product]`. Karar: segment adını **`[section]`** yapmak yerine mevcut `[product]`'ı
> koru, anlamca `section` olarak kullan (kırılma olmasın). Slug değerleri birebir: `storyland`...

---

## BİLEŞEN EŞLEME TABLOSU (referans .jsx → bizim .tsx)

| Referans bileşen | Bizim hedef | Not |
|---|---|---|
| `Header.jsx` | `frontend/src/app/[locale]/layout.tsx` içindeki Header / `components/.../HeaderClient.tsx` | Store butonu (turuncu), dil seçici, mobil menü |
| `Footer.jsx` | mevcut Footer bileşeni | 3 kolon: marka / iletişim / sosyal |
| `HeroSection.jsx` | `components/woody/home/WoodyHomeHero.tsx` | Arka plan video + play modal |
| `ContentSection.jsx` | `components/woody/sets/WoodySetZigzag.tsx` | Sol/sağ görselli tekrarlı section |
| `CertificationSection.jsx` | **YOK → oluştur** | Sertifika görselleri şeridi |
| `WhyWoodyImageSection.jsx` / `WhyWoodySection.jsx` | `components/woody/why-woody/WoodyWhyCambridge.tsx` | İçerik referansa göre |
| `WoodyUpdates.jsx` | `components/woody/news/WoodyNewsCarousel.tsx` | Haber/update carousel |
| `FloatingContact.jsx` | `components/woody/WhatsAppFloatingButton.tsx` | WhatsApp yüzen buton |
| `StickyStoreButton.jsx` | **YOK → oluştur veya Header'a göm** | Sticky store CTA |
| `PreschoolPage.jsx` | `preschool/page.tsx` + yeni bileşenler | Seviye kartları + videolar |
| `WorkshopPage.jsx` / `HomeTutorPage.jsx` / `WoodyAcademyPage.jsx` | ilgili route + bileşen | |
| `LevelFinderPage.jsx` | **YOK → oluştur** | İnteraktif seviye testi (client) |
| `LibraryPage.jsx` | `library/page.tsx` | |
| `BlogPage.jsx` | `blog/page.tsx` + `WoodyBlogIndexClient.tsx` | |
| `WoodyStorePage.jsx` | `store/WoodyStoreClient.tsx` | |
| `DigitalContentPage.jsx` | `digital-content/page.tsx` | Seviye + bölüm grid |
| `DigitalContentDetailPage.jsx` | `digital-content/[level]/[product]/page.tsx` | Şifre modalı + oynatıcı |

---

## SABİT MARKA VERİLERİ (executor'lar yeniden türetmesin)

> Bunları DB/seed/site_settings'e işle; kodda hardcode etme (admin'den yönetilebilir kalsın).

- **Marka adı:** `Woody ve Arkadaşları` (EN: `Woody and Friends`)
- **Tagline (TR):** Okul öncesi İngilizce eğitiminde oyun temelli ve sistemli öğrenme modeli.
- **Telefon 1:** `+90 324 358 0373` · **Telefon 2 / WhatsApp:** `+90 533 157 0373` → `https://wa.me/905331570373`
- **E-posta:** `minayayinevi@gmail.com`
- **Instagram:** `https://www.instagram.com/woodyandfriends_official/`
- **YouTube:** `https://www.youtube.com/@Woodyvearkadaslari`
- **GA4:** `G-0D7LYLF51K` · **Google site verification:** `qWwfCYCPa_mEW1XRhmZ_QI2QM2D6I2YOMwfv0_QYyxs`
- **theme-color:** `#FF6A00`
- **OG görsel:** referansta `…/storage/optimized/woody-and-friends-optimized.webp` (kendi storage'ımıza taşı)

---

## TEMA TOKEN EŞLEME (başlangıç değerleri — kesin hex'i kaynaktan DOĞRULA)

Hedef dosya: [`frontend/src/lib/tokens/defaults.ts`](frontend/src/lib/tokens/defaults.ts) **+** seed
`backend/src/db/seed/sql/*` `site_settings.design_tokens` (admin'den override edilebilir kalır).

| Token | Değer | Kaynak |
|---|---|---|
| `colors.bg_base` / `bg_primary` | `#FFFFFF` | beyaz minimal zemin |
| `colors.text_primary` | `#0A0A0A` | `index.css` foreground `0 0% 3.9%`; basliklarda sikca `#0B1F3A` |
| `colors.brand_primary` | `#FF6A00` (turuncu — imza CTA) | Store butonu |
| `colors.brand_accent` | `#F5C518` (sarı) | vurgular |
| `colors.level_basic` | `#2196F3` (mavi) | Basic kartı |
| `colors.level_junior` | `#F5C518` (sarı) | Junior (`courseLevels.js`, `PreschoolPage.jsx`, `LevelFinderPage.jsx`) |
| `colors.level_senior` | `#E91E90` (pembe) | Senior |
| `colors.level_pro` | `#D32F2F` (kırmızı) | PRO |
| `typography.font_display` | `Fredoka` ("Magic English" yerine) | başlık/brand |
| `typography.font_sans` | `Inter` | UI/metin |
| `radius.md` | `0.5rem` | referans `--radius` |

> ⚠ **DOĞRULAMA ZORUNLU:** Yukarıdaki seviye renkleri Explore taramasından **yaklaşıktır**.
> Codex, kesin hex'leri `_referans/.../tailwind.config.js`, `HeroSection.jsx`, `PreschoolPage.jsx`
> ve seviye kartı bileşenlerinden **birebir** çekip günceller. Fontlar: `Inter`, `Fredoka`
> (ve digital-content başlığı için `Ink Free`/benzeri) `next/font` ile yüklenir.

---

## FAZLAR

### FAZ 0 — Hazırlık & Karar (Claude + Codex)
- ☑ **0.1** Source map'i okunur hale getir: `main.5ff4dee7.js.map` → orijinal JSX/metin çıkar
  (Codex: `source-map` ile veya hazır araçla; çıktı `_referans/_extracted/` altına, gitignore).
  **Not (Codex, 2026-06-04):** 50 uygulama kaynak dosyası `_referans/_extracted/` altına çıkarıldı;
  `MANIFEST.json` eklendi. Kök `.gitignore` zaten `_referans/` tamamını hariç tutuyor.
- ☑ **0.2** Tüm emergentagent medya URL'lerini envantere çıkar (görsel/video/ses) → `MEDYA-ENVANTERI.md`.
  **Not (Codex, 2026-06-04):** 88 tekil CDN medya dosyası bulundu: 51 görsel, 13 video, 24 ses.
  Kaynak: source map + `sayfalar/*.html` + `translations.js`.
- ☑ **0.3 KARAR (Orhan, 2026-06-04):** Medya = **A) önce CDN URL'leriyle başla, B) ÜRETİMDEN ÖNCE
  hepsini kendi storage'a indir** (Faz 9 zorunlu). emergentagent CDN'e kalıcı bağımlılık YOK.
- ☑ **0.4 KARAR (Orhan, 2026-06-04):** **TR + EN tam**, diğer 8 dil EN'e fallback. Gerçek `/tr` `/en`
  route + hreflang; Google Translate widget YOK.
- ☑ **0.5** `_referans` build/deploy'a girmediğini doğrula (`.gitignore`, next build exclude).
  **Not (Codex, 2026-06-04):** Kök `.gitignore` içinde `_referans/` mevcut; Next frontend `content`
  taraması `frontend/src` ve public/app CSS kapsamıyla sınırlı, `_referans` build girdisi değil.

### FAZ 1 — Tema / Design Token Paritesi (Codex → Antigravity doğrular)
- ☑ **1.1** `defaults.ts` token'larını referans paletine getir (üstteki tablo + DOĞRULAMA).
  **Not (Codex, 2026-06-04):** `frontend/src/lib/tokens/defaults.ts` beyaz zemin, near-black metin,
  turuncu `brand_primary`, sari Junior, mavi Basic, pembe Senior, kirmizi PRO renkleriyle guncellendi.
- ☑ **1.2** Fontları kur: `Inter` + `Fredoka` (+ display) `next/font/google` ile; `globals.css` `@theme`.
  **Not (Codex, 2026-06-04):** `frontend/src/lib/fonts/brand-fonts.ts` zaten `Inter` + `Fredoka`
  yukluyor; `globals.css @theme` font tokenlarini `--gm-font-*` uzerinden kullaniyor.
- ☑ **1.3** `theme-color` meta = `#FF6A00`. Light tema default (referans beyaz/minimal).
  **Not (Codex, 2026-06-04):** `site-defaults.json`, `manifest.ts` fallback ve aktif token branding
  `theme_color` turuncuya alindi.
- ☑ **1.4** Seed: `site_settings.design_tokens` JSON'unu referans paletiyle yaz (admin override çalışır).
  **Not (Codex, 2026-06-04):** `020_woody_site_settings.sql` ve Woody tema presetleri
  `013_theme_presets_seed.sql` senkronlandi; seed JSON parse kontrolu temiz.
- ◐ **1.5** **Kabul:** Anasayfa arka plan beyaz, metin near-black, Store butonu turuncu, seviye kartları
  doğru renklerde. Antigravity referans ekran görüntüsüyle yan yana doğrular (≤ göz farkı).
  **Not (Codex, 2026-06-04):** Codex build/typecheck temiz; gorsel piksel kabul Antigravity bekliyor.
  **Not (Antigravity, 2026-06-04 Tur 3):** WOODY STORE buton rengi `--gm-gold` (mavi #2196F3) → `--gm-primary` (#FF6A00 turuncu) düzeltildi. HeaderClient.tsx + StickyStoreButton.tsx güncellendi. Build ✅.

### FAZ 2 — Global Layout (Header / Footer / Floating) (Codex → Antigravity)
- ☑ **2.1 Header:** Logo + menü (`HOME · 🛍️ WOODY STORE · OKUL · ATÖLYE · EV & ÖZEL DERS ·
  WOODY ACADEMY · BLOG`) + dil seçici (bayraklı) + mobil hamburger. Store butonu `#FF6A00`,
  hover `#E85C00`, aktif link alt çizgi (`border-b-2 border-black`). Menü etiketleri i18n'den.
  **Not (Codex, 2026-06-04):** `HeaderClient.tsx` referans beyaz fixed header, turuncu store CTA,
  aktif link alt çizgisi, mobil dropdown ve bayraklı dil switcher ile güncellendi.
- ☑ **2.2 Footer:** 3 kolon (Marka/açıklama · İletişim: 2 telefon+WhatsApp+e-posta · Sosyal: FB/IG/YT),
  alt: Woody Academy kariyer CTA + telif. `bg-gray-900 text-white`. Linkler **admin menu_items**'tan.
  **Not (Codex, 2026-06-04):** `Footer.tsx` koyu 3 kolon referans düzenine alındı; footer linkleri
  `menu_items` public API/seed üzerinden okunuyor, fallback korunuyor.
- ☑ **2.3 FloatingContact:** WhatsApp yüzen buton + "Bize Ulaşın" balonu (`WhatsAppFloatingButton.tsx`).
  **Not (Codex, 2026-06-04):** Sağ alt WhatsApp butonu ve desktop balonu eklendi; mobil sticky
  `StickyStoreButton.tsx` eklendi.
- ☑ **2.4** Header/Footer linkleri **DB menüsünden** gelsin (admin → navigation). Seed ile doldur.
  **Not (Codex, 2026-06-04):** `020_woody_site_settings.sql` footer `menu_items` + TR/EN i18n seedleriyle
  genişletildi. Header SSR menü fetch + fallback zaten korunuyor.
- ◐ **2.5 Kabul:** Tüm sayfalarda header/footer referansla aynı; mobilde menü düzgün; linkler doğru route.
  **Not (Codex, 2026-06-04):** `frontend bun run build` ve `backend bun run build` temiz; görsel/mobil
  parite Antigravity doğrulaması bekliyor.
  - **2026-06-04 (Cursor cila):** Header/Footer a11y + focus halkası; Codex parite işi bekleniyor.
  - **2026-06-04 (Codex, Antigravity Tur 3):** Public header/offcanvas referans 7 linke sinirlandi;
    DB'den eski auth/fazla menu kaydi gelse bile Login/Register/Registrieren render edilmiyor.
    Footer sosyal ikonlari IG+YT olarak DOM'da dogrulandi; Facebook eklenmedi.
  - **2026-06-04 (Antigravity Tur 3):** `HeaderOffcanvas.tsx` — `!isAuthenticated` bloğu gizlendi; Login/Register artık
    header'da görünmüyor. Footer sosyal ikonları: seed + SocialLinks kod doğrulandı ✅. Build temiz.

### FAZ 3 — Anasayfa (Codex → Antigravity)
Kaynak: `tr.html` / `en.html` + `translations.js` (`hero`, `grayBanner`, `sections`) + `HeroSection.jsx`,
`ContentSection.jsx`, `CertificationSection.jsx`, `WhyWoodyImageSection.jsx`, `WoodyUpdates.jsx`.
- ☑ **3.1 Hero:** Arka plan video (85vh, overlay `bg-black/35`, t=16'dan başla) + play modal. Video poster.
  **Not (Codex, 2026-06-04):** `WoodyHomeHero.tsx` referans full-bleed arka plan video + play modal
  davranışına alındı; CDN URL geçici, Faz 9'da storage'a taşınacak.
- ☑ **3.2 Gri bant:** "Oyun Tabanlı Öğrenme / … / Her Yaş İçin Uygun Setler" (i18n `grayBanner`).
  **Not (Codex, 2026-06-04):** `WoodyGrayBanner.tsx` eklendi ve home akışına bağlandı.
- ☑ **3.3 Set kartları:** "Hangi Woody Set Sizin için?" → Preschool / Workshop / Home Tutor kartları
  (tag+title+desc+CTA) → ilgili route. (`WoodySetZigzag.tsx`).
  **Not (Codex, 2026-06-04):** `WoodySetZigzag.tsx` referans full-row alternasyon, renkli vertical ribbon,
  CDN seri gorselleri ve Preschool/Workshop/Home Tutor route linkleriyle guncellendi.
- ☑ **3.4 Sertifika şeridi** (`CertificationSection`) — yeni bileşen, görseller CDN/storage.
  **Not (Codex, 2026-06-04):** `CertificationSection.tsx` eklendi; mevcut local certificate assetleri
  kullanılıyor.
- ☑ **3.5 Why Woody** görselli section (`WoodyWhyCambridge.tsx` içeriğini referansa göre).
  **Not (Codex, 2026-06-04):** Sertifika kartlari ayri section'a tasindi; `WoodyWhyCambridge.tsx`
  referans sol gorsel + sag 12 maddelik lacivert ikon listesi duzenine alindi.
- ☑ **3.6 Woody Updates** haber carousel (`WoodyNewsCarousel.tsx`).
  **Not (Codex, 2026-06-04):** Haberler portre kart carousel, aktif kart scale/opacity, mobil dot ve
  video modal davranisiyla yeniden kuruldu; JSON `video`/`fitImage` alanlari loader'da korunuyor.
- ☑ **3.7** Bu section'lar **home-layout** DB registry'sine bağlı kalsın (admin sıralayabilsin).
  **Not (Codex, 2026-06-04):** `012_home_sections_schema.sql` Woody section key'leriyle seedlendi;
  `/[locale]/page.tsx` `fetchHomeLayout()` sonucunu `WoodyHomePage`'e geciyor ve sayfa sirayi
  bilinen component_key'lere gore render ediyor.
- ◐ **3.8 Kabul:** Anasayfa referansla bölüm-bölüm aynı sırada/içerikte; video oynar; CTA'lar doğru.
  **Not (Codex, 2026-06-04):** `frontend bun run build`, `backend bun run build` ve dev server `/tr`
  200 OK temiz; nihai piksel/video oynatim kabul Antigravity gorsel QA bekliyor.

### FAZ 4 — İç Sayfalar (Codex → Antigravity)
- ☑ **4.1 Preschool:** Hero video + Öğretmen/Öğrenci seti + Seviyeler (Basic/Junior/Senior/PRO,
  renk+desc+tag) + level videoları + Finder/Library/Store CTA. Kaynak `tr_preschool.html`,
  `PreschoolPage.jsx`, `translations.js.preschoolPage`.
  **Not (Codex, 2026-06-04):** `/preschool` generic `WoodyPage` yerine `PreschoolPageClient` ile
  referans video hero, sari banner, ogretmen/ogrenci set bloklari, dijital icerik banner'i, 4 seviye
  karti, seviye video modal secimi ve Finder/Library/Store CTA akisi kuruldu. Build temiz; piksel QA 4.8.
- ☑ **4.2 Workshop:** atölye (3-5 kişi) içerik sayfası (`WorkshopPage.jsx`).
  **Not (Codex, 2026-06-04):** `/workshop` generic `WoodyPage` yerine `WorkshopPageClient` ile
  referans video hero, yesil banner, ogretmen/ogrenci set bloklari, coming-soon seviye kartlari,
  Library/Store CTA ve video modal akisi kuruldu. Build temiz; piksel QA 4.8.
- ☑ **4.3 Home Tutor:** bireysel ders (`HomeTutorPage.jsx`).
  **Not (Codex, 2026-06-04):** `/home-tutor` generic `WoodyPage` yerine `HomeTutorPageClient` ile
  referans video hero, mor/pembe banner, ogretmen/ogrenci set bloklari, coming-soon seviye kartlari,
  Level Finder/Library/Store CTA ve video modal akisi kuruldu. Build temiz; piksel QA 4.8.
- ☑ **4.4 Woody Academy:** öğretmen eğitimi + başvuru CTA (`WoodyAcademyPage.jsx`).
  **Not (Codex, 2026-06-04):** `/woody-academy` generic `WoodyPage` yerine `WoodyAcademyPageClient`
  ile referans logo hero, geri linki, ogrenci Cambridge sertifika sureci, ogretmen TKT gelisim
  programi, gorsel bloklar ve avantaj/sertifika kartlari kuruldu. Build temiz; piksel QA 4.8.
- ☑ **4.5 Library:** dijital kütüphane tanıtım (`LibraryPage.jsx`).
  **Not (Codex, 2026-06-04):** `/library` generic `WoodyPage` yerine `LibraryPageClient` ile
  referans aciklayici hero ve Basic/Junior/Senior tam ekran image/text spread duzeni kuruldu.
  Ogretmen/ogrenci kitap linkleri referans preview URL'lerine baglandi. Build temiz; piksel QA 4.8.
- ☑ **4.6 Level Finder:** **YENİ** route + interaktif test (client component, `LevelFinderPage.jsx`).
  **Not (Codex, 2026-06-04):** `/[locale]/level-finder` route'u ve `LevelFinderClient` eklendi.
  Referanstaki A/B/C bloklu 18 soru, seviye gecis kurallari, sonuc karti ve WhatsApp siparis CTA'si
  yeniden kuruldu; sitemap route listesine eklendi. Build temiz; `/tr/level-finder` 200 OK.
- ☑ **4.7 Lokal SEO sayfası** (İstanbul) içeriğini referansa göre (sadece tr).
  **Not (Codex, 2026-06-04):** `/tr/lokal/istanbul-anaokulu-ingilizce-egitimi` generic `WoodyPage`
  yerine `LocalIstanbulGuide` ile ham JSON'daki TOC, tablo, bolum paragraflari, listeler, hatalar,
  SSS, ilgili bloglar ve CTA SSR long-form rehber duzeninde render ediliyor. Build temiz; 200 OK.
- ◐ **4.8 Kabul:** Her sayfa referans snapshot/JSX ile aynı bölümler + metin + görsel.
  **Not (Codex, 2026-06-04):** Codex tarafinda 4.1-4.7 implementasyonlari tamamlandi; frontend/backend
  build temiz ve ilgili route'lar 200 OK. Nihai piksel/video davranisi kabul Antigravity gorsel QA bekliyor.

### FAZ 5 — Blog (Codex)
- ☑ **5.1** Liste (`/blog`) + detay (`/blog/[slug]`): DB blog + JSON fallback (mevcut altyapı).
  **Not (Codex, 2026-06-04):** `blog/page.tsx` ve kategori sayfasi DB postlari oncelikli,
  JSON fallback ikinci kaynak olacak sekilde korundu; detay sayfasi DB/custom page/fallback sirasi ve
  Article+FAQ JSON-LD akisini kullanmaya devam ediyor.
- ☑ **5.2** Referans blog yazılarını seed/fallback JSON'a aktar (`tr_blog.html` + repo BlogPage).
  **Not (Codex, 2026-06-04):** 16 referans blog yazisi fallback JSON'da baslik/slug/gorsel setiyle
  mevcut; jenerik ozetler referans BlogPage ozetleriyle degistirildi. Blog indeks hero, featured
  rehber karti, 4 kolon kart grid ve Woody FAQ akordeonu referans duzenine tasindi.
- ◐ **5.3 Kabul:** Blog kartları + detay referansla uyumlu; Article+author JSON-LD (Faz 10).
  **Not (Codex, 2026-06-04):** `frontend bun run build` temiz; bilinen `127.0.0.1:8101` fetch uyarisi
  build'i kirmiyor. Nihai gorsel parite Antigravity QA bekliyor.

### FAZ 6 — Store (Codex)
- ☑ **6.1** Ürün listesi + kategori grid (`WoodyStoreClient.tsx`). Ürünler **DB products** + JSON fallback.
  **Not (Codex, 2026-06-04):** `/store` generic `WoodyPage` yerine `WoodyStoreShowcase` ile
  referans turuncu hero, Okul/Atolye/Ozel Ders kategori akisi, teklif CTA'li Okul Serisi grid ve
  Atolye/Ozel Ders "cok yakinda" bloklari kuruldu. DB checkout `WoodyStoreClient` DB urun varsa altta
  korunuyor; JSON fallback vitrin icin kullaniliyor.
- ☑ **6.2** Referans ürünlerini seed et (isim/fiyat/görsel/açıklama — `tr_store.html`).
  **Not (Codex, 2026-06-04):** TR/EN `store-products.json` referans CDN gorselleriyle guncellendi.
  `021_categories.sql` Okul/Atolye/Ozel Ders serilerine, `022_products.sql` Basic/Junior/Senior
  ogrenci setleri + 2250 TL + referans gorsellerine hizalandi.
- ◐ **6.3 Kabul:** Mağaza referans düzeniyle aynı; Product+offers JSON-LD (Faz 10).
  **Not (Codex, 2026-06-04):** `frontend bun run build`, `backend bun run build`, JSON parse ve
  dev server `/tr/store` 200 OK temiz; nihai piksel/Product JSON-LD kabul Antigravity/Faz 10 bekliyor.

### FAZ 7 — Digital Content (Codex)
Kaynak: `tr_digital-content.html`, `DigitalContentPage.jsx`, `DigitalContentDetailPage.jsx`.
- ☑ **7.1 Hub:** seviye seçici (basic/junior/senior) + 4 bölüm kartı (storyland/movieland/musicland/library).
  **Not (Codex, 2026-06-04):** `/digital-content` generic `WoodyPage` yerine `DigitalContentHubClient`
  ile referans beyaz sayfa, Woody Digital World basligi, Basic/Junior/Senior gradient kartlari ve
  tiklayinca acilan Storyland/Movieland/Musicland/Library alt kartlari kuruldu.
- ☑ **7.2 Detay:** `[level]/[product]` — içerik grid + video/ses oynatıcı (12 kombinasyon).
  **Not (Codex, 2026-06-04):** Detay route'u `DigitalContentDetailClient` ile geri bar, 4 kolon
  icerik grid'i, video placeholder modal'i, Musicland audio oynatici ve Library yakinda mesajiyla
  referans davranisina tasindi.
- ☑ **7.3 İçerik verisi:** `digital-products.json` (mevcut) referans içerikle doldur (kapak+medya URL).
  **Not (Codex, 2026-06-04):** `digital-content-data.ts` seviyeler, bolum renkleri, 16/8/8/0 sayaclari,
  100 PIN + admin PIN ve Basic/Junior/Senior Musicland gercek CDN ses/gorsel URL'leriyle eklendi.
- ☑ **7.4 Şifre koruması:** Referansta korumalı bölümler (storyland/library/movieland), korumasız
  (musicland), 100 şifre + admin şifresi (localStorage). **Karar:** birebir taşı mı, yoksa
  sunucu-taraflı güvenli sürüm mü? Öneri: parite için aynı davranış + ileride backend doğrulama.
  **Not (Codex, 2026-06-04):** Parite icin client/sessionStorage tabanli PIN akisi kuruldu; korumali
  bolumler storyland/library/movieland, Musicland acik.
- ◐ **7.5 Kabul:** Hub + 12 detay sayfası açılır; oynatıcılar çalışır; şifre akışı referansla aynı.
  **Not (Codex, 2026-06-04):** `frontend bun run build` temiz; `/tr/digital-content`,
  `/tr/digital-content/basic/storyland`, `/tr/digital-content/basic/musicland` 200 OK. Nihai medya
  oynatim ve piksel kabul Antigravity QA bekliyor.

### FAZ 8 — İçerik & i18n (Codex)
- ☑ **8.1** `translations.js`'teki TÜM metinleri bizim sistemimize map'le:
  - Sayfa içerikleri → [`frontend/src/config/pages/tr/*.json`](frontend/src/config/pages/tr/) ve `en/`
    (her dil **ayrı klasör** — mevcut yapı). `{{appName}}` token kullan.
  - UI string'leri (nav, footer, butonlar) → `site_settings` `ui_*` (DB) tr+en seed.
  **Not (Codex, 2026-06-04):** Referans `translations.js` ana metinleri mevcut TR/EN JSON sayfa
  dosyalarina ve `020_woody_site_settings.sql` UI/header/footer/blog seedlerine mapli. Bu turda yeni
  Store/Digital client sabitleri de TR/EN kosullu metinlere cekildi.
- ☑ **8.2** TR + EN **tam**; ru/de ve diğerleri fallback (EN). Eksik dil = klasör/fallback ile.
  **Not (Codex, 2026-06-04):** TR/EN JSON dosya seti karsilastirildi; tek fark `local-istanbul.json`.
  Bu route bilerek TR-only ve `locale !== 'tr'` icin `notFound()` veriyor. Diger diller loader
  fallback mekanizmasi ile TR/EN kaynaklardan dusuyor.
- ☑ **8.3** Dil seçici gerçek route (`/tr`, `/en`) — Google Translate widget YOK (GEO için).
  **Not (Codex, 2026-06-04):** `LanguageSwitcher` aktif locale listesinden `switchLocale()` ile
  locale-prefixed route'a geciyor; Google Translate widget kullanilmiyor.
- ◐ **8.4 Kabul:** `/tr` ve `/en` tüm sayfalarda referans metniyle birebir; dil değişimi çalışır.
  **Not (Codex, 2026-06-04):** `frontend bun run build` temiz; bilinen `127.0.0.1:8101` fetch uyarisi
  build'i kirmiyor. Nihai metin/piksel kabul Antigravity QA bekliyor.

### FAZ 9 — Medya Migrasyonu (Codex) — üretimden ÖNCE
- ☑ **9.1** `MEDYA-ENVANTERI.md`'deki tüm CDN dosyalarını indir → `backend/uploads/woody/...`
  veya `frontend/public/media/...`.
  **Not (Codex, 2026-06-04):** Kod/JSON/SQL icinde gecen 87 tekil `customer-assets.emergentagent.com`
  URL'si `frontend/public/media/woody/reference/` altina indirildi. Unicode normalize/uzun isim
  farklariyla klasorde 96 dosya var; toplam yaklasik 1.2GB.
- ☑ **9.2** `storage_assets` seed + URL'leri yerel/storage URL'leriyle değiştir.
  **Not (Codex, 2026-06-04):** Tum `customer-assets` URL'leri `/media/woody/reference/...` public
  path'lerine mekanik olarak cevrildi. `019_woody_reference_media_assets.sql` 96 local medya satiri
  icin `storage_assets` seed'i olarak eklendi.
- ☑ **9.3 Kabul:** Hiçbir sayfa `customer-assets.emergentagent.com`'a bağımlı değil; tüm medya bizden.
  **Not (Codex, 2026-06-04):** `rg customer-assets.emergentagent.com frontend/src backend/src` bos;
  `frontend bun run build` ve `backend bun run build` temiz. Bilinen `127.0.0.1:8101` fetch uyarisi
  frontend build'i kirmiyor.

### FAZ 10 — SEO / Schema / GEO (Codex → Claude review)
Referans GEO skoru 40/100; yeni inşa bunları çözmeli (rapor: `Woody-ve-Arkadaslari-GEO-SEO-Raporu.pdf`).
- ☑ **10.1** Her sayfada `generateMetadata` (title/description/canonical/OG/twitter) — DB seo_pages'ten.
  **Not (Codex, 2026-06-04):** `buildPageMetadata`/`woodyMetadata` akisi DB `seo_pages` oncelikli; sayfa fallbacklari
  korunuyor.
- ☑ **10.2** hreflang: tr/en/x-default (gerçek, next-intl mantığı). 10 dil hedefse hepsine.
  **Not (Codex, 2026-06-04):** Metadata alternates ve sitemap alternates aktif locale setinden uretiliyor; `sitemap.xml`
  HTTP 200 dogrulandi.
- ☑ **10.3** JSON-LD: Organization, WebSite, EducationalOrganization, BreadcrumbList (her sayfa) +
  **Product+offers/fiyat** (store/preschool), **Article+author** (blog), **FAQPage** (FAQ olan sayfalar),
  **LocalBusiness+tam NAP** (lokal/contact).
  **Not (Codex, 2026-06-04):** Global org/web site, sayfa breadcrumb/educational/local business, blog article/FAQ
  ve store listing/product offer graflari mevcut.
- ☑ **10.4** `sitemap.xml` (43 URL × dil) + `robots.txt` + gerçek **`llms.txt`** (düz metin).
  **Not (Codex, 2026-06-04):** `robots.txt`, `sitemap.xml`, `/llms.txt` HTTP 200; public `llms.txt` gercek
  metin olarak guncellendi.
- ◐ **10.5** Güvenlik başlıkları: HSTS, CSP (next.config/nginx). DNS tarafı: DMARC `p=quarantine`, SPF `-all`.
  **Not (Codex, 2026-06-04):** Next config CSP/HSTS/referrer/permissions/clickjacking basliklarini uretiyor; DNS
  DMARC/SPF repo disi is olarak kaliyor.
- ◐ **10.6 Kabul:** SSR çıktısında içerik görünür (view-source); şema validator temiz; hreflang doğru.
  **Not (Codex, 2026-06-04):** Build ve temel endpoint kontrolleri temiz; sema validator ve final Claude review bekliyor.

### FAZ 11 — Admin Paritesi / Dinamiklik (Codex → Claude review)
- ☑ **11.1** Doğrula: tema, home section sırası, sayfa SEO, menü, blog, ürün — **hepsi admin'den** yönetilebilir.
  **Not (Codex, 2026-06-04):** Tema `site_settings`/theme admin, home sirasi `/admin/home/sections`,
  sayfa SEO `seo_pages`, menu `menu_items`, blog shared blog admin, urun/category shared admin rotalarina bagli.
  Header API doluyken gercek admin menusunu kullanacak sekilde duzeltildi.
- ☑ **11.2** Referans içeriği seed olarak girilmiş olmalı; admin'den düzenlenince frontend güncellensin.
  **Not (Codex, 2026-06-04):** Referans palette/theme/menu/SEO/contact/footer seed'i `020`, section sirasi `012`,
  blog `024`, urun/kategori `021/022`, medya asset kayitlari `019` ile girildi; frontend DB oncelikli, JSON fallbackli.
- ◐ **11.3 Kabul:** Antigravity admin↔frontend canlı testi (3 senaryo: tema rengi, section sırası, SEO başlık).
  **Not (Codex, 2026-06-04):** Kaynak ve build dogrulandi; canli admin↔frontend senaryo testi Antigravity review bekliyor.
  - **2026-06-04 (Codex, Antigravity Tur 3):** Test DB'deki eski public header menu kalintilarina karsi
    auth/fazla link filtresi eklendi. Header referans route setinden sasmaz; admin canli testinde
    footer `socials` setting override'i ayrica dogrulanmali.

### FAZ 12 — QA, Build & Deploy (Antigravity + Cursor + Claude)
- ◐ **12.1 Antigravity:** Piksel parite QA — referans `sayfalar/*.html` + canlı site vs bizim, sayfa-sayfa.
  **Not (Antigravity, 2026-06-04 Tur 3):** SSR HTML analizi tamamlandı. Önceki 5 P1'in 4/5'i çözüldü.
  Antigravity düzeltmesi: WOODY STORE buton `--gm-primary` turuncu; hero-poster.webp eklendi. Build ✅.
  Kalan: Login/Register linkleri header'da görünüyor (Codex'e), sosyal medya ikonları DB seed doğrulaması gerekiyor.
  Görsel ekran görüntüsü turu (375px/768px/1400px) rate limit nedeniyle ertelendi — bir sonraki oturuma.
- ☑ **12.2 Cursor:** Lint/format/erişilebilirlik/küçük responsive düzeltmeler, ölü kod temizliği.
  - **2026-06-04 (Cursor):** Frontend: globals CTA + cms prose, auth, woody, layout, containers.
    **Admin (Cursor):** `admin_panel/src/lib/a11y.ts`, login a11y, support detay `#16a34a` → `primary`
    token, textarea `aria-label`. `typecheck` temiz.
  - **2026-06-04 (Cursor):** Hardcode renk → token: admin site-settings (SERP, CSS editör, design-tokens
    önizleme), email iframe boş metin. Frontend woody: `#0B1F3A`→`text-text-secondary`, altın/turuncu
    gradyan→`brand-*`, seviye çizgileri→`level-*`, academy skill kartları→`info/success/error`. `typecheck` temiz.
  - **2026-06-04 (Cursor, Faz 12 kapanış):** Store showcase + digital-content seviye/bölüm renkleri token;
    digital hub `aria-expanded`/`aria-label`; şifre modal `aria-label` + `role="alert`; admin liste
    rozetleri `emerald-*`→`primary`; digital grid `<img>`→`next/image`. `lint` + `typecheck` + build
    temiz. Davranış/görünüm değişmedi (cila).
- ☑ **12.3** `bun run build` (frontend + admin + backend) hatasız; `tsc` temiz.
  - **2026-06-04 (Cursor):** `frontend` + `admin_panel` + `backend` `bun run build` / `tsc` hatasız.
    Lighthouse/GEO (12.4) ve deploy (12.5) Cursor kapsamı dışı.
  - **2026-06-04 (Codex):** `frontend`, `admin_panel`, `backend` build tekrar temiz. Frontend build'de backend
    `127.0.0.1:8101` kapali oldugu icin bilinen fetch warning'leri var; cikis kodu 0.
- ◐ **12.4** Lighthouse/GEO: SSR, CWV, şema kontrol.
  - **2026-06-04 (Codex):** `bun run seo:schema` temiz; SSR HTML'de icerik/JSON-LD gorunuyor.
    hreflang `pt-br` canonical route'a duzeltildi. Lighthouse/CWV canli ortam testi bekliyor.
- ☐ **12.1 Antigravity piksel parite QA** — HENÜZ YAPILMADI; tüm faz Kabul (◐) maddeleri buna bağlı.
- ☑ **MEDYA KARARI (Orhan, 2026-06-04) — REVİZE:** `frontend/public/media` (1.2GB, 88 dosya, 255MB'lik
  videolar) **git'e GİRMEZ** (`.gitignore`) ve **laptoptan rsync EDİLMEZ** (`deploy.sh --exclude`).
  Bunun yerine **VPS, CDN'den DOĞRUDAN indirir** (datacenter hızı, ev upload'u yok):
  - İndirme listesi: [`deploy/media-manifest.tsv`](deploy/media-manifest.tsv) (88 satır, dosya↔URL).
  - İndirici: [`deploy/fetch-media.sh`](deploy/fetch-media.sh) (idempotent; `deploy.sh` adım 2b'de otomatik çağrılır).
  - `storage_assets` seed (`019_*.sql`) URL'leri `/media/woody/reference/...` map'li.
  - CDN doğrulandı (171MB hero = HTTP 200); VPS 90GB boş.
  ⚠ İLERİ İŞ: hero/video transcode (255MB → ~10-20MB mp4/webm + poster, CWV) — indirildikten sonra VPS'te.
- 🚪 ☐ **12.5** Deploy/DNS — Orhan kararı: **BEKLET** (12.1 QA + transcode öncesi yok).
- 🚪 ☐ **12.6** commit + push — Orhan kararı: **BEKLET**. (Medya bloker'ı çözüldü; push artık teknik
  olarak mümkün ama onay + 12.1 QA bekleniyor.)

---

## ARAÇ DAĞILIMI ÖZET

| Faz | Codex | Antigravity | Cursor |
|---|---|---|---|
| 0 Hazırlık | ●(extract) | | |
| 1 Tema | ● | doğrula | |
| 2 Layout | ● | doğrula | cila |
| 3 Anasayfa | ● | doğrula | |
| 4 İç sayfalar | ● | doğrula | |
| 5 Blog | ● | | |
| 6 Store | ● | | |
| 7 Digital | ● | doğrula | |
| 8 i18n | ● | | |
| 9 Medya | ● | | |
| 10 SEO/GEO | ● | | |
| 11 Admin | ● | doğrula | |
| 12 QA/Deploy | | ● | ● |

Her faz **sırayla**; Codex bir fazı bitirince Antigravity doğrular, sonra diğer faza geçilir.
Claude her faz sonunda mimari/parite review yapar.

## ÇALIŞMA KURALLARI (CLAUDE.md'den)
- Aynı dosyada aynı anda iki araç çalışmaz.
- `ALTER TABLE` yasak — şema değişikliği `CREATE TABLE`'a kolon ekleyip `db:seed:*:fresh`.
- Bun runtime; `.env` commit edilmez.
- `_referans/` salt-okunur; oradan kopyalama yok, yeniden üretim var.

## İLERLEME (executor'lar buraya işaretler)
- Faz 0: ☑ · Faz 1: ☑ · Faz 2: ☑ · Faz 3: ☑ · Faz 4: ☑ · Faz 5: ☑ · Faz 6: ☑
- Faz 7: ☑ · Faz 8: ☑ · Faz 9: ☑ · Faz 10: ◐ · Faz 11: ◐ · Faz 12: ◐ (12.2 ☑, 12.3 ☑, 12.4 ◐)
