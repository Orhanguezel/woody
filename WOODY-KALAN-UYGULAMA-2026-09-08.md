# Woody kalan uygulama — 8 Eylül 2026

## W07 uygulama kararı

Mevcut teklif ve iletişim kayıtları korunur. Satış takibi, kayıt türü + mevcut kayıt ID'siyle bağlanan ayrı `lead_followups` tablosunda tutulur; mevcut enumlar değiştirilmez. Yalnız mevcut admin yetkisiyle erişilir. Aşama, sorumlu, kullanım amacı, sonraki işlem zamanı, kayıp nedeni ve not düzenlenir. Kayıt sürümüyle eşzamanlı güncelleme çatışması reddedilir. Yeni tablo idempotent CREATE ile hazırlanır; genel seed çalıştırılmaz.

Bu kayıtlar ödeme değildir; kazanıldı aşaması finans toplamı veya Google dönüşümü üretmez. Otomatik mesaj gönderilmez. İşletmenin SLA ve marj kararları girilmeden performans hedefi uydurulmaz. Teklif ve iletişim ayrıntılarında aynı bileşen kullanılır. Listeleme ucu geciken takipleri ve aşama toplamlarını mevcut kayıtlara bağlı olarak sağlar.

## W08 doğrulama

Canlı başlangıç mobil Lighthouse: performans 40, SEO 100, LCP 11,0 sn, TBT 1.280 ms. Hero video 132 MB ve kapaksızdı. Videonun 1,5. saniyesinden doğru WebP kapak üretildi ve görsel kontrol edildi. Açılış artık video indirmez; oynat düğmesi mevcut videoyu açar. İçerik videolarının kapakları responsive görsel olarak yüklenir. Yerel tarayıcı: ilk açılış 0 MP4 isteği, oynatınca video, 390 px taşma ve JS hatası yok.

Seviye Bulucu başlığındaki çift marka kaldırıldı, mevcut ortak metadata üreticisiyle 11 dil alternatifi eklendi. Beş öncelikli URL GSC'de indeksli; home-tutor son crawl 10 Ağustos olduğu için güncel değişikliklerin Google tarafından görüldüğü iddia edilmez.

Yerel yeni Lighthouse LCP 5,7 sn; canlı başlangıçla farklı ortam olduğu için kesin hız kazanımı sayılmaz. Canlı yeniden ölçüm bekliyor.

## W03 ve W07 kabul sonucu

- Teklif/iletişim gönderimi bir UUID istek kimliği taşır. Aynı kimlik ve aynı iş verisi ikinci kez INSERT/bildirim üretmez; farklı veriyi aynı kimlikle yazma 409 döner. Sunucunun kabul ettiği lead ID'si analitik olayına eklenir; e-posta/telefon eklenmez. Tarayıcı aynı lead ID'sini tekrar raporlamaz; Ads'e transaction_id taşınır. Bot tuzağı gerçek lead ID'si üretmez.
- Gerçek MySQL oturumunda yalnız geçici tablolarla 4 mükerrer başvuru kontrolü ve 8 takip kontrolü geçti. Takipte kayıp nedeni, kapalı kayıtta tarih, sürüm çatışması, kayıt türü izolasyonu, UTC dönüşümü ve silinmiş ana kaydın özetten çıkması doğrulandı.
- Admin tarayıcı testi sentetik API ile kurum/nitelikli/sorumlu kaydetti; tek PUT, JavaScript hatası yok. Gerçek başvuru veya e-posta oluşturulmadı.
- Liste özeti yalnız takip açılmış kayıtları sayar; tüm başvurular veya doğrulanmış satışlar gibi sunulmaz. İlk 100 takip ve açık işler aç/kapa içinde gösterilir. Sorumlu alanı operasyon etiketidir; kullanıcı yetkisi veya otomatik görev atama sistemi değildir.

## Strateji revizyon 2 — inceleme taslağı

Mevcut aktif strateji sessizce değiştirilmez. Woody'nin doğrulanmış tenant kapsamı web, Google Ads, GA4/GSC/GTM ve Merchant'tır. Sosyal platform listesi boştur, Meta reklam kapsamı kapalıdır. Sosyal/Meta içerik yayınlama işleri bu çalışmada kapsam dışıdır.

1. Kurum yolu: preschool → demo/teklif → nitelikli talep → kurum teklifi → kazanıldı. Demo kapasitesi ve yanıt süresi işletmece yazılmadan reklam hacmi artırılmaz. 30+ öğrenci modeli korunur; küçük gruba mevcut Mini School açıklanır.
2. Ev yolu: home-tutor → seviye bulucu → doğru aktif ev seti → doğrulanmış ödeme. WhatsApp tıklaması satış veya görüşme değildir. PRO yalnız bilgi/teklif alternatifi kullanır.
3. İlk deney hedefi henüz işletmece seçilmedi. Reklam bütçesi 150 TL/gün mevcut durumda tutulur; 14 EXACT negatif aday ve iki RSA taslağı kardeş reklam raporundadır. validateOnly başarılıdır, apply onayı yoktur.
4. Haftalık kontrol: aynı kapalı 7 gün ve önceki 7 gün; Ads gider/tıklama, form başvurusu, nitelikli başvuru, ödeme/iade/net tahsilat ayrı. 28 günlük sonuç için henüz geçmemiş günlerin performansı yazılmaz. Kaynak tarihi ve izin nedeniyle ölçülemeyen kayıtlar belirtilir.
5. Rakip raporları 11/11 hazırdır. Dil kursu/online ders platformu, yayın/materyal kaynağı ve okul programı ayrı iş modelleridir; hepsi aynı setin doğrudan rakibi sayılmaz. Kıyas alanları: hedef yaş, ev/kurum, uygulayıcı, fiziksel/dijital kapsam, gerçek fiyat/taahhüt, demo ve satın alma adımı. Veri yoksa bilinmiyor yazılır; önbellekteki kanıtın tarihi korunur.

