-- =============================================================
-- Test / hatali siparislerin temizligi  (hazirlik: 2026-09-04)
-- Kullanicinin /admin/orders ekranindan verdigi 17 siparis.
--
-- Bagli tablolar FK ON DELETE CASCADE oldugu icin ayrica silinmez:
--   order_items, payment_attempts, order_attribution,
--   commerce_measurement_outbox
--
-- paytr_callback_logs KASITLI olarak korunur — odeme bildirimlerinin
-- denetim izidir, siparis silinse de tarihce durmali.
--
-- LISTEDE OLMAYAN, KORUNAN 2 SIPARIS (silinmiyor):
--   804559d4-...  Ozge Ozdemir   3.000,00  ODENDI  03.09  <-- GERCEK MUSTERI
--   251b3f0f-...  MinaYayinevi   1.500,00  ODENDI  02.09
-- =============================================================

START TRANSACTION;

-- Once ne silinecegini gor (istersen COMMIT oncesi kontrol et):
SELECT CONCAT('WD', o.id) siparis, u.full_name musteri, o.total,
       o.status, o.payment_status, o.created_at
  FROM orders o LEFT JOIN users u ON u.id = o.dealer_id
 WHERE o.id IN (
  -- ---- basarisiz / iptal test siparisleri (14) ----
  '4e851fdb-733e-4e04-a3cf-529058bc323c',  -- Admin          3.750,00  basarisiz
  '419344b1-2c8b-4ec2-858c-9b066092ccb1',  -- Admin          7.500,00  basarisiz
  'b2075afe-c047-4212-be09-3b836359276a',  -- Engin Gulgor   3.000,00  basarisiz
  '3308703b-d5a1-4374-aee3-b8f13f51261e',  -- Engin Gulgor   3.000,00  basarisiz
  '344feaf0-dbd9-4e58-b498-e34e575fb42b',  -- MinaYayinevi   7.500,00  basarisiz
  'ab7f9630-9f42-4baa-8319-75e679bc9eec',  -- Admin          7.500,00  basarisiz
  '78aabd5a-90e9-4fb7-8149-0412e6e5f0a5',  -- MinaYayinevi   7.500,00  basarisiz
  '836d0fc4-12eb-4393-9592-fd3fb53459d1',  -- MinaYayinevi   7.500,00  basarisiz
  '7e52f25f-2275-496b-9d2b-c804f213bd51',  -- Duygu hacioglu 3.750,00  basarisiz
  '01583299-3e57-402b-b784-98e9d3d4f42c',  -- MinaYayinevi   2.500,00  basarisiz
  '3c177a94-cfe8-4fea-886f-a562f7dedbdf',  -- MinaYayinevi   2.500,00  basarisiz
  'e56fcc0a-599e-4587-9acb-71f4f36c07dd',  -- Admin          2.750,00  basarisiz
  '489798dc-8ce3-4786-aac5-ceaf9ddd280d',  -- Admin          2.500,00  basarisiz
  'e21e9bd3-4498-46ef-82c3-9f43f468aeb0',  -- Engin Gulgor   3.000,00  basarisiz
  -- ---- DIKKAT: bunlar ODENDI kayitlari (3) ----
  -- Ikisi Admin (orhanguzell@gmail.com), biri MinaYayinevi = kendi test alimlarin.
  -- Gercek para hareketi degilse silinmesi sorunsuz; emin degilsen bu 3 satiri
  -- yorum satiri yapip oyle calistir.
  '5a0fc092-39d4-4fce-9d3b-bcb0a0807a2b',  -- MinaYayinevi   3.000,00  ODENDI
  'b67e3d73-5a29-4d56-8d56-08c14a8ffd46',  -- Admin          2.500,00  ODENDI
  'afb50c70-b487-4555-ad61-dbbebb88ea7d'   -- Admin          2.500,00  ODENDI
);

DELETE FROM orders
 WHERE id IN (
  '4e851fdb-733e-4e04-a3cf-529058bc323c',
  '419344b1-2c8b-4ec2-858c-9b066092ccb1',
  'b2075afe-c047-4212-be09-3b836359276a',
  '3308703b-d5a1-4374-aee3-b8f13f51261e',
  '344feaf0-dbd9-4e58-b498-e34e575fb42b',
  'ab7f9630-9f42-4baa-8319-75e679bc9eec',
  '78aabd5a-90e9-4fb7-8149-0412e6e5f0a5',
  '836d0fc4-12eb-4393-9592-fd3fb53459d1',
  '7e52f25f-2275-496b-9d2b-c804f213bd51',
  '01583299-3e57-402b-b784-98e9d3d4f42c',
  '3c177a94-cfe8-4fea-886f-a562f7dedbdf',
  'e56fcc0a-599e-4587-9acb-71f4f36c07dd',
  '489798dc-8ce3-4786-aac5-ceaf9ddd280d',
  'e21e9bd3-4498-46ef-82c3-9f43f468aeb0',
  '5a0fc092-39d4-4fce-9d3b-bcb0a0807a2b',
  'b67e3d73-5a29-4d56-8d56-08c14a8ffd46',
  'afb50c70-b487-4555-ad61-dbbebb88ea7d'
);

-- Kalanlari dogrula — 2 satir kalmali (Ozge Ozdemir + MinaYayinevi, ikisi de ODENDI)
SELECT CONCAT('WD', o.id) siparis, u.full_name musteri, o.total, o.payment_status
  FROM orders o LEFT JOIN users u ON u.id = o.dealer_id
 ORDER BY o.created_at DESC;

-- Sonuc dogruysa:
COMMIT;
-- Yanlissa COMMIT yerine:  ROLLBACK;
