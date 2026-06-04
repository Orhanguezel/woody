# CODEX GÖREV — Claude SSR Parite QA (Tur 1)

> Antigravity tokeni bitti → görsel/parite QA'yi Claude (mimar) **token-siz SSR içerik paritesiyle**
> devraldı. Yöntem: test sitesi (`test.guezelwebdesign.com`) SSR HTML'i + repo kodu vs referans
> snapshot (`_referans/canli-site-mayis2026/sayfalar/*.html`). Tarih: 2026-06-04. Branch: `woody-icerik-i18n`.

---

## ⚠️ ÖNCE: TEST SİTESİ BAYAT (stale deploy)

Test sitesinin SSR HTML'inde giriş yapılmamışken **`>Login<` hâlâ var** — yani Codex'in
[`CODEX-GOREV-antigravity-bulgular.md`](CODEX-GOREV-antigravity-bulgular.md) Görev 1 fix'i (header auth
gizleme) **test.guezelwebdesign.com'a deploy edilmemiş**. Repo/lokal düzeltilmiş olsa da test eski build.
**Sonuç:** Test sitesi güncel repoyu yansıtmıyor → güvenilir QA için **test'e yeniden deploy** gerekir
(deploy gate'i Orhan onayında). Aşağıdaki #1 muhtemelen redeploy ile çözülür; #2/#3 kod seviyesi.

---

## GÖREV 3 — [P1] Title'da ÇİFT marka eki ("… | Woody ve Arkadaşları ve Arkadaşları | Woody ve Arkadaşları")

**Belirti:** SSR title'ları bozuk:
- `/tr/preschool` → `Anaokulu İngilizce Eğitim Setleri | Woody ve Arkadaşları ve Arkadaşları | Woody ve Arkadaşları`
- `/tr/digital-content` → `Dijital Kütüphane | Woody ve Arkadaşları ve Arkadaşları | Woody ve Arkadaşları`

**Kök neden (Claude doğruladı):**
- `backend/src/db/seed/sql/020_woody_site_settings.sql:31` → `title_template: "%s | Woody ve Arkadaşları"`.
- `frontend/src/seo/serverMetadata.ts:285,337` → Next.js `title: { default, template }` uygular.
- **Per-page SEO title'ları zaten marka ekini içeriyor** → template tekrar ekliyor = **çift (hatta üçlü)**.
  ("ve Arkadaşları" fazlalığı, sayfa başlığının "...| Woody" ile bitip template'in "ve Arkadaşları…"
  eklemesinden; net hex'i seed/pageSeo title'larından doğrula.)

**Yapılacaklar:**
1. Per-page SEO title'larını **çıplak** yap (marka eki OLMADAN): örn. preschool title = "Anaokulu
   İngilizce Eğitim Setleri" (sonuna "| Woody…" EKLEME). Kaynak: ilgili `seo_pages` seed / sayfa
   `generateMetadata` fallback'leri.
2. Template (`%s | Woody ve Arkadaşları`) markayı **tek sefer** eklesin.
3. Anasayfa: `title_default` zaten tam marka başlığı → home'da template uygulanmamalı (Next `default`
   davranışı). Doğrula.

**Kabul:** Her sayfada title = `<sayfa başlığı> | Woody ve Arkadaşları` (tek marka eki). Referans
snapshot başlıklarıyla eşleş (`_referans/.../sayfalar/tr_preschool.html` `<title>`). Tekrar yok.

---

## GÖREV 4 — [P2] İç sayfalarda marka adı `<h1>` (sayfaya özel H1 beklenir)

**Belirti:** SSR'de `/tr/preschool`, `/tr/blog`, `/tr/store`, `/tr/digital-content` sayfalarının
ilk `<h1>`'i **"Woody ve Arkadaşları"** (marka) — sayfaya özel H1 değil. Referansta her sayfanın
kendi H1'i var (preschool → "PRESCHOOL SERIES" vb.).

**Claude notu (KESİN DEĞİL — Codex doğrulasın):**
- Tek-satır grep ile bulundu; çok-satırlı H1'leri kaçırmış olabilir. preschool'da gerçek H1 var
  (`PreschoolPageClient.tsx:126`, dev "PRESCHOOL" 120px). Yani muhtemelen **iki H1** var: bir yerde
  marka H1'i (banner/fallback) + sayfa H1'i → **çift/yanlış H1 (SEO)**.
- Şüpheli kaynaklar: `frontend/src/layout/banner/Breadcrum.tsx:46`, `Hero.tsx:77`, `WoodyPage.tsx`,
  `WoodyFallback.tsx` — bunlardan biri marka adını H1 olarak basıyor olabilir.

**Yapılacaklar:**
1. Her public sayfada **tam olarak bir `<h1>`** olduğunu doğrula; o da **sayfaya özel** olsun.
2. Marka adını H1 yapan paylaşılan banner/fallback varsa → iç sayfalarda H1'i sayfa başlığına bağla
   ya da marka öğesini `<p>`/`<span>`'e indir (logo zaten görsel).
3. Anasayfa H1'i marka/hero başlığı olabilir (referansa göre); iç sayfalar kendi başlığı.

**Kabul:** Her sayfada tek H1 + sayfaya özel (referansla uyumlu). `curl … | grep '<h1'` her sayfada
1 sonuç ve doğru metin.

---

## NOTLAR
- ALTER TABLE yasak — seed + `db:seed:*:fresh`.
- #1 (Login) = redeploy işi (deploy gate). #2/#3 = repo fix.
- Codex bitince: **test'e yeniden deploy gerekir** ki Claude SSR QA tekrar koşsun (token-siz).
- Bu QA piksel değil **içerik/yapı/meta** paritesi; piksel görsel QA Antigravity tokeni dönünce.

