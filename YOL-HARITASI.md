# Woody ve Arkadaşları — Devralma & Yeniden İnşa Yol Haritası

> **Hedef:** Mevcut siteyi (woodyvearkadaslari.com) **tam devralmak** ve modern, AI-arama
> uyumlu bir mimariye (**Next.js + SSR**) taşımak. İçerik ve tasarım korunur, mimari yenilenir.
> **Durum:** Güncel kaynağa erişim yok → referans olarak Nisan GitHub repo + canlı site
> source map'leri kullanılacak (bkz. [`_referans/README.md`](_referans/README.md)).

Oluşturulma: 2026-06-02 · Stack: `sablon_proje` (Next.js 16 + Fastify + Tailwind v4 + next-intl)

> **🟢 GÜNCEL DURUM (2026-06-04):** Ana teknik inşa (Faz 1–2) **bitti**. Detaylı görev takibi
> [`WOODY-REFERANS-PARITE-CEKLIST.md`](WOODY-REFERANS-PARITE-CEKLIST.md)'de (Faz 0–9 ☑, 10–11 ◐, 12 gate).
> Bu dosya üst-seviye **devralma/canlı geçiş** yol haritasıdır. Kalanlar: **deploy + canlı doğrulama +
> opsiyonel performans (video transcode)**. DNS kontrolü **teyitli** (İHS panelinden A kayıtları
> 2026-06-04'te değiştirildi — bkz. Faz 0/Bölüm 1).

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

- [x] **Domain registrar'ı kim?** → **İHS Telekom** (NS: dijkstra/knuth.ihsdns.com). Cloudflare değil.
- [x] Müşteri registrar panelinde **nameserver / DNS kaydını değiştirebiliyor mu?** → **EVET, teyitli.**
      2026-06-04'te İHS DNS Zone panelinden apex+www A kayıtları başarıyla değiştirildi (InterServer
      askıya alınınca GitHub Pages'e yönlendirildi). Panel erişimi: `minayayinevi@gmail.com`.
- [x] Evet → siteyi yeni sunucumuza **bağımsız taşıyabiliriz** (geliştiriciye gerek yok). ✅
- [~] Hayır senaryosu geçersiz (kontrol bizde).

**✅ ÖN KOŞUL SAĞLANDI** → Faz 3 (deploy/geçiş) için DNS engeli yok; tek A kaydı değişimiyle VPS'e geçilir.

---

## 2. Devir & erişim kontrol listesi

| Varlık | Kimde olmalı | Durum |
|---|---|---|
| Domain + DNS | Müşteri (İHS paneli) | ✅ teyit edildi (2026-06-04 A kaydı değiştirildi) |
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

### Faz 1 — İçerik & varlık çıkarma (reverse-engineer) — ✅ BİTTİ
- [x] Canlı siteden **tüm içeriği** çıkar: 43 sayfa (12 ürün dahil), metinler, görseller
- [x] **Source map**'ten (`_referans/.../main.5ff4dee7.js.map`) güncel React bileşenlerini
      ve veri yapısını geri oku → Mayıs sürümü kurtarıldı (`_referans/_extracted/`)
- [x] Nisan repo'dan tasarım + `translations.js` çevirilerini al
- [x] **Çıktı:** içerik + medya envanteri (`MEDYA-ENVANTERI.md`, 88 medya) hazır
- [~] **Store/ödeme tespiti:** ⚠ AÇIK — gerçek ödeme/sipariş akışı **müşteri tarafında kesinleştirilmeli**
      (entegrasyon kararı bekliyor; en büyük risk)

### Faz 2 — Yeni mimari (Next.js inşa) — ✅ BİTTİ
- [x] 10 dil route yapısı + tam hreflang (tr/en/de/ar/fr/ru/es/it/nl/pt-br + x-default); `pt`→`pt-br` fix
- [x] URL'leri **birebir koru:** `/tr/store`, `/tr/digital-content/basic/storyland` …
- [x] Sayfa şablonları: anasayfa, preschool, workshop, home-tutor, woody-academy, library,
      blog, store, digital-content + 12 ürün + lokal + level-finder
- [x] Route bazlı meta + **JSON-LD**: Organization, EducationalOrganization,
      **Product+offers**, **Article+author** (blog), **FAQPage**, BreadcrumbList, LocalBusiness
- [x] Tasarımı taşı (shadcn/Radix + referans tema token'ları)
- [x] Backend API (Fastify): ürün/blog/içerik; admin_panel'den yönetim
- [x] **Gerçek `llms.txt`** (statik, düz metin) + sitemap + robots
- [x] **Build kontrolleri:** frontend/admin/backend `bun run build` temiz; `seo:schema` temiz

### Faz 3 — Deploy & kesintisiz geçiş — ◐ BEKLEMEDE (gate: Orhan onayı)
- [ ] Yeni host: kendi VPS (`46.202.194.115`) → `deploy/deploy.sh` (hazır)  ⏸ gate
- [~] **301 redirect haritası** — URL'ler birebir korundu → gerek yok (yoklanacak)
- [ ] DNS'i yeni host'a yönlendir — ✅ ön koşul sağlandı; tek A kaydı değişimi  ⏸ gate
- [~] GA4 + GTM taşı (`G-0D7LYLF51K`, `dogaadmin`) — config repoda var; canlı deploy sonrası **doğrulanacak**
- [x] Güvenlik başlıkları (**HSTS, CSP, Permissions-Policy**) — repo tarafı eklendi; SSL canlıda
- [ ] DNS email: DMARC `p=quarantine` + `rua`, SPF `-all` — **repo dışı**, İHS DNS panelinde yapılacak

### Faz 4 — Doğrulama (GEO raporunu kapat) — ◐ CANLI ORTAM GEREKLİ
- [ ] Search Console URL Inspection → SSR teyidi (canlıda)
- [ ] Googlebot/GPTBot/ClaudeBot user-agent testi → içerik görünüyor mu (canlıda)
- [x] Schema validator (`seo:schema` temiz) · [ ] Lighthouse/CWV (canlıda ölçülecek)
- [ ] Rapordaki bulguları kapat → yeni GEO skoru ölç (canlıda)
- [~] ⚠ **Performans ön-iş:** 255MB video transcode (→ web mp4/webm + poster) deploy/CWV öncesi önerilir

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
