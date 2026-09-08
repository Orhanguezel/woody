# Woody — uygulanabilir reklam deneyi ve kalan kararlar

8 Eylül 2026. **Taslak; reklam hesabına uygulanmadı.**

## Güncel kanıt

- Kapalı dönem: 11 Ağustos–7 Eylül. Tüm görünür arama terimleri sorgulandı: 2.471 satır, 353 tıklama, 2.166,04 TL. Bu, 4.278,56 TL hesap harcamasının %50,63'ü; görünmeyen sorguların niyeti bilinmiyor.
- WhatsApp/form dönüşümleri satış değildir. Önceki 23 dönüşüm ve 4.400 TL dönüşüm değeri ciro/ROAS olarak yorumlanmaz.
- Kampanyanın satın alma, telefon ve lead hedefleri salt okunur kaydedildi. Satın alma action'ının yeniden okuması başarısız oldu; eski durum güncelmiş gibi raporlanmadı.
- 50 hesap değişikliği kaydı okundu. Bu kayıtlar tek başına yetkisiz erişim kanıtı değildir; hesap sahibiyle değişikliklerin sahipliği eşleştirilmelidir. Sızmış kimliklerin rotasyonu ayrı açık kalır.

## Somut negatif aday paketi

Search-1 (`22883526699`) için 14 **EXACT / tam eşleşme** negatif aday; 249,81 TL, 40 tıklama, 0 kaydedilmiş lead. Benzer iki sorgu toplam iki lead getirdiği için pakete alınmadı. Genel “oyun” negatif yapılmıyor. İkinci sınıf çocuğu ürün kapsamına girebileceğinden bu bir ticari niyet hipotezidir, kesin yanlış kitle kanıtı değildir.

Tanitio change-set: `114b87a2-7da9-4869-94e9-2a1964ce60f0`. Google Ads `validateOnly` başarılı. **Apply çalıştırılmadı.** Bütçe, bidding, mevcut reklam ve hedefler değişmez.

| Tam eşleşmeli sorgu | Harcama (TL) | Tıklama |
|---|---:|---:|
| 2 sınıf ingilizce oyunları | 76.07 | 13 |
| 2 sınıf ingilizce oyunları wordwall | 36.85 | 4 |
| ingilizce oyunları 2 sınıf | 36.68 | 5 |
| 2 sınıf ingilizce oyunları 1 ünite | 22.90 | 4 |
| 2 sınıf oyunları ingilizce | 17.92 | 3 |
| ingilizce kelime oyunu 2 sınıf | 10.29 | 1 |
| ingilizce oyunlar 2 sınıf | 10.18 | 2 |
| 2 sınıf ingilizce renkleri öğreniyorum | 7.99 | 2 |
| 2 sınıflar için ingilizce oyunları | 5.96 | 1 |
| ingilizce oyunları 2 sınıf 1 ünite | 5.91 | 1 |
| ingilizce 2 sınıf oyunlar | 5.65 | 1 |
| 2 sınıf ingilizce oyunları kolay | 5.42 | 1 |
| ilkokul 2 sınıf ingilizce oyunları | 5.28 | 1 |
| ingilizce 2 sınıf oyunları | 2.72 | 1 |

Geri dönüş: uygulanırsa yalnız bu paketin oluşturduğu campaignCriterion kaynakları kaydedilir; durdurma/kaldırma ayrıca mevcut onay akışından yürütülür. Mevcut negatifler topluca silinmez.

## İlk deney — işletme seçimi bekliyor

Mevcut 150 TL/gün tavan korunur; bütçe artışı yok. İki alternatifi aynı anda yeni kampanyalara bölmek yerine seçilen tek yol denenir.

**Kurum:** `/tr/preschool#quote-form`; gerçek 30+ öğrenci modeli ve daha küçük gruplar için Mini School alternatifi. Başlık taslakları: “Okul Öncesi İngilizce Seti”, “Kurumunuz İçin Teklif Alın”, “Seviyeye Uygun Set Seçimi”. Açıklama: “Kurumunuzun öğrenci sayısını ve ihtiyacını paylaşın. Uygun setler için teklif isteyin.”

**Ev / özel ders:** `/tr/home-tutor#home-levels`; Basic/Junior/Senior aktif katalogdan. Başlık taslakları: “Evde İngilizce Çalışmaları”, “Seviyeye Uygun Seti Seçin”, “Set İçeriğini İnceleyin”. Açıklama: “Seviye önerisini alın, ev ve özel ders setlerini inceleyin. Güncel içerik ve fiyatı ürün sayfasında görün.”

Yeni reklam/kampanya oluşturulmadı. Hedef yol, demo kapasitesi, yanıt SLA’sı ve dönüşüm sözleşmesi kesinleşince mevcut change-set üzerinden hazırlanır; yeni kampanya PAUSED kalır.

## Haftalık karar çerçevesi

1. Aynı kapalı 7 gün + düşük hacim için 28 gün; Ads ve finans tarihleri açık yazılır, GSC'nin veri gecikmesi ayrıca belirtilir.
2. Harcama, ticari niyetli ziyaret, sunucunun kabul ettiği form, nitelikli lead, kazanılan sipariş ve net tahsilat ayrı sütunlar olur. WhatsApp tıklaması nitelikli lead değildir.
3. SKU maliyeti/kargo/komisyon/iade bilinmeden kâr, hedef ROAS veya kabul edilebilir CAC hesaplanmaz.
4. 7 ve 14 gün teknik/niyet kontrolü yapılır; kurum kapanış süresi bilinmeden yalnız erken sıfır satışla kampanya kesilmez. 28. gün kapalı dönem değerlendirmesi hazırlanır; sonuç henüz gerçekleşmiş gibi yazılmaz.
5. Sonuç zayıfsa arama niyeti → açılış → lead niteliği → takip → fiyat/teklif sırasıyla incelenir. Küçük yaş/saat örnekleminden otomatik dışlama yapılmaz.

## Hesap sahibinde kalanlar

- GA4 mülkü 500518307: User Data Collection Acknowledgement. API anahtarı oluşturma denemesi `FAILED_PRECONDITION` ile engellendi; hiçbir anahtar oluşturulmadı.
- Google OAuth/Ads kimlik rotasyonu ve yetkisiz değişiklik incelemesi. Yeni sırlar belgeye veya sohbete yazılmaz; Tanitio bağlantısı aynı değişiklikte güncellenir.
- Somut negatif paketinin ve ilk deney yolunun ticari onayı.

Kaynak kanıtları: özel yerel `/tmp/woody-ads-complete/` ve Tanitio change-set kaydı. Referans: [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference), [PayTR iade API](https://dev.paytr.com/iade-api).
