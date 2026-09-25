# Woody AI görünürlük — hata/sorun çeklisti ve uygulama durumu (25 Eylül 2026)

Kaynaklar: `WOODY-AI-GORUNURLUK-TESHIS-RAPORU-2026-09-25.md`, `WOODY-AI-GORUNURLUK-IYILESTIRME-PLANI-2026-09-25.md`.
Her madde canlı site, canlı API veya kodla yeniden doğrulandı. `[x]` = yapıldı, `[ ]` = açık, `[!]` = dış veri/insan gerekir.

## A. Raporların kendi hataları (düzeltilmiş okuma)

- [x] **A1. "Sitemap 50 URL" yanlış.** Canlı `sitemap.xml` 512 `<loc>` içeriyor. Tanitio `SITEMAP_MAX_URLS = 50` sınırında okumayı kesiyor ve kesilmiş sayıyı toplam gibi kaydediyor. Gerçek URL örneklemi 10/50 (%20) değil, **10/512 (~%2)**.
- [x] **A2. 10 sayfa rastgele değil, sitemap'in ilk 50 satırından seçiliyor.** Sitemap sırası locale ağırlıklı olduğundan örneklem 10 dilde aynı hizmet sayfalarına düşüyor. Blog/ürün/about/iletişim tesadüfen değil, yapısal olarak dışarıda kalıyor.
- [x] **A3. "Blog sayfalarında yazar ve tarih zaten bulunuyor" eksik.** 19 TR yazının 2'sinde (`6-yas-ingilizce-egitimi`, `cambridge-egitim-sistemi-nedir`) görünen yazar ve JSON-LD `Yalçın Karakuş`. Bu isim 2026-08-31 kararıyla hiçbir yerde kullanılmamalı. Diğer 17 yazı `Woody Editör Ekibi` → kodda `Ayşe Polat Karakuş` eşleniyor; yani üç farklı yazar temsili var.
- [x] **A4. `dateModified` hiçbir zaman yayın tarihinden farklı değil.** Güncelleme yapılsa bile görünür "güncellendi" tarihi yok. Rapor tarihi "var" saymış.
- [x] **A5. `llms.txt` SSS bölümü olumlu sayılmış, fakat cevaplar soruyu cevaplamıyor.** Örnek: "Okul öncesi İngilizce eğitimi neden çoğu kurumda kalıcı olmuyor?" → cevap marka sloganı. Alıntılanabilirliği düşüren bir kaynak.
- [x] **A6. `llms.txt` "Site yapısı" etiketleri ham rota anahtarı** (`home`, `home-tutor`, `local-istanbul`); açıklama yok.
- [x] **A7. "Üç ölçüm aynı başlık altında" kısmen yanlış.** GA4 AI trafiği zaten ayrı "Arama Performansı" sekmesinde, SERP gözlemi ayrı "Yerel SERP Gözlemi" sekmesinde. Asıl sorun: sekmeler birbirine referans vermiyor, "Kapsama" etiketi sinyal ağırlığını URL kapsamı gibi gösteriyor.
- [x] **A8. 17 HTTP hatası şans değil, araç hatası.** `geo-observe-local.ts` Brave'e gecikmesiz, tekrarsız art arda istek atıyor; kod yorumunda bile "Brave ~20 ardışık istekten sonra boş dönüyor" yazıyor. Aynı gün, gecikme+tekrar kullanan rakip keşif hattı 29/30 başarı almış.
- [x] **A9. `en`/`tr` alias'ları zaten ölçüme girmiyor** (<3 karakter elenir). Sahte mention üreten `english`, `play` gibi alias'lardır.
- [x] **A10. Plan "kurucunun gerçek uzmanlık alanı ve deneyim geçmişi"ni istiyor, bu veri elimizde yok.** Uydurulmaz; müşteriden alınacak (bkz. D).
- [x] **A12. Raporun "FAQ şemaları bulunuyor" dediği şemanın bir kısmı sahteydi.** Her blog yazısına sayfada GÖRÜNMEYEN, sağlık şablonundan kalma 2 soruluk FAQPage basılıyordu ("Bu makale profesyonel tavsiyenin yerini tutar mı?"). Google yapılandırılmış veri kuralına aykırı. Artık FAQPage yalnız yazının görünür SSS bölümünden üretiliyor.
- [x] **A13. Editoryal politika metni 10 dilde başka projenin sağlık şablonuydu** ("bağımlılık yaratan", "uzman görüşmesi"). Hiçbir sayfada gösterilmiyordu. Woody'ye göre yeniden yazılıp about sayfasına bağlandı.
- [x] **A11. Plan ayrı `/tr/authors/...` profil sayfası öneriyor.** Mevcut mimaride `/{locale}/about#author` zaten `ProfilePage/Person` düğümü. İkinci profil URL'si yazar kimliğini ikiye böler. Karar: profil URL'si = about#author. Byline, Article.author ve Organization.founder aynı `@id`'yi kullanır.

