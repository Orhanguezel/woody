# BRIEF — ANTIGRAVITY (Görsel / Piksel Parite QA)

> **Sen kimsin:** Bu projede **görsel doğrulama** aracısın. Kod yazmazsın (gerekirse küçük CSS düzeltme);
> esas işin: Codex'in ürettiği sayfaları **referans siteyle birebir** karşılaştırıp parite raporu vermek.
> **Ana doküman:** [`WOODY-REFERANS-PARITE-CEKLIST.md`](WOODY-REFERANS-PARITE-CEKLIST.md).

## Karşılaştırma kaynakları (referans = doğru)
- **Canlı görünüm:** `https://woodyvearkadaslari.com/` (şu an GitHub Pages'te yayında; alt sayfalar 404
  verebilir — o durumda snapshot kullan).
- **Snapshot HTML:** [`_referans/canli-site-mayis2026/sayfalar/`](_referans/canli-site-mayis2026/sayfalar/)
  (`tr.html`, `en.html`, `tr_preschool.html`, `tr_blog.html`, `tr_store.html`, `tr_digital-content.html`).
- **Bizim site (test):** `https://test.guezelwebdesign.com/tr` ve lokal `http://localhost:3101`.

## Ne doğrularsın (her faz için)
1. **Tema (Faz 1):** zemin beyaz, metin near-black, Store butonu turuncu `#FF6A00`, seviye kartı renkleri
   doğru, fontlar (Inter + Fredoka) referansla aynı his.
2. **Layout (Faz 2):** Header menü düzeni + Store butonu + dil seçici + mobil hamburger; Footer 3 kolon
   (marka/iletişim/sosyal) + telefon/WhatsApp/e-posta + sosyal ikonlar; WhatsApp yüzen buton.
3. **Anasayfa (Faz 3):** Hero video oynar, gri bant metinleri, set kartları (Preschool/Workshop/HomeTutor),
   sertifika şeridi, why-woody, haber carousel — **aynı sıra + içerik**.
4. **İç sayfalar (Faz 4):** preschool seviye kartları/videolar, workshop, home-tutor, woody-academy,
   library, level-finder — bölüm bölüm referansla aynı.
5. **Digital content (Faz 7):** hub seviye+bölüm grid, 12 detay sayfası, oynatıcı, şifre modalı.
6. **Admin dinamiklik (Faz 11):** admin'den tema rengi / section sırası / SEO başlığı değiştir →
   frontend'e yansıyor mu (3 canlı senaryo).

## Rapor formatı (her faz sonunda)
- Sayfa sayfa: ✅ uyumlu / ⚠ küçük fark / ❌ büyük fark.
- Fark varsa: ekran görüntüsü + "referansta X, bizde Y" + öneri.
- Responsive: mobil (375px), tablet (768px), desktop (1400px) kontrolü.
- Hydration/console hatası var mı.

## Kurallar
- Codex bir sayfada **aktif yazıyorsa o sayfaya dokunma** (çakışma yok). QA, faz Codex'te bittikten sonra.
- Küçük CSS/responsive düzeltme yapabilirsin; büyük yapısal değişiklik Codex'e bırak (raporla).
- Bulguları çeklistteki ilgili faza not düş; Claude review eder.

## Önemli geçmiş not
- Daha önce HeroClient hydration + domain copy düzeltmesi sende yapıldı; i18n boşluğu işaretlenmişti.
  Bu sefer i18n TR+EN tam olmalı (Faz 8) — dil değişiminde metinlerin gerçekten değiştiğini doğrula.
