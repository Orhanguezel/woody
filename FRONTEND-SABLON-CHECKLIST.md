# Frontend Şablon — Detaylı Checklist (markadan/projeden bağımsız boş taslak)

> **Hedef:** Frontend'i `backend` + `admin_panel` gibi **nötr, boş taslak şablona** çevirmek.
> İskelet (App Router, i18n, auth, layout, SEO, RTK store, tema) korunur; astroloji/danışman/
> fal/zodyak/ticaret **domain içeriği** kaldırılır. Marka adı `AppName` token'ı + env üzerinden.
>
> **Kaynak:** goldmoodastro (astroloji) türevi.
> **Verilen kararlar:** Ticaret (checkout/pricing/booking-payment) → **kaldır**. i18n → backend
> `site_settings` tabanlı (statik locale JSON yok), zaten nötrlendi.
>
> İşaretleme: `[ ]` yapılacak · `[x]` tamam · **KALDIR** / **KORU** / **NÖTR** = aksiyon

---

## Faz 0 — Hazırlık
- [ ] Dal: `git checkout -b frontend-sablon`
- [ ] Baseline: `cd frontend && bun run build` ve `bun run lint` (mevcut hatalar not edilsin)
- [ ] Her faz sonunda küçük commit + `bun run build` ile doğrula

---

## Faz 1 — Route'lar · `src/app/[locale]/`

