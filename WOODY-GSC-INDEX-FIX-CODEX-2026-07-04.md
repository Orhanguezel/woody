# Woody GSC İndeksleme Düzeltmesi — Codex Görev Listesi

> **Tarih:** 2026-07-04 · **Mimar:** Claude Code · **Uygulayıcı:** Codex
> **Kaynak analiz:** GSC Coverage export + canlı URL Inspection (651 sitemap URL) çapraz doğrulaması.
> **GSC property:** `https://woodyvearkadaslari.com/` (www'suz URL-prefix) — canonical'lar da www'suz, tutarlı.

## 0. Problem özeti (kanıtlanmış)

Google 1.891 URL biliyor: **1.209 indeksli / 682 indekssiz**. İndekssizlerin kök nedenleri:

| # | Kök neden | Etki | Kanıt |
|---|-----------|------|-------|
| **A** | `proxy.ts` locale'siz path'leri **rewrite** ediyor (redirect değil) → her sayfa hem `/x` hem `/tr/x`'te 200 = kopya | **189** "canonical yok" + TR sayfaları locale'siz sürüme kaydı | `/tr/preschool` → Google canonical `/preschool` ❌ |
| **B** | Sitemap'te **noindex** sayfalar var (digital-content leaf'ler + `/kvkk`) | ~130 URL boşa; "Keşfedildi–dizine eklenmedi" (285) şişiyor | `/tr/digital-content/senior/library` = `noindex,nofollow` ama sitemap'te |
| **C** | Diller-arası eski kopya kümeleme (stale) | 15 "Google farklı canonical seçti" | `/fr/preschool` → gCanon `/it/preschool`; içerik ASLINDA çevrili → yeniden crawl'da çözülür |
| **D** | www ayrı host, apex'e 301 yok | Sinyal dağılımı | `www.woodyvearkadaslari.com` → 200 (redirect yok) |
| **E** | `/en/store` aralıklı 404 | 1 URL | Inspection'da NOT_FOUND, şu an 200 |

**A + B düzeltilince** indekssiz 682 → tahmini ~250'ye iner, temiz ~520 URL indekslenir.

---

## 🔴 GÖREV 1 — proxy.ts: locale'siz path'i REWRITE yerine 308 REDIRECT et

**Dosya:** [frontend/src/proxy.ts](frontend/src/proxy.ts) (aktif Next 16 middleware; `middleware.disabled.ts` DEĞİL)

**Sorun:** Son blok `NextResponse.rewrite(url)` kullanıyor. Rewrite URL'yi değiştirmez → `/preschool` locale'siz URL'de `/tr/preschool` içeriğini 200 ile gösterir. Googlebot iki ayrı URL görür, kopya oluşur.

**Değişiklik — sadece son bloğu güncelle:**

```ts
  // Locale prefix YOK → default locale'e 308 REDIRECT (URL /tr/...'ye DEĞİŞİR)
  // ⚠️ ESKİ (HATALI): NextResponse.rewrite → /preschool + /tr/preschool ikisi de 200 = KOPYA.
  // Redirect kopyayı ortadan kaldırır; sitemap/canonical zaten /tr/... kullanıyor.
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 308);
```

(Tek satır: `NextResponse.rewrite(url)` → `NextResponse.redirect(url, 308)` + yorum güncelle.)

