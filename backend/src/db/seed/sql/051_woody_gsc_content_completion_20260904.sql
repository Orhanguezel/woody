-- 2026-09-04 remaining first-page content completion.
-- Idempotent markers prevent duplicate sections on reseed.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

UPDATE `blog_posts_i18n`
   SET `content` = CONCAT(
     `content`,
     '<section data-seo-block="age-level-finder-20260904"><h2>Doğru başlangıç seviyesini nasıl seçersiniz?</h2><p>Yaş tek başına seviye kararı değildir. Çocuğun yönergeyi anlama, görsel seçme ve kısa kalıba katılma durumunu birlikte değerlendirin. <a href="/tr/level-finder">Woody Level Finder ile başlangıç seviyesini belirleyin</a>; ardından <a href="/tr/store">uygun öğrenci setini inceleyin</a>.</p></section>'
   )
 WHERE `locale` = 'tr'
   AND `slug` = '4-5-6-yas-ingilizce-egitimi'
   AND LOCATE('data-seo-block="age-level-finder-20260904"', `content`) = 0;

UPDATE `blog_posts_i18n`
   SET `content` = CONCAT(
     `content`,
     '<section data-seo-block="set-comparison-20260904"><h2>Setleri aynı ölçütlerle karşılaştırın</h2><table><thead><tr><th>Ölçüt</th><th>Kontrol sorusu</th><th>Kanıt</th></tr></thead><tbody><tr><td>Seviye</td><td>İçerik çocuğun mevcut katılım düzeyine uygun mu?</td><td>Örnek sayfa ve seviye çıktısı</td></tr><tr><td>Öğretmen akışı</td><td>Haftalık kazanım ve ders sırası açık mı?</td><td>Öğretmen planı</td></tr><tr><td>Tekrar</td><td>Kitap, kart, oyun, şarkı ve hikâye aynı hedefe bağlanıyor mu?</td><td>Materyal eşlemesi</td></tr><tr><td>İlerleme</td><td>Gözlenebilir davranışlar tanımlı mı?</td><td>Kontrol listesi</td></tr></tbody></table><p>Başlangıç seçeneklerini doğrudan karşılaştırmak için <a href="/tr/store/basic-level-set-ogrenci-seti-0001">Basic</a>, <a href="/tr/store/junior-level-set-ogrenci-seti-0002">Junior</a> ve <a href="/tr/store/senior-level-set-ogrenci-seti-0003">Senior öğrenci setlerini</a> inceleyin. Kararsızsanız önce <a href="/tr/level-finder">Level Finder</a> sonucunu alın.</p></section>'
   )
 WHERE `locale` = 'tr'
   AND `slug` = 'anaokulu-ingilizce-egitim-seti-nasil-secilir'
   AND LOCATE('data-seo-block="set-comparison-20260904"', `content`) = 0;

UPDATE `blog_posts_i18n`
   SET `content` = CONCAT(
     `content`,
     '<section data-seo-block="lesson-week-table-20260904"><h2>Örnek haftalık ders planı</h2><table><thead><tr><th>Gün</th><th>Kazanım</th><th>Sınıf akışı</th></tr></thead><tbody><tr><td>Pazartesi</td><td>Hedef kelimeleri tanıma</td><td>Kart gösterimi, seçme oyunu, kısa kapanış</td></tr><tr><td>Salı</td><td>Yönergeye tepki</td><td>Hareket oyunu, eşleştirme, tekrar</td></tr><tr><td>Çarşamba</td><td>Kelimeyi bağlamda görme</td><td>Kısa hikâye, görsel sıralama, soru-cevap</td></tr><tr><td>Perşembe</td><td>Ritimle tekrar</td><td>Şarkı, hareket, kart istasyonu</td></tr><tr><td>Cuma</td><td>Gözlenebilir pekiştirme</td><td>Mini görev, bireysel seçim, öğretmen notu</td></tr></tbody></table><p>Akışı yaşa göre uyarlamak için <a href="/tr/blog/4-5-6-yas-ingilizce-egitimi">4-5-6 yaş karşılaştırmasını</a>; hazır sistem ve öğretmen materyalleri için <a href="/tr/preschool">Woody Okul Serisini</a> kullanın.</p></section>'
   )
 WHERE `locale` = 'tr'
   AND `slug` = 'anaokulu-ingilizce-ders-plani-nasil-hazirlanir'
   AND LOCATE('data-seo-block="lesson-week-table-20260904"', `content`) = 0;

UPDATE `blog_posts` b
INNER JOIN `blog_posts_i18n` i ON i.blog_post_id = b.id
   SET b.updated_at = CURRENT_TIMESTAMP(3)
 WHERE i.locale = 'tr'
   AND i.slug IN (
     '4-5-6-yas-ingilizce-egitimi',
     'anaokulu-ingilizce-egitim-seti-nasil-secilir',
     'anaokulu-ingilizce-ders-plani-nasil-hazirlanir'
   );
