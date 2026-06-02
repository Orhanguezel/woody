# deploy/ — Production Deploy Araclari (markadan bagimsiz)

Bu klasor sablonun **deploy iskeletidir**. Slug ve portlar `proje.json`'dan, VPS sirlari
`.secrets/credentials.env`'den okunur — hicbir proje adi hard-code edilmez.

> **Durum:** Woody icin VPS/domain henuz hazir degil. Araclar hazirda bekliyor;
> sunucu netlesince `.secrets/credentials.env` doldurulup `deploy.sh` calistirilir.

## Dosyalar

| Dosya | Ne yapar |
|---|---|
| `deploy.sh` | rsync → VPS, `bun install` + build, PM2 (re)start, port smoke-test |
| `credentials.env.example` | `.secrets/credentials.env` icin sablon (VPS_USER/HOST, SSH_KEY, domainler) |
| `nginx/site.conf.template` | Reverse-proxy server block (token'li: domain + portlar) |
| `../ecosystem.config.cjs` | PM2 app tanimi — `<slug>-backend/admin/frontend`, portlar proje.json'dan |

## Ilk kurulum (VPS hazir oldugunda)

```bash
# 1) Sirlari hazirla
mkdir -p .secrets
cp deploy/credentials.env.example .secrets/credentials.env
$EDITOR .secrets/credentials.env        # VPS_HOST, SSH_KEY, (opsiyonel) domainler

# 2) VPS'te: bun + pm2 + nginx + mysql kurulu olmali. DB ve app .env'leri:
#    /var/www/<slug>/backend/.env       (production DB, JWT/COOKIE secret, CORS_ORIGIN, PUBLIC_URL)
#    /var/www/<slug>/admin_panel/.env   (NEXT_PUBLIC_* production domainleri)
#    /var/www/<slug>/frontend/.env      (NEXT_PUBLIC_* production domainleri)
#    Bu .env'ler rsync'ten haric tutulur; VPS'te bir kere elle olusturulur.

# 3) Ilk deploy + DB seed
./deploy/deploy.sh --seed

# 4) nginx
sed -e 's/__DOMAIN_FRONTEND__/.../; s/__BACKEND_PORT__/8101/; ...' \
    deploy/nginx/site.conf.template > /tmp/<slug>.conf   # token'leri doldurun
#   VPS'e kopyala → sites-available → symlink → nginx -t → reload → certbot --nginx
```

## Gunluk deploy

```bash
./deploy/deploy.sh                 # hepsi
./deploy/deploy.sh backend         # tek hedef
./deploy/deploy.sh admin frontend  # secili hedefler
./deploy/deploy.sh --fresh-seed    # DIKKAT: prod DB drop + seed
```

## Notlar

- **.env dosyalari rsync edilmez.** Production secret'lari VPS'te yasar (sync drift olmaz).
- DB sema degisikligi: kok `CLAUDE.md` kurali — `ALTER` yok; seed SQL guncellenir + `--fresh-seed`.
- PM2 boot persist: VPS'te bir kere `pm2 startup` + `pm2 save`.
