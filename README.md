# Sablon Proje

Yeni bir urune baslarken bu klasoru kopyalayip tek komutla baseline ayarlarini yapabilmek icin hazirlandi.

## Icerik

- `backend/` (Fastify + Drizzle)
- `frontend/` (Next.js)
- `admin_panel/` (Next.js)
- `proje.json` (proje metadatasi)
- `scripts/init-project.sh` (env + `proje.json` + marka)
- `scripts/apply-brand.py` (`AppName` token → gercek marka; seed + site-defaults + offline)

## Sadece marka / sablon tokenlari

`.env` dosyalarina dokunmadan yalnizca depodaki `AppName`, `TarMinGO`, `TarGO` kalintilarini ve `proje.json` / seed / `site-defaults` metinlarini guncellemek icin:

```bash
bash scripts/init-project.sh --name "Ornek Proje" --slug "ornek-proje" --brand-only
```

**Token:** Veritabani seed (`004_site_settings_schema.sql`, `012_...`) ve `frontend/public/offline.html` icinde gorunen marka yeri `AppName` olarak birakilir; `init-project.sh` veya `--brand-only` `scripts/apply-brand.py` calistirildiginda proje adi ile degistirilir.

## Hizli Baslangic

1. Bu klasoru yeni proje klasoru olarak kopyalayin.
2. Asagidaki komutu yeni proje klasorunde calistirin:

```bash
bash scripts/init-project.sh \
  --name "Ornek Proje" \
  --slug "ornek-proje" \
  --db "ornek_proje_db" \
  --backend-port 8086 \
  --frontend-port 3077 \
  --admin-port 3096
```

Mevcut `.env` dosyalarini da guncellemek istersen `--force` ekleyin.

3. Olusan dosyalari kontrol edin:
   - `proje.json`
   - `backend/.env`
   - `frontend/.env.local`
   - `admin_panel/.env.local`

4. Monorepo root dizininden workspace adimini tamamlayin:
   - root `package.json` icindeki `workspaces` listesine yeni proje yollarini ekleyin
   - root dizinde `bun install` calistirin

## Notlar

- Seed SQL’de sabit satir `id` kurallari: `backend/src/db/seed/README.md`.
- `init-project.sh` mevcut `.env` / `.env.local` dosyalarini silmez; yoksa `.env.example` uzerinden olusturur. Port ve anahtar guncellemesi yalnizca yeni dosyada veya `--force` ile yapilir.
- Tam kurulum sonunda `scripts/apply-brand.py` otomatik calisir (`AppName` → `--name`, `proje.json.name` → `--slug`).
- Uygulama adlari ve aciklamalar env uzerinden yonetilir, hard-code edilmez.
- API pattern standardi: is endpointleri `/api/v1/...` altindadir.