| Route | Aksiyon | Not |
|---|---|---|
| `page.tsx` (home) | **NÖTR** | HomeContent → sadece nötr section'lar |
| `layout.tsx`, `error.tsx`, `not-found.tsx` | **KORU** | iskelet |
| `login/`, `register/`, `forgot-password/`, `password-reset/`, `verify-email/`, `logout/` | **KORU** | auth |
| `profile/`, `profile/privacy/` | **KORU** | temel hesap |
| `profile/bookings/` | **KALDIR** | randevu domaini |
| `me/`, `me/settings/` | **KORU** | temel hesap (astro widget'ları temizle) |
| `me/consultant/`, `me/credits/`, `me/readings/` | **KALDIR** | astro hesap |
| `blog/`, `blog/[slug]/` | **KORU** | jenerik |
| `contact/`, `faqs/` | **KORU** | jenerik |
| `terms/`, `privacy-policy/`, `cookie-policy/`, `kvkk/`, `editorial-policy/`, `legal-notice/`, `privacy-notice/`, `gizlilik/`, `kullanim-sartlari/`, `cerez-politikasi/` | **KORU** | legal (bkz. Faz 7 sadeleştirme) |
| `dashboard/` | **KALDIR** | astro panel |
| `explore/` | **KALDIR** | astro keşfet |
| `karne/` | **KALDIR** | astro "karne" |
| `pricing/` | **KALDIR** | premium/ticaret |
| `checkout/`, `checkout/[orderId]/` | **KALDIR** | ticaret |

- [ ] Yukarıdaki **KALDIR** route klasörlerini sil
- [ ] Silinen route'lara link veren yerleri temizle (header/footer/menu/CTA)

---

## Faz 2 — İçerik container'ları · `src/components/containers/`

| Klasör | Aksiyon |
|---|---|
| `home/` | **NÖTR** (bkz. Faz 3) |
| `auth/` | **KORU** |
| `blog/` | **KORU** |
| `contact/` | **KORU** |
| `faqs/` | **KORU** |
| `legal/` | **KORU** |
| `profile/` | **KORU** (astro alanları çıkar) |
| `about/` | **NÖTR** (placeholder metin) |
| `coffee/` (kahve falı) | **KALDIR** |
| `dreams/` (rüya) | **KALDIR** |
| `numerology/` | **KALDIR** |
| `tarot/` | **KALDIR** |
| `consultant/` | **KALDIR** |
| `become-consultant/` | **KALDIR** |
| `consultant-dashboard/` | **KALDIR** |
| `chat/` | **KALDIR** (astro destek chat) |
| `booking-payment/` | **KALDIR** |
| `feedback/` | **KALDIR** |

- [ ] **KALDIR** container'ları sil + import edildikleri yerleri temizle

---

## Faz 3 — Home section bileşenleri · `src/components/containers/home/`

**KALDIR (astro/premium):**
- [ ] `ConsultantsSection.tsx`, `ZodiacGridSection.tsx`, `ExpertiseCategoriesSection.tsx`
- [ ] `HybridModelSection.tsx`, `TransparencySection.tsx`, `WaitlistSection.tsx`
- [ ] `PremiumMembershipBanner.tsx`, `FirstSessionDiscountBanner.tsx`, `WelcomePremiumBanner.tsx`
- [ ] `HomeBecomeConsultantBanner.tsx`, `HomeTestimonialsSection.tsx`, `AppDownloadSection.tsx`

**KORU + NÖTR placeholder:**
- [ ] `HeroNew.tsx`, `FeaturesNew.tsx`, `PromisesSection.tsx`, `HomeIntroSection.tsx`
- [ ] `BannerSlot.tsx`, `WelcomeBannerSection.tsx`, `HomeCTABanner.tsx`

**Renderer:**
- [ ] `HomeLayoutRenderer.tsx` + `HomeContent.tsx` → yalnız korunan section key'lerini map'le
- [ ] `fetchHomeLayout.server.ts` → kaldırılan section'lara referans kalmasın

---

## Faz 4 — RTK endpoint'leri · `src/integrations/rtk/`

**KALDIR (domain):**
- [ ] `private/consultant_self.endpoints.ts`
- [ ] `public/consultants.public`, `consultant_services.public`, `consultant_applications`
- [ ] `public/horoscopes`, `horoscopes.public`, `credits.public`, `reviews.public`
- [ ] `public/chat`, `bookings_public`, `subscriptions`, `orders`, `resources`, `popups`, `sliders`

**KORU (jenerik):**
- [ ] `baseApi`, `auth`, `health`, `banners`, `menu_items`, `footer_sections`, `faqs`,
      `custom_pages`, `contacts`, `newsletter_public`, `mail`, `storage_public`,
      `notifications`, `kvkk`, `geocode`

- [ ] Silinen endpoint'leri RTK store/`baseApi` enjeksiyon listesinden çıkar
- [ ] Bu endpoint'leri import eden bileşenler (zaten Faz 1-3'te silinmiş olmalı) — kalan varsa temizle

---

## Faz 5 — İçerik JSON'ları · `src/config/pages/`

| Dosya | Aksiyon |
|---|---|
| `home-hero.json` | **NÖTR** (AppName + placeholder) |
| `home-features.json` | **NÖTR** |
| `home-promises.json` | **NÖTR** |
| `home-intro-process.json` | **NÖTR** |
| `home-cta-banner.json` | **NÖTR** |
| `home-welcome-banner.json` | **NÖTR** |
| `home-expertise-section.json` | **KALDIR** (astro) |
| `home-expertise-categories.json` | **KALDIR** (astro) |
| `home-hybrid-model.json` | **KALDIR** (astro) |
| `about-page-copy.json` | **NÖTR** |
| `dashboard-copy.json` | **KALDIR** |
| `explore-page.json` | **KALDIR** |
| `editorial-policy.json` | **NÖTR** (jenerik legal) |
| `blog-fallback-posts.json` | **NÖTR** (1-2 jenerik örnek) |
| `site-defaults.json` | **NÖTR** (AppName, boş sosyal/iletişim) |
| `routes.ts` | bkz. Faz 6 |
| `home-layout-components.ts` | bkz. Faz 6 |

---

## Faz 6 — Routing & menü
- [ ] `src/config/routes.ts` → `consultants`, `booking` kaldır; `home/about/blog/contact/
      faqs/legal/profile` kalsın
