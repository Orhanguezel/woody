# Frontend Çok-Dilli Statik İçerik Checklist — dil başına klasör

> **Hedef:** Tüm statik sayfa içeriğini `frontend/src/config/pages/<locale>/*.json` altında,
> **her dil için ayrı klasör** olacak şekilde düzenlemek. En az **tr + en**. Yeni dil eklemek =
> `config/pages/<lang>/` klasörünü oluşturup dosya setini koymak (kod değişmeden çalışmalı).
>
> **Mevcut durum:** 9 JSON dosyası `{ "tr": {…}, "en": {…}, "de": {…} }` gömülü yapıda;
> tüketim ya statik `import x from '.../x.json'` + `branchLocale`, ya da `lib/page-copy.ts`
> `import()` + `pickLocale`. `{{appName}}` token'ı + locale fallback var.
>
> **Kapsam:** Yalnız STATİK sayfa içeriği (`config/pages`). DB i18n (`ui_*` / site_settings)
> ayrı katmandır, bu checklist'in dışı.
>
> İşaretleme: `[ ]` yapılacak · `[x]` tamam

---

## Faz 0 — Hazırlık & tespit
- [ ] Dal: `git checkout -b frontend-i18n-klasor` (frontend-sablon üzerinden)
- [ ] Baseline: `cd frontend && bun run build` + `typecheck` + `lint`
- [ ] **about-page isim uyumsuzluğunu çöz:** `AboutPageContent.tsx` `about-page-copy.json`
      import ediyor ama dosya `about-page.json`. Tek isimde birleştir (build kırığı riski).
- [ ] Hedef diller netleştir: başlangıç `tr`, `en` (de mevcut ama opsiyonel — istenirse 3. dil).

## Faz 1 — Klasör yapısı
- [ ] `src/config/pages/tr/` ve `src/config/pages/en/` oluştur
- [ ] **Locale-bağımsız dosyalar klasör DIŞINDA kalır** (köte `config/pages/` altında):
      `routes.ts`, `site-defaults.json` (gerekiyorsa), home-layout registry (kodda)
- [ ] Hedef dosya seti (her dil klasöründe aynı isimler):
  - `home-hero.json`, `home-features.json`, `home-promises.json`, `home-intro-process.json`
  - `home-cta-banner.json`, `home-welcome-banner.json`
  - `about-page.json`, `blog-fallback-posts.json`, `editorial-policy.json`

## Faz 2 — İçeriği böl (embedded {tr,en,de} → klasör dosyaları)
- [ ] Her `X.json` için: `X.json.tr` → `tr/X.json`, `X.json.en` → `en/X.json`
      (tek dil objesi; artık üst seviyede `tr/en/de` sarmalı YOK)
- [ ] `{{appName}}` token'larını **koru** (değişmeden taşı)
- [ ] (Opsiyonel) `de/` da isteniyorsa `X.json.de` → `de/X.json`
- [ ] Eski tek-dosya `X.json`'ları sil (split sonrası)
- [ ] Otomasyon önerisi: küçük bir script ile böl (her dosyayı oku, locale anahtarlarına ayır)

## Faz 3 — Locale-aware loader
- [ ] `src/config/pages/loader.ts` ekle:
  - **Önerilen (server, "klasör bırak çalışsın"):**
    `loadPageContent<T>(name, locale): Promise<T>` →
    `import(\`@/config/pages/\${pickLocale(locale)}/\${name}.json\`)`, hata/eksikse
    **default locale (tr)** fallback. Webpack bunu context olarak çözer → yeni dil
    klasörü eklenince kod değişmeden bulunur.
  - **Alternatif (client SSR-safe):** statik registry (`tr`/`en` import edip runtime seç) —
    yeni dilde registry'ye 1 satır import gerekir.
- [ ] `injectAppName` entegre (token → env `NEXT_PUBLIC_APP_NAME` / DB app_name)
- [ ] `pickLocale` + fallback zinciri: istenen → default(tr) → boşsa anahtar adı

## Faz 4 — Tüketicileri güncelle
- [ ] `lib/page-copy.ts` helper'larını loader'a indir (getHomeHeroCopy / getEditorialPolicyCopy
      → `loadPageContent('home-hero'|'editorial-policy', locale)`)
- [ ] **Server bileşenler / server fetch:** `fetchHomeLayout.server.ts` (home-features) →
      loader ile locale'e göre
- [ ] **Client bileşenler** (şu an statik import + `[locale]`): server'dan **prop** ile içerik al
      VEYA registry kullan. Etkilenenler:
  - `home/HeroNew.tsx`, `home/FeaturesNew.tsx`, `home/PromisesSection.tsx`,
    `home/HomeIntroSection.tsx`, `home/HomeCTABanner.tsx`, `home/WelcomeBannerSection.tsx`
  - `blog/BlogPageContent.tsx`, `about/AboutPageContent.tsx`
- [ ] Eski `import … from '@/config/pages/X.json'` + `branchLocale(X, locale)` çağrılarını kaldır

## Faz 5 — EN içeriğini doğrula/tamamla
- [ ] `en/` altındaki tüm JSON'lar gerçek İngilizce (embedded `en` çoğu yerde mevcuttu —
      placeholder/eksik kalanları çevir)
- [ ] `tr/` içerikleri teyit; `{{appName}}` token'ları yerinde
- [ ] (de eklendiyse) `de/` doğrula

## Faz 6 — "Yeni dil ekleme" akışını dokümante et
- [ ] README / bu dosyaya kısa rehber:
  1. `cp -r src/config/pages/en src/config/pages/<lang>`
  2. `<lang>/*.json` içeriklerini çevir
  3. Dili aktif et (DB `app_locales` / admin `locales-settings-tab`)
  4. (registry kullanıldıysa) registry'ye import ekle — server-loader kullanıldıysa adım yok

## Faz 7 — Doğrulama
- [ ] `bun run build` + `typecheck` + `lint` temiz
- [ ] `/tr/...` Türkçe, `/en/...` İngilizce statik içerik gösteriyor
- [ ] Eksik anahtar/dil → fallback (tr) çalışıyor, sayfa kırılmıyor
- [ ] `{{appName}}` her dilde doğru enjekte
- [ ] Home section'ları (Hero/Features/Promises/CTA/Banner/Intro) + about + blog + editorial
      doğru dilde

---

## Notlar / kararlar
- **Client vs server:** mevcut home bileşenleri `'use client'` + statik import. Per-locale
  dinamik import client'ta SSR-güvenli değil → **server'da yükle, props ile geçir** (önerilen)
  ya da statik **registry**. Karar Faz 3'te netleşmeli.
- **DB i18n ayrı:** `ui_*` (form etiketleri vb.) DB/site_settings'ten gelir; bu checklist
  yalnız `config/pages` statik içeriğini klasörler. İki katman birbirinden bağımsız.
- **Token korunur:** `{{appName}}` her dil dosyasında kalır; marka yine env/DB'den.
- **Kapsam dışı:** `backend/`, `admin_panel/`, `packages/`.
