# Woody — Rakip keşfi ve sorgu boşluk analizi (10 Eylül 2026)

**Amaç:** Hangi sorgularda çıkmıyoruz, hangilerinde geride kalıyoruz, hangi sorgularda talep var ama içeriğimiz yok. Sonuç, blog ve mağaza içeriğinin genişletme/düzenleme planına dönüştürüldü.

**Tenant:** `woody` · Tanitio `/rakip-kesfi` ve Search Console verisi (`ekosistem-sosyal-medya` reposu, canlı DB). Bu rapor kod, reklam veya yayın değiştirmez.

## 1. Yönetici özeti

1. **Organik görünürlüğümüz marka ağırlıklı ve yanıltıcı.** 90 günde 10.871 gösterimin 8.071'i (%74) marka sorgusu; bunun 7.342'si tek kelime "woody" (Toy Story karakteri karışıklığı: 4 tıklama). Eğitim niyetli Türkçe sorgular 124 sorgu, **1.196 gösterim, 11 tıklama**. Büyüme burada.
2. **Türkçe eğitim sorgularının %82'si 2. sayfa ve ötesinde.** 124 sorgunun 52'si 11–20, 50'si 21–50. sırada. İlk 3'te yalnız 5 sorgu var. En yüksek gösterimli 10 sorgunun tamamı ("5 6 yaş ingilizce eğitimi", "anaokulu ingilizce", "6 yaş ingilizce", "5 yaş ingilizce ders programı"…) 12–30. sırada. Bu sorgularda gösterim var, tıklama sıfır.
3. **Bugün yapılan 45 sorguluk ek keşifte 20 sorguda hiç görünmüyoruz.** Bunlar üç türde: (a) "eğitim seti / kitap / fiyat" ticari sorguları — pazaryerleri (Trendyol, Hepsiburada, n11, Akakçe) kazanıyor; (b) "renkler / sayılar / hayvanlar / kelimeler / oyunlar / şarkılar / parmak oyunları" öğretmen materyali sorguları — Wordwall, Pinterest, Twinkl kazanıyor; (c) veli soruları ("evde çocuğa İngilizce nasıl öğretilir", "kaç yaşında başlanmalı", "çocuğum İngilizce öğrensin istiyorum", "faydaları") — Novakid, Flalingo, Konuşarak Öğren, Oxford Kids blogları kazanıyor.
4. **Tek bir hub yazı 20+ sorguyu topluyor ama hiçbirinde ilk sayfada değil.** `4-5-6-yas-ingilizce-egitimi` (579 gösterim, konum 13,7) "4 yaş", "5 yaş", "6 yaş", "5 6 yaş" sorgularının hepsine iniş sayfası. 4 Eylül'de açılan tekil 4/5/6 yaş yazıları GSC'de henüz görünmüyor. Yaş bazlı ayrışma iç bağlantı ve başlıkla tamamlanmalı; hub karşılaştırma merkezi olarak kalmalı.
5. **Kazandığımız alan öğretmen/plan tarafı.** "anaokulu ingilizce konuları", "müfredat", "öğretmeni ders planı", "dersi nasıl işlenir", "hikâye anlatımı", "cambridge okul öncesi" sorgularında Yandex 1–2. sıradayız; Google'da ders planı yazısı 628 gösterim/72 tıklama ile en iyi çalışan sayfamız. Strateji: bu güçlü tarafı **indirilebilir materyalle** kilitle, veli ve ürün tarafındaki boşluğu yeni yazılarla kapat.

## 2. Veri kaynakları ve sınırlar

| Kaynak | Kapsam | Sınır |
|---|---|---|
| Search Console (Tanitio GSC bağlantısı, canlı API) | 10 Haziran – 7 Eylül 2026 (90 gün), 368 sorgu, 634 sorgu-sayfa çifti | Yalnız Google'da en az bir kez göründüğümüz sorgular. Hiç görünmediğimiz sorguları GSC göstermez. |
| Tanitio rakip keşfi — 8 Eylül | Brave (594 sonuç) + Yandex (593) + Bing (yarım, 251); GSC'nin en çok gösterimli 30 sorgusu, ilk 20 sonuç | Tarama konumu Google konumu **değildir**; rakip kapsamı ve içerik türü için kullanıldı. |
| **Tanitio rakip keşfi — 10 Eylül (bu rapor için yeni koşu)** `879d049a` | Yandex, **45 elle seçilmiş sorgu**, 899 sonuç; ticari/veli/öğretmen niyetleri | Aynı sınır. Koşu Tanitio `/rakip-kesfi` ekranında görünür; 28 gün sonra aynı listeyle tekrar edilip delta alınacak. |
| Woody canlı blog API | 18 yayınlı TR yazı | Kelime sayıları 8 Eylül raporundan. |
| Önceki raporlar | `WOODY-RAKIP-KARSILASTIRMALI-ICERIK-ZENGINLESTIRME-RAPORU-2026-09-08.md`, `WOODY-RAKIP-ANALIZ-KONTROL-2026-09-08.md` | Bu rapor onları tekrar etmez; sorgu bazlı boşluğa odaklanır. |

Rakip sıralaması, trafiği veya satışı bilinmiyor. "Kazanıyor" ifadesi yalnız tarama sonuçlarındaki konumu anlatır.

## 3. Mevcut görünürlük fotoğrafı (Google, 90 gün)

