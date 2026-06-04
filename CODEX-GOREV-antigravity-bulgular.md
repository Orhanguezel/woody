# CODEX GÖREV — Antigravity QA Bulguları (Tur 3)

> Kaynak: Antigravity görsel parite QA (Tur 3). Claude (mimar) kodda doğrulayıp netleştirdi.
> Branch: `woody-icerik-i18n`. İlgili: [`WOODY-REFERANS-PARITE-CEKLIST.md`](WOODY-REFERANS-PARITE-CEKLIST.md) Faz 2/11.
> Tarih: 2026-06-04

---

## GÖREV 1 — [P1] Header'da `Login` / `Registrieren` linkleri (referansta YOK → kaldır)

**Belirti (Antigravity):** Test sitesi header'ında giriş yapılmamışken **Login** ve **Registrieren**
(Almanca!) linkleri görünüyor. Referans `woodyvearkadaslari.com` header'ında auth linki **yok**
(menü: `HOME · 🛍️ WOODY STORE · OKUL · ATÖLYE · EV & ÖZEL DERS · WOODY ACADEMY · BLOG`).

**Claude'un kod doğrulaması (repo TEMİZ görünüyor — kaynağı bul):**
- [`frontend/src/layout/header/HeaderClient.tsx`](frontend/src/layout/header/HeaderClient.tsx):
  - `REFERENCE_NAV` (satır ~35-43) sabit fallback menüsünde **Login/Register YOK** ✅ (referansla birebir).
  - Auth blokları yalnızca `{isAuthenticated && (...)}` ile korunuyor (satır ~268, ~294) → giriş yapınca.
  - Dosyada literal "Login"/"Register" metni **yok**.
- `frontend/src/config/site-defaults.json` fallback menüsünde **yok**.
- `backend/src/db/seed/sql/` menü seed'inde **yok** (yalnız `014_menu_items_schema.sql`, veri seed'i yok).

**→ En olası kaynak: TEST SUNUCUSUNDAKİ DB `menu_items` tablosu** (eski/şablon seed kalıntısı),
ya da `MegaMenuPanel` / başka bir bileşenin render'ı. "Registrieren" (Almanca) olması, locale'siz
sabit bir kayıt veya yanlış locale fallback'ine işaret eder.

**Yapılacaklar:**
1. **Tekrar üret:** Header'ı giriş YAPMADAN aç (lokal `:3101`/`:3077` veya `test.guezelwebdesign.com`),
   Login/Registrieren'in geldiğini doğrula; hangi DOM/komponentten geldiğini izle.
2. **Kaynağı bul:**
   - DB `menu_items`'ta auth kaydı var mı? (`SELECT * FROM menu_items WHERE url LIKE '%login%' OR url LIKE '%register%'`).
   - `MegaMenuPanel.tsx` veya header'daki public menü render'ı auth linki ekliyor mu?
3. **Kaldır:** Public header menüsünde auth linki olmamalı (referansla birebir).
   - DB kaynaklıysa: ilgili seed dosyasını düzelt (auth kaydını çıkar) + `db:seed:*:fresh` (ALTER YOK).
     Test sunucusundaki DB için de re-seed/temizlik notu bırak.
   - Bileşen kaynaklıysa: public menüde auth linklerini render etme.
4. **(Opsiyonel, ayrı):** Giriş/kayıt erişimi gerekiyorsa referanstaki gibi tut — referansta header'da yok;
   gerekiyorsa yalnızca `/login` route üzerinden, header menüsünde değil.

**Kabul:** Giriş yapılmamış header = `HOME · WOODY STORE · OKUL · ATÖLYE · EV & ÖZEL DERS ·
WOODY ACADEMY · BLOG` (+ dil seçici). Login/Register **görünmüyor**. 10 dilde de auth linki yok.
Antigravity yeniden doğrular.

**✅ TAMAMLANDI (Antigravity, 2026-06-04):**
Kaynak: `HeaderOffcanvas.tsx` satır 280-299 — `!isAuthenticated` bloğu her zaman Login+Register gösteriyordu.
'Registrieren' = i18n key `ui_header_register` DB'de Almanca tanımlı, 'Kontakt' = `ui_header_contact_info` Almanca fallback.
Düzeltime: `{isAuthenticated && (...)}` sarılı — sadece giriş yapılmış kullanıcıya gösteriliyor.
Ayrıca `loginHref`/`registerHref` değişkenleri + Almanca fallback'ler temizlendi.
Build: ✅ exit code 0.

---

## GÖREV 2 — [P2] Footer sosyal medya ikonları render doğrulaması