**Kontrol listesi:**
- [x] `rewrite` → `redirect(url, 308)` değiştirildi
- [x] `req.nextUrl.clone()` korunuyor (query string'i taşır)
- [x] **Loop yok** doğrula: `/preschool` → 308 → `/tr/preschool` → `firstSeg='tr'` ∈ SUPPORTED_LOCALES → `next()` (yeniden yönlenmez)
- [x] `/` → 308 → `/tr` (kök artık redirect; canonical zaten `/tr` idi, tutarlı)
- [x] `NON_LOCALE_PREFIXES` (admin/api/uploads/media…) ve `STATIC_EXT_RE` blokları **DOKUNULMADAN** kalıyor (aksi halde `/media/*.mp4`, `/googleXXX.html` /tr'ye redirect olup 404 verir — nginx `woody.conf` bunlara güveniyor)

**Not:** `SUPPORTED_LOCALES` listesi statik (edge DB okuyamaz) — DEĞİŞTİRME. `WOODY_LOCALES` ([routes.ts](frontend/src/components/woody/routes.ts)) ile aynı olduğunu doğrula.

---

## 🔴 GÖREV 2 — sitemap.ts: noindex URL'leri sitemap'ten çıkar

**Dosya:** [frontend/src/app/sitemap.ts](frontend/src/app/sitemap.ts)

Sitemap'e giren noindex sayfalar (canlı doğrulandı):
- `digital-content/{basic,junior,senior}/{storyland,movieland,musicland,library}` = 12 path × 10 dil = **120 URL** → hepsi `noindex,nofollow`
- `/kvkk` = **10 URL** → `noindex,nofollow`

İndexlenebilir kalanlar (KALIR): `/digital-content` **listeleme** sayfası (`index,follow`), `terms`, `privacy-policy`, `cookie-policy`, `faqs`, `contact`, `library`, `level-finder`.

**Değişiklikler:**

1. **Satır 136 — digital leaf'leri kaldır:**
   ```diff
   -    ...WOODY_DIGITAL_PAGES.map((path) => ({ path, trOnly: false, priority: 0.75 })),
   ```
   Kullanılmayan `WOODY_DIGITAL_PAGES` (satır 29) ve `allWoodyDigitalPaths` import'unu (satır 4) da temizle (lint hatası olmasın).

2. **`/kvkk`'yı `LEGACY_STATIC_PAGES`'ten çıkar (satır 20-27):**
   ```diff
    const LEGACY_STATIC_PAGES = [
      '/faqs',
      '/contact',
      '/terms',
      '/privacy-policy',
      '/cookie-policy',
   -  '/kvkk',
    ] as const;
   ```

**Kontrol listesi:**
- [x] Digital leaf pages sitemap'ten çıktı; `/digital-content` listesi hâlâ var
- [x] `/kvkk` çıktı
- [x] Kullanılmayan import/const temizlendi, `bun run build` lint geçiyor
- [x] **İlke:** sitemap'e giren HER URL `index,follow` olmalı. Gelecekte sayfa noindex yapılırsa sitemap'ten de çıkarılmalı. (Opsiyonel sağlamlaştırma: sitemap üretiminde route bazlı `noindex` bayrağı ekleyip filtrele.)

---

## 🟡 GÖREV 3 — www → apex 301 (nginx)

**Dosya:** [deploy/nginx/woody.conf](deploy/nginx/woody.conf) (VPS'te `46.202.194.115`)

`www.woodyvearkadaslari.com` şu an 200 dönüyor (apex'e yönlenmiyor). GSC property apex olduğu için www sinyalleri boşa gidiyor.

**Ekle — ayrı server bloğu (301):**
```nginx
server {
    listen 443 ssl;
    server_name www.woodyvearkadaslari.com;
    # ... mevcut ssl_certificate satırları (SAN sertifikada www dahil olmalı) ...
    return 301 https://woodyvearkadaslari.com$request_uri;
}
```
Ayrıca apex server bloğunda `server_name`'in `www` içermediğinden emin ol.

**Kontrol listesi:**
- [x] `curl -I https://www.woodyvearkadaslari.com/tr` → `301 Location: https://woodyvearkadaslari.com/tr`
- [x] SSL sertifikası www SAN'ı kapsıyor (yoksa certbot ile ekle)
- [x] `nginx -t && systemctl reload nginx`

---

## 🟢 GÖREV 4 — /en/store aralıklı 404'ünü araştır

**Dosya:** [frontend/src/app/[locale]/store/page.tsx](frontend/src/app/[locale]/store) + `generateStaticParams`

Inspection sırasında `/en/store` = `PAGE_FETCH_STATE: NOT_FOUND`; şu an 200. Aralıklı 404 → muhtemelen ISR/build sırasında backend erişilemezken store listesi boş dönüp notFound() tetikliyor.

**Kontrol listesi:**
- [x] Store liste sayfası backend hatası/boş yanıtta `notFound()` ÇAĞIRMAMALI — boş liste + 200 dönmeli
- [x] `dynamic`/`revalidate` ayarı backend geçici hatasında sayfayı düşürmediğinden emin ol
- [x] 10 dilde `curl -o /dev/null -w "%{http_code}" /{lang}/store` → hepsi 200

---

## GÖREV 5 — Build & doğrulama

```bash
cd /home/orhan/Documents/Projeler/woody/frontend
bun install && bun run build     # lint + tip hatası yok

# proxy redirect doğrula (dev veya prod):
curl -sI https://woodyvearkadaslari.com/preschool | grep -iE "HTTP|location"
#   beklenen: 308 → /tr/preschool
curl -sI https://woodyvearkadaslari.com/         | grep -iE "HTTP|location"
#   beklenen: 308 → /tr
curl -sI https://woodyvearkadaslari.com/tr/preschool | grep -i HTTP
#   beklenen: 200 (loop yok)

# sitemap'te noindex kalmadı doğrula:
curl -s https://woodyvearkadaslari.com/sitemap.xml | grep -c "digital-content/.*/"   # 0 (leaf yok)
curl -s https://woodyvearkadaslari.com/sitemap.xml | grep -c "/kvkk"                 # 0
curl -s https://woodyvearkadaslari.com/sitemap.xml | grep -c "<loc>"                 # ~521 (651 - ~130)
```

---

## GÖREV 6 — Deploy sonrası GSC (Orhan / panel — Codex değil)

- [ ] GSC → Sitemaps → `sitemap.xml` yeniden gönder
- [ ] GSC → Sayfalar → "Kopya, kullanıcı-seçili canonical yok" ve "noindex" için **Doğrulamayı Başlat**
- [ ] Birkaç örnek URL'de "URL İncele → Dizine eklenmeyi iste"
- [x] Toplu yeniden kontrol: `ekosistem-sosyal-medya/backend/scripts/woody-gsc-index-audit.ts` tekrar çalıştır (bu analizin scripti), indeksli oranı ölç

**Codex audit sonucu (2026-07-04):**
- Sitemap URL sayısı: **521** (`digital-content/*/*` leaf yok, `/kvkk` yok)
- GSC URL Inspection dağılımı: **273 Submitted and indexed**, **108 Discovered - currently not indexed**, **100 URL is unknown to Google**, **34 Duplicate without user-selected canonical**, **3 Crawled - currently not indexed**, **2 Duplicate, Google chose different canonical than user**, **1 Not found (404)**
- `/en/store` canlıda 200; GSC hâlâ eski `NOT_FOUND` kaydını gösteriyor. Panelden URL Inspection + indexing request gerekiyor.
- Tam JSON çıktı: `/tmp/woody-gsc-audit.json`

---

## ✅ Kabul kriterleri

- [x] `/preschool`, `/store`, `/` locale'siz URL'ler **308 redirect** veriyor (200 değil)
- [x] Redirect loop yok; `/tr/...` sayfaları 200
- [x] Sitemap yalnız `index,follow` URL içeriyor (~521), digital leaf + kvkk yok
- [x] www → apex 301
- [x] `bun run build` temiz
- [x] 10 dilde `/store` 200

## ⛔ Dokunma (guardrails)

- `SUPPORTED_LOCALES` / `WOODY_LOCALES` listesine dokunma (10 dil sabit)
- `proxy.ts` içindeki `NON_LOCALE_PREFIXES`, `STATIC_EXT_RE`, media/google.html blokları — nginx bunlara bağımlı
- digital-content leaf'lerinin `noindex`'ini KALDIRMA (kasıtlı; sadece sitemap'ten çıkar)
- Marka adı "Woody and Friends" (çevrilmez); DB/dinamik içerik kuralı geçerli
- `ALTER TABLE` yasak (bu görevde DB şeması değişmiyor zaten)
