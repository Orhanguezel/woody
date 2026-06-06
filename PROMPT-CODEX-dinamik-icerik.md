# Codex Görev Prompt'u — Woody Dinamik İçerik + Müşteri Talepleri (Faz 2)

> Bu dosyayı Codex'e ver. Çeklist: [GOREV-CEKLIST.md](GOREV-CEKLIST.md) · Notlar: [MUSTERI-NOTLARI.md](MUSTERI-NOTLARI.md)
> Branch: `woody-icerik-i18n` · Repo kökü: `/home/orhan/Documents/Projeler/woody`

---

## Sen kimsin / kapsamın

Woody projesinin **ağır implementasyon** ajanısın. Görevin: müşterinin sayfa-içerik taleplerini, içeriği **DB'de saklanıp admin panelden yönetilecek** şekilde uygulamak. Ayar tipi maddeler (sosyal/whatsapp/home sırası) Claude'da; SEN onlara dokunma.

**OLMAZSA OLMAZ KURAL:** İçeriği koda/JSON'a sabit gömme. Her metin/fiyat/CTA/video URL'i `site_settings` tablosundan (DB) gelir, admin'den düzenlenir. `config/pages/**.json` yalnızca **fallback** kalır.

---

## Mimari (mevcut, doğrulandı)

- **Saklama:** `site_settings` tablosu — `key`/`locale`/`value`(JSON-string). Locale fallback + `'*'` global.
  - Modül: `packages/shared-backend/modules/siteSettings/` · Seed: `backend/src/db/seed/sql/020_woody_site_settings.sql`
- **Public API:** `GET /api/v1/site_settings/:key` · **Admin API:** `PUT /api/v1/admin/site-settings/:key`, bulk-upsert
- **Admin UI:** `admin_panel/src/app/(main)/admin/(admin)/site-settings/` → `tabs/*.tsx`
- **Frontend okuma:** RTK `useGetSiteSettingByKeyQuery({ key, locale })`; DB + `site-defaults.json` fallback merge örneği `frontend/src/layout/footer/Footer.tsx:48-72`.
- **DB kuralı (KESIN):** `ALTER TABLE` YASAK. `site_settings` zaten `CREATE TABLE` — yeni içerik = seed SQL'e **yeni INSERT satırı**. Sonra `bun run build && bun run db:seed:*:fresh`.

---

## SIRA — önce altyapı, sonra içerik

### ADIM 0 (BLOK AÇICI) — `page_*` DB + Admin + Frontend okuyucu altyapısı

Bunu bitirmeden 2/4/5/9/3 maddelerine geçme.

1. **Seed (`020_woody_site_settings.sql`):** Her locale (en az `tr`, `en`, `de`) için yeni `site_settings` satırları ekle:
   - `page_store` ← `frontend/src/config/pages/<locale>/store.json` + `store-products.json` içeriği
   - `page_preschool` ← `pages/<locale>/preschool.json`
   - `page_workshop` ← `pages/<locale>/workshop.json`
   - `value` = ilgili JSON'un string'i. **Sadece INSERT, ALTER yok.**
2. **Admin UI:** `site-settings` altına yeni **"Sayfa İçerikleri"** sekmesi ekle (`tabs/page-content-tab.tsx` + gerekirse edit detay sayfası). Mevcut `general-settings-tab.tsx` desenini taklit et. Locale seçici + her `page_*` anahtarını düzenleyen form alanları (başlık, açıklama, CTA metni, ürün/section listesi, fiyat metni, video URL, görünürlük bayrakları). Admin endpoint: `site_settings_admin.endpoints.ts`.
3. **Frontend okuyucu:** İlgili sayfalarda statik `import x from '.../x.json'`'u RTK sorgusuna çevir:
   ```ts
   const { data } = useGetSiteSettingByKeyQuery({ key: 'page_store', locale });
   const content = mergeWithFallback(data?.value, storeJsonFallback);
   ```
   DB boş/eksikse JSON dosyasına **fallback**. SSR uyumlu olsun (gerekirse server fetch + hydrate).
