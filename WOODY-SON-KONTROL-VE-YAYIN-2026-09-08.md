# Woody — Son kontrol ve yayın, 8 Eylül 2026

Woody dönüşüm paketindeki bekleyen değişiklikler incelendi, hatalar düzeltildi ve canlıya alındı. Tanitio'nun Woody raporları güncel kaynaktan doğrulandı. Bu rapor satış artışı elde edildiği veya tüm büyüme checklist'inin tamamlandığı iddiası değildir.

## Değişiklikler

- Kısmi iadeler kendi tutarıyla kalıcı işlem defterine yazılıyor. Toplam iade sipariş tutarını aşamıyor; eşzamanlı istekler kilitleniyor. PayTR yanıtı belirsizse tekrar para transferi yerine mutabakat gerekiyor. Tam iadede erişim kaldırılıyor.
- Callback tekrarları ve eski ödeme referansları ödenmiş/iade edilmiş siparişi yeniden açamıyor. Purchase teslim sahibi ödeme anında sabitleniyor; sonradan sunucu ayarı değişmesi browser/server çift gönderimine yol açmıyor.
- Finans summary/daily/products/attribution aynı işlem kaynağını kullanıyor. Bilinen test ödemeleri dışlanıyor. Yeni işlemler ödeme/iade tarihiyle raporlanıyor; eski kanıtı olmayan kayıtların tarihleri geriye dönük uydurulmuyor. Attribution olmayan ödeme direct diye etiketlenmiyor; düşük hacimli gruplar gizleniyor.
- İzin verildiği anda ilk açılışın UTM bilgisi yakalanıyor; izin reddinde kayıt temizleniyor. Yeni izin sürümü eski kabulün önüne geçiyor. Geç oluşan GA client/session kimlikleri checkout sırasında tekrar okunuyor; bozuk çerez checkout'u durdurmuyor. Açılış/referrer URL'lerinden rastgele sorgu parametreleri çıkarıldı.
- Level finder sonucu aktif ürüne doğrudan satın alma ve kurum teklifi bağlantısı veriyor; uygun ürün yoksa bilgi yoluna yönlendiriyor.
- Checkout minimum adet, stok, tam sayı ve yinelenen ürün kontrolü müşteri kaydı oluşturmadan yapılıyor.
- İç CTA ölçümü artık 400 ms bekleme ve zorunlu tam sayfa yenilemesi yapmıyor. Beacon olayı kaynak sayfayı korurken Next.js geçişi devam ediyor.
- Deploy yeni Next.js build'ini ayrı klasörde hazırlıyor. Derleme sırasında aktif `.next` silinmiyor; önceki build `.next.previous` altında korunuyor. Backend deploy yalnız refund ledger tablosunu idempotent oluşturuyor; genel/fresh seed çalıştırılmadı.

## Kanıt

- 18 hedefli test, 48 assertion: measurement, PayTR iade, adet sınırları, attribution ve tek teslim sahibi.
- Backend build ve frontend TypeScript/production build başarılı.
- Yerel ve canlı MySQL oturumunda yalnız TEMPORARY tablolarla 7 senaryo: tekrar callback, eski referans, kısmi iade tutarı, toplam net gelir, iade sonrası callback, izin reddi, test ödeme ayrımı. Müşteri satırları değiştirilmedi; PayTR/Google'a test ödeme gönderilmedi.
- İmzalı canlı Commerce API'nin dört rapor ucu HTTP 200. 10 Ağustos–8 Eylül aralığı: 1 ödeme / 3.000 TL brüt, 1 eski iade / 1.500 TL, 1.500 TL net gelir. Bu net gelir kâr değildir. Günlük ve ürün toplamı özetle tutarlı. Eski iki ödeme kaydında testMode alanı yok; yeni test flag filtresi bunların geçmiş niteliğini kanıtlamaz.
- Mobil 390 px canlı home-tutor ve checkout: üç doğru ev seti bağlantısı; yatay taşma yok. Consent kabulü sonrası `qa-audit` kaynak bilgisi checkout'a taşındı. Aynı document işareti korundu; CTA geçişi tam sayfa yüklemedi. Kuyrukta bir CTA, bir route page_view ve bir begin_checkout komutu görüldü. GA4/Ads toplama uçları tarayıcı testinde engellendi; engellenen ağ hataları uygulama hatası sayılmadı. Bu kontrol gerçek GA4 teslim/kabul kanıtı değildir.
- Tek TTFB örnekleri eski build'de 281 ms, yeni build'de 561 ms; karşılaştırmalı CWV iyileşmesi iddia edilmez. Kanıtlanan performans düzeltmesi, tıklamadaki zorunlu 400 ms bekleme ve tam belge yüklemesinin kaldırılmasıdır.
- Frontend build `cWJuJg5vHAHIQr7Nra4RJ`; Woody backend/admin/frontend PM2 online.
- Tanitio canlı dashboard build `Jy4B78z3P6CRW_Atu8MbS`. Woody izlenen rakip: 11, raporu olan: 11. Daha önce hatalı bulunan AI hafıza kaydı pasif (`active=0`). Tanitio'da açık yerel değişiklikler HaldeFiyat'a aittir; Woody paketinin parçası değildir.
- Ortak paketin public site_settings sır filtresi yerel/canlı SHA256 eşleşiyor; ortak paket çalışma ağacı temiz. Başka projelerin ortak paket geçmişi bu iş için birleştirilmedi.

## Kalan somut engeller

1. **GA4 mülk sahibi beyanı:** Measurement Protocol secrets listeleme başarılı, kayıt sayısı 0. Secret oluşturma Google HTTP 400 `FAILED_PRECONDITION`: “The User Data Collection Acknowledgement must be attested on this property before measurement protocol secrets may be created.” Mülk sahibi GA4 yönetiminde bu beyanı tamamlamalı. Ardından secret oluşturulup Woody production ayarına güvenli biçimde eklenmeli ve izinli yeni ödeme ile doğrulanmalı. Beyan kullanıcı adına verilmedi.
2. **Gerçek ödeme/iade kabulü:** Somut test tutarı ve işletme onayı olmadan gerçek para hareketi yapılmadı. Browser fallback dönüş sayfasına bağlıdır; kullanıcı dönmezse sunucu ölçümü eksikliği sürer. 4 Eylül tarihli eski iade kuyruğu bugünün iadesi olarak gönderilmedi.
3. **Daha önce açığa çıkan Google kimlikleri:** Kod filtresi yayında; kimlik rotasyonu ve Tanitio bağlantısının yeni kimliklerle eşlenmesi henüz doğrulanmadı.
4. İş hedefi, reklam tavanı, marj/CAC, sosyal hesap bağlantıları ve onaylı yayın planı ana checklist'te açık. Reklam bütçesi veya yayın takvimi bu kontrolde değiştirilmedi.

## Yayın ve geri dönüş

Kaynak yedeği: Woody sunucusunda `/var/backups/woody/pre-conversion-20260908.tar.gz`. Önceki frontend build: `/var/www/woody/frontend/.next.previous`. Yeni refund tablosu veri silmeden eklendi; geri dönüşte iade kanıtları silinmez. Yayın logları yerelde `/tmp/woody-final-deploy.log`, `/tmp/woody-final-backend.log`; tarayıcı kanıtları `.playwright-cli/` altında ve Git dışında.

Teknik sözleşme kontrolü: [PayTR Refund API](https://dev.paytr.com/en/iade-api), [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events).