| Küme | Sorgu | Gösterim | Tıklama | Gösterim ağırlıklı konum |
|---|---:|---:|---:|---:|
| Marka (woody, woody and friends, woody academy…) | 68 | 8.071 | 141 | 9,7 |
| Yabancı dil sorguları (it/de/fr/ru… sayfalar) | 176 | 1.599 | 4 | 12,2 |
| Okul öncesi / anaokulu genel | 26 | 306 | 1 | 20,8 |
| 6 yaş | 17 | 287 | 1 | 17,8 |
| 5 yaş | 20 | 207 | 2 | 17,6 |
| Ders planı / yıllık plan | 16 | 77 | **6** | 24,8 |
| Müfredat / konular | 7 | 63 | 1 | 25,7 |
| 4 yaş | 6 | 62 | 0 | 16,7 |
| Set / materyal | 4 | 45 | 0 | 14,3 |
| 3 yaş | 5 | 44 | 0 | 27,9 |
| Öğretim yöntemi | 3 | 37 | 0 | 13,9 |
| Şarkı / hikâye | 2 | 17 | 0 | 12,6 |
| Cambridge | 2 | 16 | 0 | 9,2 |
| Oyun / etkinlik | 4 | 11 | 0 | 11,6 |

**Türkçe eğitim sorgularında konum dağılımı (124 sorgu):** 1–3: 5 · 4–10: 15 · **11–20: 52** · 21–50: 50 · 50+: 2.

Çalışan sayfalar (gösterim / tıklama / konum): ders planı yazısı 628/72/9,8 · 4-5-6 yaş hub 579/11/13,7 · set seçimi 258/9/13,7 · 3-6 yaş 169/2/15,3 · anaokulunda nasıl öğretilir 126/0/24,1 · Cambridge eğitim sistemi 80/1/5,9 · müfredat 71/7/6,8 · şarkılar 75/1/8,7 · yöntemler 74/2/8,4.

## 4. Geride olduğumuz sorgular (Google'da görünüyoruz, ilk sayfada değiliz)

Gösterime göre ilk 20. "Kazanan" sütunu 8 Eylül Yandex keşfinin ilk 3'ü; ilk sayfada olmadığımız için Google'da da benzer profil beklenir.

