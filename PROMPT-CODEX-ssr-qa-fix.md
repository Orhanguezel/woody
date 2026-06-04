# CODEX KICKOFF — SSR QA Düzeltmeleri (title çift-marka + H1)

> Aşağıdaki metni Codex'e ver. Görev kaynağı: [`CODEX-GOREV-claude-ssr-qa.md`](CODEX-GOREV-claude-ssr-qa.md).

---

## PROMPT (Codex'e yapıştır)

Branch: `woody-icerik-i18n`. Proje: `/home/orhan/Documents/Projeler/woody` (Next.js + Fastify + admin, Bun).
Görev dosyası: `CODEX-GOREV-claude-ssr-qa.md` — Görev 3 ve Görev 4'ü uygula. Claude (mimar) SSR parite
QA'sında 2 kod-seviyesi SEO bug'ı buldu; kök nedenler dosyada. Sırayla yap, her adımda build'i koru.

### GÖREV 3 — Title'da çift marka eki (P1)
Belirti: `/tr/preschool` ve `/tr/digital-content` title'ları `… | Woody ve Arkadaşları ve Arkadaşları |
Woody ve Arkadaşları` (marka eki 2-3 kez). Kök neden: per-page SEO title'ları markayı zaten içeriyor +
`title_template: "%s | Woody ve Arkadaşları"` (seed `020_woody_site_settings.sql:31`) tekrar ekliyor.

Yap:
1. Tüm per-page SEO title'larını **çıplak** yap (marka eki YOK). Kaynakları bul: `seo_pages` seed'leri
   (`backend/src/db/seed/sql/*`) + sayfa `generateMetadata` fallback title'ları (`frontend/src/app/[locale]/**/page.tsx`,
   `frontend/src/seo/serverMetadata.ts`). Örn: preschool = "Anaokulu İngilizce Eğitim Setleri".
2. Template markayı tek sefer eklesin. Anasayfa `title_default` zaten tam → home'da template uygulanmasın
   (Next `title.default` davranışı doğrula).
3. Referans `_referans/canli-site-mayis2026/sayfalar/*.html` `<title>`'larıyla eşleştir.
Kabul: her sayfa title = `<sayfa başlığı> | Woody ve Arkadaşları` (tek ek), tekrar yok.

### GÖREV 4 — İç sayfalarda marka adı H1 (P2)
Belirti: `/tr/preschool|blog|store|digital-content` ilk `<h1>`'i "Woody ve Arkadaşları" (sayfaya özel değil).
Şüpheli kaynaklar: `frontend/src/layout/banner/Breadcrum.tsx:46`, `layout/banner/Hero.tsx:77`,
`components/woody/WoodyPage.tsx`, `WoodyFallback.tsx`.

Yap:
1. Her public sayfada **tam olarak 1 `<h1>`** olsun ve **sayfaya özel** olsun.
2. Marka adını H1 yapan paylaşılan banner/fallback varsa iç sayfalarda H1'i sayfa başlığına bağla ya da
   marka öğesini `<p>/<span>`'e indir.
3. Anasayfa H1'i hero/marka başlığı olabilir (referansa göre); iç sayfalar kendi başlığı.
Kabul: her sayfada `curl … | grep '<h1'` = 1 sonuç + doğru sayfa başlığı.

### Kurallar
- ALTER TABLE YASAK → seed düzelt + `bun run build && bun run db:seed:*:fresh`.
- `_referans/` salt-okunur (kopyalama yok, oradan oku).
- Bitince: `frontend bun run build` + `bun run seo:schema` temiz olmalı. Değişen dosyalar + kök neden raporla.
- `CODEX-GOREV-claude-ssr-qa.md` içine ✅ TAMAMLANDI notu düş.

### NOT (deploy)
Düzeltmeler repoda biter; **test sitesine deploy Orhan onayında** (gate). Deploy sonrası Claude SSR QA
tekrar koşacak (token-siz). `Login` sızıntısı (#1) zaten önceki fix'te çözüldü, redeploy ile gelecek.
