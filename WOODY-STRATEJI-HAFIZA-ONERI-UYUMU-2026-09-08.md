# Woody strateji, hafıza ve öneri uyumu — 8 Eylül 2026

Woody’nin üç sayfası canlı kayıtlar üzerinden güncellendi. Dayanak: 46 izlenen kayıt, 37 rapor ve ayrıca gözden geçirilen yedi programın kaynakları. Uygulama kodu veya reklam/yayın sistemi yeniden deploy edilmedi; mevcut servislerle tenant verisi güncellendi.

## Strateji

- Sürüm 1deki tarihsel 28 günlük performans yorumları güncel karar dayanağından çıkarıldı; önceki belge korumalı yedekte saklandı.
- Son sürüm 3: kurum/öğretmen ile veli akışı, paket içeriği, örnek ders, demo kapsamı ve doğrulanmış satış ölçümü önceliklendirildi.
- Yedi kaynaklı karşılaştırma hesabı, altı içerik serisi, toplamı %100 olan beş içerik başlığı ve dokuz sonraki adım kaydedildi.
- Yayın planı ve içerik oranları deney taslağı olarak belirtildi. Sosyal bağlantı/yayın izni tamamlanmış sayılmadı.
- Araştırma notları üç ayrı kaynak/tarih/kapsam kaydına ayrıldı: rakipler, GA4 ödeme kabulü, tarihsel strateji.

## AI hafızası

- 24 eski veya doğrulanmamış performans yorumu pasifleştirildi; metinler silinmedi.
- Yaş, cinsiyet, şehir ve saat bazlı ROAS yorumlarından aktif otomatik çıkarım kalmadı.
- 10 tarihli ve kaynaklı bilgi eklendi. Önceden geçerli kalan 6 kayıtla birlikte 16 aktif bilgi var.
- Rakip kanıtının sınırları, Instagram/Meta bağlantı eksikliği ve GA4 ödeme kabulünün açık olması açıkça kaydedildi.
- Rakibin beyanı, Woody’nin mevcut özelliği veya kanıtlanmış ticari başarı gibi yazılmadı.

## AI önerileri

Dokuz yeni öneri kaydedildi. Her birinde gerekçe, kaynak, öncelik ve ölçülecek sonuç var:

1. Yeni ödeme ile GA4 satış ölçümünü doğrulama.
2. Genel kaynakları doğrudan rakip stratejisinden ayırma.
3. Kurum ve veli için ayrı teklif akışı.
4. Paket içeriği ve örnek materyal önizlemesi.
5. Öğretmen için örnek ders ve destek kapsamı.
6. Demo teklifinin kapsamı ve maliyeti.
7. Woody Instagram ve Meta bağlantıları.
8. Kanıtlı içerik serilerinin taslakları.
9. Reklam değişikliklerini güncel sorgu ve gerçek marjla doğrulama.

Önerilerin tamamı `new`; `action_type` ve `action_payload` boş. Reklam bütçesi, hedefleme, kampanya, gerçek ödeme veya içerik yayını uygulanmadı.

## Tekrar çalıştırma ve kanıt

Backend dizininde:

```bash
bun scripts/apply-woody-strategy-evidence.ts
# Yukarıdaki komut yalnız doğrulama yapar.
bun scripts/apply-woody-strategy-evidence.ts --apply
```

Script yalnız Woody’yi işler. Strateji revizyonunu, 46/37 rakip kapsamını, arşivlenecek kayıtların tenant üyeliğini ve öneri şemasını kontrol eder. Korumalı önceki durum yedeği alır. Mevcut önerileri yeniden açmaz veya çoğaltmaz. Kaynak alanı düzenlemesinin ikinci uygulamasında eklenen öneri sayısı 0 olarak doğrulandı.

Plan: `backend/scripts/woody-strategy-evidence-2026-09-08.json`.

Açık kalan gerçek işlerin durumu: Instagram/Meta bağlantısı, yeni izinli ödeme ile GA4 kabulü, gerçek marj ve demo kapsamı. Bunlar tamamlanmış gibi işaretlenmedi.

Canlı tarayıcı kabulü: üç sayfa ve API HTTP 200, tenant=woody, JavaScript sayfa hatası yok, yatay taşma yok. Strateji revizyon 3 ve üç araştırma kaydı, hafızada 16 aktif bilgi/0 aktif inference, önerilerde dokuz kayıt ekranda doğrulandı. Ekran kanıtları Tanitio output/playwright/woody-*-aligned-2026-09-08.png dosyalarında.