---

## ✅ TAMAMLANDI — Codex SSR QA Fix (2026-06-04)

**Görev 3 — Title çift-marka:** tamamlandı.
- Per-page SEO title fallback'leri çıplaklaştırıldı: preschool, digital-content, FAQ; home/store marka tekrar riski temizlendi.
- `buildMetadataFromSeo` artık title'ı final string olarak hesaplayıp `absolute` verir; root layout template'i aynı title'a ikinci kez marka ekleyemez.
- Eski/stale DB title değerleri için normalize guard eklendi (`Woody ve Arkadaşları ve Arkadaşları` collapse + mevcut marka suffix temizliği).
- Blog/FAQ/contact layout metadata'ları DB/API boşsa global title'a düşmeyecek şekilde `buildPageMetadata` fallback'ine alındı.

**Görev 4 — H1:** tamamlandı.
- Splash marka başlığı `<h1>` yerine `<p>` oldu; public sayfalarda SSR H1 sayısı tek.
- SSR spot-check: `/tr`, `/tr/preschool`, `/tr/blog`, `/tr/store`, `/tr/digital-content`, `/tr/faqs`, `/tr/contact` → `h1Count = 1`.

**Yerel doğrulama:**
- `cd frontend && bun run build` ✅ geçti. Bilinen `127.0.0.1:8101` API fetch uyarıları var, exit code 0.
- `cd frontend && bun run seo:schema` ✅ geçti.
- Dev SSR spot-check (`http://127.0.0.1:3077`) title tekrarlarını temiz doğruladı.

**Deploy notu:** test/canlı deploy yapılmadı; Orhan gate'inde. Test sitesi yeniden deploy edilince Claude SSR QA tekrar koşabilir.

---

## ✅✅ CLAUDE DOĞRULAMA (dev SSR, 2026-06-04) — GEÇTİ

Dev server (`http://127.0.0.1:3077`) üzerinde bağımsız token-siz SSR QA koşuldu:

| Sayfa | HTTP | h1 | auth sızıntısı | title |
|---|---|---|---|---|
| /tr | 200 | 1 | yok | Woody ve Arkadaşları \| Okul Öncesi İngilizce |
| /tr/preschool | 200 | 1 | yok | Anaokulu İngilizce Eğitim Setleri \| Woody ve Arkadaşları |
| /tr/blog | 200 | 1 | yok | Blog \| Woody ve Arkadaşları |
| /tr/store | 200 | 1 | yok | Store \| Woody Eğitim Setleri |
| /tr/digital-content | 200 | 1 | yok | Dijital Kütüphane \| Woody ve Arkadaşları |
| /tr/faqs | 200 | 1 | yok | Sık Sorulan Sorular \| Woody ve Arkadaşları |
| /tr/contact | 200 | 1 | yok | İletişim \| Woody ve Arkadaşları |
| /en | 200 | 1 | yok | Woody and Friends \| Preschool English |

- **Görev 3 (title çift-marka): GEÇTİ** — hiçbir sayfada tekrar yok; başlıklar referans snapshot
  `_referans/.../sayfalar/*.html` `<title>`'larıyla **birebir** (bizimkiler diakritikli, daha iyi).
- **Görev 4 (H1): GEÇTİ** — tüm sayfalarda `h1Count = 1`, sayfaya özel.
- **Bonus: Login/Registrieren sızıntısı dev'de YOK** → Görev 1 fix'i repoda canlı; test sitesindeki
  sızıntı sadece **bayat deploy**tı. Redeploy ile düzelir.

Açık tek iş: SEO/parite tarafında **piksel görsel QA** (Antigravity tokeni dönünce) + canlı deploy gate.

---

## GÖREV 5 — [P2] WhatsApp widget sol konum + sticky store çakışması (Codex)

İstek (Orhan): WhatsApp widget sola taşınacak.

**Claude tespiti (2026-06-05):** Widget repoda **ZATEN solda**:
- `frontend/src/components/woody/WhatsAppFloatingButton.tsx:33` → `fixed bottom-6 left-6 z-[900]`
- `frontend/src/components/woody/StickyStoreButton.tsx:34` → `fixed bottom-5 left-4 z-[899] md:hidden`

⚠️ **Asıl sorun: ikisi de SOL ALTTA → mobilde üst üste biniyor.**

Yap:
1. WhatsApp solda kalsın (referansa göre konumu teyit et: `_referans/.../FloatingContact.jsx`).
2. Çakışmayı çöz: ya StickyStoreButton'ı sağa al, ya dikey offset ver (ör. WhatsApp `bottom-6`,
   sticky store `bottom-20`), ya da aynı tarafta üst üste binmeyecek şekilde diz.
3. Mobil (375px) + desktop'ta ikisinin de erişilebilir/tıklanabilir olduğunu doğrula.

**Kabul:** Mobilde WhatsApp ve sticky store butonu çakışmıyor; WhatsApp sol altta; ikisi de tıklanır.

✅ **Tamamlandı (2026-06-05 / Codex):**
- WhatsApp widget solda bırakıldı: `bottom-6 left-6`.
- Mobil sticky store butonu aynı sol kolonda WhatsApp'ın üstüne alındı: `bottom-28 left-4`.
- Sağ alt köşeye taşınmadı; böylece `ScrollProgress` ile yeni bir sağ alt çakışması yaratılmadı.
- 375px mobil Playwright bounding-box kontrolünde WhatsApp ve sticky store arasında overlap yok.
