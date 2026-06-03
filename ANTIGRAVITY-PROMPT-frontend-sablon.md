# Antigravity Görevi — Frontend nötr şablon görsel/UI doğrulaması

## Rol
Sen Antigravity'sin (UI/görsel doğrulayıcı). `woody` reposunda `frontend-sablon` dalındaki
**nötr boş taslak frontend şablonunu** tarayıcıda çalıştırıp ekran görüntüleriyle doğrulayacaksın.
Kod yazma; **gör, dene, raporla.** (Bağlam: `docs/antigravity-kb.md` varsa oku.)

## Bağlam
- `frontend/` daha önce goldmoodastro (astroloji) türeviydi; **nötr şablona** çevrildi:
  astroloji/danışman/fal/zodyak/ticaret içerikleri kaldırıldı, iskelet (auth, blog, contact,
  faqs, legal, profile, home shell) korundu. Tema/section/SEO **DB + admin panelden dinamik**.
- Marka adı `AppName` token'ı + `NEXT_PUBLIC_APP_NAME` env'inden gelir (hard-code marka yok).

## Önkoşullar (çalıştırmadan önce)
1. **DB ayakta** (MySQL `woody_db`, seed edilmiş). Not: lokalde docker/system MySQL 3306
   çakışması yaşanmıştı — önce DB'nin tek ve erişilebilir olduğundan emin ol.
2. **Backend** çalışır: `cd backend && bun run dev` → `http://127.0.0.1:8101` (`/api/health` = 200).
3. **Frontend** çalışır: `git checkout frontend-sablon && cd frontend && bun run dev`
   → genelde `http://localhost:3101` (terminaldeki portu kullan).
4. Test öncesi `git branch --show-current` = `frontend-sablon` olmalı.

## Doğrulanacak sayfalar (her biri için ekran görüntüsü + TR/EN)
Korunan route'lar — **açılmalı, nötr/placeholder içerik, kırık yok:**
- [ ] `/` (home) — Hero / Features / Promises / CTA gibi **nötr section'lar**; astro
      (danışman, burç, fal, "expertise") section'ı **YOK**
- [ ] `/login`, `/register`, `/forgot-password`
- [ ] `/blog`, `/blog/[bir-yazı]`
- [ ] `/contact`, `/faqs`
- [ ] `/profile` (giriş gerektiriyorsa login akışı)
- [ ] Legal: `/terms`, `/privacy-policy`, `/cookie-policy`, `/kvkk`, `/editorial-policy`

Kaldırılan route'lar — **404 / yönlendirme vermeli (içerik göstermemeli):**
- [ ] `/explore`, `/pricing`, `/dashboard`, `/karne`, `/checkout`
- [ ] `/me/consultant`, `/me/credits`, `/me/readings`

## Her sayfada bak
- [ ] **Görsel kırık yok:** logo placeholder geliyor; astro görseli (support_ai vb.) yok;
      bozuk/eksik resim (broken image) yok
- [ ] **Layout sağlam:** header + footer nötr linkler (astro mega-menü/kategori yok),
      taşma/üst üste binme yok, responsive (mobil + masaüstü)
- [ ] **Tema uygulanıyor:** renkler/CSS değişkenleri DB'den geliyor (boş/temasız görünüm yok)
- [ ] **Metin nötr:** "danışman, burç, fal, zodyak, horoscope, tarot" gibi domain metni yok;
      marka yerine `AppName`/env adı görünüyor (gerçek marka hard-code değil)
- [ ] **i18n:** locale değiştir (TR/EN/DE) → metinler değişiyor, sayfa kırılmıyor
- [ ] **SEO:** sekme başlığı / meta description dolu (görünüm kaynağı: DB site_settings)

## Konsol & ağ (DevTools)
- [ ] **Console error yok** (özellikle "Cannot read", missing component, hydration error)
- [ ] **Network'te kaldırılan uçlara çağrı yok / 404 yok:** `consultants`, `horoscopes`,
      `credits`, `bookings`, `subscriptions`, `orders`, `chat`, `reviews`, `sliders`, `popups`
- [ ] Korunan uçlar 200: `/api/v1/home/layout`, `/api/v1/site_settings/design_tokens`,
      `/api/v1/menu-items` / `menu_items`, `/api/v1/footer-sections`

## Admin ↔ frontend dinamiklik kontrolü (kısa)
- [ ] Admin'de `/admin/home-layout`'tan bir section'ı pasif yap → frontend `/` yenile →
      o section kaybolur (section dinamik)
- [ ] Admin `/admin/site-settings` SEO sekmesinde home title değiştir → frontend home
      sekme başlığı güncellenir (revalidate sonrası)
- [ ] Admin tema/design-tokens değişimi → frontend renkleri değişir

## Çıktı (rapor)
1. Her sayfa için **ekran görüntüsü** (TR + en az 1 EN), mobil + masaüstü.
2. **PASS/FAIL tablosu**: sayfa | açıldı mı | görsel | konsol | not.
3. **Bulgular**: kırık görsel, taşan layout, kalan astro metni/link, console/network hatası
   — dosya/sayfa + ekran görüntüsüyle.
4. Genel verdict: şablon görsel olarak nötr ve sağlam mı? Bloklayıcı var mı?

## Kapsam dışı (dokunma)
- Kod değiştirme (bulguları raporla, düzeltmeyi Codex/Claude yapar).
- `backend/`, `admin_panel/`, `packages/` üzerinde değişiklik.