## İşletme girdileri ve hesap sözleşmesi

| Girdi | Durum / kullanım |
|---|---|
| SKU bazında ürün maliyeti | İşletme bekliyor; eski seed'den türetilmez |
| Kargo, ödeme komisyonu, değişken destek maliyeti | İşletme bekliyor |
| İade payı ve hedef katkı payı | İşletme bekliyor |
| Demo kapasitesi, çalışma saatleri, yanıt SLA'sı | İşletme bekliyor; otomatik süre hedefi yok |
| Senior fiyatı, öğretmen seti dahil mi, erişim süresi | Mevcut fiyat korunur; ticari teyit olmadan vaat değişmez |

Katkı = net tahsilat − ürün maliyeti − kargo − komisyon − değişken hizmet maliyeti. İzin verilen CAC = reklam öncesi katkı − korunacak hedef katkı. Girdiler eksikse CAC veya kâr üretilmez. Ads dönüşüm değeri WhatsApp'a atanmış olabilir; gelir yerine kullanılmaz.

## Offline conversion sözleşmesi — henüz etkin değil

Kayıt kimliği quote/contact UUID'dir. Nitelikli/kazanıldı aşaması yalnız admin kararıdır; ödeme kimliğiyle mutabakat yapılmadıkça purchase sayılmaz. Gelecekte Google aktarımı için ayrı onaylı change-set, conversion action, gerçek olay zamanı, izin kanıtı ve izinle elde edilmiş tıklama kimliği gerekir. E-posta/telefon GA4 event parametresine yazılmaz. Kariyer/öğretmen başvuruları purpose=career ile satış raporundan ayrılır. İlk turda Google'a otomatik offline olay gönderilmez.

## Yayın sonucu

Uygulama commit'i `ba7331c`, ana çalışma dalına fast-forward ile alındı ve canlıya yayımlandı. Frontend build `DZfj5kN2PsjfxzQe_e7SH`; admin build `L0MxTXBPs4xcp4XneCoqo`. Üç PM2 servisi online. Yedekler `/var/www/woody-releases/checklist-20260908/backup/` altında; mevcut finans kayıtları ve ortak paketler değiştirilmedi.

- Canlı teklif formu sentetik istek karşılamasıyla hata → yeniden deneme → çift tıklama testini geçti: aynı request_id, bir generate_lead, gerçek başvuru/bildirim yok.
- Canlı admin asset'leri `/admin-assets` altında HTTP 200. İlk derlemede eksik prefix fark edilince admin önceki çalışan build'e döndürüldü; doğru prefix ile yeniden derlenip kontrol edildi. Sentetik API ile takip kaydetme, listede tek özet ve varsayılan kapalı detay testi geçti; JS hatası yok.
- Sunucuda 12 MySQL kabul kontrolü yalnız TEMPORARY tablolarla yeniden geçti. Oturumsuz admin takip ucu 401.
- Hero kapak HTTP 200 ve image/webp. Seviye Bulucu başlığı tek marka ve 11 hreflang içeriyor.
- Aynı canlı URL ve aynı mobil Lighthouse ayarları: performans 40 → 62, LCP 11,0 → 4,1 sn, TBT 1.280 → 1.170 ms, CLS 0 → 0,005; SEO 100. Bunlar tek laboratuvar örnekleridir, saha CWV sonucu değildir. LCP/TBT hedefi henüz karşılanmadı; kalan maliyet JS çalışması ve görüntü yüklemesindedir.
- Tanitio devam build'i `ncLm8APrYPfQ4hGqNFG7W`; health/db OK. GA4-hata, finans HTTP-hata ve HTTP 200 içinde sync-hata senaryoları canlı arayüzde geçti.

Gerçek yeni ödeme/iade ve GA4 sunucu teslimi, GA4 mülk sahibi beyanı/secret, kimlik rotasyonu, reklam apply onayı ve işletme maliyet/SLA/ürün teyitleri açık. Sayısal AI taslakları karar girdisinden korunuyor. Ardından Tanitio `7fde188` ile atomik insan düzeltmesi, supersedes geçmişi ve arşiv kaydı koruması da yayımlandı; dashboard build `O-mLRblY4wVOhRAwoGOzE`. Hatalı kayıt açıklayıcı düzeltmeye bağlandı; finansın üç hata senaryosu tekrar geçti.
