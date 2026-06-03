# Codex Görevi — Frontend'i nötr boş taslak şablona çevir

## Rol
Sen Codex'sin (implementer). Bu repoda **frontend'i markadan/projeden bağımsız, boş taslak
şablona** çevireceksin. Mimari/karar zaten verildi; senin işin uygulamak.

## Tek doğruluk kaynağı
Kök dizindeki **`FRONTEND-SABLON-CHECKLIST.md`** dosyasını oku ve **faz faz (Faz 1→9)** uygula.
Checklist'teki KALDIR / KORU / NÖTR tabloları bağlayıcıdır. Her tamamladığın maddeyi
`[ ]` → `[x]` yap.

## Bağlam
- Repo: `woody` (sablon_proje türevi monorepo: `backend/`, `admin_panel/`, `frontend/`,
  ortak paketler `packages/`).
- `frontend/` şu an **goldmoodastro (astroloji)** türevi: zodyak, danışman, fal (kahve/rüya/
  tarot/numeroloji), krediler, randevu, premium içerik dolu.
- `backend/` ve `admin_panel/` **zaten nötrlendi** (referans olarak bakabilirsin).
- Hedef: iskeleti koru (App Router, i18n, auth, layout, SEO, RTK store, tema), **domain
  içeriğini boşalt**, marka adını `AppName` token'ına çevir.

## Kesin kurallar (ihlal etme)
1. **`packages/` (shared-*) DOKUNMA** — ayrı repo. Frontend `@shared/...` import ediyorsa
   bırak; gerekiyorsa sadece frontend tarafını uyarlama yap.
2. **`backend/` ve `admin_panel/` DOKUNMA** — bu görev yalnız `frontend/`.
3. **Marka adı hard-code etme.** Her yerde `AppName` token'ı veya `NEXT_PUBLIC_APP_NAME`
   env'i kullan (apply-brand.py `AppName`'i gerçek markaya çevirir).
4. **Ticaret kaldırılacak** (checkout / pricing / booking-payment) — karar verildi.
5. **i18n DB tabanlı** (backend `site_settings`); statik locale JSON yok. Kodda gömülü astro
   metinleri varsa nötrle, çeviri altyapısını bozma.
6. İskeleti (routing/i18n/auth/layout/SEO/RTK/tema) **silme**; sadece domain içeriğini.

## Çalışma akışı
1. Dal aç: `git checkout -b frontend-sablon`
2. Baseline: `cd frontend && bun run build` + `bun run lint` (mevcut durumu not et).
3. **Silme sırasına uy** (orphan import'u en aza indirir):
   Faz 1 route → Faz 2 container → Faz 3 home section → Faz 4 RTK endpoint →
   Faz 5 içerik JSON → Faz 6 routing/menü → Faz 7 marka/i18n/SEO → Faz 8 public → Faz 9 doğrulama.
4. **Her faz sonunda:**
   - `cd frontend && bun run build` ve `bun run lint` çalıştır; **build yeşil kalmalı**.
   - Kalan kırık import / kullanılmayan dosya / ölü link temizle.
   - Türkçe conventional commit at (örn. `refactor(frontend): faz 1 — astro route'lari kaldirildi`).
5. Bir dosyayı silince onu import eden tüm yerleri de temizle (build bunu yakalar).

## `home-layout-components.ts` senkronu (önemli)
`frontend/src/config/pages/home-layout-components.ts` ile
`admin_panel/src/config/home-layout-components.ts` **aynı section key setini** kullanmalı.
İkisini de aynı nötr sete indir (Hero/Features/Promises/CTA/Banner gibi korunan section'lar).
(admin_panel dosyasını bu istisnada güncelleyebilirsin — sadece bu dosya.)

## Kabul kriterleri (Faz 9 — bitti sayılması için hepsi geçmeli)
- [ ] `cd frontend && bun run build` → hatasız
- [ ] `bun run lint` → yeni hata yok · `bun run typecheck` → temiz
- [ ] Şu sayfalar açılıyor (nötr/placeholder içerik): `/`, `/login`, `/register`, `/blog`,
      `/contact`, `/faqs`, `/terms`, `/privacy-policy`, `/profile`
- [ ] Kaldırılan domain route'larına (explore/pricing/dashboard/karne/checkout/consultant/
      booking) header/footer/menü/CTA'da link kalmadı
- [ ] Frontend'de kaldırılan/var olmayan backend uçlarına (consultant/booking/horoscope/
      credits/subscriptions/orders) RTK çağrısı kalmadı
- [ ] Hiçbir yerde hard-code marka ("Woody", "goldmood", astro terimleri) kalmadı;
      `grep -rniE "goldmood|zodiac|burç|consultant|danışman|horoscope|fal|tarot|numerolog" frontend/src`
      yalnızca (varsa) zorunlu/yorum kalıntısı döndürür
- [ ] `FRONTEND-SABLON-CHECKLIST.md` içindeki kutular işaretlendi

## Raporlama
Her faz sonunda kısa özet ver: hangi dosyalar silindi/nötrlendi, build durumu, kalan riskler.
İş bitince son bir özet + commit listesi.

## Başlangıç komutu (öneri)
```bash
cd /home/orhan/Documents/Projeler/woody
git checkout -b frontend-sablon
sed -n '1,200p' FRONTEND-SABLON-CHECKLIST.md   # planı oku
cd frontend && bun run build && bun run lint    # baseline
# sonra Faz 1'den başla
```
