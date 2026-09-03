# Ödeme sorunu yaşayan müşterilere bilgilendirme (TASLAK — GÖNDERİLMEDİ)

Hazırlık: 2026-09-04. **Onay bekliyor.** Müşteriye giden iletişim olduğu için
gönderilmeden önce metnin ve alıcı listesinin onaylanması gerekir.

## Alıcılar

Ödeme denemesi başarısız olan **gerçek dış müşteriler** (Admin ve MinaYayinevi
hesapları kendi test alımların olduğu için listede yok):

| Ad | E-posta | Başarısız deneme | Tutar | Tarih |
|---|---|---|---|---|
| Engin Gülgör | gulgorengin@gmail.com | 3 | ₺3.000 | 31.08 – 02.09 |
| Duygu Hacıoğlu | mfdhacioglum@hotmail.com | 1 | ₺3.750 | 02.09 |

> Not: İki alıcı da **birden fazla ürün/tutar** denemiş olabilir; metin tutar
> belirtmiyor, bilerek. Kişiye özel tutar yazılacaksa tabloya göre uyarlanmalı.

## Konu

```
Woody and Friends — ödeme sorunumuz giderildi
```

## Metin

```
Merhaba {AD},

Geçtiğimiz günlerde woodyvearkadaslari.com üzerinden sipariş vermeye
çalıştığınızda ödeme adımında bir hata ile karşılaştınız. Sorun bizim
ödeme altyapımızdan kaynaklanıyordu; sizinle veya kartınızla ilgili
bir durum değildi.

Bu sorunu giderdik. Ödeme sistemimiz artık sorunsuz çalışıyor.

Siparişinizi dilediğiniz zaman yeniden oluşturabilirsiniz:
https://woodyvearkadaslari.com/tr/store

Denemeleriniz sırasında kartınızdan herhangi bir tahsilat yapılmadı.
Yaşadığınız zaman kaybı için özür dileriz.

Sorunuz olursa bu e-postayı yanıtlamanız yeterli; yardımcı oluruz.

Sevgiler,
Woody and Friends
```

## Gönderim öncesi doğrulanmalı

1. **"Kartınızdan tahsilat yapılmadı" cümlesi** — `payment_status = failed`
   olduğu için tahsilat beklenmez, ama PayTR panelinden teyit edilmeden bu
   cümle söz vermek olur. Teyit edilemezse cümle çıkarılmalı.
2. **"Sorunsuz çalışıyor"** — ödeme akışının gerçekten uçtan uca test edilmiş
   olması gerekir (son başarılı sipariş: Özge Özdemir, 03.09, ödendi → olumlu
   sinyal ama tek başına yeterli değil).
3. Gönderim kanalı: admin panel → E-Posta, ya da doğrudan SMTP
   (VPS Postfix, bkz. hafıza `woody-mail-setup`).
