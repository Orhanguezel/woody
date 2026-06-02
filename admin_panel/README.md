# Admin Panel Template

Next.js 16, Tailwind v4; tema ve icerik `site_settings` / theme uzerinden.

## Calistirma

Ortak ekosistem kokunden:

```bash
cd /path/to/tarim-dijital-ekosistem
bun install
cd projects/<project>/admin_panel && bun run dev
```

Varsayilan port: **3096** (`package.json`). Backend: `projects/<project>/backend` (8086).

`.env` icin: `.env.example` kopyala; API URL'leri kendi ortamina gore ayarla.

## Uyarlama notlari

- Endpoint ve metinler backend ile hizalanir; sabit domain/marka kodda tutulmaz.
- Tasarim: CSS tokenlari — admin tema ayarlari ile degisebilir.
