-- 2026-09-03 GSC first-page opportunity refresh.
-- Existing URL ownership is preserved; no new competing blog URL is created.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Italian query: ~1,015 impressions, avg position ~5, zero clicks.
-- The story page owns the combined small-group/game/story/continuity question.
UPDATE blog_posts_i18n
   SET title = 'Perché storie, gioco e piccoli gruppi contano nell''inglese prescolare?',
       meta_title = 'Storie, gioco e piccoli gruppi nell''inglese prescolare',
       meta_description = 'Piccoli gruppi, gioco, storie e continuità rendono l''inglese prescolare comprensibile e ripetibile: ecco perché funzionano insieme dai 3 ai 6 anni.',
       content = CASE
         WHEN LOCATE('data-seo-block="it-opportunity-20260903"', content) = 0 THEN CONCAT(
           '<section data-seo-block="it-opportunity-20260903"><p><strong>Quanto contano piccoli gruppi, gioco, storie e continuità nell''apprendimento dell''inglese?</strong> Contano molto perché il piccolo gruppo dà a ogni bambino il tempo di partecipare, il gioco trasforma la lingua in un''azione, la storia le dà un contesto e la continuità permette di ritrovare le stesse parole in incontri successivi. Per i bambini dai 3 ai 6 anni questi quattro elementi funzionano meglio insieme che come attività isolate.</p></section>',
           content
         )
         ELSE content
       END
 WHERE locale = 'it' AND slug = 'perche-storia-funziona-inglese-scuola-infanzia';

-- Secondary Italian pages are narrowed to their own intent.
UPDATE blog_posts_i18n
   SET meta_title = 'Giochi in inglese all''asilo | Ascolto e partecipazione',
       meta_description = 'Il gioco in inglese alla scuola dell''infanzia sostiene ascolto, scelta, movimento e partecipazione: esempi pratici per una lezione prescolare.'
 WHERE locale = 'it' AND slug = 'perche-apprendimento-inglese-basato-sul-gioco-e-efficace';

UPDATE blog_posts_i18n
   SET meta_title = 'Metodo inglese prescolare | Routine e progressione 3-6 anni',
       meta_description = 'Un metodo di inglese prescolare efficace unisce routine, progressione 3-6 anni, supporti visivi e ripetizione coerente durante l''anno.'
 WHERE locale = 'it' AND slug = 'metodi-apprendimento-inglese-scuola-infanzia';

-- Turkish age cluster: 4/5/6-year queries sit mainly in positions 11-20.
UPDATE blog_posts_i18n
   SET content = CASE
         WHEN LOCATE('data-seo-block="age-plan-20260903"', content) = 0 THEN CONCAT(
           '<section data-seo-block="age-plan-20260903"><h2>4, 5 ve 6 yaş için hızlı İngilizce planı</h2><p>Yaşa göre ders süresi, dil hedefi ve etkinlik biçimi aynı olmamalıdır. Aşağıdaki özet, öğretmenin ilk planı kurmasına yardımcı olur.</p><table><thead><tr><th>Yaş</th><th>Önerilen akış</th><th>Ana hedef</th><th>Etkinlik</th></tr></thead><tbody><tr><td>4 yaş</td><td>15-20 dakika</td><td>Dinleme, taklit ve tek kelimelik tepki</td><td>Hareketli oyun, kart ve kısa şarkı</td></tr><tr><td>5 yaş</td><td>20-25 dakika</td><td>Kısa kalıp ve hikâye sırası</td><td>Hikâye, eşleştirme ve soru-cevap</td></tr><tr><td>6 yaş</td><td>25-30 dakika</td><td>Basit cümle ve iletişim</td><td>Rol oyunu, görev ve konuşma turu</td></tr></tbody></table><p>Programın tamamını kurum ölçeğinde değerlendirmek için <a href="/tr/preschool">anaokulu İngilizce programını</a>, materyalleri incelemek için <a href="/tr/store">Woody eğitim setlerini</a> ziyaret edebilirsiniz.</p></section>',
           content
         )
         ELSE content
       END,
       meta_description = '4, 5 ve 6 yaş İngilizce eğitimi için yaşa göre ders süresi, konu, oyun, hikâye, şarkı ve örnek sınıf akışını karşılaştırın.'
 WHERE locale = 'tr' AND slug = '4-5-6-yas-ingilizce-egitimi';

UPDATE blog_posts b
INNER JOIN blog_posts_i18n i ON i.blog_post_id = b.id
   SET b.updated_at = CURRENT_TIMESTAMP(3)
 WHERE (i.locale = 'it' AND i.slug IN (
          'perche-storia-funziona-inglese-scuola-infanzia',
          'perche-apprendimento-inglese-basato-sul-gioco-e-efficace',
          'metodi-apprendimento-inglese-scuola-infanzia'
       ))
    OR (i.locale = 'tr' AND i.slug = '4-5-6-yas-ingilizce-egitimi');