## B. Woody sitesi — uygulanan düzeltmeler

- [x] B1. İki yazıdaki (`6-yas-ingilizce-egitimi`, `cambridge-egitim-sistemi-nedir`) `Yalçın Karakuş` yazar kaydı → `Ayşe Polat Karakuş`. Canlı DB'ye uygulandı (2026-09-25 22:45). Repoda bu isim yok.
- [x] B2. Article JSON-LD `author` → `@id: /{locale}/about#author` ve aynı URL. Görünür byline bu profile bağlantı veriyor.
- [x] B3. Organization şemasına `founder` → aynı Person `@id`.
- [x] B4. Byline'da görünür yayın ve güncelleme tarihi. `dateModified` gerçek `updated_at`'ten gelir.
- [x] B5. About sayfası: jenerik `authorBio` kurucu biyografisini eziyordu, kaldırıldı. Kurucu/Mina Yayınevi ilişkisi görünür. Seri/kullanıcı/yaş tablosu ve editoryal politika bölümü eklendi. Editoryal politika metni başka projeden kalma sağlık dili içeriyordu ("bağımlılık", "uzman görüşmesi"); Woody'ye göre yeniden yazıldı.
- [x] B6. `llms.txt`: rehberler bölümü DB'den (öncelikli 6 rehber + diğerleri, tek cümle kapsam), yazar profili, seri/yaş ayrımı, son güncelleme tarihi, insan okunur sayfa etiketleri. Slogan-cevaplı SSS yerine soruyu cevaplayan SSS.
- [x] B7. Altı öncelikli rehber: H1 altında 40–80 kelimelik doğrudan cevap, eksik karar tabloları (müfredat, 6 yaş), resmî/birincil kaynak + sınır bölümü. Canlı içerik kopyası üzerinde doğrulandı: 6/6 yazı 100/ready (konular ve 5 yaş önce 87/fail idi, kelime kapısını geçemiyordu). Betik: `backend/src/scripts/applyWoodyGeoCitability.ts`. Canlı DB'ye uygulandı; ikinci koşu 0 değişiklik (idempotent).
- [x] B8. Lead ölçümü: `generate_lead` / `whatsapp_click` / `phone_click` olaylarına `landing_page`, `referrer_host`, `ai_source` parametreleri eklendi. AI asistan yönlendiricisi sınıflandırması (ChatGPT, Gemini, Perplexity, Claude, Copilot…). Böylece AI referral → açılış sayfası → CTA → lead zinciri GA4'te izlenebilir.
- [x] B11. Public blog detay API'si `updated_at` döndürmüyordu → `dateModified` hep yayın tarihiydi. `packages/shared-backend/modules/blog/repository.ts` artık `GREATEST(blog_posts.updated_at, blog_posts_i18n.updated_at)` döndürüyor (VPS'e elle senkronlandı; `packages` ayrı/gitignored kopya).
- [x] B10. `faq.json` yazım hatası ("ilerlemememesidir") düzeltildi.
- [ ] B9. GA4'te `landing_page`, `referrer_host`, `ai_source` için olay kapsamlı özel boyut tanımı ve `generate_lead` / `whatsapp_click` / `phone_click` anahtar etkinlik durumunun doğrulanması. GA4 Admin erişimi gerekir; yapılmadı.

## C. Tanitio — ölçüm düzeltmeleri (repo: ekosistem-sosyal-medya, dal `fix/geo-olcum-dogrulugu`)

- [x] C1. Sitemap toplamı ayrı sayılıyor (50 sınırı kaldırıldı, güvenli üst sınır ile). "URL örneklemi 10/512" kartı.
- [x] C2. Katmanlı örnekleme: ana sayfa 1, kurum 1, hizmet 2, ürün 2, blog 3, iletişim 1. Tek dil, aynı sayfanın dil kopyaları elenir.
- [x] C3. "Kapsama" → "Sinyal kapsamı". Marka bileşeni → "Bağımsız varlık profili (Wikipedia/Wikidata)" ve açıklaması. Sekmeler arası yönlendirme notu ve GA4 AI trafiği özeti.
- [x] C4. Yerel gözlem koşucusu: istekler arası gecikme, tekrar, ayrıntılı hata kodları (429/captcha/ağ), yarım kalan koşuyu sürdürme.
- [x] C5. Kapsam %70 altındaysa "Yetersiz örneklem — ön değerlendirme"; paylar KPI gibi gösterilmez. Başarısız sorgu görünmezlik sayılmaz.
- [x] C6. Alias hijyeni (genel/platform kelimeleri reddedilir). Wikipedia/YouTube/Pinterest/Google Play/TripAdvisor… "kaynak platformu" olarak ayrılır ve rakip olarak takibe alınamaz.
- [x] C7. Niyete göre soru şablonları (bilgi/fayda/ürün/fiyat/ebeveyn/öğretmen/kurum).
- [x] C8. Temiz Woody soru seti (12 markasız + 2 markalı) repoda. Kabul: ≥10/12 başarılı.
- [ ] C9. Tanitio dalının canlıya alınması + temiz setle yeni koşu + yeni Site Sağlığı denetimi. Yapılmadı (bkz. "Canlıya alma").

