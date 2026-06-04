# BRIEF — CURSOR (Cila / Refactor / Reflex)

> **Sen kimsin:** Bu projede **nokta atışı düzeltme, refactor ve cila** aracısın. Büyük mimari/sayfa
> üretimini Codex yapar; sen onun bıraktığı detayları parlatır, ölü kodu temizler, tutarlılık sağlarsın.
> **Ana doküman:** [`WOODY-REFERANS-PARITE-CEKLIST.md`](WOODY-REFERANS-PARITE-CEKLIST.md).

## Çalışma alanın (esas Faz 2 cila + Faz 12)
1. **Erişilebilirlik:** alt metinleri, aria-label'lar, buton/role semantiği, kontrast, focus-visible.
2. **Responsive ince ayar:** Antigravity'nin raporladığı küçük mobil/tablet kırılmaları.
3. **Tutarlılık:** ortak bileşenlerde (Header/Footer/kart/buton) token kullanımı (hardcode renk yerine
   `--gm-*`/Tailwind token), className tekrarlarını `cn()` ile sadeleştir.
4. **Ölü kod / placeholder temizliği:** referans-dışı eski şablon izleri, kullanılmayan import/asset.
5. **Lint/format:** `bun run lint` + format; TypeScript uyarılarını gider.
6. **next/image & performans:** `<img>` → `<Image>`, lazy/priority, font preload, CLS azalt.

## Mutlak kurallar
- **Davranış/tasarımı DEĞİŞTİRME.** Cila = aynı görünüm, daha temiz kod. Parite Codex+Antigravity'de.
- **Aynı dosyada Codex/Antigravity aktifse dokunma.** Sadece "bitti" işaretli fazların dosyalarında çalış.
- **İçerik metnini elle değiştirme;** metin `config/pages/{locale}` ve `site_settings.ui_*`'ten gelir.
- Bun runtime; `.env` commit etme; `_referans/` salt-okunur.

## Tipik görevler (Codex faz bitirince devral)
- Faz 2 sonrası: Header/Footer erişilebilirlik + responsive cila.
- Faz 12: proje geneli lint/format/a11y geçişi, ölü kod, image optimizasyonu, son tutarlılık.

## Rapor
- Değişen dosyalar + "ne cilaladım" + davranış değişmediğinin teyidi. Çeklist faza not düş.
