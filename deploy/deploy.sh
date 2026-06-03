#!/usr/bin/env bash
# Markadan bagimsiz sablon deploy — lokalden calistirilir.
# Repoyu VPS'e rsync'ler, bun install + build yapar, PM2 ile (re)start eder.
#
# Slug ve portlar proje.json'dan; VPS bilgileri .secrets/credentials.env'den okunur.
#
#   ./deploy/deploy.sh                # full deploy (backend + admin + frontend)
#   ./deploy/deploy.sh backend        # sadece backend
#   ./deploy/deploy.sh admin          # sadece admin panel
#   ./deploy/deploy.sh frontend       # sadece frontend
#   ./deploy/deploy.sh backend admin  # birden fazla hedef
#   ./deploy/deploy.sh --seed         # backend deploy + db:seed:nodrop (ilk kurulum)
#   ./deploy/deploy.sh --fresh-seed   # backend + DROP+seed (DIKKAT: prod data silinir)
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CRED="$ROOT/.secrets/credentials.env"
[[ -f "$CRED" ]] || { echo "❌ $CRED bulunamadi. deploy/credentials.env.example'i kopyalayip doldurun."; exit 1; }
# shellcheck disable=SC1090
set -a; source "$CRED"; set +a

# ─── proje.json'dan slug + portlar ──────────────────────────────────────────────
read_json() { python3 -c "import json,sys;d=json.load(open('$ROOT/proje.json'));print($1)"; }
SLUG="$(read_json "d['name']")"
BACKEND_PORT="$(read_json "d.get('ports',{}).get('backend','')")"
ADMIN_PORT="$(read_json "d.get('ports',{}).get('admin','')")"
FRONTEND_PORT="$(read_json "d.get('ports',{}).get('frontend','')")"

: "${VPS_USER:?credentials.env icinde VPS_USER yok}"
: "${VPS_HOST:?credentials.env icinde VPS_HOST yok}"
: "${SSH_KEY:?credentials.env icinde SSH_KEY yok}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/$SLUG}"
BUN_BIN="${BUN_BIN:-/usr/local/bin/bun}"

SSH_TARGET="${VPS_USER}@${VPS_HOST}"
SSH_KEY_PATH="${SSH_KEY/#\~/$HOME}"
SSH_OPTS=(-i "$SSH_KEY_PATH" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)

remote()    { ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$@"; }
remote_sh() { ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'bash -s'; }
say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
ok()  { printf '   \033[1;32m✓\033[0m %s\n' "$*"; }

# ─── Argumanlar ─────────────────────────────────────────────────────────────────
TARGETS=()
SEED_MODE=""
for arg in "$@"; do
  case "$arg" in
    backend|admin|frontend) TARGETS+=("$arg") ;;
    all) TARGETS=(backend admin frontend) ;;
    --seed)        SEED_MODE="nodrop" ;;
    --fresh-seed)  SEED_MODE="fresh" ;;
    *) echo "Bilinmeyen arguman: $arg"; exit 2 ;;
  esac
done
[[ ${#TARGETS[@]} -eq 0 ]] && TARGETS=(backend admin frontend)
has() { for t in "${TARGETS[@]}"; do [[ "$t" == "$1" ]] && return 0; done; return 1; }

echo "Proje: $SLUG → $SSH_TARGET:$DEPLOY_PATH  (hedefler: ${TARGETS[*]})"

# ─── 1. Repo → VPS rsync ─────────────────────────────────────────────────────────
say "Repo senkronizasyonu (rsync → $DEPLOY_PATH)"
remote "mkdir -p '$DEPLOY_PATH'"
rsync -avz --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='/node_modules' \
  --exclude='/packages' \
  --exclude='/docs' \
  --exclude='.next/' \
  --exclude='dist/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.secrets/' \
  --exclude='backend/uploads/' \
  --exclude='_referans/' \
  --exclude='*.log' \
  --exclude='*.tsbuildinfo' \
  --exclude='.DS_Store' \
  -e "ssh ${SSH_OPTS[*]}" \
  "$ROOT/" "$SSH_TARGET:$DEPLOY_PATH/"
ok "Senkronize edildi"

# ─── 2. Bun workspaces install ───────────────────────────────────────────────────
say "Bun install (root)"
remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH"
$BUN_BIN install --frozen-lockfile || $BUN_BIN install
BASH
ok "Bagimliliklar kuruldu"

start_app() {
  local suffix="$1" port="$2"
  remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH"
pm2 delete "${SLUG}-${suffix}" 2>/dev/null || true
BUN_BIN="$BUN_BIN" pm2 start ecosystem.config.cjs --only "${SLUG}-${suffix}" --update-env
pm2 save
sleep 3
ss -ltnp | grep ":${port}" >/dev/null || { echo "❌ ${suffix} portu ${port} acik degil"; pm2 logs "${SLUG}-${suffix}" --lines 40 --nostream; exit 1; }
echo "  → port ${port} OK"
BASH
}

# ─── 3. Backend ──────────────────────────────────────────────────────────────────
if has backend; then
  say "Backend build"
  remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH/backend"
rm -rf dist .tsbuildinfo
$BUN_BIN run build
BASH
  ok "Backend build tamam"

  if [[ "$SEED_MODE" == "fresh" ]]; then
    say "DB seed (FRESH — DROP + recreate)"
    remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH/backend"
ALLOW_DROP=true $BUN_BIN run db:seed
BASH
    ok "DB fresh seed tamam"
  elif [[ "$SEED_MODE" == "nodrop" ]]; then
    say "DB seed (no-drop)"
    remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH/backend"
$BUN_BIN run db:seed:nodrop
BASH
    ok "DB seed tamam"
  fi

  say "PM2 (re)start — backend"
  start_app backend "$BACKEND_PORT"
  ok "Backend calisiyor"
fi

# ─── 4. Admin panel ──────────────────────────────────────────────────────────────
if has admin; then
  say "Admin panel build"
  remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH/admin_panel"
rm -rf .next
NODE_ENV=production $BUN_BIN run build
BASH
  ok "Admin build tamam"
  say "PM2 (re)start — admin"
  start_app admin "$ADMIN_PORT"
  ok "Admin calisiyor"
fi

# ─── 5. Frontend ─────────────────────────────────────────────────────────────────
if has frontend; then
  say "Frontend build"
  remote_sh <<BASH
set -euo pipefail
cd "$DEPLOY_PATH/frontend"
rm -rf .next
NODE_ENV=production $BUN_BIN run build
BASH
  ok "Frontend build tamam"
  say "PM2 (re)start — frontend"
  start_app frontend "$FRONTEND_PORT"
  ok "Frontend calisiyor"
fi

# ─── 6. Sonuc ────────────────────────────────────────────────────────────────────
say "PM2 listesi"
remote 'pm2 list' || true
echo
echo "✅ Deploy tamam: $SLUG"
echo "   Production .env / domain ayarlari nginx + her app'in .env'i ile yonetilir (deploy/README.md)."