4. **DoD:** Store/Preschool/Workshop metinleri DB'den geliyor; admin'den düzenlenince siteye yansıyor; DB boşken JSON fallback çalışıyor; `bun run build` temiz.

---

### ADIM 1 — Müşteri içerik talepleri (ADIM 0 üstünde)

Aşağıdaki değişiklikleri **DB içeriği (page_* seed değeri) + koşullu render** olarak uygula; metinleri koda gömme.

**Madde 2 — Store "Teklif Al" + fiyat metni kaldır**
- `page_store` seed değerinde `primaryCTA`'yı boşalt, `"2250 TL'den başlayan fiyatlarla"` fiyat metinlerini kaldır.
- `frontend/src/components/woody/store/WoodyStoreShowcase.tsx` (CTA ~satır 9, `quoteHref` 43-49): değerler DB içerikten; boşsa o eleman **render edilmez**. Kart hizalaması bozulmasın.
- JSON fallback'tan (`store.json:9,17-19`, `store-products.json:10-12`) da kaldır.

**Madde 5 — Store altı "İçerikler" + "Sepete Ekle"/checkout kaldır**
- `frontend/src/components/woody/store/WoodyStoreClient.tsx`: cart state (`:45`), checkout API (`:92-114`), Iyzipay (`:128`), "Sepete ekle" (`:171-174`), boş-sepet (`:231`) → görünürlüğü `page_store` içindeki `showCart:false` bayrağıyla yönet (müşteri ileride açabilsin). Bayrak false iken hiç render etme.
- Kullanılmayan import/state temizle, build kırılmasın.

**Madde 4 — Başlıkları sadeleştir + Magic English (Madde 1 fontuna bağlı)**
- Seri başlık metinlerini DB içeriğe taşı: "Okul Serisi" / "Atölye Serisi" (ön ek YOK).
- Kaynaklar: `frontend/src/components/woody/home/WoodySetZigzag.tsx:11`, `home-copy.ts:37-56` (`SET_SERIES_MEDIA.ribbonTr`), `workshop.json`.
- "Woody ve Arkadaşları X Serisi" şablonundan ön eki çıkar. **`app_name`'e DOKUNMA** (`site-defaults.json:7` = "Woody ve Arkadaşları", her yerde marka).
- Bu başlıklara `.font-series` class'ını uygula (ADIM 2'de Baloo 2 olarak hazırlayacaksın — Magic English yerine lisans-güvenli display).

