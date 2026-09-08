# Woody GA4 anahtar doğrulaması — 8 Eylül 2026

Google Admin API'de Woody property 500518307 / stream 11990946070 altında `tanitio` adlı Measurement Protocol anahtarı bulundu. Veri akışının ölçüm kimliği Woody ile eşleşti. İlk kontrolde Woody production `GA4_API_SECRET` ve PM2 ortamı boştu; anahtar Google'da oluşturulmuş ancak sunucuya aktarılmamıştı.

Mevcut anahtar güvenli geçici dosyayla sunucuya aktarıldı; yeni anahtar oluşturulmadı. Production `.env` yedeği korumalı dizine alındı ve yalnız GA4_API_SECRET güncellendi. Backend yeni ayarla yeniden başlatıldı. Kurulan değer ile Google API'den alınan değer birebir eşleşti; değerler rapora, Git'e veya çıktıya yazılmadı. Geçici aktarım dosyaları temizlendi.

## Kabul

- Backend online; ölçüm işleyicisinin çalıştığı kuyruk değişimiyle doğrulandı.
- `/debug/mp/collect` üzerinde purchase ve refund: HTTP 200, validationMessages boş; ENFORCE_RECOMMENDATIONS kullanıldı.
- 4 Eylül tarihli eski GA4 olayı `measurement_event_expired` ile terminal failed/attempt_count=10 oldu; bugünün olayı olarak gönderilmedi.
- Gerçek sipariş, ödeme veya iade oluşturulmadı. Google raporlarına sentetik satış yazılmadı.

GA4 beyanı/anahtarı nedeniyle kurulum engeli artık yok. Debug ucu anahtarın geçerliliğini tek başına doğrulamaz; anahtar ayrıca Google Admin API kaydıyla birebir karşılaştırıldı. Gerçek yeni, izinli ödeme ve iadenin GA4 raporunda görülmesi hâlâ ayrı uçtan uca kabul adımıdır.

Kaynak: https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events
