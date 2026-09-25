# Woody AI görünürlük iyileştirme planı — 25 Eylül 2026

Bu plan, `WOODY-AI-GORUNURLUK-TESHIS-RAPORU-2026-09-25.md` bulgularını uygulanabilir işlere dönüştürür. Amaç yalnız bir hazırlık puanını yükseltmek değil; Woody'nin uzmanlığını anlaşılır, doğrulanabilir, alıntılanabilir ve dönüşüme bağlanabilir hale getirmektir.

## Hedefler

1. Ölçüm yanlış yorumlarını kaldırmak.
2. Woody'nin ana konu kümelerinde tek ve güçlü kaynak sayfalar oluşturmak.
3. Kurucu/uzman, yöntem, ürün ve sınıf deneyimi kanıtlarını birbirine bağlamak.
4. AI kaynaklı gerçek oturumları lead veya satış yoluna bağlamak.
5. Aynı, temiz soru setini 7/14/28 günlük tekrarlarla ölçmek.

## Faz 0 — ölçümü güvenilir hale getir

### Tanitio tarafı

- [ ] Görünürlük ekranını üç alt sekmeye ayır: `GEO hazırlığı`, `Gerçek AI trafiği`, `Yerel kaynak gözlemi`.
- [ ] `Kapsama` kartını `Sinyal kapsamı` olarak yeniden adlandır.
- [ ] Ayrı `URL örneklemi: 10/50 (%20)` kartı göster.
- [ ] Site Sağlığı taramasını katmanlı örnekle:
  - 1 ana sayfa
  - 1 hakkımızda/kurum sayfası
  - 2 hizmet sayfası
  - 2 ürün/mağaza sayfası
  - 3 blog/rehber sayfası
  - 1 iletişim/güven sayfası
- [ ] Yerel gözlemde başarı kapsamı %70'in altındaysa rakip oranlarına `Yetersiz örneklem` uyarısı koy.
- [ ] Başarısız sorguları sıfır görünürlük olarak sayma.
- [ ] Aktör alias'larını manuel doğrulamadan ölçüme alma.
- [ ] `en`, `tr`, `play`, `english`, `youtube` gibi genel/platform kelimelerini marka alias'ı olarak reddet.
- [ ] Wikipedia, Pinterest, YouTube, Google Play gibi platformları ticari rakip tablosundan çıkarıp `kaynak platformu` olarak ayrı göster.
- [ ] Soru üretimini niyete göre değiştir:
  - bilgi: `X nedir, nasıl uygulanır?`
  - fayda: `X'in kanıtlanabilir faydaları ve sınırları nelerdir?`
  - ürün: `X seçerken hangi özellikler karşılaştırılmalı?`
  - fiyat: `X fiyatını hangi bileşenler belirler?`
  - ebeveyn: `X yaşındaki çocuk için nasıl başlanır?`

### Temiz Woody soru seti

İlk doğrulama seti 12 markasız + 2 markalı sorudan oluşmalı:

| Tür | Soru |
|---|---|
| Bilgi | Anaokulu İngilizce müfredatı nasıl hazırlanır? |
| Bilgi | Anaokulu İngilizce konuları yaşa göre nasıl değişir? |
| Bilgi | 5 yaş İngilizce ders programında neler olmalı? |
| Bilgi | 6 yaş İngilizce eğitimi nasıl planlanmalı? |
| Bilgi | 3–4 yaş İngilizce eğitimine nasıl başlanır? |
| Karar | Okul öncesi İngilizce eğitim seti seçerken nelere dikkat edilmeli? |
| Karar | Anaokulu için İngilizce eğitim setleri nasıl karşılaştırılır? |
| Karar | Okul öncesi İngilizce kitabı seçerken hangi ölçütler kullanılmalı? |
| Kurum | Anaokulları için uygulanabilir İngilizce programı nasıl kurulur? |
| Öğretmen | Okul öncesi İngilizce dersinde oyun, şarkı ve hikâye nasıl birlikte kullanılır? |
| Ebeveyn | İngilizce bilmeyen ebeveyn evde çocuğunu nasıl destekleyebilir? |
| Fiyat | Okul öncesi İngilizce eğitim seti fiyatını hangi içerikler belirler? |
| Markalı | Woody and Friends nedir? |
| Markalı | Woody and Friends eğitim setlerinin içeriğinde neler var? |

