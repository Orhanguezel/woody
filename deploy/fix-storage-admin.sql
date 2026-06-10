SET NAMES utf8mb4;

INSERT INTO site_settings (id, `key`, locale, `value`)
VALUES (
  'ss-ui-admin-pages-tr',
  'ui_admin_pages',
  'tr',
  '{"dashboard":{"title":"Kontrol Paneli","description":"Genel durum ve hızlı erişimler."},"storage":{"title":"Dosya Yöneticisi","description":"Görselleri ve medya dosyalarını yönetin."},"home_layout":{"title":"Anasayfa Düzeni","description":"Anasayfa bölümlerini sıralayın ve düzenleyin."},"site_settings":{"title":"Site Ayarları","description":"Marka, SEO, yerelleştirme ve entegrasyon ayarları."}}'
)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = CURRENT_TIMESTAMP(3);

UPDATE storage_assets SET url = '/media/woody/reference/6qg348xf_Preschool%20Basic%20(297%20x%20210%20mm)%20(Instagram%20Go%CC%88nderisi%20(45)).png' WHERE id = 'sa-woody-ref-c89a22cb45b5d323cbcb';
UPDATE storage_assets SET url = '/media/woody/reference/bbn6tpbx_I%CC%87lk%20sayfa%20theme%201_Sayfa_5.jpg' WHERE id = 'sa-woody-ref-3837205cc74f0c860221';
UPDATE storage_assets SET url = '/media/woody/reference/ejpqg9mg_I%CC%87lk%20sayfa%20theme%201_Sayfa_1.jpg' WHERE id = 'sa-woody-ref-4a7d0198ae8d82c1dfe5';
UPDATE storage_assets SET url = '/media/woody/reference/kbd06i5m_I%CC%87lk%20sayfa%20theme%201_Sayfa_4.jpg' WHERE id = 'sa-woody-ref-e06fa60823a61246bfb9';
UPDATE storage_assets SET url = '/media/woody/reference/pxbe6piu_I%CC%87lk%20sayfa%20theme%201_Sayfa_2.jpg' WHERE id = 'sa-woody-ref-0bba185a4901d13c85fb';
UPDATE storage_assets SET url = '/media/woody/reference/uoftphsc_I%CC%87lk%20sayfa%20theme%201_Sayfa_3.jpg' WHERE id = 'sa-woody-ref-a929c3c6789691416930';
UPDATE storage_assets SET url = '/media/woody/reference/w6y5frsb_I%CC%87lk%20sayfa%20theme%201_Sayfa_7.jpg' WHERE id = 'sa-woody-ref-e0db6193f4912391ab1a';
UPDATE storage_assets SET url = '/media/woody/reference/wh47lcep_I%CC%87lk%20sayfa%20theme%201_Sayfa_6.jpg' WHERE id = 'sa-woody-ref-29245dd196759aed9df3';
UPDATE storage_assets SET url = '/media/woody/reference/ymtca4bt_I%CC%87lk%20sayfa%20theme%201_Sayfa_8.jpg' WHERE id = 'sa-woody-ref-a4adc9edcaec7fc788f9';

UPDATE storage_assets
SET url = REPLACE(REPLACE(url, '%C4%B0lk', 'I%CC%87lk'), 'G%C3%B6nderisi', 'Go%CC%88nderisi')
WHERE url LIKE '%\\%C4\\%B0lk%' OR url LIKE '%G\\%C3\\%B6nderisi%';
