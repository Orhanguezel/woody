# Woody — rakiplere göre içerik açıkları ve mevcut siteyi zenginleştirme raporu

Tarih: 8 Eylül 2026. Kapsam: Türkçe içerikler, mevcut satış ve bilgi sayfaları, mevcut blog. Durum: analiz ve uygulama checklist’i hazır; bu çalışma hiçbir içeriği yayımlamadı veya canlı kodu değiştirmedi.

## 1. Yönetici kararı

**Öncelik yeni makale sayısını artırmak değil, mevcut içeriği satın alma kararını destekleyen somut kanıta dönüştürmek.** Canlı blog API’sinde 18 yayımlanmış Türkçe yazı var. Yaş grupları, haftalık plan, müfredat, oyun, hikâye, şarkı, ev rutini ve set seçimi zaten işleniyor. Okul, Mini School ve ev/özel ders ayrımı; video anlatımı, kütüphane ve seviye bulucu da mevcut.

Rakip karşılaştırmasında en belirgin geliştirme alanları:

1. **Paketin tam olarak ne içerdiğini karar noktasında açıklamak.** Video ve genel tanıtım var; seçilen seriye/seviyeye ait öğretmen–öğrenci ayrımı, erişim kapsamı ve örnek materyal aynı kısa açıklamada buluşmalı.
2. **Genel yöntem yazılarını gerçek Woody örneğine bağlamak.** Dokuz makalede aynı üç bölüm başlığı tekrar ediyor. İncelenen gövdelerde benzer genel uygulama paragrafları var. Her yazının kendi materyali, yönergesi ve gözlem örneği olmalı.
3. **Bilgi yazısından satın almaya geçişi sağlamlaştırmak.** Set seçimi yazısında doğrudan ürün bağlantıları mevcut; kontrol edilen Basic, Junior ve Senior ürün bağlantılarının üçü de HTTP 404 verdi. Yeni metinden önce bu geçişler düzeltilmeli.
4. **Yaş içeriklerinin görevlerini ayırmak.** 4/5/6 yaş ve yıllık plan konularında yeni benzer yazılar açmak yerine mevcut sayfaların niyeti korunmalı. 4 Eylül’de yayımlanan üç yazı için birkaç günlük veriyle başarısızlık kararı verilmemeli.
5. **Ticari koşullar ile genel vaatleri aynı yerde anlaşılır kılmak.** Okul serisinin 30 öğrenci alt sınırı ve öğretmen seti koşulları zaten açıklanıyor; Mini School ve ev serilerinin ayrıntıları kendi tanıtımlarında da aynı netlikte olmalı.

Bu bulgular **içeriğin açıklığına ve keşifte görünürlüğe** ilişkindir. Rakiplerin daha iyi eğitim verdiğini, daha çok sattığını veya daha verimli reklam yönettiğini kanıtlamaz.

## 2. Kanıt, kapsam ve verinin sınırı

| Kaynak | Dönem / durum | Nasıl kullanıldı? |
|---|---|---|
| Canlı Woody blog listesi ve 18 yazının ayrı içerik API’si | 8 Eylül doğrudan HTTP okuması | Mevcut başlık, gövde, bölüm, iç bağlantı envanteri |
| Canlı ana sayfa, Okul, Mini School, Ev & Özel Ders, Store, İletişim | 8 Eylül doğrudan HTML okuması | Gerçekte var olan açıklamalar ve satın alma yönlendirmeleri |
| Search Console kayıtlı raporu | 9 Ağustos–5 Eylül; 8 Eylül 12:54 UTC çekimi | Woody sorgu gösterimleri/tıklamaları ve Google ortalama konumu |
| Tamamlanmış Yandex keşfi | 8 Eylül 12:49–12:53 UTC; 30/30 sorgu, 593 sonuç | Aynı sorgu grubunda görülen alan adları; Google sıralaması değildir |
| Son Bing keşfi | 8 Eylül; hata, 13/30 sorgu, 251 sonuç | Tam karşılaştırmaya alınmadı; eksik tarama |
| Önceki rakip raporları | Aynı gün 46 izlenen / 37 rapor; 7 kaynak incelemesi | Yardımcı bağlam; içerik kararı için erişilebilen resmî sayfalarla sınırlandı |

Son tarama durumları bu çalışma sırasında canlı repository üzerinden yeniden okundu. Başarılı Yandex koşusu `f4e7923b-5afe-43e4-a9f6-ed7a99a1d3ec`; yarım Bing koşusu `5a7c462c-c158-481a-b1fc-e4e85d6ad938`. Yeni tarama başlatılmadı; rakiplere sürekli istek atan bir süreç kurulmadı.

