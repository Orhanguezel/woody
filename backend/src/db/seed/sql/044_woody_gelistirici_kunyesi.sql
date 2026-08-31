-- 044_woody_gelistirici_kunyesi.sql
-- Footer'daki gelistirici kunyesi artik kodda degil bu ayarda.
-- Kullanici istegi (2026-08-31): link https://gzlteknoloji.com/ adresine gitsin.
-- `label` alani eklendi — gorunen metin de veriden gelsin, kodda yedegi yok
-- (ayar bos ise kunye HIC gosterilmez).
UPDATE `site_settings`
   SET `value` = JSON_MERGE_PATCH(
         `value`,
         JSON_OBJECT(
           'url',   'https://gzlteknoloji.com/',
           'label', 'DESIGNED BY GUEZELWEB'
         )
       ),
       `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `key` = 'developer_branding' AND JSON_VALID(`value`);