Kabul ölçütü: Aynı Brave motoru, TR/TR, tek tekrar; en az 10/12 markasız sorgu başarılı. Kapsam düşükse sonuç KPI olarak yayımlanmaz.

## Faz 1 — marka ve uzmanlık merkezi

### `/tr/about`

- [ ] Mina Yayınevi ve Woody and Friends ilişkisini açıkça tanımla.
- [ ] Kurucu Ayşe Polat Karakuş'un adı, rolü, gerçek uzmanlık alanı ve deneyim geçmişini görünür yaz.
- [ ] Yöntemin ne zaman ve hangi sınıf ihtiyacından doğduğunu somutlaştır.
- [ ] Ürün/hizmet ailelerini ve hangi kullanıcıya hizmet verdiğini açık tabloyla göster.
- [ ] Gerçek şirket/iletişim bilgileri, editoryal sorumluluk ve içerik güncelleme politikasını bağla.
- [ ] Doğrulanabilir bağımsız basın, kurum veya iş ortaklığı kaynakları varsa ekle; yoksa üretme.
- [ ] `Person` profil sayfası açılacaksa `Article.author.url` bu sayfaya bağlansın.

### Yazar/uzman profili

- [ ] `/tr/authors/ayse-polat-karakus` veya mevcut mimariye uygun kalıcı profil.
- [ ] Ad, rol, kısa biyografi, uzmanlık konuları ve yayımladığı içerikler.
- [ ] Yalnız gerçekten sahip olunan sosyal/profesyonel profiller `sameAs` olarak eklenir.
- [ ] Blogdaki görünür byline ile JSON-LD `Person` aynı kişi ve aynı URL olmalı.

Başarı kanıtı: canlı HTML, Article JSON-LD ve görünür byline aynı adı/profil URL'sini taşır; Google Rich Results testi kritik hata vermez.

## Faz 2 — alıntılanabilir içerik kalıbı

Öncelikli sayfalar:

1. `anaokulu-ingilizce-konulari`
2. `anaokulu-ingilizce-mufredati-nasil-hazirlanir`
3. `anaokulu-ingilizce-ders-plani-nasil-hazirlanir`
4. `5-yas-ingilizce-ders-programi`
5. `6-yas-ingilizce-egitimi`
6. `anaokulu-ingilizce-egitim-seti-nasil-secilir`

Her sayfada uygulanacak kalıp:

### A. İlk cevap bloğu

- H1'in hemen altında 40–80 kelimelik doğrudan cevap.
- İlk cümle sorunun cevabını verir; marka sloganıyla başlamaz.
- Yaş, süre, hedef veya kapsam gibi somut ayrımlar kullanılır.

### B. Karar tablosu

- Kullanıcı seçimini etkileyen 4–7 ölçüt.
- Her ölçütün anlamı ve hangi durumda uygun olduğu.
- Ürün karşılaştırmasında yalnız gerçek özellik ve güncel bilgi.

### C. Birinci el uygulama kanıtı

- Gerçek öğretmen/sınıf deneyimi.
- Ders süresi, tekrar sıklığı, yaş grubu ve gözlenebilir çıktı.
- Varsa anonimleştirilmiş vaka; tarih, kapsam ve yöntem belirtilir.
- Sonuç ölçülmediyse başarı oranı veya öğrenme artışı uydurulmaz.

### D. Kaynak ve sınır

- MEB, Cambridge veya ilgili resmi/akademik birincil kaynağa bağlamsal bağlantı.
- Kaynağın Woody yaklaşımını otomatik olarak onayladığı iddia edilmez.
- Eğitsel önerinin hangi bağlamda değişebileceği açıklanır.

### E. Yazar ve güncellik

- Görünür yazar adı ve profil bağlantısı.
- `datePublished` ve gerçek değişiklik olduğunda `dateModified`.
- Editoryal kontrol/sorumluluk bilgisi.

### F. Sonraki adım

