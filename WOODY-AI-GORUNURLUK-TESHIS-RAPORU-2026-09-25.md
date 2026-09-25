# Woody AI görünürlük teşhis raporu — 25 Eylül 2026

## Yönetici özeti

Tanitio'daki `AI Görünürlük` ekranı bugün tek bir şeyi değil, birbirinden farklı üç ölçümü aynı başlık altında gösteriyor:

1. **GEO hazırlık skoru:** Woody sayfalarının HTML, şema, metin yapısı ve görünür güven sinyallerinden türetilen yerel hazırlık puanı.
2. **Yerel kaynak görünürlüğü:** Ücretsiz Brave sonuçlarında Woody URL'sinin görünmesi. Bu bir AI asistan ölçümü değildir.
3. **Gerçek AI yönlendirme trafiği:** GA4'te ChatGPT, Gemini ve benzeri kaynaklardan gelen oturumlar.

Bu üçü birbirinin yerine kullanılamaz. Woody için doğrulanmış tablo şöyledir:

| Ölçüm | Sonuç | Güvenilir yorum |
|---|---:|---|
| GEO hazırlık skoru | 38,3/100 | Taranan 10 sayfanın yerel hazırlık proxy'si; gerçek AI cevap görünürlüğü değil |
| GEO sinyal kapsamı | %100 | Seçilen 10 sayfada bütün puan bileşenleri ölçüldü; sitenin 50 URL'sinin tamamı taranmadı |
| GEO güveni | %64,8 | Bileşen güvenlerinin birleşimi; orta güven |
| E-E-A-T yerel proxy | 29,4/100 | Örneklem blog içermediği için site genelini temsil etmiyor |
| Yerel SERP geçerli örnek | 7/24, %29,2 | Sonuç yetersiz; 17 sorgu HTTP hatası aldı |
| Yerel SERP Woody URL görünürlüğü | 2/7, %28,6 | Yalnız 7 başarılı Brave sorgusunun ikisinde aynı Woody sayfası görüldü |
| Karşılaştırma içi görünürlük payı | %12,5 | Eksik ve kirli rakip seti içindeki pay; pazar payı değil |
| Gerçek AI trafiği, son 28 gün | 1/374 oturum, %0,27 | ChatGPT kaynaklı, etkileşimli, anahtar etkinlik yok |
| Gerçek AI trafiği, son 90 gün | 6/732 oturum, %0,82 | Gemini 4, ChatGPT 2; 5 etkileşimli oturum, anahtar etkinlik yok |

Ana sonuç: **Woody AI kaynaklarından gerçek trafik alıyor, fakat hacim küçük ve dönüşüm kanıtı yok.** Sayfanın 38,3 puanı bu gerçek trafiğin oranı değildir. Ayrıca yerel gözlem koşusunun yalnız %29,2'si tamamlandığı için rakip kıyası karar vermek için yeterli değildir.

## 1. Kaynaklar ve ölçüm zamanı

- Tanitio canlı Site Sağlığı denetimi: `e9915c6b-6540-4066-89f7-3e3363ab95ff`
- Denetim bitişi: 25 Eylül 2026 15:07:32 UTC
- İstenen adres: `https://woodyvearkadaslari.com/`
- Sitemap: 50 URL bulundu; 10 URL tarandı.
- Yerel SERP koşusu: `0f2e746e-3a0e-4460-83c9-1bb70c47c357`
- Yerel koşu: Brave, TR/TR, 25 soru, tek tekrar; 24 markasız + 1 markalı soru.
- GA4 mülkü: Tanitio tenant bağlantısından okundu; bu raporda mülk kimliği ve hiçbir secret yayımlanmaz.
- GSC ve GA4 bağlantıları canlı okumada başarılıydı.
- Canlı `robots.txt`, `llms.txt`, sitemap ve seçilmiş Woody sayfaları ayrıca HTTP üzerinden kontrol edildi.

## 2. GEO hazırlık puanı neden 38,3?

Puan aşağıdaki bileşenlerden oluşuyor:

| Bileşen | Puan | Ağırlık | Kanıt güveni | Yorum |
|---|---:|---:|---|---|
| Alıntılanabilirlik | 21,6 | %25 | Orta | Sayfa metin blokları kısa/dağınık; doğrudan cevap yapısı zayıf |
| Marka/varlık profili | 0 | %20 | Düşük | Ölçüm yalnız Wikipedia/Wikidata `sameAs` profilini bu bileşende sayıyor |
| Sayfa E-E-A-T sinyalleri | 37,5 | %20 | Orta | Hizmet sayfalarında yazar, tarih ve kaynak kanıtı sınırlı |
| Teknik SEO | 62,7 | %15 | Yüksek | Ayrı SEO bileşik skorundan geliyor |
| Schema | 100 | %10 | Yüksek | Geçerli ve çeşitli JSON-LD var |
| Sosyal platform profilleri | 60 | %10 | Düşük | Instagram, YouTube ve Facebook `sameAs` profilleri var |