| Sorgu | Gösterim | Google konum | Şu an inen sayfa | Taramada kazanan | Neden geride | Aksiyon |
|---|---:|---:|---|---|---|---|
| 5 6 yaş ingilizce eğitimi | 71 | 14,1 | 4-5-6 hub | flalingo, novakid, achieveuni | Hub genel; yaş çifti için ayrı vaat yok | Hub'da "5–6 yaş" bölümü + 5 ve 6 yaş tekil yazılarına bağlantı |
| anaokulu ingilizce | 71 | 20,3 | anaokulu-ingilizce-nasil-ogretilir | tureng, reverso (sözlük) + wordwall | Sorgu belirsiz (çeviri niyeti karışıyor) | Kovalanmaz; "anaokulu ingilizce programı/eğitimi" biçimlerine odaklan |
| anaokulu ingilizcesi | 52 | 18,5 | aynı | sözlük siteleri | Aynı | Aynı |
| 6 yaş ingilizce | 44 | 12,3 | 4-5-6 hub | novakid, flalingo, multibem | Tekil 6 yaş yazısı henüz sıralanmıyor | `6-yas-ingilizce-egitimi` yazısını hedef; hub'dan tam eşleşen ankrajla bağla |
| 5 yaş ingilizce ders programı | 42 | 19,8 | 4-5-6 hub | novakid programs, cowboyenglish, twinkl MEB | Tekil 5 yaş yazısı 4 Eylül'de açıldı, hub hâlâ iniyor | `5-yas-ingilizce-ders-programi`'nı güçlendir: gerçek haftalık plan tablosu + indirilebilir PDF |
| 6 yaş ingilizce dersi | 35 | 16,8 | 4-5-6 hub | scartakademi, eddy, novakid | Kurs siteleri "ders" kelimesini sahipleniyor | 6 yaş yazısına "örnek ders akışı (25 dk)" bölümü |
| anaokulu ingilizce konuları | 35 | 29,9 | ders planı yazısı | **biz #1 (Yandex)**, elmadil, novakid | Google'da yanlış sayfa iniyor; `anaokulu-ingilizce-konulari` yazısı var | Ders planı yazısından konular yazısına güçlü iç bağlantı; konular yazısını ünite tablosuyla derinleştir |
| anaokulu ingilizce ders | 34 | 22,6 | ders planı | novakid, **biz #2**, firstenglish | Sayfa ders planı; "ders" niyeti nasıl işlenir yazısına ait | `anaokulunda-ingilizce-nasil-ogretilir` yazısını hedefle |
| anasınıfına ingilizce nasıl öğretilir | 34 | 13,3 | anaokulunda-…-ogretilir (eski URL) | — | 2. sayfa eşiğinde | Başlığa "anasınıfı" eş anlamlısı, gerçek ders başlangıcı örneği |
| ingilizce ders planı | 34 | 34,6 | eski /woodymagaza URL | — | Genel sorgu, ilkokul/lise niyetleri karışık | Okul öncesi vurgulu kalınır; kovalanmaz |
| 5 yaş ingilizce | 32 | 16,7 | 4-5-6 hub | flalingo, novakid, bilisselakademi | Hub genel | 5 yaş tekil yazısı hedef |
| ingilizce anaokulu dersleri | 31 | 20,8 | ders planı | novakid, **biz #2**, firstenglish | — | "Nasıl öğretilir" yazısına yönlendir |
| 4 yaş ingilizce | 28 | 17,4 | 4-5-6 hub | cambly, novakid, flalingo (Yandex'te biz yokuz) | 4 yaş tekil yazı etkinlik odaklı, "4 yaş ingilizce" genel niyetini karşılamıyor | `4-yas-ingilizce-etkinlikleri`'ne "4 yaşında İngilizce: ne beklenir, nasıl başlanır" giriş bölümü |
| 5 yaş ingilizce eğitimi | 26 | 16,4 | 4-5-6 hub | novakid, flalingo, bilisselakademi | Aynı | 5 yaş tekil |
| 6 yaş ingilizce eğitimi | 26 | 18,9 | 3-6 yaş yazısı | novakid, flalingo, **biz #3** | İki yazı aynı sorguya iniyor (kanibalizasyon) | 3-6 yaş yazısından 6 yaş tekiline bağla; 3-6 yazısını 3 yaş odağına çek |
| anaokulu için ingilizce eğitim seti | 25 | 16,2 | set seçimi yazısı | hepsiburada, n11, touchenglish | Ticari niyet; yazı bilgilendirici | Mağaza kategori sayfası + set seçimi yazısında ürün kartları (bkz. §7.3) |
| 6 yaş ingilizce konuları | 21 | 36,9 | 4-5-6 hub | novakid blog, flalingo, minesminis | Yaşa özel konu listesi yok | 6 yaş yazısına konu/ünite tablosu |
| anaokulunda ingilizce eğitim | 17 | 37,9 | eski /blog URL | — | Eski URL, zayıf sayfa | 308 yönlendirme çalışıyor; hedef yazıyı güçlendir |
| anasınıfı ingilizce eğitim seti | 17 | 12,5 | set seçimi | hepsiburada, n11, touchenglish (biz Yandex #6) | Ticari | §7.3 |
| okul öncesi ingilizce öğretme teknikleri | 17 | 16,5 | yöntemler yazısı | — | 2. sayfa | Yöntemler yazısına "teknik" tablosu (TPR, hikâye, şarkı, oyun) ve örnek |

## 5. Hiç görünmediğimiz sorgular (10 Eylül manuel keşfi: 20/45)

### 5.1 Ticari — pazaryerleri kazanıyor

| Sorgu | İlk 5 | İçerik türü |
|---|---|---|
| okul öncesi ingilizce eğitim seti | n11, hepsiburada, trendyol, touchenglish, akakçe | Pazaryeri kategori sayfası + Touch English ana sayfa |
| çocuklar için ingilizce eğitim seti | n11, touchenglish, trendyol, hepsiburada, onedio | Aynı |
| ingilizce eğitim seti fiyatları | trendyol, n11, hepsiburada, cimri, dr | Fiyat karşılaştırma |
| okul öncesi ingilizce kitabı / anaokulu ingilizce kitabı | n11, hepsiburada, trendyol, akakçe, okuling | Pazaryeri |
| 3 yaş / 4 yaş ingilizce kitap | trendyol, hepsiburada, amazon, tırtıl kids, dr / novakid activity-books | Pazaryeri + Novakid "Pre-A1 kitap" sayfası |
| ingilizce hikaye kitabı okul öncesi | okuling, trendyol, hepsiburada, krm dükkan, dr | Kitapçı kategori |
| ingilizce eğitim seti öğretmen | touchenglish (FunJoy), dr, **trendyol'daki Woody workshop ilanı**, udemy | Rakip ürün sayfası; Woody ürünü pazaryerinde 3. sırada, kendi sitemiz yok |

**Not:** "anaokulu ingilizce eğitim seti" ve "evde ingilizce eğitim seti çocuk" sorgularında 5. sıradayız; "okul öncesi ingilizce öğretmen kiti"nde 4. Yani ürün sayfaları sıralanabiliyor, eksik olan **"eğitim seti / kitap / fiyat" kelimelerini taşıyan bir kategori sayfası** ve ürün başlıkları.

### 5.2 Öğretmen materyali — Wordwall / Pinterest / Twinkl kazanıyor

| Sorgu | İlk 5 | Kazanan içerik |
|---|---|---|
| okul öncesi ingilizce oyunları | wordwall, pinterest, novakid games, wonjo, ahaslides | Etkileşimli oyun listesi, "12 sıfır hazırlıklı oyun" |
| anaokulu ingilizce renkler etkinliği | pinterest, wordwall, jaletezer.k12, onur koleji, ingilizceciyiz | Okul etkinlik haberi, çalışma kâğıdı |
| anaokulu ingilizce sayılar | pinterest, wordwall, novakid blog, englishcentral, hepsiburada (tablo) | Kelime listesi + çalışma kâğıdı |
| okul öncesi ingilizce hayvanlar | wordwall, pinterest, englishcentral, novakid, minidil | Aynı |
| okul öncesi ingilizce kelimeler | wordwall, quizlet, novakid A1 liste, speakenglishdaily "ilk 50 kelime", ingilizceciyiz "ilk 100" | Kelime listesi |
| okul öncesi ingilizce şarkılar | novakid, yabancıdilakademisi, spotify playlist, yasemin, speakenglishdaily | Şarkı listesi (12–15 şarkı, ne öğretir) |
| ingilizce parmak oyunları okul öncesi | pinterest, anneninokulu, wordwall, wonjo, AÇEV | Parmak oyunu metinleri |
| anaokulu ingilizce etkinlikleri (17. sıradayız) | pinterest, wordwall, abaenglish, novakid worksheets, twinkl | Çalışma kâğıdı PDF |
| anaokulu ingilizce materyalleri (14.) | wordwall, pinterest, hepsiburada, twinkl, okuling | Materyal listesi |

Bu grupta kazananların ortak özelliği **hemen kullanılabilir, indirilebilir veya basılabilir bir şey vermesi**. Bizim yazılarımız yöntem anlatıyor, materyal vermiyor.

### 5.3 Veli soruları — online kurs blogları kazanıyor

| Sorgu | İlk 5 | Kazanan içerik |
|---|---|---|
| evde çocuğa ingilizce nasıl öğretilir | oxfordkids "sıfırdan giriş rehberi", novakid "evde nasıl öğretebilirim", flalingo "İngilizce bilmeyen ebeveyn rehberi", candelas, konuşarak öğren | Adım adım veli rehberi |
| çocuklar için ingilizce kaç yaşında başlanmalı | britishtime, novakid, flalingo, englishacademy, englishtime | "Kaç yaşında" rehberi (her kurs sitesinde var) |
| çocuğum ingilizce öğrensin istiyorum | novakid, cambly, oxfordkids, flalingo, preply | Kurs açılış sayfası + giriş rehberi |
| okul öncesi ingilizce eğitiminin faydaları | novakid "merak edilenler", chatterkids "7 fayda", perfectenglish, englishcentral, onlinekidsacademy | Fayda listesi |
| 4 yaş çocuğa … nasıl öğretilir (10.) / 5 yaşındaki … (18.) | konuşarak öğren (her yaş için ayrı yazı), novakid, flalingo | Yaşa özel "nasıl öğretilir" |
| ingilizce bilmeyen anne çocuğuna … (8.) | flalingo, novakid, oxfordkids, superprof | "İngilizce bilmeyen ebeveyn" rehberi |

Veli niyetinde tek bir yazımız var (`evde-ingilizce-rutini-nasil-kucuk-kalir`, 785 kelime) ve hedef sorguların hiçbirini başlığında taşımıyor.

### 5.4 Görünmediğimiz ama kovalanmayacaklar

"okul öncesi ingilizce öğretmeni" (iş ilanı siteleri), "anaokulu ingilizce"/"anaokulu ingilizcesi" (sözlük niyeti), "ingilizce ders planı" (tüm kademeler). Bunlara içerik yazılmaz.

## 6. Kazandığımız sorgular — koru ve kilitle

| Sorgu | Yandex konum | Google (GSC) | Sayfa |
|---|---:|---:|---|
| anaokulu ingilizce öğretmeni ders planı | 1 | — | ders planı |
| anaokulu ingilizce dersi nasıl işlenir | 1 | — | nasıl öğretilir |
| okul öncesi ingilizce müfredatı | 1 | — | müfredat |
| anaokulu ingilizce konuları | 1 | 29,9 | konular |
| anaokulu ingilizce müfredat | 1 | 21,2 | ders planı |
| 3 yaş grubu ingilizce öğretimi | 1 | 39,3 | 3-6 yaş |
| anaokulları için ingilizce eğitim | 2 | — | preschool |
| anaokulu ingilizce hikaye anlatımı | 2 | — | hikâye yazısı |
| cambridge english okul öncesi / pre a1 starters okul öncesi | 2 | — | cambridge yazısı |
| okul öncesi ingilizce eğitim modeli | 2 | — | ana sayfa |
| 3 yaş ingilizce eğitimi | 2 | 19,2 | 3-6 yaş |
| anaokulu ingilizce yıllık plan 2026 | 3 | (yıllık plan 9,0 / 5 tıklama) | ders planı |

Yandex'te 1–2. sıradayken Google'da 20–40. sırada olan sorgular ("konuları", "müfredat", "3 yaş grubu") **içerik değil otorite/bağlantı** sorunudur: sayfa doğru, Google henüz güvenmiyor. Bu sayfalara iç bağlantı, indirilebilir materyal ve güncelleme tarihi verilmeli; yeniden yazılmamalı.

## 7. Rakip profili (kim, neyle kazanıyor)

| Rakip | Manuel 45 sorguda ilk 10 | GSC 30 sorguda | Kazanma biçimi | Bizim için ders |
|---|---:|---:|---|---|
| novakidschool.com | 27 | 28 (ort. 4,1; 22 sorguda bizden önde) | Yaş bazlı program sayfaları (`/programs/education_4_5`), her niyete blog, ücretsiz oyun/worksheet, activity books | Yaşa özel iniş sayfası + her veli sorusuna ayrı yazı + ücretsiz materyal |
| flalingo.com | 10 | 19 (ort. 2,8) | 3-5 / 4-5 yaş kurs sayfaları, "İngilizce bilmeyen ebeveyn" rehberi | Veli rehberi |
| n11 / hepsiburada / trendyol / akakçe / cimri | 15 / 14 / 13 / 10 / 4 | 13 (hepsiburada) | Kategori sayfası "okul öncesi İngilizce eğitimi, 776 ₺ ortalama fiyat" | Ticari sorgular pazaryerinin; kendi kategori sayfamız + Merchant listesi + pazaryeri kararı |
| wordwall.net / tr.pinterest.com / twinkl | 10 / 8 / 8 | 12 (wordwall) | Hazır etkinlik, çalışma kâğıdı, MEB uyumlu paket | İndirilebilir materyal |
| konusarakogren.com | 6 | 11 | "X yaşındaki çocuğa İngilizce nasıl öğretilir" yaş başına yazı | Yaş × soru matrisi |
| touchenglish.com.tr | 6 | 9 | Yıllık planlar sayfası, FunJoy öğretmen seti, ana sayfa "eğitim seti" | En yakın ürün rakibi; plan sayfası + set sayfası |
| ingilizceciyiz.com / ingilizcecin.com / onceokuloncesi | 8 / 5 / — | 2–4 | 2026-2027 yıllık plan, günlük plan örnekleri | Plan indirmesi |
| multibem.com.tr | 5 | 15 (10 sorguda önde) | Kurum programı, "yaşa göre hangi yöntem", 36 haftalık plan + ücretsiz | Kurum sayfası + plan |
| oxfordkids.com.tr | 5 | — | "Sıfırdan başlayan çocuklar için giriş rehberi" | Veli rehberi |
| englishcentral / speakenglishdaily / elmadil | 7 / 3 / — | 9 (elmadil) | Kelime/sayı/hayvan/şarkı listeleri "2026 güncel" | Konu bazlı kelime yazıları |

## 8. İçerik planı

### 8.1 Mevcut yazıları düzenleme (URL değişmez, güncelleme tarihi güncellenir)

| Yazı | Hedef sorgular (gösterim) | Ne eklenecek |
|---|---|---|
| `4-5-6-yas-ingilizce-egitimi` (912 kelime, hub) | 5 6 yaş (71), 4 6 yaş (19), 3 6 yaş (7) | Yaş karşılaştırma tablosu (dikkat süresi, kelime hedefi, materyal, oturum süresi); her yaş satırından tekil yazıya **tam eşleşen ankraj** ("4 yaş İngilizce", "5 yaş İngilizce ders programı", "6 yaş İngilizce eğitimi"). Tekil yazıların ayrıntısını hub'da tekrar etme. |
| `5-yas-ingilizce-ders-programi` (586) | 5 yaş ingilizce ders programı (42), 5 yaş ingilizce (32), 5 yaş ingilizce eğitimi (26), 5 yaş için ingilizce (17+13) | Haftalık plan tablosu gerçek Woody ünitesiyle; 25 dk ders akışı; **indirilebilir haftalık plan PDF**; "5 yaşında ne beklenir" giriş. |
| `6-yas-ingilizce-egitimi` (859) | 6 yaş ingilizce (44), dersi (35), eğitimi (26), konuları (21), dersleri (20) | Konu/ünite tablosu; örnek ders akışı; okula geçiş (ilkokul 1) vurgusu; Senior set bağlantısı. |
| `4-yas-ingilizce-etkinlikleri` (624) | 4 yaş ingilizce (28), 4 yaş ingilizce eğitimi (21), 4 yas ingilizce ogretme (11) | Başlığı "4 Yaş İngilizce: Nasıl Başlanır ve 10 Etkinlik" yönünde genişlet; giriş bölümü "4 yaşında İngilizce eğitimi nasıl olmalı"; 2 etkinliğin malzeme fotoğrafı + yönergesi. |
| `3-6-yas-ingilizce-egitimi-nasil-olmali` (747) | 3 yaş ingilizce eğitimi (10), 3 yaş grubu (14), 3 yaş etkinlik (7), 3 yaş konuları (9) | 3 yaş odağına çek: hazır oluş, 10 dk oturum, ebeveynle birlikte; 6 yaş bölümünü kısaltıp tekil yazıya bağla (kanibalizasyonu kes). |
| `anaokulu-ingilizce-konulari` (645) | anaokulu ingilizce konuları (35), 6 yaş konuları (21), 3 yaş konuları (9) | Yaşa göre üç sütunlu konu tablosu; her konuda Woody ünitesi + kart + şarkı; ders planı yazısından buraya bağlantı (şu an Google yanlış sayfayı gösteriyor). |
| `anaokulu-ingilizce-ders-plani-nasil-hazirlanir` (872, en iyi sayfa) | yıllık plan (10/5 tıklama), ders planı pdf, günlük plan (Yandex 7.), yıllık plan 2026 (Yandex 3.) | **2026-2027 yıllık plan + günlük plan şablonu PDF** (e-posta ile indirme = lead); "günlük plan" ve "2026-2027" ifadeleri başlık/alt başlıkta. |
| `anaokulunda-ingilizce-nasil-ogretilir` (720) | anasınıfına nasıl öğretilir (34), anaokulu ingilizce ders (34), dersleri (31), dersi nasıl işlenir (Yandex 1.) | "Anasınıfı" eş anlamlısı; gerçek ders başlangıcı yönergeleri (İngilizce cümleler); 25 dk örnek ders. |
| `anaokulu-ingilizce-egitim-seti-nasil-secilir` (1152) | anaokulu için eğitim seti (25), anasınıfı eğitim seti (17), 6 yaş set tavsiye (9), 3 4 yaş set (5) | Karşılaştırma tablosu (kutu içeriği / yaş / dijital erişim / fiyat) + ürün kartları; "kaça mal olur" bölümü (Mini School 3×2.500). Ürün bağlantıları 10 Eylül'de düzeltildi. |
| `okul-oncesi-ingilizce-ogrenme-yontemleri` (700) | öğretme teknikleri (17) | Teknik tablosu (TPR, hikâye, şarkı, oyun, rutin) + her tekniğe bir Woody örneği. |
| `ingilizce-sarkilarla-egitim` (713) | şarkılarla öğretim (16), okul öncesi ingilizce şarkılar (yokuz) | **Şarkı listesi bölümü**: 12 şarkı, hangi konuyu öğretir, nasıl uygulanır; MusicLand parçası örneği. |
| `evde-ingilizce-rutini-nasil-kucuk-kalir` (785) | evde çocuğa nasıl öğretilir (yokuz), ingilizce bilmeyen anne (8.) | Başlığı "Evde Çocuğa İngilizce Nasıl Öğretilir? İngilizce Bilmeyen Ebeveyn İçin Rutin" yönünde; adım adım 4 hafta; Ev seti bağlantısı. |

### 8.2 Yeni yazılar (öncelik sırasıyla)

| # | Başlık (taslak) | Hedef sorgular | Rakip referansı | Woody farkı / CTA |
|---|---|---|---|---|
| 1 | **Çocuklar İngilizceye Kaç Yaşında Başlamalı? (3–6 yaş rehberi)** | çocuklar için ingilizce kaç yaşında başlanmalı; okul öncesi ingilizce eğitiminin faydaları | britishtime, novakid, englishacademy | Yaşa göre "ne beklenir" tablosu + Level Finder CTA |
| 2 | **Evde Çocuğa İngilizce Nasıl Öğretilir? (İngilizce bilmeyen ebeveyn için)** — 8.1'deki rutin yazısını bu başlığa taşımak yerine ayrı yazı; rutin yazısı "haftalık rutin" niyetinde kalır | evde çocuğa ingilizce nasıl öğretilir; çocuğum ingilizce öğrensin istiyorum; ingilizce bilmeyen anne | oxfordkids, novakid, flalingo | Ev seti ile 4 haftalık örnek; video önizleme; Ev & Özel Ders CTA |
| 3 | **Okul Öncesi İngilizce Kelimeler: İlk 100 Kelime (konuya göre, yazdırılabilir)** | okul öncesi ingilizce kelimeler; anaokulu ingilizce sayılar; hayvanlar; renkler | wordwall, quizlet, speakenglishdaily, ingilizceciyiz | Konu × yaş tablosu; **yazdırılabilir kelime kartı PDF**; Storyland/kart ürünlerine bağlantı |
| 4 | **Okul Öncesi İngilizce Oyunları: Sıfır Hazırlıklı 15 Oyun** | okul öncesi ingilizce oyunları; anaokulu ingilizce etkinlikleri; parmak oyunları | wordwall, ahaslides, lemonacademy, novakid games | Her oyun: hedef–kural–malzeme–öğretmen cümlesi; 3 parmak oyunu metni; 4 yaş etkinlik yazısından ayrı (o yazı 4 yaş odaklı kalır) |
| 5 | **Anaokulu İngilizce Renkler ve Sayılar Etkinlikleri (çalışma kâğıtlarıyla)** | anaokulu ingilizce renkler etkinliği; sayılar; hayvanlar | pinterest, wordwall, k12 okul haberleri | 3 çalışma kâğıdı PDF; Woody kart görselleri |
| 6 | **Okul Öncesi İngilizce Şarkıları: 12 Şarkı, Ne Öğretir, Nasıl Uygulanır** (8.1'deki şarkı yazısı genişletmesi yeterli olmazsa ayrı liste yazısı) | okul öncesi ingilizce şarkılar | novakid, yabancıdilakademisi, speakenglishdaily | MusicLand parçaları + uygulama |
| 7 | **Anaokulu İngilizce Günlük Plan Örneği (2026-2027)** | anaokulu ingilizce günlük plan; ders planı pdf; yıllık plan 2026 | onceokuloncesi, ingilizceciyiz, ingilizcecin, multibem 36 hafta | İndirilebilir günlük + yıllık plan; ders planı yazısıyla birbirine bağlı |
| 8 | **Okul Öncesi İngilizce Eğitim Seti Fiyatları ve Karşılaştırma (2026)** | ingilizce eğitim seti fiyatları; okul öncesi ingilizce eğitim seti; çocuklar için eğitim seti | trendyol/hepsiburada kategori, cimri, touchenglish | Şeffaf fiyat tablosu (Ev/Mini School/Atölye), kutu içeriği, kaça mal olur; ürün kartları. Set seçimi yazısıyla kanibalizasyon: seçim yazısı "nasıl seçilir", bu yazı "fiyat ve karşılaştırma" |
| 9 | **Okul Öncesi İngilizce Hikâye Kitapları: Yaşa Göre Seçim ve Anlatım** | ingilizce hikaye kitabı okul öncesi; 3 yaş / 4 yaş ingilizce kitap; anaokulu ingilizce hikaye anlatımı (Yandex 2.) | okuling, hepsiburada hikâye seti, novakid activity-books | Storyland kitapları + hikâye yazısına bağlantı |
| 10 | **5 Yaşındaki Çocuğa İngilizce Nasıl Öğretilir?** ve **4 Yaşındaki Çocuğa …** (yaş × soru matrisi) | 4 yaş çocuğa nasıl öğretilir (10.); 5 yaşındaki çocuğa (18.) | konusarakogren yaş serisi | Yaş tekil yazılarıyla iç bağlantı; 3 yaş versiyonu 3-6 yazısında kalır |
| 11 | **Kreş ve Anaokulları İçin İngilizce Programı Nasıl Kurulur?** (kurum) | kreş ingilizce eğitimi (5.); anaokulları için ingilizce eğitim (2.); anaokulu ingilizce eğitim programı (17.) | novakid, englishkidsacademy, sınav koleji, multibem | Okul serisi + teklif formu CTA; 30+ öğrenci modeli (işletme metni bekliyor) |
| 12 | **Cambridge Pre-A1 Starters'a Okul Öncesinde Hazırlık** | cambridge starters hazırlık (7.); pre a1 starters okul öncesi (2.) | cambridgeenglish.org, icsenglish, flalingo | Belge/kapsam netleşince (Cambridge iddiaları işletme onayında) |

### 8.3 Mağaza ve ürün sayfaları (ticari sorgular)

- Mağazada seri sayfaları var (`#store-series-…`) ama **"okul öncesi İngilizce eğitim seti"** ifadesini başlık/meta'da taşıyan bir kategori sayfası yok. Öneri: `/tr/store` başlığı "Okul Öncesi İngilizce Eğitim Setleri | Woody and Friends", seri başlıklarına "eğitim seti" ve yaş aralığı; ürün başlıklarına yaş ("Basic Öğrenci Seti (3–4 yaş)").
- Product schema 10 Eylül'de eklendi; Merchant Center ücretsiz listeleme fiyatlı ürünlerle mümkün (Tanitio'da Merchant bağlantısı var).
- Trendyol'da eski bir "woody ve arkadaşları workshop" ilanı "ingilizce eğitim seti öğretmen" sorgusunda 3. sırada — sahibi kim, güncel mi? Pazaryeri varlığı işletme kararı; en azından ilan bilgileri güncel fiyatla tutarlı olmalı.
- Teknik: `/tr/store/18` 60 gösterim, konum 1,4, **404**. Eski ürün URL'si; ilgili ürüne veya mağazaya 301 verilmeli (bir sonraki turda yapılır).
- `/tr/blog/anaokulu-icin-ingilizce-programi-nasil-olmali` 200 dönüyor ama blog listesinde yok (17 gösterim) — yayın durumu kontrol edilmeli.

### 8.4 İndirilebilir materyal (öğretmen tarafındaki üstünlüğü kilitler)

Wordwall/Pinterest/Twinkl'ı yöntem yazısıyla yenmek mümkün değil; onları **kendi materyalimizle** yeneriz. Beş dosya: yıllık plan 2026-2027, günlük plan şablonu, ilk 100 kelime kartı, renkler/sayılar/hayvanlar çalışma kâğıdı, 15 oyun kartı. E-posta karşılığı indirme = kurum lead'i (`purpose=institution`).

### 8.5 Yapılmayacaklar

- "woody" tek kelime sorgusu (7.342 gösterim) kovalanmaz; Toy Story niyeti.
- Sözlük niyetli "anaokulu ingilizce(si)"; iş ilanı niyetli "öğretmeni"; genel "ingilizce ders planı".
- Yabancı dil sayfalarına (it/de/fr) yeni içerik: 1.599 gösterim / 4 tıklama; Türkiye satışına katkısı yok.

## 9. Sıra ve ölçüm

| Hafta | İş | Ölçüm |
|---|---|---|
| 1 | 8.1'deki 5 yaş / 6 yaş / hub / konular / ders planı düzenlemeleri + yıllık plan PDF; `/tr/store/18` 301 | GSC: 5-6 yaş sorgularında konum 14→≤10 hedefi (28 gün) |
| 2 | Yeni yazı 1, 2, 3 (veli rehberleri + kelime listesi) | Yeni sorgularda ilk gösterim |
| 3 | Yeni yazı 4, 5, 7 + materyal PDF'leri | Materyal indirme lead sayısı |
| 4 | 8.3 mağaza başlıkları + yazı 8, 9 | "eğitim seti" sorgularında görünürlük |
| 5+ | 10, 11, 12 (işletme metinleri geldikçe) | — |

**Tekrar ölçüm:** 8 Ekim'de aynı 45 sorguyla Tanitio keşfi yeniden koşulur (koşu `879d049a` referans); GSC 90 gün karşılaştırması aynı kümelerle. Yandex konumu Google konumu değildir; başarı ölçütü GSC'deki konum ve tıklamadır.

## 10. Ekler

### A. Manuel keşif — 45 sorgu, bizim konumumuz (Yandex, 10 Eylül)

| Sorgu | Biz | İlk 3 |
|---|---:|---|
| 3 yaş ingilizce kitap | — | trendyol, hepsiburada, amazon |
| 4 yaş çocuğa ingilizce nasıl öğretilir | 10 | konusarakogren, ingilizcesepeti, novakid |
| 4 yaş ingilizce kitap | — | trendyol, hepsiburada, novakid |
| 5 yaşındaki çocuğa ingilizce nasıl öğretilir | 18 | konusarakogren, novakid, flalingo |
| anaokulları için ingilizce eğitim | 2 | novakid, **woody**, englishkidsacademy |
| anaokulu ingilizce dersi nasıl işlenir | 1 | **woody**, novapreschool, novakid |
| anaokulu ingilizce eğitim programı | 17 | sinav.com.tr, perfectenglish, novakid |
| anaokulu ingilizce eğitim seti | 5 | hepsiburada, n11, trendyol |
| anaokulu ingilizce etkinlikleri | 17 | pinterest, wordwall, abaenglish |
| anaokulu ingilizce günlük plan | 7 | onceokuloncesi, ingilizceciyiz, lemonacademy |
| anaokulu ingilizce hikaye anlatımı | 2 | **woody**, lexinglo, flalingo |
| anaokulu ingilizce kitabı | — | hepsiburada, n11, trendyol |
| anaokulu ingilizce materyalleri | 14 | wordwall, pinterest, hepsiburada |
| anaokulu ingilizce öğretmeni ders planı | 1 | **woody**, canva, ingilizceciyiz |
| anaokulu ingilizce programı | 7 | twinkl, novakid, sinav.com.tr |
| anaokulu ingilizce renkler etkinliği | — | pinterest, wordwall, jaletezer.k12 |
| anaokulu ingilizce sayılar | — | pinterest, wordwall, novakid |
| anaokulu ingilizce yıllık plan 2026 | 3 | yeshocam, ingilizceciyiz, **woody** |
| cambridge english okul öncesi | 2 | cambridgeenglish.org, **woody**, studyinuk |
| cambridge pre a1 starters okul öncesi | 2 | cambridgeenglish.org, **woody**, flalingo |
| cambridge starters hazırlık | 7 | cambridgeenglish.org, icsenglish, ozelders |
| çocuğum ingilizce öğrensin istiyorum | — | novakid, cambly, oxfordkids |
| çocuklar için ingilizce eğitim seti | — | n11, touchenglish, trendyol |
| çocuklar için ingilizce kaç yaşında başlanmalı | — | britishtime, novakid, flalingo |
| evde çocuğa ingilizce nasıl öğretilir | — | oxfordkids, novakid, flalingo |
| evde ingilizce eğitim seti çocuk | 5 | onedio, trendyol, n11 |
| ingilizce bilmeyen anne çocuğuna ingilizce nasıl öğretir | 8 | flalingo, novakid, oxfordkids |
| ingilizce eğitim seti fiyatları | — | trendyol, n11, hepsiburada |
| ingilizce eğitim seti öğretmen | — | touchenglish, dr, trendyol (Woody ilanı) |
| ingilizce hikaye kitabı okul öncesi | — | okuling, trendyol, hepsiburada |
| ingilizce parmak oyunları okul öncesi | — | pinterest, anneninokulu, wordwall |
| kreş ingilizce eğitimi | 5 | englishkidsacademy, novakid, konusarakogren |
| okul öncesi ingilizce ders planı pdf | 8 | ingilizcecin, MEB, twinkl |
| okul öncesi ingilizce eğitim modeli | 2 | tadpreschool, **woody**, wlakids |
| okul öncesi ingilizce eğitim seti | — | n11, hepsiburada, trendyol |
| okul öncesi ingilizce eğitiminin faydaları | — | novakid, chatterkids, perfectenglish |
| okul öncesi ingilizce flashcard | 8 | pinterest, pinterest, wordwall |
| okul öncesi ingilizce hayvanlar | — | wordwall, pinterest, englishcentral |
| okul öncesi ingilizce kelimeler | — | wordwall, quizlet, novakid |
| okul öncesi ingilizce kitabı | — | n11, hepsiburada, trendyol |
| okul öncesi ingilizce müfredatı | 1 | **woody**, twinkl, MEB |
| okul öncesi ingilizce öğretmen kiti | 4 | sequoialanguage, lingucat, **woody** |
| okul öncesi ingilizce öğretmeni | 10 | dersveral, indeed, armut |
| okul öncesi ingilizce oyunları | — | wordwall, pinterest, novakid |
| okul öncesi ingilizce şarkılar | — | novakid, yabancıdilakademisi, spotify |

### B. GSC 30 sorgusunda Yandex/Brave görünürlüğümüz (8 Eylül)

Yandex'te 30 sorgunun 13'ünde, Brave'de 24'ünde yokuz. Yandex'te yok olduklarımız: 4 yaş ingilizce; anaokulu ingilizcesi; 5 yaş ingilizce; 5 yaş ingilizce ders programı; 6 yaş ingilizce dersi; 4 yaş ingilizce eğitimi; 5 yaş için ingilizce eğitimi; 4 6 yaş ingilizce; 5 yaş ingilizce eğitimi; 6 yaş ingilizce konuları; okul öncesi ingilizce yıllık plan; 5 yaş çocuğu için ingilizce; 4 yas ingilizce ogretme. Ortak payda: **yaş + "ingilizce (eğitimi/dersi)"** biçimleri, yani Novakid/Flalingo'nun yaş bazlı program sayfalarının sahiplendiği alan.

### C. Ham veri

Tanitio DB `competitor_serp_runs` / `competitor_serp_results` (tenant `woody`): koşular `111be997` (Brave), `f4e7923b` (Yandex), `5a7c462c` (Bing, yarım), `879d049a` (Yandex, manuel 45). GSC dökümü 10 Haziran – 7 Eylül, 368 sorgu. Rapor dışı tutulan kişisel veri yok.