- [ ] `src/config/pages/home-layout-components.ts` → korunan section key seti;
      **admin_panel `src/config/home-layout-components.ts` ile birebir aynı** olmalı
- [ ] `src/layout/header/` (`Header`, `HeaderClient`, `MegaMenuPanel`, `HeaderOffcanvas`)
      → mega-menü astro kategorileri kaldır, nötr linkler
- [ ] `src/layout/footer/Footer.tsx` → nötr linkler/metin
- [ ] `src/layout/banner/` → nötr veya kaldır

---

## Faz 7 — Marka & i18n & SEO
- [ ] `src/lib/site-config.ts` + `src/config/pages/site-defaults.json` → `AppName` /
      `NEXT_PUBLIC_APP_NAME`
- [ ] i18n: statik locale JSON yok (DB/`site_settings` tabanlı) → backend zaten nötr;
      kodda gömülü astro metinleri (`src/i18n/ui.ts`, `uiDb.ts`) varsa nötrle
- [ ] `src/lib/zodiac/` (signs, celebrities, affirmations) → **KALDIR**
- [ ] `src/features/` → `chat` (astro) KALDIR; `analytics`, `auth`, `profiles` KORU
- [ ] `src/lib/og/` (OG görsel üretimi) → astro şablonları nötrle
- [ ] SEO: `src/seo/` JSON-LD/şema → astro tipleri (Service/Person consultant) nötrle
- [ ] Legal route tekrarları (TR/EN) → tek standarda indir (opsiyonel)

---

## Faz 8 — public/ varlıklar · `frontend/public/`
- [ ] `logo/` → placeholder logo
- [ ] `support_ai*.png/webp` (astro AI danışman görseli) → **KALDIR**
- [ ] `banners/`, `icons/`, `img/` → astro görselleri kaldır/placeholder
- [ ] `llms.txt` → AppName/nötr
- [ ] `offline.html` → `AppName` (apply-brand kapsamında)
- [ ] `favicon*` → nötr/placeholder (admin ile tutarlı)

---

## Faz 9 — Doğrulama
- [ ] `cd frontend && bun run build` → geçer
- [ ] `bun run lint` → yeni hata yok
- [ ] `bun run typecheck` → temiz
- [ ] Açılan sayfalar (boş/placeholder): `/`, `/login`, `/register`, `/blog`, `/contact`,
      `/faqs`, `/terms`, `/privacy-policy`, `/profile`
- [ ] Kaldırılan route'lar 404 / link kalmadı (header/footer/menu)
- [ ] Backend uyumu: silinen endpoint'lere (consultant/booking/horoscope/credits) çağrı yok
- [ ] `proje.json` notları + README "frontend boş taslak" güncel

---

## Bağımlılık haritası / riskler
- **Backend:** quiz/consultant/booking/horoscope modülleri backend'de yok → frontend bu uçlara
  çağrı yaparsa runtime hata. Faz 4 ile temizlenir.
- **Home layout senkronu:** frontend `home-layout-components.ts` ↔ admin `home-layout-components.ts`
  aynı key seti olmalı (admin'den section eklenince frontend render edebilsin). Şu an ikisi de
  astro key'leri içeriyor; ikisini birlikte nötrle.
- **`shared-frontend` / `shared-ui` paketleri:** frontend `@shared/shared-ui/...` (örn. AuthorBio,
  cn) kullanıyor; bu paket ayrı repo (packages/) — orada astro kalıntısı varsa ayrıca ele alınır.
- **Silme sırası:** önce route + container + home section (Faz 1-3), sonra endpoint (Faz 4),
  sonra içerik/menü (Faz 5-6); böylece "import edilmeyen kalan dosya" en aza iner.
- **Geri ekleme:** ticaret gerekince shared `orders`/`payments`; blog/iletişim/faq zaten shared
  backend'de mevcut.