- Bilgi niyetinde ilgili rehber.
- Kurum niyetinde teklif/görüşme formu.
- Ürün niyetinde doğru mağaza veya ürün ailesi.
- CTA parametreleri kaynak sayfayı korumalı.

## Faz 3 — sayfa özel işleri

### Konular sayfası

- [ ] 3, 4, 5 ve 6 yaş için konu derinliği tablosu.
- [ ] Konu listesi ile müfredat ve ders planı farkı.
- [ ] Her yaştan kendi hedef sayfasına bağlantı.
- [ ] Gerçek Woody materyaliyle bir haftalık örnek.

### Müfredat sayfası

- [ ] Ay/tema/kazanım/materyal/ölçme tablosu.
- [ ] Müfredatın okul yönetimi, öğretmen ve veli için çıktıları.
- [ ] Yıllık planın ayrıntısını ders planı sayfasına devret.

### Ders planı sayfası

- [ ] Günlük, haftalık ve yıllık plan ayrımı.
- [ ] 25–30 dakikalık gerçek ders akışı.
- [ ] Dosya gerçekten hazırsa indirilebilir plan; değilse vaat yok.

### 5 yaş sayfası

- [ ] Beş günlük örnek program.
- [ ] Hikâye takibi, kısa kalıp ve gözlem çıktısı.
- [ ] Hub'dan açıklayıcı bağlantı.

### 6 yaş sayfası

- [ ] Konu/ünite tablosu.
- [ ] Soru-cevap ve ilkokula geçiş sınırı.
- [ ] 3–6 ve 4–5–6 sayfalarındaki ayrıntıların buraya aktarılması.

### Set seçimi sayfası

- [ ] Yaş, ortam, kutu içeriği, öğretmen desteği, dijital içerik ve fiyat/teklif ölçütleri.
- [ ] Gerçek ürün kartları ve güncel bağlantılar.
- [ ] 6 yaş set tavsiyesi için ayrı bölüm.

## Faz 4 — gerçek otorite ve bağımsız kanıt

- [ ] İş birliği yapılan okul/öğretmenlerden yayın izni alınmış vaka anlatımları.
- [ ] Sınıf uygulama örnekleri: kapsam, süre, yöntem, gözlenen çıktı.
- [ ] Öğretmen eğitim içerikleri ve imzalı uzman yazıları.
- [ ] Resmî müfredat/standart kaynaklarına açıklayıcı referanslar.
- [ ] Gerçek fuar, eğitim, kurum iş birliği veya yayın kanıtları.
- [ ] Spam bağlantı satın alma, sahte yorum veya uydurma kurum logosu kullanılmamalı.

Wikipedia/Wikidata, ancak bağımsız kayda değerlik ve doğrulanabilir kaynaklar doğal olarak oluştuğunda değerlendirilir. Hazırlık puanını yükseltmek için yapay kayıt açılmaz.

## Faz 5 — `llms.txt` ve bot erişimi

Mevcut `llms.txt` çalışıyor ve korunmalı. Güncellenecekler:

- [ ] En güçlü rehberlerin doğrudan URL'leri:
  - konular
  - müfredat
  - ders planı
  - 5 yaş
  - 6 yaş
  - set seçimi
- [ ] Kurucu/yazar profili.
- [ ] Her bağlantının tek cümlelik kapsam açıklaması.
- [ ] Ürün/hizmet ayrımı ve yaş aralıkları.
- [ ] Son güncelleme tarihi.

`llms.txt` tek başına AI görünürlüğü sağlamaz; keşif için yardımcı bir dizindir. Asıl içerik HTML sayfalarında erişilebilir, doğru ve kaynaklı kalmalıdır.

Robots politikası bugün uygun görünüyor. OAI-SearchBot ile GPTBot izinleri bağımsız tutulmalıdır; gelecekte eğitim kullanımı kapatılmak istenirse GPTBot kapatılıp arama görünürlüğü için OAI-SearchBot açık bırakılabilir.

## Faz 6 — AI trafiğini dönüşüme bağla

Mevcut temel: 28 günde 1 AI oturumu, 90 günde 6; anahtar etkinlik 0.

