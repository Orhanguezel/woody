-- Yasal metinlerdeki kisi/satici adini tek kaynaktan duzeltir.
-- 038 dahil onceki seed'ler eski adi eklese bile bu son adim tum dilleri normalize eder.
-- Idempotent: eski ad kalmadiginda hicbir satiri degistirmez.
UPDATE `custom_pages_i18n`
   SET `content` = REPLACE(`content`, 'Yalçın Karakuş', 'Ayşe Polat Karakuş')
 WHERE `content` LIKE '%Yalçın Karakuş%';
