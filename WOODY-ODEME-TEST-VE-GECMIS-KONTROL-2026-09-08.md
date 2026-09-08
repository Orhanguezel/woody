# Woody ödeme testleri ve geçmiş kontrolü — 8 Eylül 2026

Kontrol: 16:04 UTC. Kaynaklar: Woody canlı MySQL kayıtları, canlı backend kabul scriptleri ve Woody GA4 property 500518307 Data API. Müşteri bilgileri ve anahtarlar rapora alınmadı.

## Yeniden çalıştırılan testler

| Kontrol | Sonuç |
|---|---|
| commerce-ledger-acceptance.ts | 7/7: mükerrer callback, eski ödeme referansı, kısmi iade, kümülatif net tutar, iade sonrası callback koruması, izin reddi, test ödemesi hariç tutma |
| lead-followups-acceptance.ts | 8/8 |
| lead-dedup-acceptance.ts | 4/4 |
| GA4 purchase debug doğrulaması | HTTP 200, doğrulama mesajı yok |
| GA4 refund debug doğrulaması | HTTP 200, doğrulama mesajı yok |

19 kabul senaryosu yalnız geçici MySQL tablolarında çalıştı. Gerçek sipariş, ödeme, iade veya müşteri bildirimi oluşturulmadı. GA4 testleri ENFORCE_RECOMMENDATIONS ile /debug/mp/collect üzerinden yapıldı; raporlara satış eklemez. Anahtarın Google kaydıyla eşleşmesi önceki anahtar doğrulama raporunda ayrıca doğrulandı.

## Görülebilen eski test bildirimleri

Aşağıdaki callback kayıtlarında test_mode=1, status=success, outcome=processed mevcut. Tutarlar callback log tablosunda zaten TL'ye dönüştürülmüş olarak saklanıyor; tekrar 100'e bölünmedi. Saatler veritabanındaki ham kayıt saatleridir.

| Kayıt zamanı | Tutar | Kanıt |
|---|---:|---|
| 31 Ağustos 2026 14:11:22 | 2.500 TL | Başarılı test ödeme bildirimi |
| 31 Ağustos 2026 15:29:16 | 2.500 TL | Başarılı test ödeme bildirimi |
| 1 Eylül 2026 16:08:59 | 3.000 TL | Başarılı test ödeme bildirimi |

Bunlar üç callback kaydıdır; üç benzersiz sipariş veya banka tahsilatı olduğu sonucu çıkarılmaz. Geçmişte başarısız test bildirimleri de var. Bazılarında order_not_found sonucu mevcut; bu geçmiş loglar bugünkü test başarısızlığı değildir.

## Hâlen mevcut siparişler

| Sipariş | Kayıt | Tutar | Son durum |
|---|---|---:|---|
| 804559d4… | 3 Eylül | 3.000 TL | paid / ödeme denemesi succeeded |
| 251b3f0f… | 2 Eylül; 4 Eylül iade güncellemesi | 1.500 TL | refunded / ödeme denemesi refunded |

Bu iki siparişin test modu bilgisi hem ödeme isteğinde hem ilgili callback'te boş. Bu nedenle gerçek banka tahsilatı veya test siparişi oldukları kesinleştirilemez. Ayrı siparişlerdir; 1.500 TL, 3.000 TL siparişin kısmi iadesi değildir. İkisinde de ölçüm izni ve GA4 client_id kaydı bulunmuyor.

Mevcut ticaret defteri 3.000 TL purchase ve 1.500 TL legacy refund gösteriyor. Yeni commerce_refunds tablosunda kayıt yok; eski iade, sipariş durumuna dayanan uyumluluk kaydıdır. Bu kayıtlar mutabakat yapılmış banka geliri olarak sunulmamalıdır.

## GA4 geçmişi

Sorgulanan dönem: 1 Ocak–8 Eylül 2026, GA4 rapor saat dilimi Europe/Istanbul. Bugünün verileri henüz tamamlanmamış olabilir.

| Olay | Adet |
|---|---:|
| WhatsApp tıklaması | 92 |
| Ödemeye başlama (begin_checkout) | 18 |
| Sepete ekleme (add_to_cart) | 4 |
| Satın alma (purchase) | 0 |
| İade (refund) | 0 |
| Form talebi (generate_lead) | 0 |

Purchase/refund transactionId sorgusu da boş döndü. Seçili olayların anlık sorgusunda kayıt yoktu. Bunlar olay sayılarıdır; benzersiz kişi veya sipariş sayısı değildir.

4 Eylül tarihli eski GA4 refund kuyruğu measurement_event_expired ile terminal failed, attempt_count=10 ve sent_at boş durumda. Geçmiş olay yeniden gönderilmedi. Eski siparişlerde izin/client_id olmaması da yeni ölçüm hattında kullanılmalarını engeller.

## Kalan kabul

- [x] Önceki güvenli kabul testlerini yeniden çalıştır.
- [x] Eski test callback'lerini ve mevcut siparişleri ayrı göster.
- [x] GA4 geçmişini doğrudan API ile karşılaştır.
- [ ] Yeni, ölçüm izni verilmiş gerçek ödemenin transaction_id ile GA4 raporunda görünmesini doğrula; gerekiyorsa aynı siparişin gerçek iadesini ayrıca doğrula.

PayTR şu anda etkin ve testMode=false. Yeni gerçek ödeme testi için ödeme aracı ve tutarı belirlenmiş sipariş gerekir. Bu kontrolde gerçek para işlemi yapılmadı.

Google debug davranışı: https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events