- [ ] AI kaynaklı oturumların açılış sayfalarını raporla.
- [ ] Form/WhatsApp/telefon CTA'larında landing page ve source bilgisini koru.
- [ ] `generate_lead`, teklif formu ve gerçek satış event'lerinin GA4 key event durumunu doğrula.
- [ ] AI referral → sayfa → CTA → lead zincirini aylık raporla.
- [ ] Çok küçük sayıda yüzde değişimi başarı diye sunma; mutlak oturum ve lead sayısını birlikte göster.

Başarı sırası:

1. AI kaynaklı gerçek oturum ölçülüyor.
2. Oturumun açılış sayfası biliniyor.
3. CTA etkileşimi ölçülüyor.
4. Lead oluşuyor.
5. CRM/satışla eşleşiyor.

## 30/60/90 günlük plan

### İlk 30 gün

- Ölçüm ekranı ve örneklem sorunlarını düzelt.
- Temiz soru setini hazırla ve ≥%70 başarıyla çalıştır.
- About/yazar varlık merkezini güçlendir.
- Altı öncelikli içerikte doğrudan cevap, tablo, yazar ve kaynak kalıbını uygula.
- AI referral açılış sayfası ve key event raporunu doğrula.

### 31–60 gün

- Gerçek sınıf/öğretmen vaka içeriklerini yayınla.
- Ürün ve kurum sayfalarında somut özellik/kapsam tabloları oluştur.
- `llms.txt` seçilmiş rehber URL'leriyle güncelle.
- Aynı yerel soru setini 7 ve 28 günlük aralıklarla tekrar ölç.

### 61–90 gün

- GSC sorgu-sayfa sahipliği ve AI referral landing page sonuçlarını birlikte değerlendir.
- Hangi rehberlerin kaynak görünürlüğü, organik tıklama ve lead ürettiğini belirle.
- Sonuç üretmeyen içerikleri çoğaltmak yerine çalışan kümeleri derinleştir.
- Bağımsız kurum/uzman referanslarını sürdürülebilir bir yayın planına bağla.

## Kabul kriterleri

### Ölçüm

- [ ] Yerel markasız sorgu kapsamı en az %70; hedef %80+.
- [ ] Başarısız sorgular görünmezlik sayılmıyor.
- [ ] Rakip aktörlerde genel alias/platform kirliliği yok.
- [ ] URL örneklemi blog, ürün, hizmet ve kurum sayfalarını kapsıyor.
- [ ] Hazırlık puanı ile gerçek AI trafiği ayrı gösteriliyor.

### Site

- [ ] Altı hedef sayfada görünür yazar, tarih, doğrudan cevap ve karar tablosu var.
- [ ] Yazar URL'si görünür byline ve Article JSON-LD içinde aynı.
- [ ] Gerçek birinci el kanıt veya açıkça belirtilmiş yöntem/sınır var.
- [ ] Resmî/otoriteli kaynak bağlantıları bağlam içinde kullanılmış.
- [ ] Canonical, hreflang ve mevcut URL'ler korunmuş.
- [ ] `robots.txt`, `llms.txt`, sitemap HTTP 200.

### Sonuç

- [ ] AI oturumları mutlak sayı ve toplam trafik payıyla raporlanıyor.
- [ ] AI kaynaklı açılış sayfaları görülebiliyor.
- [ ] En az bir CTA/key event ölçüm yolu doğrulanmış.
- [ ] Başarı, iki ardışık karşılaştırılabilir 28 günlük dönemde değerlendirilmiş.
- [ ] Tek bir yerel tarama veya hazırlık puanı satış/AI pazar payı diye sunulmuyor.

## Öncelik sırası

1. Ölçüm doğruluğu ve temiz soru seti
2. Sorgu sahipliği verilen altı rehber
3. About/yazar/kurum varlık merkezi
4. Gerçek sınıf ve öğretmen kanıtları
5. AI trafik → lead ölçümü
6. Bağımsız otorite ve dağıtım

Bu plan, önceki `WOODY-RAKIP-TARAMA-ANALIZI-2026-09-25.md` raporundaki sorgu sahipliği kararlarıyla birlikte uygulanmalıdır; aynı sorgu için yeni kopya sayfalar açılmamalıdır.