**Madde 9 — Hero giriş metinlerini sil**
- `frontend/src/components/woody/home/WoodyGrayBanner.tsx:2-3` öğelerini DB içeriğe taşı (örn. `homepage_hero` veya `home_banner` anahtarı, liste).
- "Oyun Tabanlı Öğrenme" ve "Dijital İçeriklerle Desteklenen Sistem" öğelerini kaldır (tr/en/de). Kalan öğe(ler) dengeli, divider/hizalama düzelt.
- ⚠ Bu dosya home altında ama **sadece sen** `WoodyGrayBanner.tsx`'e dokun; `WoodyHomePage.tsx`'e (section sırası, Claude'da) dokunma.

**Madde 10 — Dijital İçerikler: Basic/Junior/Senior → buton (sunum, kodda)**
- `frontend/src/components/woody/digital-content/DigitalContentHubClient.tsx:39-77` + `digital-content-data.ts:19-23` (renkler `var(--level-basic|junior|senior)`).
- Net tıklanabilir **buton**: `<button>`/`role`, hover+focus state, klavye odağı, görünür "basılabilir" stil. Renk `--level-*` (`globals.css:81-84`).

**Madde 3 — Öğretmen + Öğrenci Seti dikey video `[VİDEO BEKLENİYOR — başlama]`**
- Videolar gelmeden BAŞLAMA. Claude haber verecek.
- Gelince: `public/media/woody/...` altına koy; **video URL'leri `page_preschool` DB içeriğinde** tut (kodda sabit yol değil).
- `frontend/src/components/woody/preschool/PreschoolPageClient.tsx:113-114` ("Öğretmen/Öğrenci Seti") → dikey 9:16 player (`aspect-[9/16]`, max-width, mobil uyumlu). Mevcut `LEVEL_MEDIA` (`:21-49`) yapısını kullan.

---

### ADIM 2 — Fontlar (Madde 1) `[Madde 4'ten ÖNCE bitir]` `[KARAR VERİLDİ]`

> **Mimari karar (Claude):** Müşterinin istediği "Montessori" ve "Magic English" fontları lisans/teknik nedenle kullanılamaz (Magic English = kişisel-kullanım Disney fontu + Türkçesiz; ücretsiz Montessori = gövde için uygunsuz tracing fontu). Yerine **lisans-güvenli (SIL OFL), tam Türkçe destekli Google Fonts** kullan:
> - **Gövde (Montessori yerine):** **Quicksand** → `--font-quicksand` (ağırlıklar 400/500/600/700)
> - **Seri başlıkları (Magic English yerine):** **Baloo 2** → `--font-baloo` (700/800)

- Kaynaklar: `frontend/src/lib/fonts/brand-fonts.ts` (`next/font/google`), `frontend/src/app/layout.tsx:120`, `frontend/src/app/globals.css`.
- `brand-fonts.ts`: Quicksand + Baloo 2'yi `next/font/google` ile ekle (`variable: '--font-quicksand'`, `--font-baloo`, `subsets: ['latin','latin-ext']` — **`latin-ext` Türkçe için zorunlu**). `brandFontVariableClassName`'e iki değişkeni de ekle. **woff2/`public/fonts` GEREKMEZ** — Google Fonts.
- `globals.css`: body varsayılan fontunu Quicksand'e geçir. **TR karakter testi zorunlu:** ğ ı ş İ ö ü ç Ğ Ş.
- Utility class: **`.font-series`** → Baloo 2 (Madde 4 başlıkları bunu kullanacak). İstersen `.font-quicksand` da tanımla.
- Not: ileride bu seçim `design_tokens.typography` ayarına bağlanıp admin'den değiştirilebilir hale getirilebilir (şimdilik kod).

---

## SENİN DOKUNMAYACAĞIN dosyalar (Claude'da)

`020_woody_site_settings.sql`'in `socials`/`contact_info`/`home_sections` satırları, `general-settings-tab.tsx`, `site-defaults.json` socials/contact fallback, `Footer.tsx`, `SocialLinks.tsx`, `WhatsAppFloatingButton.tsx`, **`WoodyHomePage.tsx`**.
> Not: `020_..._site_settings.sql`'i ikiniz de düzenliyorsunuz ama **farklı anahtar satırları**. Çakışma olmaması için sadece `page_*` / `homepage_hero` satırlarını sen ekle; `socials`/`contact_info`/`home_sections`'a dokunma. Push öncesi `git pull --rebase`.

---

## Çalışma kuralları

- Branch `woody-icerik-i18n`; push öncesi `git pull --rebase`; küçük+sık commit; mesaj: `feat(woody): madde-X ...`.
- Her madde sonrası `bun run build` temiz + TS hatasız. Seed değişince `bun run build && bun run db:seed:*:fresh` (doğru `db:seed:woody:fresh` script adını `backend/package.json`'dan teyit et).
- SSR/hydration uyumu: DB fetch'i sayfayı bozmamalı, fallback her zaman çalışmalı.
- Takıldığında veya mimari belirsizlikte (font lisansı, `page_*` şema şekli, app_name şablon konumu) **Claude'a sor** — tahminle ilerleme.

## Tamamlanınca Claude'a raporla
- Hangi maddeler bitti, hangi `page_*` anahtarları eklendi, admin'de neler düzenlenebilir, build/seed çıktısı, açık kalan bloklar (video, font lisansı).
