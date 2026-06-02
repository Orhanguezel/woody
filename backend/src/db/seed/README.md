# Seed SQL — `id` kurallari

Yeni veya guncellenen seed dosyalarinda **sabit satir kimlikleri** icin asagidaki konvansiyon uygulanir.

## Sabit kayitlar (okunabilir, max 64 karakter)

| Oncelik | Oncu | Ornek | Kullanim |
|---------|------|-------|----------|
| `site_settings` | `ss-` | `ss-brand-name`, `ss-default-locale` | `key` ile eslesen veya dokumanda adi gecen satirlar |
| Ayni `key`, farkli `locale` | `ss-` + key + `-loc-<locale>` | `ss-chat-ai-welcome-message-loc-tr`, `ss-chat-ai-welcome-message-loc-all` | `*` locale icin `-loc-all` |
| `home_sections` | `home-` | `home-hero`, `home-konular` | Bolum slug / layout referansi |
| `user_roles` (seed satiri) | `ur-` | `ur-admin-primary`, `ur-admin-secondary` | Sabit rol satirlari (auth seed) |

- Tablo `id` kolonu `VARCHAR(64)` ise bu onculer kullanilir.
- **Yasak:** `01000000-0000-4000-8000-000000000030` gibi uzun sahte UUID’ler (okunamaz, merge/debug zor).
- **Auth kullanici id:** `users.id`, `profiles.id` gibi gercek kullanici kayitlari `.env` yer tutuculari (`{{ADMIN_ID}}`) ile kalir; bunlar gercek UUID formatinda olabilir.

## Gecici / tekil satirlar

Cok sayida tekrar uretilen ve kodda `id` ile referanslanmayan satirlarda `UUID()` kullanilabilir; tercihen yine `ss-<key>` ile deterministik tutulur (004 gibi toplu ayar seed’leri).

## Semaya uyum

`id` uzunlugunu degistirirken ilgili dosyadaki `CREATE TABLE` tanimini guncelle (`VARCHAR(64)`); lokal ortamda `ALTER TABLE` kullanilmaz — `db:seed:*:fresh` ile sifirdan kurulur.

## Harici anahtarlar

`user_id`, `parent_id` vb. baska tablodaki `id`’ye bagli kolonlar, hedef tablonun tipine uyar (ornegin `users.id` `CHAR(36)` ise deger de 36 karakterlik UUID olmali).