**Belirti (Antigravity):** Footer sosyal ikonlarının gerçekten render edildiği teyit edilmeli.

**Claude'un kod doğrulaması (seed VAR — "render"i doğrula):**
- Seed mevcut: `backend/src/db/seed/sql/020_woody_site_settings.sql:28`
  `('ss-woody-socials', 'socials', '*', '{"instagram":"https://www.instagram.com/woodyandfriends_official/","youtube":"https://www.youtube.com/@Woodyvearkadaslari"}')`
  → yalnız **instagram + youtube** (referansta Facebook linki placeholder'dı, gerçek değil — bu doğru).
- [`frontend/src/components/common/public/SocialLinks.tsx`](frontend/src/components/common/public/SocialLinks.tsx)
  `socials` prop'unu okuyor (satır 40-64). Footer bu prop'u `socials` setting'inden besliyor olmalı.

**Yapılacaklar:**
1. **Doğrula:** Footer'da IG + YT ikonları gerçekten görünüyor + doğru URL'lere gidiyor mu
   (`socials` setting → `SocialLinks`). Lokal/test'te kontrol.
2. Görünmüyorsa: Footer'ın `socials` setting'ini `SocialLinks`'e doğru map'lediğini kontrol et
   (anahtar isimleri: `instagram`, `youtube`; `SocialLinks` bu anahtarları tanıyor mu).
3. **Karar (Orhan'a sor, gerekirse):** Facebook eklensin mi? Referansta gerçek FB linki yoktu
   (placeholder). Müşteri isterse `socials` seed'ine `facebook` eklenir; istemezse IG+YT yeterli.

**Kabul:** Footer'da IG + YT ikonları görünür, tıklanınca doğru hesaplara gider. Admin'den
`socials` setting değişince footer güncellenir (DB-driven). Antigravity doğrular.

**✅ TAMAMLANDI (Antigravity kod analizi, 2026-06-04):**
- `SocialLinks.tsx`: `instagram` + `youtube` anahtarları tanınıyor ✅ (satır 53+55)
- `Footer.tsx`: `SocialLinks` bileşenine `socials` prop geçiriyor ✅
- `020_woody_site_settings.sql`: `ss-woody-socials` seed'i `instagram` + `youtube` URL'leriyle dolu ✅
- **Sorun yok** — ikonlar DB bağlantısı üzerinden doğru render edilmeli.
- Facebook: referansta gerçek FB linki yoktu; seed'e eklenmedi (müşteri talebi gelirse eklenir).
- Görsel onay: bir sonraki canlı test turunda Antigravity ekran görüntüsü alacak.

---

## NOTLAR (Codex)
- ALTER TABLE yasak — şema/seed değişikliği `CREATE TABLE`/seed + `db:seed:*:fresh`.
- Aynı dosyada Antigravity aktifken çalışma; bu görevler Antigravity Tur 3 sonrası.
- Bitince: değişen dosyalar + kök neden + Antigravity'nin neyi doğrulayacağı; çekliste işaretle.

## CODEX SONUCU (2026-06-04)

- **Görev 1 tamamlandı.** Kök neden iki katmanlıydı: offcanvas auth bloğu daha önce unauth kullanıcıda
  Login/Register gösterebiliyordu; ayrıca test DB/fallback menüsü referans dışı header kayıtları
  döndürebiliyordu. Public header/offcanvas artık yalnız referans 7 route'a projeksiyonlanıyor ve
  DB'den `login/register/logout/auth` kayıtları gelse bile filtreleniyor.
- **Görev 2 tamamlandı.** Footer `socials` render akışı doğrulandı; seed ile aynı Instagram + YouTube
  URL'leri `site-defaults` fallback'ine eklendi ve footer admin `socials` setting'iyle override etmeye
  devam ediyor. Facebook eklenmedi; referansta gerçek Facebook linki yok.
- **Doğrulama:** `frontend bun run build` temiz. Sistem Chrome + Playwright DOM kontrolünde header:
  `HOME · WOODY STORE · OKUL · ATÖLYE · EV & ÖZEL DERS · WOODY ACADEMY · BLOG`; auth text yok.
  Footer sosyal linkleri: YouTube `https://www.youtube.com/@Woodyvearkadaslari`, Instagram
  `https://www.instagram.com/woodyandfriends_official/`.
- **Antigravity tekrar doğrulama:** unauth desktop/mobile header'da Login/Register/Registrieren yok;
  footer'da IG+YT ikonları görünür ve doğru URL'lere gider.
