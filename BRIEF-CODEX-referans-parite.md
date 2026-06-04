# BRIEF — CODEX (Referans Parite Implementasyonu)

> **Sen kimsin:** Bu projede **toplu kod yazan** araçsın. Mimari kararlar verildi; sen implemente edersin.
> **Ana doküman:** [`WOODY-REFERANS-PARITE-CEKLIST.md`](WOODY-REFERANS-PARITE-CEKLIST.md) — bunu aç ve fazları sırayla uygula.
> **Referans okuma:** [`AGENTS.md`](AGENTS.md) (varsa) + [`CLAUDE.md`](/home/orhan/Documents/Projeler/CLAUDE.md).

## Görev özeti
`woodyvearkadaslari.com` referans sitesini bizim **Next.js + Fastify + Admin** şablonuna **birebir**
taşı: içerik + tema + tüm sayfalar. Referans materyal: [`_referans/`](_referans/) (salt-okunur, kopyalama).

## Mutlak kurallar
1. **Sıra ile çalış.** Çeklistteki FAZ 0 → 12. Bir fazı bitirmeden diğerine geçme. Her faz sonunda
   ilgili sayfalar `bun run build` ile derlenebilir olmalı.
2. **`_referans/`'tan kod KOPYALAMA.** Oradan içerik/tasarım **oku**, bizim mimariye (DB-driven,
   i18n JSON `config/pages/{locale}`, design tokens, home-layout registry) **yeniden üret**.
   Referans CSR/CRA; biz **SSR/SSG** yapıyoruz.
3. **Source of truth önceliği:** canlı snapshot (`sayfalar/*.html`) + source map (`main.5ff4dee7.js.map`)
   > GitHub repo (Nisan). Çakışmada canlı kazanır.
4. **İçerik DB/JSON'dan, hardcode YOK.** Metinler `config/pages/{tr,en}/*.json` ve `site_settings.ui_*`;
   marka/tema/menü/SEO admin'den yönetilebilir kalmalı (seed ile doldur).
5. **DB şeması:** `ALTER TABLE` YASAK. Kolon gerekiyorsa ilgili `CREATE TABLE`'a ekle +
   `bun run build && bun run db:seed:*:fresh`. (Bkz. CLAUDE.md.)
6. **Aynı dosyada başka araç çalışıyorsa dokunma.** Antigravity QA fazındayken o sayfaya yazma.
7. **Bun** runtime. `.env` commit etme. TypeScript strict.

## İlk somut işler (FAZ 0)
- `main.5ff4dee7.js.map` source map'ini orijinal JSX/metne çöz → `_referans/_extracted/` (gitignore'a ekle).
- Tüm emergentagent medya URL'lerini topla → kökte `MEDYA-ENVANTERI.md` (görsel/video/ses + hangi sayfada).
- Tema token kesin hex/font'larını `tailwind.config.js` + bileşenlerden doğrula → çeklist tablosunu güncelle.

## Her faz için "bitti" tanımı
- Çeklistteki **Kabul** kriteri sağlanır.
- İlgili route `bun run build` + `tsc` temiz.
- İçerik i18n'den gelir (tr+en), medya çalışır, admin'den yönetilebilir.
- Çeklistteki kutucuğu ☑ yap + kısa not (hangi dosyalar değişti).

## Önemli hedefler (kolay kaçanlar)
- **GEO/SEO:** SSR'de içerik view-source'ta görünmeli. Her sayfa `generateMetadata` + JSON-LD.
- **i18n:** Google Translate widget'ı **kullanma**; gerçek `/tr` `/en` route + hreflang.
- **Digital content şifre akışı:** referansla aynı davranış (karar 7.4 — Orhan onayı bekle).
- **Medya:** Faz 9'da CDN bağımlılığını sıfırla (kendi storage).

## Çıktı/raporlama
- Her faz sonunda: değişen dosyalar listesi + kalan riskler + Antigravity'nin neyi doğrulaması gerektiği.
- Karar gereken yerlerde (⚠) DURUP Orhan/Claude onayı iste; tahminle ilerleme.

## Branch
`woody-icerik-i18n` üzerinde çalış (mevcut). Büyük faz bitimlerinde anlamlı commit.