### Yanlış anlaşılmaması gereken nokta

`Marka/varlık profili = 0`, Woody'nin marka olmadığı veya internette tanınmadığı anlamına gelmez. Bu sürüm yalnız taranan HTML'deki Wikipedia/Wikidata profillerini sayıyor. Sırf puan yükseltmek için Wikipedia/Wikidata kaydı açılmamalı; bağımsız kayda değerlik ve kaynak yoksa bu hem yanıltıcı hem de sürdürülemez olur.

Schema puanının 100 olması da AI sistemlerinde görünürlük garantisi değildir. Geçerli şema, sayfanın anlaşılmasına yardım eden teknik bir sinyaldir. Google da yapılandırılmış verinin görünümü garanti etmediğini ve işaretlenen içeriğin kullanıcıya görünür, doğru ve güncel olması gerektiğini açıkça belirtir.

## 3. Örneklem sorunu: 10 sayfa siteyi temsil etmiyor

Sitemap'te 50 URL bulunmasına rağmen denetim aşağıdaki 10 sayfayı taradı:

1. `/tr`
2. `/pt-br`
3. `/tr/preschool`
4. `/tr/workshop`
5. `/tr/home-tutor`
6. `/tr/woody-academy`
7. `/en`
8. `/pt-br/preschool`
9. `/en/preschool`
10. `/en/workshop`

Örneklemde şunlar yok:

- Türkçe blog yazıları
- Ürün ve mağaza sayfaları
- Hakkımızda sayfası
- İletişim sayfası
- Sorgu boşluğu analizinde belirlenen 5 ve 6 yaş hedef sayfaları

Bu yüzden ekrandaki `%100 kapsama`, **50 sayfalık sitenin tamamı tarandı** anlamına gelmiyor. Yalnız seçilmiş 10/10 sayfada puan bileşenleri ölçülebildiğini ifade ediyor. Gerçek URL örneklem oranı 10/50, yani %20'dir.

Bloglar dışarıda kaldığı için E-E-A-T puanı da aşağı yönlü sapıyor. Canlıda ayrıca ölçülen altı hedef blog yazısında:

| Sayfa | Alıntılanabilirlik | Basit E-E-A-T sinyali | Schema |
|---|---:|---:|---:|
| Anaokulu İngilizce konuları | 29 | 75 | 100 |
| Anaokulu İngilizce müfredatı | 34 | 75 | 100 |
| Anaokulu İngilizce ders planı | 35 | 75 | 100 |
| 5 yaş İngilizce ders programı | 33 | 75 | 100 |
| 6 yaş İngilizce eğitimi | 35 | 75 | 100 |
| Eğitim seti nasıl seçilir | 39 | 75 | 100 |

Bu sayfalarda `Article`, `Person`, yayın/güncelleme tarihi, `SpeakableSpecification` ve FAQ şemaları bulunuyor. Ancak alıntılanabilirlik hâlâ 29–39 bandında; yapı doğru olsa da metinlerin doğrudan, kaynaklı ve karar vermeye yarayan cevap blokları güçlendirilebilir.

## 4. E-E-A-T kırılımı

| Boyut | Puan | Geçen / toplam sinyal | Teşhis |
|---|---:|---:|---|
| Güven | 40,6 | 13/30 | İletişim ve bazı güvenceler var; doğrulanmış sosyal kanıt/yorum zayıf |
| Uzmanlık | 2,9 | 1/40 | Hizmet sayfası örnekleminde yazar, tarih, FAQ ve dış kaynak çok az |
| Deneyim | 31,2 | 6/20 | Süreç anlatımı kısmen var; somut sınıf/uygulama kanıtı az |
| Otorite | 45,0 | 10/20 | Organization şeması var; marka hikâyesi ve bağımsız kaynak bağlantısı yetersiz |

En zayıf değer uzmanlıktır; fakat burada iki gerçek birlikte okunmalıdır:

1. Tarama örneklemi ağırlıklı olarak hizmet/locale sayfalarından oluşuyor.
2. Blog sayfalarında yazar ve tarih zaten bulunuyor.

Bu nedenle çözüm, bütün hizmet sayfalarına yapay biçimde blog yazarı eklemek değildir. Çözüm; hizmet sayfalarında sorumlu uzman/kurum, yöntem, somut süreç ve gerçek kanıtı göstermek; bilgi yazılarında ise yazar profilini ve kaynakları güçlendirmektir.

## 5. Yerel SERP gözlemi neden güvenilir karar üretmiyor?

