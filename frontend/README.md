# Site Frontend (Next.js)

Next.js 16, RTK Query, coklu dil; tema ve metinler `site_settings` + `src/config/site-defaults.json` + `NEXT_PUBLIC_*` ile.

## Calistirma

```bash
cd /path/to/tarim-dijital-ekosistem
bun install
cd projects/<yeni-proje>/frontend
cp .env.example .env.local
bun run dev
```

Varsayilan port **3077**. Ortak UI: `@site/shared-ui` (monorepo `packages/shared-ui`).

API: proje `backend` (8086); koken `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_API_URL`.
