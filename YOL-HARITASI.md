# Woody ve Arkadaşları — Devralma & Yeniden İnşa Yol Haritası

> **Hedef:** Mevcut siteyi (woodyvearkadaslari.com) **tam devralmak** ve modern, AI-arama
> uyumlu bir mimariye (**Next.js + SSR**) taşımak. İçerik ve tasarım korunur, mimari yenilenir.
> **Durum:** Güncel kaynağa erişim yok → referans olarak Nisan GitHub repo + canlı site
> source map'leri kullanılacak (bkz. [`_referans/README.md`](_referans/README.md)).

Oluşturulma: 2026-06-02 · Stack: `sablon_proje` (Next.js 16 + Fastify + Tailwind v4 + next-intl)

---

## 0. Özet — neden yeniden inşa?

Mevcut site **Create React App (CSR)** + sonradan eklenmiş PHP meta katmanı. En kritik
sorunu **mimaridir**: tamamen istemci tarafında render edildiği için **Googlebot, GPTBot,
ClaudeBot, PerplexityBot içeriği görmüyor** (sadece "yükleniyor" ekranı). Bu, CRA ile
kökten çözülemez. **Next.js (SSR/SSG)** bunu + 10-dil hreflang'i + şema enjeksiyonunu
**doğal olarak** çözer. Bu yüzden "yama" değil, **re-platform** yapıyoruz.

GEO Skoru: **40/100** (detay: `geo-seo-claude/Woody-ve-Arkadaslari-GEO-SEO-Raporu.pdf`).

---

## 1. ⚠️ Devralmanın ÖN KOŞULU — domain/DNS kontrolü

Geliştiriciye ulaşamadığımız için devralmanın **tek kaldıracı domain'i yönlendirebilmek.**

