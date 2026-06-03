# Frontend Şablon Checklist — markadan/projeden bağımsız boş taslak

> **Hedef:** Frontend'i tıpkı `backend` + `admin_panel` gibi **nötr, boş taslak şablona**
> çevirmek. İskelet (routing, i18n, auth, layout, SEO, RTK, tema) korunur; astroloji/
> danışman/fal/zodyak gibi **domain içerikleri** boşaltılır. Marka adı `AppName` token'ı
> + env üzerinden gelir.
>
> Kaynak: goldmoodastro türevi (astroloji). ~198 dosya astro/danışman/zodyak referansı içeriyor.

İşaretleme: `[ ]` yapılacak · `[x]` tamam

---

## Faz 0 — İlke & hazırlık
- [ ] Çalışma dalı aç (örn. `frontend-sablon`), küçük commit'ler
- [ ] `bun run build` ve `bun run lint` baseline'ı al (mevcut hatalar not edilsin)
- [x] **Karar (verildi): ticaret (checkout / pricing / booking-payment) ŞİMDİLİK KALDIRILACAK.**
      Gerekince shared `orders`/`payments` ile geri eklenir.

---

## Faz 1 — Domain modüllerini kaldır (astro / danışman / fal / ticaret)
**Route klasörleri** (`src/app/[locale]/`):
- [ ] `explore/`, `pricing/`, `dashboard/`, `karne/`
- [ ] `checkout/`, `checkout/[orderId]/` (ticaret — kaldırılacak)
- [ ] `me/consultant/`, `me/credits/`, `me/readings/` (hesap altı astro)
- [ ] `profile/bookings/` (randevu domaini)

**İçerik container'ları** (`src/components/containers/`):
- [ ] `coffee/` (kahve falı), `dreams/` (rüya), `numerology/`, `tarot/`
- [ ] `consultant/`, `become-consultant/`, `consultant-dashboard/`
- [ ] `chat/`, `booking-payment/`, `feedback/`

**lib / features:**
- [ ] `src/lib/zodiac/` (signs, celebrities, affirmations) — sil
- [ ] `src/features/chat/` — astro destek chat'i (sil veya nötrle)
- [ ] `src/lib/og/`, `src/lib/tokens/` — astro'ya özel parça varsa nötrle

**Home section bileşenleri** (`src/components/containers/home/`) — **kaldır**:
- [ ] `ConsultantsSection`, `ZodiacGridSection`, `ExpertiseCategoriesSection`
- [ ] `HybridModelSection`, `TransparencySection`, `WaitlistSection`
- [ ] `PremiumMembershipBanner`, `FirstSessionDiscountBanner`, `WelcomePremiumBanner`
- [ ] `HomeBecomeConsultantBanner`, `HomeTestimonialsSection`, `AppDownloadSection`

---

## Faz 2 — Korunacak iskelet (generic) + nötr placeholder
**Aynen koru (marka nötrlenerek):**
- [ ] Auth: `login`, `register`, `forgot-password`, `password-reset`, `verify-email`, `logout`
- [ ] `profile/` (temel), `me/settings/` (temel hesap ayarları)
- [ ] `blog/`, `blog/[slug]/`, `contact/`, `faqs/`
- [ ] Legal sayfalar: `terms`, `privacy-policy`, `cookie-policy`, `kvkk`, `editorial-policy`
      (+ TR eşleştirmeleri: `gizlilik`, `kullanim-sartlari`, `cerez-politikasi`, `kvkk`, `legal-notice`)
- [ ] `layout/` header + footer, `i18n/`, `seo/`, `store/` (RTK), tema

**Nötr placeholder içerikle koru** (home iskeleti):
- [ ] `HeroNew`, `FeaturesNew`, `PromisesSection`, `HomeIntroSection`
- [ ] `BannerSlot`, `WelcomeBannerSection`, `HomeCTABanner`
- [ ] `HomeContent` + `HomeLayoutRenderer` → yalnız nötr section'ları render etsin

---

## Faz 3 — İçerik JSON'larını nötrle (`src/config/pages/`)
- [ ] `home-hero.json`, `home-features.json`, `home-promises.json`,
      `home-intro-process.json`, `home-cta-banner.json`, `home-welcome-banner.json`
      → "AppName" + jenerik placeholder metin
- [ ] `home-expertise-section.json`, `home-expertise-categories.json`,
      `home-hybrid-model.json` → sil (astro)
- [ ] `about-page-copy.json`, `dashboard-copy.json`, `editorial-policy.json`,
      `explore-page.json` → nötrle veya sil
- [ ] `blog-fallback-posts.json` → jenerik örnek 1-2 yazı
- [ ] `site-defaults.json` → `AppName`, boş sosyal/iletişim

---

## Faz 4 — Routing & menü
- [ ] `src/config/routes.ts` → `consultants`, `booking` kaldır; generic (home/about/blog/
      contact/faqs/legal/profile) kalsın
- [ ] `src/config/pages/home-layout-components.ts` → nötr section anahtar seti
      (admin'deki `home-layout-components.ts` ile **birebir** tutulmalı)
- [ ] Header mega-menü (`MegaMenuPanel`, `HeaderClient`) → nötr linkler
- [ ] Footer (`Footer.tsx`) → nötr linkler/metin

---

## Faz 5 — Marka & i18n
- [ ] `src/lib/site-config.ts` + `site-defaults.json` → `AppName` / env (`NEXT_PUBLIC_APP_NAME`)
- [ ] i18n çeviri dosyaları → astro metinlerini (burç/danışman/fal) temizle, nötr anahtarlar
- [ ] `public/` görseller (astro logo, og, slider) → placeholder; `offline.html` `AppName`
- [ ] `apply-brand.py` kapsamına giren frontend dosyaları güncel mi? (token = `AppName`)

---

## Faz 6 — Doğrulama
- [ ] `bun run build` (frontend) geçer
- [ ] `bun run lint` temiz (yeni hata yok)
- [ ] `/` (home) açılır — nötr placeholder
- [ ] Auth / blog / contact / faqs / legal / profile sayfaları açılır
- [ ] Backend ile uyum: kaldırılan modüllere (consultant/booking/quiz) frontend çağrısı kalmadı
- [ ] `proje.json` / README güncel (frontend "boş taslak şablon" notu)

---

## Notlar / riskler
- **Backend bağımlılığı:** quiz/consultant/booking backend modülleri zaten yok →
  frontend'de bu uçlara çağrı varsa temizlenmeli (aksi halde runtime 404).
- **Home layout senkronu:** frontend `home-layout-components.ts` ile admin'deki liste
  aynı anahtarları kullanmalı (admin'de section ekleyince frontend render edebilsin).
- **Legal sayfa tekrarları:** TR/EN çift legal route'lar var; nötr şablonda tek standarda
  indirmek (redirect/locale) düşünülebilir.
- **Ticaret (checkout/pricing):** woody yol haritasında "store" var; şimdilik kaldır,
  gerektiğinde shared `orders`/`payments` modülleriyle geri eklenebilir.