### Koşu kapsamı

- Markasız sorgu: 24
- Başarılı: 7
- Başarısız: 17
- Kapsama: %29,2
- Markalı sorgu: 1; başarısız

Başarılı sorgular yalnız şu üç konu grubunda toplandı:

- `4 yaş ingilizce`: discovery, informational, comparison
- `anaokulu ingilizce`: discovery, informational, comparison
- `okul öncesi ingilizce kitabı`: yalnız discovery

Fiyat, fayda, oyun, kelime ve ebeveyn niyeti gruplarının tamamı HTTP hatası aldı. Dolayısıyla ölçüm kapsamlı bir Woody görünürlük fotoğrafı değildir.

### Woody'nin görüldüğü kanıt

Woody yalnız iki başarılı 4 yaş sorgusunda, aynı sayfayla göründü:

`https://woodyvearkadaslari.com/tr/blog/4-5-6-yas-ingilizce-egitimi`

Bu bulgu, 4 yaş kümesinde bir kaynak görünürlüğü olduğunu gösterir. Diğer başarısız 17 sorgu için `Woody görünmüyor` denemez.

### Rakip listesi kirli

Koşudaki aktörler arasında gerçek rakip olmayan veya marka olarak izlenmemesi gereken alanlar var:

- `en.wikipedia.org`
- `youtube.com`
- `play.google.com`
- `tr.pinterest.com`
- `tripadvisor.com.tr`
- `icradairesi.tr`

Ayrıca otomatik takma ad üretimi bazı alan adlarını aşırı genel kelimelere indirgemiş:

- `english.web.tr` → `english`
- `en.wikipedia.org` → `en`
- `tr.pinterest.com` → `tr`
- `play.google.com` → `play`

Bu nedenle `english.web.tr` için görünen `%85,7 marka adı geçişi` gerçek marka anılması değildir; sonuç metninde genel `English` kelimesinin bulunmasından kaynaklanır. Marka-anılma kıyası temizlenmeden kullanılmamalıdır.

### Soru kalitesi sorunu

Otomatik şablon bazı bilgi niyetlerini anlamsız ürün seçimi sorusuna çevirmiştir:

- `okul öncesi İngilizce eğitiminin faydaları seçerken nelere dikkat edilmeli?`
- `çocuğum İngilizce öğrensin istiyorum seçenekleri içerik, kullanım ve kalite açısından nasıl karşılaştırılır?`

Bu sorular gerçek kullanıcı niyetini temsil etmez. Aynı setle tekrar ölçüm yapılmadan önce elle düzeltilmelidir.

## 6. Gerçek AI asistan trafiği

GA4 ölçümü çalışıyor ve okunabilir durumda.

### Son 28 gün

- Toplam site oturumu: 374
- AI Assistant oturumu: 1
- Kaynak: `chatgpt.com`
- Etkileşimli oturum: 1
- Anahtar etkinlik: 0
- Toplam trafik payı: %0,27

### Son 90 gün

- Toplam site oturumu: 732
- AI Assistant oturumu: 6
- Kaynaklar: Gemini 4, ChatGPT 2
- Etkileşimli oturum: 5
- Anahtar etkinlik: 0
- Toplam trafik payı: %0,82

Bu, Woody'nin en azından bazı gerçek AI asistan yönlendirmeleri aldığını kanıtlar. Fakat örneklem çok küçüktür; ziyaretlerin satış veya lead etkisi kanıtlanmamıştır. `0 anahtar etkinlik`, dönüşüm olmadığı kadar dönüşüm ölçümünün/CTA eşleşmesinin zayıf olabileceğini de düşündürür. Oturum bazında kaynak → açılış sayfası → lead zinciri ayrıca izlenmelidir.

## 7. Teknik olarak çalışan parçalar

- `robots.txt` HTTP 200 ve GPTBot, OAI-SearchBot, ChatGPT-User, Claude, Perplexity ve diğer genel botlara public içerikleri açıyor.
- OpenAI'nin güncel dokümantasyonunda OAI-SearchBot ile GPTBot izinlerinin birbirinden bağımsız olduğu belirtiliyor. Woody ikisini de açık tutuyor.
- `llms.txt` HTTP 200, başlığı, marka açıklaması, site yapısı, ürün/hizmetler, SSS ve iletişim bilgileri var.
- Sitemap HTTP 200 ve 50 URL keşfedildi.
- Organization/WebSite/EducationalOrganization/Article/Person/FAQ şemaları mevcut.
- Sosyal `sameAs` profilleri Instagram, YouTube ve Facebook için mevcut.
- Hedef blog sayfaları HTTP 200 ve canonical URL'leri doğru.

## 8. Woody tarafındaki gerçek açıklar