Keşif sorgularının GSC kaynak dönemi 9 Ağustos–6 Eylül; bu raporun bağımsız GSC tablosu 9 Ağustos–5 Eylül’dür. Küçük sayı farkları aynı dönemmiş gibi birleştirilmedi. Alan adı tablosundaki “gösterim” alanı rakibin gerçek gösterimi veya trafik tahmini değildir; raporda rekabet puanı olarak kullanılmadı.

Dış sayfalar arama aracının önbelleğinden de gelebilir. Kaynaklar teklif/sunum kanıtıdır; müşteri sonucu veya bağımsız pedagojik doğrulama değildir. Pingu’nun önceki hata veren yakalaması, erişilemeyen Instagram profilleri ve Meta reklam verisi bu içerik önceliklerini belirlemez.

Kalıcı ham özet: [WOODY-ICERIK-DENETIM-KANITLARI-2026-09-08.json](WOODY-ICERIK-DENETIM-KANITLARI-2026-09-08.json). Müşteri veya oturum bilgisi içermez. Kelime sayıları HTML gövdesinin boşlukla ayrılmasıyla yaklaşık hesaplandı; kalite puanı değildir.

## 3. Keşifte hangi rakiplere karşı geri kalıyoruz?

Aşağıdaki tablo aynı 30 sorguluk Yandex koşusuna aittir. “Bizden önde” panelin tarama karşılaştırmasıdır; Woody sonuçlarda görünmediği sorguları da etkileyebilir. Koşu dışındaki tüm arama pazarı için genellenemez.

| Alan adı | Göründüğü sorgu | Ort. tarama konumu | Bizden önde sayısı | Rekabet türü |
|---|---:|---:|---:|---|
| novakidschool.com | 28/30 | 4,1 | 22 | Online ders alternatifi ve arama içeriği rakibi |
| flalingo.com | 19/30 | 2,8 | 18 | Online ders alternatifi ve yaş grubu içeriği rakibi |
| multibem.com.tr | 15/30 | 7,2 | 10 | Kurumsal materyal/program ve içerik karşılaştırması |
| cambly.com | 13/30 | 4,7 | 12 | Online ders alternatifi; aynı ürün modeli değil |
| wordwall.net | 12/30 | 11,3 | 6 | Etkinlik arayan öğretmenin kaynak alternatifi |

YouTube, pazar yerleri, sözlükler ve resmî kaynaklar aynı listede görünebilir; bunları Woody ile aynı ürünü satan firma olarak değerlendirmiyoruz. Özellikle “anaokulu ingilizcesi” sorgusu çeviri niyeti de taşıyor. Bu sorgu için yeni satış yazısı üretmek düşük önceliktir. İtalyanca sorgular Türkçe üretim listesine alınmadı.

