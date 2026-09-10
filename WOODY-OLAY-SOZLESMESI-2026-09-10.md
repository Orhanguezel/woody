# Woody — Ölçüm olay sözleşmesi (10 Eylül 2026)

Bu belge kodda **fiilen** atılan olayları listeler; koda bakmadan "hangi sayı ne demek" sorusunu cevaplar. Kaynak dosyalar: `frontend/src/lib/ads-conversion.ts`, `frontend/src/lib/ecommerce-events.ts`, `frontend/src/features/analytics/AdsConversionClicks.tsx`, `GAViewPages.tsx`, `backend/src/modules/checkout/commerceMeasurement.ts`.

## 1. Lead olayları (GA4 + Google Ads)

| Kullanıcı eylemi | GA4 olayı | Ads dönüşümü (`AW-17456893817`) | Ne zaman atılır | Lead sayılır mı |
|---|---|---|---|---|
| Teklif formu (`/preschool#quote-form`, `/store#quote-form`) | `generate_lead` — `lead_channel=form`, `form_type=quote`, `lead_id`, `source` | `form` etiketi, `transaction_id=lead_id` | **Yalnız sunucu 2xx döndükten sonra**; `request_id` ile tekrar/çift tıklama/yenileme aynı lead'i ikinci kez üretmez | **Evet** — sunucu kabullü başvuru |
| İletişim formu (`/contact`) | `generate_lead` — `form_type=contact`, `source=website`, `lead_id` | `form` etiketi, `transaction_id=lead_id` | Sunucu kabulünden sonra, aynı tekrar koruması | **Evet** (kariyer/öğretmen başvurusu admin'de `purpose=career` ile satıştan ayrılır) |
| WhatsApp bağlantısı (yalnız `wa.me/<numara>` veya `send?phone=`) | `whatsapp_click` — `lead_channel=whatsapp` | `whatsapp` etiketi | Tıklamada; paylaşım linkleri (`wa.me/?text=`) sayılmaz | **Hayır** — ilgi sinyali. Görüşme başladı / nitelikli lead demek değildir |
| Telefon bağlantısı (`tel:`) | `phone_click` — `lead_channel=phone` | `phone` etiketi | Tıklamada | **Hayır** — ilgi sinyali |
| Site içi CTA (ürün/seviye düğmeleri) | `cta_click` (beacon; sayfa geçişini bekletmez) | yok | Tıklamada | Hayır |

Kişisel veri kuralı: e-posta, telefon, ad hiçbir olay parametresine yazılmaz; yalnız sunucunun ürettiği `lead_id` (UUID) taşınır.

## 2. E-ticaret olayları (GA4)

| Eylem | Olay | Kaynak | Not |
|---|---|---|---|
| Ürün detayı | `view_item` | tarayıcı | |
| Satın al düğmesi | `add_to_cart` → `begin_checkout` | tarayıcı | Doğrudan satın alma akışı; sepet sayısı checkout'tan küçük olabilir, huni değildir |
| Ödeme formu gönderimi | `add_payment_info` (`payment_type=paytr`) | tarayıcı | |
| **Ödeme başarılı** | `purchase` (`transaction_id=sipariş id`, `value`, `currency=TRY`, `items`) | **Tek sahip**: ödeme anında sabitlenir — sunucu (Measurement Protocol, `commerce_measurement_outbox`) veya tarayıcı (başarı sayfası) | Aynı sipariş iki yoldan sayılmaz; callback tekrarı ve sayfa yenileme ek purchase üretmez |
| İade | `refund` (gerçek iade tutarı) | sunucu | Kısmi iade kendi tutarıyla; 72 saatten eski olay gönderilmez |

**Ölçüm ön koşulu:** `purchase`/`refund` yalnız çerez onayı **kabul** edilmiş, `ga_client_id` bilinen, test modu dışı, ödemesi `paid` siparişte gönderilir. Onay reddinde outbox `measurement_ineligible_consent_payment_or_test` ile düşer ve **satış GA4/Ads'te görünmez** (finans kaynağı Commerce API'dir, GA4 değil). 10 Eylül itibarıyla gerçek müşterilerin 2/2'si reddetmiştir.

**Ads tarafında satış:** `Woody Landing Page (web) purchase` (GA4 içe aktarım) 8 Eylül'den beri ENABLED/primary. Site etiketi `purchase` dönüşüm etiketi (`googleAdsConversionLabels.purchase`) **bilerek boş**; doldurulursa aynı satış iki kez sayılır.

## 3. Raporda nasıl okunur

- "Dönüşüm" = `form` + `whatsapp` + `phone` + `purchase` toplamıdır; **satış sayısı değildir**. Satış = `purchase` (GA4) veya Commerce API ödeme.
- Ads dönüşüm değeri WhatsApp/telefon için tahmini lead değeridir; ciro değildir.
- Nitelikli lead ve kazanılan satış yalnız admin `lead_followups` aşamasıdır (`qualified`, `won`); Google'a otomatik gönderilmez (offline conversion sözleşmesi ayrı onay ister).
- Haftalık kontrol: aynı kapalı 7 gün; Ads gider/tıklama · sunucu kabullü form · nitelikli · ödeme/iade/net tahsilat ayrı sütun.