1. **Doğrudan cevap ve alıntı blokları zayıf:** Bloglar yapısal olarak iyi ancak alıntılanabilirlik 29–39 bandında.
2. **Birinci el kanıt az:** Gerçek sınıf uygulaması, öğretmen deneyimi, süre, yaş, materyal, öğrenme çıktısı ve vaka sonuçları yeterince görünür değil.
3. **Bağımsız otorite sinyali az:** Sosyal profiller var fakat doğrulanabilir kurum/uzman referansları sınırlı.
4. **Marka varlık merkezi zayıf:** Hakkımızda sayfası var; kurucu, yöntem, tarihçe, editoryal sorumluluk ve referansların tek merkezde daha açık bağlanması gerekiyor.
5. **AI trafiği dönüşüme bağlanmıyor:** Altı 90 günlük AI oturumunda anahtar etkinlik yok.
6. **`llms.txt` seçilmiş içerik ayrıntısını taşımıyor:** Blog hub var, fakat ana konular/müfredat/5 yaş/6 yaş/set seçimi gibi güçlü rehberler tek tek listelenmiyor.

## 9. Tanitio ekranındaki ürün sorunları

| Sorun | Etki | Düzeltme önerisi |
|---|---|---|
| `AI Görünürlük` başlığı üç farklı ölçümü birleştiriyor | Kullanıcı 38,3'ü gerçek AI görünürlüğü sanabilir | `GEO hazırlığı`, `Gerçek AI trafiği`, `Yerel kaynak gözlemi` alt sekmeleri |
| Kapsama %100 yazıyor, URL örneklemi 10/50 | Site tamamı ölçülmüş izlenimi | `Sinyal kapsamı %100` ve `URL örneklemi 10/50 (%20)` ayrı gösterilsin |
| İlk 10 sitemap URL'si locale/hizmet ağırlıklı | Blog/ürün performansı temsil edilmiyor | Katmanlı örnek: ana sayfa, about, hizmet, ürün, blog, iletişim |
| 7/24 başarılı koşuda oran gösteriliyor | Düşük kapsam güçlü sonuç gibi okunuyor | <%70 kapsamda oranları `ön değerlendirme` olarak işaretle veya gizle |
| Rakip otomatik alias'ları genel kelimeye dönüşüyor | Sahte marka mention oranı | `en`, `tr`, `play`, `english` gibi genel alias'ları reddet; manuel aktör onayı |
| Platform/domain listesi rakip diye taşınıyor | Karşılaştırma tablosu kirleniyor | Pinterest/YouTube/Google Play/Wikipedia gibi platformları ayrı kaynak sınıfına al |
| Otomatik soru şablonu her niyete uymuyor | Anlamsız sorgular ve zayıf kanıt | Bilgi/fayda/ürün/fiyat niyetine ayrı şablon; çalıştırmadan önce zorunlu gözden geçirme |
| Marka skoru 0 etiketi | Wikipedia yokluğu marka yokluğu gibi okunuyor | `Bağımsız varlık profili` olarak yeniden adlandır; açıklamayı görünür yap |

## 10. Güven düzeyi ve karar

- **Yüksek güven:** GA4 AI trafik sayıları, HTTP erişimi, robots/llms/sitemap durumu, şema varlığı.
- **Orta güven:** Taranan sayfalardaki alıntılanabilirlik ve E-E-A-T proxy bulguları.
- **Düşük güven:** 7 başarılı sorguya dayanan yerel kaynak kıyası ve rakip mention oranları.
- **Ölçülemeyen:** ChatGPT/Gemini/Claude genel cevaplarında Woody'nin toplam görünürlük veya pazar payı.

Bu raporun kararı: Woody tarafında içerik ve varlık kanıtı güçlendirilmeli; fakat önce Tanitio ölçümü doğru etiketlenmeli ve temiz/başarılı bir soru setiyle yeniden çalıştırılmalıdır. Mevcut `%28,6` veya `%12,5` değerleri hedef/KPI yapılmamalıdır.

## Kaynaklar

- Tanitio canlı `seo_audits`, `geo_observation_runs`, `geo_observations` kayıtları; yukarıdaki denetim ve koşu kimlikleri.
- Tanitio canlı GSC/GA4 tenant bağlantısı; 25 Eylül 2026 salt-okunur sorguları.
- Woody canlı `robots.txt`, `llms.txt`, `sitemap.xml` ve raporda listelenen sayfalar.
- [OpenAI crawler dokümantasyonu](https://developers.openai.com/api/docs/bots)
- [Google Article structured data ve yazar önerileri](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google genel structured data kuralları](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Rakip payı, toplam AI cevap görünürlüğü veya satış etkisi uydurulmamıştır. Yerel SERP ölçümü, gerçek AI asistan cevabı olarak adlandırılmamıştır.