Commit'ler: `cd3be1b` (örnekleme + ekran), `48a0e62` (yerel SERP gözlemi). Backend 1755/1755, dashboard 234/234 test geçti.

## D. İnsan/dış veri gerektirenler (uydurulmayacak)

- [!] D1. Kurucunun gerçek eğitim/deneyim geçmişi, yöntemin doğduğu tarih ve sınıf ihtiyacı (plan Faz 1). Müşteriden alınacak; about `founderParagraphs` ve `author.bio*` alanlarına yazılacak.
- [!] D2. Birinci el sınıf kanıtı: yayın izni alınmış okul/öğretmen vakaları, ders süresi, gözlenen çıktı (Faz 2-C, Faz 4). Ölçülmemiş başarı oranı yazılmaz.
- [!] D3. Kurucunun gerçekten sahip olduğu profesyonel profiller (LinkedIn vb.) → `author.sameAs`. Şu an boş, bilerek.
- [!] D4. Bağımsız basın/kurum/iş birliği kaynakları. Wikipedia/Wikidata yalnız doğal kayda değerlik oluşunca değerlendirilir.
- [!] D5. İndirilebilir ders planı dosyası hazır olunca ders planı rehberine eklenir; hazır değilse vaat edilmez.

## E. Ölçüm takvimi

- [ ] E1. Temiz setle ilk koşu (Brave, TR/TR, 1 tekrar) → baz çizgisi.
- [ ] E2. Aynı setle 7. ve 28. gün tekrarları (2 Ekim, 23 Ekim 2026).
- [ ] E3. GA4: AI oturumu, açılış sayfası, CTA ve lead mutlak sayılarla 28 günlük iki ardışık dönemde (26 Eylül–23 Ekim, 24 Ekim–20 Kasım) karşılaştırılır. Yüzde değişim tek başına başarı sayılmaz.

## Canlıya alma (sırayla)

Durum (2026-09-25 23:00): 1 ve 2 YAPILDI ve canlıda doğrulandı (yazar @id, founder, FAQPage görünür SSS'den, kaynak bölümü, canonical doğru, llms.txt yeni bölümler, dateModified 25 Eylül). Tanitio main'e birleşti ve push edildi (`0777d03`), fakat sunucu deploy'u (4) izin katmanında engellendi → elle: `ssh vps-vistainsaat 'cd /var/www/ekosistem-sosyal-medya && bash scripts/deploy.sh all'`. 3 ve 5 açık.

1. Woody DB (VPS, `/var/www/woody/backend`): önce `bun src/scripts/applyWoodyGeoCitability.ts` (dry-run; 1 yazar satırı + 6 PLAN satırı beklenir), sonra `--apply`. Tekrar çalıştırmak güvenli (idempotent).
2. Woody frontend deploy (`./deploy/deploy.sh frontend`). Sonra doğrula: `curl -s https://woodyvearkadaslari.com/llms.txt | grep "Oncelikli rehberler"`, `/tr/about#author` ve bir blog yazısında `"@id":".../tr/about#author"`. Canonical'ın localhost olmadığını da kontrol et.
3. GA4 → Yönetici → Özel tanımlar: olay kapsamlı `landing_page`, `referrer_host`, `ai_source` boyutları; `generate_lead`, `whatsapp_click`, `phone_click` anahtar etkinlik mi, kontrol et.
4. Tanitio `fix/geo-olcum-dogrulugu` → main + deploy. Ardından Woody için yeni Site Sağlığı denetimi (URL örneklemi 10/512 görünmeli).
5. Temiz setle yerel gözlem (operatör makinesinde, `backend/`):
   `bun scripts/geo-prepare-run.ts --tenant=woody --token-file=TOKEN_FILE --questions=scripts/fixtures/woody-geo-questions-2026-09-25.json --execute`
   `bun scripts/geo-observe-local.ts --tenant=woody --run=<runId> --token-file=TOKEN_FILE --execute-local`
   Kabul: ≥10/12 markasız başarılı; değilse sonuç KPI değildir.