- [ ] **Domain registrar'ı kim?** (büyük ihtimalle İHS — müşterinin İHS hesabı var)
- [ ] Müşteri registrar panelinde **nameserver / DNS kaydını değiştirebiliyor mu?**
- [ ] Evet ise → siteyi yeni sunucumuza bağımsız taşıyabiliriz (geliştiriciye gerek yok). ✅
- [ ] Hayır ise → önce domain kontrolünü almak gerekir (registrar'a kimlikle başvuru).

**Bu madde netleşmeden Faz 3'e (deploy/geçiş) geçilmez.** Kod geliştirme (Faz 1-2) paralel sürebilir.

---

## 2. Devir & erişim kontrol listesi

| Varlık | Kimde olmalı | Durum |
|---|---|---|
| Domain + DNS | Müşteri (registrar paneli) | ❓ teyit edilecek |
| Google Search Console | Müşteri (`minayayinevi@gmail.com`) | ✅ var |
| Google Analytics 4 (`G-0D7LYLF51K`) | Müşteri | ✅ var |
| Google Tag Manager (`dogaadmin`) | Müşteri | ✅ var |
| Eski hosting (InterServer 64.20.45.186) | Geliştiricide | ❌ erişim yok |
| Emergent hesabı (üretici platform) | Geliştiricide | ❌ erişim yok |
| Güncel kaynak kod | Geliştiricide | ❌ erişim yok → source map'ten çıkaracağız |
| İHS cPanel | Müşteri | ⚠️ var ama muhtemelen boş/kullanılmıyor |

> Not: Eski hosting/Emergent'e erişemememiz **engelleyici değil** — yeni siteyi temiz kurup
> domain'i ona yönlendireceğiz. Sadece **store/ödeme arka uç sırları** (varsa) yeniden kurulur.

---

## 3. Teknik stack kararı (`sablon_proje`)

Bu proje `sablon_proje` şablonundan kuruldu (`frontend/ backend/ admin_panel/` zaten mevcut).

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/Radix UI
- **i18n:** **next-intl** — 10 dil için gerçek route'lar (`/tr`, `/en`, `/de` …) + tam hreflang
- **Backend:** Fastify + Drizzle ORM + MySQL (store/blog/içerik API'leri)
- **Admin:** `admin_panel/` — içerik, ürün, blog, çeviri yönetimi
- **Render:** SSR/SSG (kritik sayfalar sunucudan tam HTML)
- **Runtime:** Bun

---

## 4. Fazlar

### Faz 1 — İçerik & varlık çıkarma (reverse-engineer)
- [ ] Canlı siteden **tüm içeriği** çıkar: 43 sayfa (12 ürün dahil), metinler, görseller
- [ ] **Source map**'ten (`_referans/.../main.5ff4dee7.js.map`) güncel React bileşenlerini
      ve veri yapısını geri oku → Mayıs sürümünü kurtar
- [ ] Nisan repo'dan tasarım + `translations.js` çevirilerini al
- [ ] **Çıktı:** içerik envanteri + "neyi taşıyoruz / neyi yeniden kuruyoruz" listesi
- [ ] **Store/ödeme tespiti:** gerçek ödeme/sipariş var mı? Hangi entegrasyon? (en büyük risk)

### Faz 2 — Yeni mimari (Next.js inşa)
- [ ] next-intl ile 10 dil route yapısı + tam hreflang (tr/en/de/ar/fr/ru/es/it/nl/pt-BR + x-default)
- [ ] URL'leri **birebir koru:** `/tr/store`, `/tr/digital-content/basic/storyland` …
- [ ] Sayfa şablonları: anasayfa, preschool, workshop, home-tutor, woody-academy, library,
      blog, store, digital-content + 12 ürün + lokal
- [ ] Route bazlı meta + **JSON-LD**: Organization, EducationalOrganization,
      **Product+offers**, **Article+author** (blog), **FAQPage**, BreadcrumbList, LocalBusiness
- [ ] Tasarımı taşı (repo zaten shadcn/Radix — uyumlu)
- [ ] Backend API (Fastify): ürün/blog/içerik; admin_panel'den yönetim
- [ ] **Gerçek `llms.txt`** (statik, düz metin)

### Faz 3 — Deploy & kesintisiz geçiş
- [ ] Yeni host: kendi VPS (guezelwebdesign tarzı) veya Vercel (SSR uyumlu)
- [ ] **301 redirect haritası** (URL değişeni varsa — yoksa gerek yok)
- [ ] DNS'i yeni host'a yönlendir (Faz 1'in ön koşulu sağlanınca)
- [ ] GA4 + GTM taşı (`G-0D7LYLF51K`, `dogaadmin`)
- [ ] SSL, güvenlik başlıkları (HSTS, CSP, Permissions-Policy)
- [ ] DNS email: DMARC `p=quarantine` + `rua`, SPF `-all`

### Faz 4 — Doğrulama (GEO raporunu kapat)
- [ ] Search Console URL Inspection → SSR teyidi (içerik render ediliyor mu)
- [ ] Googlebot/GPTBot user-agent testi → artık içerik görünüyor mu
- [ ] Schema validator + Lighthouse (Performance/SEO/Best Practices)
- [ ] Rapordaki tüm bulguları tek tek kapat → yeni GEO skoru ölç

---

## 5. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| **Domain kontrolü müşteride değil** | Devralma takılır | Faz 0'da teyit; gerekirse registrar başvurusu |
| **Store/ödeme sırları geliştiricide** | Ödeme akışı yeniden | Faz 1'de tespit; yeni entegrasyon kur |
| Dinamik veri (sipariş/üye) eski sunucuda | Veri migrasyonu | InterServer erişimi yoksa sıfırdan; canlı veri var mı kontrol |
| URL değişimi | SEO kaybı | URL'leri birebir koru + 301 haritası |
| Emergent bağımlılığı | Bakım zorluğu | Bağımsız Next.js kod tabanı (Emergent'siz) |

---

## 6. Referans materyaller — [`_referans/`](_referans/)

- `_referans/github-repo-nisan2026/` — GitHub deposu (Nisan, .git geçmişi dahil)
- `_referans/canli-site-mayis2026/build/` — güncel frontend build + **source map**
- `_referans/canli-site-mayis2026/sayfalar/` — route HTML anlık görüntüleri (meta+JSON-LD)
- `_referans/canli-site-mayis2026/sitemap.xml` — 43 URL envanteri
- Tam GEO denetim raporu: `../geo-seo-claude/Woody-ve-Arkadaslari-GEO-SEO-Raporu.pdf`

---

## 7. Yeni oturumda ilk adımlar (kickoff)

Bu klasörde (`/home/orhan/Documents/Projeler/woody`) yeni oturum açtığında:

1. **`_referans/README.md`**'yi oku — tüm bağlam orada.
2. **Faz 0:** Müşteriye sor → "Domain'i nereden aldın, DNS/nameserver değiştirebiliyor musun?"
3. **Faz 1'i başlat:** Canlı siteyi + source map'i tarayıp içerik envanteri çıkar.
4. **Store/ödeme** gerçek mi, Faz 1'de netleştir (mimariyi belirler).
5. `sablon_proje` yapısını markaya uyarla (`scripts/apply-brand.py` / `init-project.sh`).
6. Faz 2'ye geç: next-intl + route iskeleti + ilk sayfa şablonları.

> İlk büyük teknik kazanım: **bir sayfayı SSR ile yayına alıp Search Console URL Inspection'da
> içeriğin render edildiğini görmek** — bu, raporun #1 bulgusunu kapatır.
