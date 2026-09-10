#!/usr/bin/env bash
# Build beside the app so the active .next stays intact until activation.
set -euo pipefail
root="$1" app="$2" process="$3" bun_bin="$4"
stage="$(mktemp -d "$root/.build-${app}.XXXXXX")"
backup="$root/$app/.next.previous"
activating=0
cleanup() {
  code=$?
  if [[ "$code" -ne 0 && "$activating" -eq 1 ]]; then
    rm -rf "$root/$app/.next"
    if [[ -d "$backup" ]]; then mv "$backup" "$root/$app/.next"; fi
    pm2 restart "$process" || true
  fi
  rm -rf "$stage"
  exit "$code"
}
trap cleanup EXIT
rsync -a --exclude='.next*' --exclude='node_modules' "$root/$app/" "$stage/"
if [[ -d "$root/$app/node_modules" ]]; then ln -s "$root/$app/node_modules" "$stage/node_modules"; fi
cd "$stage"
NODE_ENV=production "$bun_bin" run build
test -s .next/BUILD_ID
# Kapi: NEXT_PUBLIC_SITE_URL/APP_URL build'e localhost olarak gomulduyse (8 Eylul 2026 olayi:
# canonical/hreflang/sitemap iki gun localhost gosterdi) bu build ASLA aktive edilmez.
if grep -rqE '"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?"\.trim\(\)' .next/server/chunks .next/server/app 2>/dev/null; then
  echo "❌ Build NEXT_PUBLIC_SITE_URL/APP_URL olarak localhost gomdu — .env kontrol et (NEXT_PUBLIC_SITE_URL=https://...). Aktivasyon iptal." >&2
  exit 1
fi
pm2 stop "$process" || true
activating=1
rm -rf "$backup"
if [[ -d "$root/$app/.next" ]]; then mv "$root/$app/.next" "$backup"; fi
mv .next "$root/$app/.next"
cd "$root"
BUN_BIN="$bun_bin" pm2 start ecosystem.config.cjs --only "$process" --update-env
activating=0