**Çıkarım:** Yaşa göre arayan velinin karşısına ders platformları sık çıkıyor. Woody’nin yanıtı yeni bir online ders platformu kurmak değil; mevcut ev serisinin kim tarafından, hangi materyalle, nasıl kullanılacağını açık anlatmak. [Novakid okul öncesi sayfası](https://www.novakidschool.com/tr/education/preschool/) ve [Flalingo 3–5 yaş sayfası](https://flalingo.com/tr/kids/3-5-yas) bu sorgular için bulunan resmî örneklerdir. Keşif görünürlüğü tek başına dönüşüm üstünlüğü göstermez.

## 4. Google verisiyle içerik önceliği

GSC’nin sorgu düzeyindeki verisi; bunlar aylık arama hacmi değildir. Sayfa ataması aşağıda **önerilen içerik sahibi** anlamındadır; tüm gösterimlerin o URL’ye ait olduğu varsayılmaz.

| Sorgu | Gösterim | Tıklama | Google ort. konum | Karar |
|---|---:|---:|---:|---|
| anasınıfı ingilizce eğitim seti | 9 | 0 | 10,89 | Mevcut set seçimi yazısı + seri/ürün açıklamaları; ticari niyet öncelikli |
| 6 yaş ingilizce | 24 | 1 | 12,42 | Mevcut 6 yaş yazısında somut uygulama ve doğru sonraki adım |
| 4 yaş ingilizce | 20 | 0 | 18,90 | Mevcut 4 yaş etkinliklerini gerçek materyalle zenginleştir |
| 5 yaş ingilizce ders programı | 20 | 0 | 21,15 | Yeni yazı zaten 4 Eylül’de açıldı; URL’yi koru ve bekleme dönemi uygula |
| anaokulu ingilizce konuları | 19 | 0 | 29,89 | Yeni konu haritasını koru, üniteyle eşleştir |
| 6 yaş ingilizce konuları | 10 | 0 | 39,90 | Ayrı yazı açma; 6 yaş makalesindeki konu bölümünü geliştir |
| okul öncesi ingilizce yıllık plan | 10 | 5 | 9,00 | Çalışan ders planı URL’sini koru; örnek materyalle güçlendir |
| 3 yaş grubu ingilizce öğretimi | 8 | 0 | 39,75 | Önce mevcut 3–6 yaş yazısında özgün 3 yaş bölümü |

Örneklem küçük. “İlk sayfaya çıkar”, “satışı yüzde X artırır” gibi sonuçlar çıkarılamaz. Yıllık plan sorgusunun 5 tıklaması mevcut ders planı URL’sine bağlanıyor; bu nedenle niyet düzenlemek adına çalışan URL’yi taşımak doğru değil. Başlık/URL değişmeden ilgili yazılara bağlamlı geçiş verilmeli.

## 5. Rakip sunumu → Woody’de somut geliştirme

| Rakip / kanıt | Woody’de mevcut durum | Gerçek açık ve öneri | Güven |
|---|---|---|---|
| Touch Maya & Luca: basılı/dijital kapsam ayrı, örnek sayfa ve dijital örnek bağlantıları mevcut | Woody’de video ve kütüphane bağlantıları var | Önizleme yok demek yanlış. Seçilen sete ait örnek + neye baktığını açıklayan kısa altyazı + kapsam bilgisini mevcut açıklamaya ekle | Yüksek: sunum farkı |
| Kidsnook Class: kitap ve sınıf materyali türlerini somut sıralıyor | Woody fiziksel/dijital sistemi anlatıyor; öğretmen/öğrenci ayrımı Okul sayfasında var | Ürün/seri düzeyinde doğrulanmış içerik listesi ve kullanım amacı; başka serinin malzemesini pakete dahilmiş gibi göstermeme | Yüksek: açıklama fırsatı |
| Multibem: kurum programı ve kaynakları görünür biçimde sunuluyor | Woody haftalık/aylık plan iddiası ve öğretmen akışı yazıları sunuyor | Bir gerçek ünite için plan–materyal–gözlem eşlemesi göster; öğretmen desteğinin teyitli kapsamını yaz | Orta: ürün kalitesi karşılaştırılmadı |
| Novakid/Flalingo: yaş odaklı keşifte görünür | Woody’de 4, 5, 6 yaş ve geniş yaş rehberleri zaten var | Aynı başlıkları çoğaltmadan gerçek ev uygulaması ve set seçme açıklamasıyla farklılaş | Yüksek görünürlük, orta dönüşüm hipotezi |
| Wordwall: etkinlik sorgularında kaynak alternatifi | Woody’de 10 oyun ve çeşitli örnek akışlar mevcut | Hazırlanacak malzeme, öğretmen cümlesi ve uygulanmış örnek görselle yazıyı kullanılabilir kıl | Orta; ücretli araç özellikleri incelenmedi |

Kaynaklar: [Touch Maya & Luca](https://touchenglish.com.tr/index.php?sayfa=mayaluca), [Kidsnook öğrenci setleri — Class bölümü](https://kidsnook.com.tr/yayinlar/ogrenci-setleri/), [Multibem programı](https://www.multibem.com.tr/erken-cocukluk-egitim-modeli/). Kidsnook’un `/teachers` adresi bu kontrolde 404 verdi; o adres öğretmen destek kanıtı olarak kullanılmadı. Türkçe sessiz kitap seti ile İngilizce Class setinin içerikleri karıştırılmadı.

## 6. Mevcut sayfalara uygulanacak içerik brief’leri

### P0 — Set seçimi yazısı ve satış bağlantıları

Adres: `/tr/blog/anaokulu-ingilizce-egitim-seti-nasil-secilir`.

Yazı zaten 1.152 kelime; karşılaştırma ölçütleri, Level Finder ve ürün bağlantıları var. Daha uzun bir genel rehber gerekmiyor. “Setleri aynı ölçütlerle karşılaştırın” bölümündeki ürün hedefleri canlı katalogla doğrulanmalı. Basic, Junior ve Senior bağlantıları (`basic-level-set-ogrenci-seti-0001`, `junior-level-set-ogrenci-seti-0002`, `senior-level-set-ogrenci-seti-0003`) `/tr/store/` altında 404 verdi; yeni slug tahmin edilmemeli. Makale gövdelerindeki 18 benzersiz Türkçe iç hedefin 15’i son hedefte 200, bu üçü 404 döndü.

İçerik değişikliği: soyut ölçütlerin altına “Woody’de nasıl kontrol edebilirsiniz?” açıklaması ekle. Örneğin öğretmen planı için gerçek örneğe, paket kapsamı için doğru ürün açıklamasına, başlangıç düzeyi için mevcut seviye bulucuya yönlendir. Aynı paragrafta üç farklı satış çağrısı yerine bağlama uygun bir ana çağrı kullan.

Kabul: seçili üç ürün bağlantısı son hedefte 200; doğru seri/seviye açılıyor; okur linke basmadan kurum teklifi mi bireysel satın alma mı olduğunu anlıyor.

### P0 — Ana sayfa ve Cambridge açıklamasının tutarlılığı

Adresler: `/tr`, `/tr/blog/cambridge-egitim-sistemi-nedir`.

Ana sayfada hem sertifika alınacağına ilişkin kesin ifade hem sürecin başlatıldığı açıklaması var. Bu, içerik tutarlılığı sorusudur. Yeni başarı iddiası eklenmemeli; Woody’nin yetkili ekibi hangi programı, kurum ilişkisini, katılım/sınav koşulunu ve varsa ayrı ücreti belgelemeli. Metin belgenin izin verdiği kapsamda kesinleştirilmeli. “Yaş seviyesi”, “Woody ürün seviyesi” ve “sınav seviyesi” eş anlamlı kullanılmamalı.

Ana sayfadaki mevcut seri ayrımı korunmalı. Yeni bölüm açmak yerine seri kartı açıklamaları, okul/küçük grup/bireysel kullanım ayrımını ilgili sayfadaki koşullarla tutarlı hale getirmeli. Aynı vaat iki yerde uzun biçimde tekrarlanmamalı.

### P1 — Okul serisi: teklif öncesi açık cevaplar

Adres: `/tr/preschool`.

**Zaten var:** en az 30 öğrenci koşulu; öğretmen setinin anlaşmalı kuruma öğrenci setleriyle ücretsiz sunulması ve yıllık yenilenmesi; video; seviye açıklamaları; teklif formu; SSS.

Mevcut açıklama/SSS içine eklenecekler: öğrenci ve öğretmen paketlerinin teyitli içerik ayrımı; yıllık yenilemenin neleri kapsadığı; dijital erişimin kimlere, ne kadar süreyle verildiği; başlangıç hazırlığında kurumun yapacakları. Yanıtı doğrulanamayan başlık teklif görüşmesinde netleştirilir şeklinde açık bırakılmalı; uydurma destek süresi verilmemeli.

Örnek içerik paketi: gerçek bir ünitenin tek öğretmen planı sayfası, eşleşen öğrenci sayfası ve malzemenin masada çekilmiş fotoğrafı. Mevcut video/açıklama alanlarında göster; yeni önizleme uygulaması kurma. Ana çağrı mevcut teklif formu.

### P1 — Mini School: toplam ihtiyaç ve kullanım koşulu

Adres: `/tr/workshop`. Mini School’un gerçek adresi budur; `/tr/mini-school` değildir.

Mevcut sayfada seri videosu ve seviyeler var. Store ise öğrenci seti için en az 3 adet koşulunu ve öğretmen setlerini ayrı gösteriyor. Bu bilgilerin seri açıklamasında da anlaşılır olması gerekir. Öğretmen setinin ayrıca gerekip gerekmediği, bir grup için kullanım sınırı ve yeniden kullanım koşulu satış ekibiyle kesinleştirilmeli. Okul serisindeki ücretsiz öğretmen seti koşulu Mini School’a taşınmamalı.

Kısa metin brief’i: “Öğrenci seti ve öğretmen setinin görevleri”, “Kaç adet gerekir?”, “Basic/Junior/Senior seçiminde neye bakılır?”. Fiyatı makaleye kopyalamak yerine güncel Store’a bağla. Yeni hesaplama aracı yok.

### P1 — Ev & Özel Ders: yetişkinin rolünü açıklamak

Adres: `/tr/home-tutor`.

Mevcut video ve satın alma akışı korunur. Açıklamada şu sorular yanıtlanmalı: materyali veli mi öğretmen mi uygular; yetişkinin İngilizce bilgisi açısından beklenen rol nedir; sette fiziksel/dijital olarak neler vardır; canlı öğretmen hizmeti dahil midir; erişim nasıl başlar? Son iki konu teyit olmadan olumlu cevaplanmaz.

Mevcut ev rutini yazısına bağlantı ver; orada gerçek materyalle 5–10 dakikalık örnek göster. Bu süre bir editoryal örnektir, bütün çocuklara zorunlu ders reçetesi değildir. PRO için mevcut “Bilgi alın” davranışı korunur; satın alınabilir paket varmış gibi içerik üretilmez.

### P1 — Dijital kullanım: mevcut yazıyı somutlaştırmak

Adres: `/tr/blog/dijital-icerik-okulda-nasil-guvenli-acilir`; ilgili ürün alanı `/tr/digital-content`.

716 kelimelik yazıda erişim, okul hesabı ve güvenlik açıklamaları zaten var. Geliştirme: gerçek hesapta doğrulanmış 3 adımlı kullanım anlatımı, kişisel veri içermeyen ekran görüntüsü, bir basılı etkinliğin dijital tekrara nasıl bağlandığını gösteren örnek. Yeni portal veya üyelik akışı açılmaz.

Dijital bağlantı `https://woodyvearkadaslari.web.app/` adresine yönleniyor; son hedef 200 olsa da JavaScript çalıştırmadan HTML ayrıştırmasında yalnız marka başlığı çıktı. Bu tek başına kullanıcı ekranının boş veya Google indekslemesinin bozuk olduğunu kanıtlamaz. Yayın öncesinde tarayıcıda render ve erişim kontrolü ayrı doğrulanmalı; şimdilik içerik görünürlüğü belirsizliği olarak kaydedildi.

## 7. Makale envanteri ve tek tek zenginleştirme planı

Aşağıdaki her satır mevcut `/tr/blog/` adresinin devamıdır. Yeni URL açılmaz, mevcut tarih geçmişi korunur; gerçek düzenlemede güncellenme tarihi değiştirilir. Kelime artırmak hedef değildir.

| Mevcut slug | Yaklaşık kelime | Önerilen özgün katkı |
| `anaokulu-ingilizce-konulari` | 645 | Mevcut yıllık haritaya gerçek bir Woody ünitesi–kart–şarkı eşlemesi; yeni konu listesi yazma. |
| `4-yas-ingilizce-etkinlikleri` | 624 | 10 oyundan 2’sini gerçek malzeme fotoğrafı, hazırlık ve öğretmen yönergesiyle göster. |
| `5-yas-ingilizce-ders-programi` | 586 | Mevcut haftalık ve 25 dakikalık planın tek gününü gerçek ünite/sayfa numarasıyla örnekle. |
| `6-yas-ingilizce-egitimi` | 859 | Mevcut konu tablosunu somut materyal ve gözlenebilir davranış örneğiyle derinleştir. |
| `cambridge-egitim-sistemi-nedir` | 711 | Yetki, program ve sertifika koşullarını belgeye göre ayır; genel üstünlük iddialarını gözden geçir. |
| `dijital-icerik-okulda-nasil-guvenli-acilir` | 716 | Gerçek erişim adımları ve anonim ekran görüntüsü; metindeki yetki iddialarını ürünle doğrula. |
| `evde-ingilizce-rutini-nasil-kucuk-kalir` | 785 | Mevcut haftalık rutine Home Tutor materyalinden bir uygulama; veli hazırlığı ve doğru seri bağlantısı. |
| `okul-oncesi-ingilizcede-hikaye-neden-ise-yarar` | 820 | Hakları Woody’ye ait bir hikâyeden kısa sahne, 3 soru ve tek devam etkinliği. |
| `anaokulu-ingilizce-ders-plani-nasil-hazirlanir` | 872 | Gerçek öğretmen planı örneği; yıllık plan sorgusundan gelen çalışan trafiği koru. |
| `ingilizce-sarkilarla-egitim` | 713 | Bir gerçek MusicLand parçasının adı ve ders öncesi/sırası/sonrası kullanımı; telifli sözleri kopyalama. |
| `oyun-temelli-ingilizce-egitimi-neden-etkili` | 702 | Bir oyunun hedef–kural–malzeme–gözlem ilişkisi; 4 yaş oyun listesini tekrar etme. |
| `okul-oncesi-ingilizce-ogrenme-yontemleri` | 700 | Yöntem seçme kısa tablosu ve derin yazılara bağlantı; tüm yöntemleri yeniden uzun anlatma. |
| `3-6-yas-ingilizce-egitimi-nasil-olmali` | 747 | 3 yaş için özgün başlangıç senaryosu ve hazır oluş açıklaması; ayrı 3 yaş yazısı şimdilik açma. |
| `anaokulu-ingilizce-mufredati-nasil-hazirlanir` | 767 | Planlama mantığına odaklan: kazanım/tekrar/değerlendirme; konu listesini ilgili yazıya bırak. |
| `anaokulunda-ingilizce-nasil-ogretilir` | 720 | Öğretmenin gerçek ders başlangıcı yönergeleri ve çekingen katılıma alternatif; genel şablonu azalt. |
| `anaokulu-ingilizce-egitim-sistemi-nedir` | 750 | Kurum uygulamasında materyallerin ilişkisini tek somut örnekle açıkla; seçme kriterlerini diğer yazıya bırak. |
| `4-5-6-yas-ingilizce-egitimi` | 912 | Yaşlar arası karşılaştırma merkezi olarak koru; ayrıntılar için 4/5/6 yazılarına bağlan. |
| `anaokulu-ingilizce-egitim-seti-nasil-secilir` | 1152 | Önce ürün bağlantıları; ardından karşılaştırma kriterlerine gerçek Woody kanıtı ve kapsam açıklaması. |

Dokuz yazıda “Woody and Friends ile uygulama akışı”, “Sınıf içi örnek akış”, “Öğretmen için uygulama notları” başlıkları birlikte tekrar ediyor. Tekrarlanan başlık tek başına SEO sorunu değildir; asıl editoryal sorun, farklı sorulara benzeyen genel paragraflarla yanıt verilmesidir. Uygulamada aynı üç paragrafı farklı kelimelerle yeniden yazmak yerine her yazıya kendi özgün örneği konmalı. Bu gözlemden algoritmik ceza sonucu çıkarılmadı.

### Niyet sahipliği ve iç bağlantı düzeni

- Yıllık konu listesi: `anaokulu-ingilizce-konulari`; müfredat tasarım yöntemi: `anaokulu-ingilizce-mufredati-nasil-hazirlanir`.
- Ders planının nasıl kurulacağı: `anaokulu-ingilizce-ders-plani-nasil-hazirlanir`; 5 yaş haftalık uygulaması: `5-yas-ingilizce-ders-programi`.
- Yaşlar arası karşılaştırma: `4-5-6-yas-ingilizce-egitimi`; ayrıntılı 4 yaş oyunları ve 6 yaş programı kendi yazılarında.
- Ürün seçme ölçütleri: set seçimi yazısı; güncel fiyat ve satın alma koşulları: Store/ilgili ürün. Blogda eski fiyat bırakma.

Bu harita editoryal odaktır; mevcut canonical veya yönlendirmeleri değiştirme talimatı değildir. Çalışan yıllık plan trafiğini zorla başka URL’ye aktarma. Her makalede ilgili 1–2 bilgi yazısı ve bağlama uygun 1 ticari sonraki adım yeterli; zorunlu link kotası veya her yere tüm ürünleri eklemek yok.

## 8. Yeni makale gerekli mi?

**İlk uygulama dalgasında hayır.** Önce mevcut 18 yazıdan öncelikli olanlar ve satış açıklamaları geliştirilmeli. “5 yaş ders programı”, “6 yaş konuları”, “evde İngilizce”, “set nasıl seçilir” gibi yeni yazılar mevcut niyetleri tekrarlar.

Mevcut blog mimarisi içinde, ancak mevcut yazıyla kapsam çakışması çözülürse iki ikinci dalga aday var. Bunlar yayın kararı verilmiş işler değildir; yeni bölüm, kategori veya menü gerektirmez.

### Aday A — Kurumda Woody ile ilk hafta: öğretmen hazırlığından ilk derse

Hedef: set seçmiş veya teklif değerlendiren okul yöneticisi/öğretmen. Arama hacmi doğrulanmadı; satış sonrası açıklık ve teklif değerlendirmesi için öneri.

Ayrışma: genel “ders planı nasıl hazırlanır?” yerine gerçek ürünün ilk kullanım süreci. Bölümler: teslim alınan materyalin kontrolü; erişim hazırlığı; ilk ünitenin seçimi; ilk dersin hazırlığı; hafta sonu gözlem; destek için hangi bilginin iletileceği. Her adım gerçek ürün belgesine dayanmalı. Taslak uzunluk 700–1.000 kelime; kapsam tamamlanınca dur.

Gerekli kanıt: yayınevinin başlangıç kılavuzu, gerçek plan ve ürün listesi, teyitli destek kanalı. Mevcut sistem/ders planı yazısında aynı içerik yeterince anlatılabiliyorsa ayrı yazı yerine oraya ekle. Çağrı: mevcut Okul sayfasındaki teklif veya gerçek destek yolu; uydurma ücretsiz eğitim vaadi yok.

### Aday B — Çocuğun İngilizce sürecini veliyle paylaşmak: örnek haftalık not

Hedef: okul öğretmeni ve veli. Ayrışma: “ne öğretelim?” yerine gözlenen katılımı nasıl açık anlatacağız? Bu ihtiyaç mevcut yazılarda bölüm olarak var; bağımsız yazı ancak gerçek örnek not ve özgün şablon sağlanırsa değer katar.

Bölümler: gözlem ile sınav sonucu farkı; anonim örnek haftalık not; evde tek tekrar önerisi; konuşmayan çocuğa ilişkin kesin hüküm kurmama; aileye sonraki adım. Taslak 600–900 kelime. Örnek çocuk, okul ve sonuçlar gerçekmiş gibi uydurulmaz; kurguysa açıkça “örnek şablon” denir. Yeni öğrenci takip modülü geliştirilmez. Mevcut ev rutini ve öğretmen planı yazılarına bağlanır.

**Bekletilecek konular:** rakip marka isimli “en iyi” listeleri, belgesiz başarı hikâyeleri, ayrı 3 yaş ana sayfası, yeni PDF kütüphanesi, interaktif karşılaştırıcı, yeni kurs hizmeti. Bunlar mevcut kapsamı büyütür veya yeterli kanıt sunmaz.

## 9. İçerik üretiminde kullanılacak örnek format

Öncelikli her yazı için teslim paketi:

1. Mevcut paragraf/bölüm ve değişiklik gerekçesi; korunacak slug ve başlık niyeti.
2. 1 gerçek Woody materyali: doğru seri, seviye, ünite, sayfa ve kullanım hakkı bilgisi.
3. Kısa uygulama anlatımı: hazırlık → yetişkin yönergesi → beklenen katılım → alternatif uygulama. Süre ve sonuçlar örnek olarak etiketlenir.
4. Görsel altyazısı ve açıklayıcı alternatif metin. Stok/AI görsel gerçek Woody ürününü veya uygulanmış sınıfı temsil ediyormuş gibi kullanılmaz.
5. Doğrulanmış tek ana yönlendirme: okul için teklif, ev kullanıcısı için doğru seri/ürün, kararsız kullanıcı için mevcut seviye bulucu.
6. Editör ve ürün uzmanı kontrolü; kaynak/inceleme tarihi.

Örnek brief: 5 yaş haftalık planının mevcut Salı satırını gerçek üniteye bağla. “Bu etkinlikte kullanılacak materyal: [doğrulanacak ürün/ünite/sayfa]”. Yer tutucu tamamlanmadan yayımlama. “Haftada X kelime öğrenir” veya “rakiplerden hızlı ilerler” sonucu yazma. Hedef, öğretmenin örneği anlayabilmesi; çocuk performans garantisi değildir.

## 10. Uygulama sırası ve checklist

Süreler iş yükü tahminidir, performans taahhüdü değildir. Plan içerik ekibi + Woody ürün sorumlusu içindir; kod geliştirme zorunlu önkoşul değildir.

| Sıra | İş | Sorumlu | Tahmini emek | Bağımlılık / tamamlanma kanıtı |
|---|---|---|---|---|
| 1 / P0 | Set seçimi makalesinin satış linkleri | Editör + geliştirici | 1–2 saat | Güncel katalog; doğru ürün hedefleri 200 |
| 2 / P0 | Cambridge ve seri koşullarının teyidi | Woody ürün sorumlusu | 0,5 gün + belge bekleme | Belgeyle tutarlı açıklamalar |
| 3 / P1 | Okul, Mini School, ev seri açıklamaları | Editör + satış | 1–2 gün | Paket/erişim koşulları onaylı |
| 4 / P1 | Set seçimi + ders planı + 5 yaş + 6 yaş güncellemesi | Editör + öğretmen | 2–3 gün | Her yazıya özgü gerçek örnek |
| 5 / P1 | Konu haritası + 4 yaş + ev rutini | Editör + öğretmen | 1–2 gün | Tekrar etmeyen özgün katkı |
| 6 / P2 | Dijital/hikâye/şarkı ve kalan yazılar | Editör | 2–4 gün | Erişim ve materyal teyidi |
| 7 / P2 | Yeni iki makale adayının kararı | İçerik sorumlusu | 0,5 gün | Gerçek kanıt ve çakışmayan amaç varsa taslak |

İlk hafta: P0, ürün bilgisi ve dört öncelikli yazı. İkinci hafta: diğer P1’ler. Üçüncü–dördüncü hafta: P2 ve ilk sonuç kontrolü. İçerikler sırf takvim dolsun diye yayınlanmaz.

### Tamamlanan analiz

- [x] 18 Türkçe makalenin canlı gövdesi, başlığı ve iç bağlantıları incelendi.
- [x] Mevcut seri ayrımı, video, kütüphane ve seviye bulucu dikkate alındı.
- [x] Tamamlanmış keşif ile yarım Bing koşusu ayrıldı.
- [x] Google sorgu verisi ile Yandex tarama konumu ayrıldı.
- [x] Her mevcut makale için içerik katkısı ve niyet sahibi belirlendi.
- [x] Site mimarisini büyütmeyen uygulama sırası yazıldı.

### Uygulamada açık işler

- [ ] Blog satış linkleri mevcut katalog hedefleriyle düzeltilecek; tüm hedefler kontrol edilecek.
- [ ] Ürün/erişim/sertifika açıklamaları Woody sorumlusunca doğrulanacak.
- [ ] İlk gerçek öğretmen planı, öğrenci sayfası ve ürün fotoğrafı seçilecek.
- [ ] P1 yazılarda tekrarlanan genel paragraflar özgün örneklerle değiştirilecek.
- [ ] Başlık, slug ve içerik amacı korunarak değişiklikler mevcut editörde taslak hazırlanacak.
- [ ] Mobil/masaüstü görünüm, görsel boyutu, alt metin, iç bağlantı ve CTA kontrol edilecek.
- [ ] Dijital sayfanın tarayıcıda görünürlüğü ayrıca doğrulanacak.
- [ ] Yayımlanan her revizyonun tarihi ve eski/yeni içeriği kayıt altına alınacak.
- [ ] 28 tam gün sonrası aynı URL/sorgu grubunda ölçüm yapılacak.

## 11. Başarıyı nasıl ölçeceğiz?

Yayınlanan revizyonun tarihi T0 olsun. İlk kontrol 7 gün sonra yalnız erişim, indekslenebilirlik ve yanlış bağlantılar için; esas içerik karşılaştırması T0 sonrası 28 tam gün ile önceki 28 tam gün arasında. GSC gecikmesi nedeniyle henüz tamamlanmamış son günler dışarıda bırakılmalı. 4 Eylül yazıları için mevcut Ağustos ağırlıklı veri “güncelleme sonrası performans” sayılmaz.

Ölçüler: seçili markasız sorguların gösterim/tıklama/CTR’si; ilgili makaleye organik giriş; mevcut ölçüm uygunsa yazıdan seri/ürüne geçiş; doğrulanmış teklif veya satış. CTR = tıklama / gösterim. Sorgu konumu ortalamadır; tek sabit sıra değildir. Bir sorgunun başka sayfada görünmesi tek başına içerik çakışması kanıtı sayılmaz.

İlk teslim hedefi sonuç yüzdesi değil: bozuk satış bağlantılarının giderilmesi, öncelikli her yazıda bir gerçek materyal örneği ve teyitli ticari açıklama. Sonuçlarda düşük hacim, sezon, reklam ve teknik değişiklikler birlikte not edilmeli; artışın tamamı makaleye atfedilmemeli.

Önceki ölçüm çalışmasında GA4 satın alma kabulü henüz gerçek yeni işlemle kapanmamıştı. Bu rapor onu yeniden test etmedi. Dolayısıyla içerik kaynaklı ciro veya ROAS başlangıç değeri verilmedi. Mevcut olayların anlamı doğrulanmadan WhatsApp tıklaması satış, form açılması lead sayılmamalı. Bu işte reklam bütçesi değiştirilmez; ileride reklam metni yalnız doğrulanmış sayfa vaadine dayanır.

## 12. Uygulama sınırı

Mevcut sayfa ve blog gövdeleri, açıklamalar, görseller, altyazılar, SSS ve iç bağlantılar geliştirilecek. Yeni menü, landing sayfası, araç, portal, ürün serisi veya veri modeli bu planın parçası değil. Kaynak sayısı ve kelime sayısı hedef yapılmayacak. En önemli teslim: **Woody’nin zaten sahip olduğu sistemi, örnekleri ve koşullarıyla daha anlaşılır göstermek.**
