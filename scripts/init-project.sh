#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Kullanim:
  bash scripts/init-project.sh --name "Proje Adi" --slug "proje-slug" [secenekler]

Zorunlu:
  --name            Gorunen proje adi (or. "Ornek Proje")
  --slug            Teknik slug (or. "ornek-proje")

Opsiyonel:
  --db              Veritabani adi (varsayilan: <slug>_db)
  --backend-port    Backend portu (varsayilan: 8086)
  --frontend-port   Frontend portu (varsayilan: 3077)
  --admin-port      Admin panel portu (varsayilan: 3096)
  --force           Mevcut env dosyalarina da degisiklik uygula
  --brand-only      Sadece marka/token (apply-brand): .env dokunmaz
EOF
}

PROJECT_NAME=""
PROJECT_SLUG=""
DB_NAME=""
BACKEND_PORT="8086"
FRONTEND_PORT="3077"
ADMIN_PORT="3096"
FORCE_UPDATE="false"
BRAND_ONLY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      PROJECT_NAME="${2:-}"
      shift 2
      ;;
    --slug)
      PROJECT_SLUG="${2:-}"
      shift 2
      ;;
    --db)
      DB_NAME="${2:-}"
      shift 2
      ;;
    --backend-port)
      BACKEND_PORT="${2:-}"
      shift 2
      ;;
    --frontend-port)
      FRONTEND_PORT="${2:-}"
      shift 2
      ;;
    --admin-port)
      ADMIN_PORT="${2:-}"
      shift 2
      ;;
    --force)
      FORCE_UPDATE="true"
      shift
      ;;
    --brand-only)
      BRAND_ONLY="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Bilinmeyen arguman: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_NAME" || -z "$PROJECT_SLUG" ]]; then
  echo "--name ve --slug zorunludur." >&2
  usage
  exit 1
fi

if [[ -z "$DB_NAME" ]]; then
  DB_NAME="${PROJECT_SLUG//-/_}_db"
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/proje.json" ]]; then
  echo "proje.json bulunamadi: $ROOT_DIR/proje.json" >&2
  exit 1
fi

if [[ "$BRAND_ONLY" == "true" ]]; then
  python3 "$ROOT_DIR/scripts/apply-brand.py" "$ROOT_DIR" "$PROJECT_NAME" "$PROJECT_SLUG"
  echo
  echo "Marka guncellemesi tamamlandi: $PROJECT_NAME ($PROJECT_SLUG)"
  exit 0
fi

cp_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ -f "$dst" ]]; then
    echo "Atlandi (zaten var): $dst"
    return 1
  fi
  cp "$src" "$dst"
  echo "Olusturuldu: $dst"
  return 0
}

replace_in_file() {
  local file="$1"
  local key="$2"
  local value="$3"
  python3 - "$file" "$key" "$value" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]
text = path.read_text(encoding="utf-8")
updated = []
for line in text.splitlines():
    if line.startswith(f"{key}="):
        updated.append(f"{key}={value}")
    else:
        updated.append(line)
path.write_text("\n".join(updated) + "\n", encoding="utf-8")
PY
}

BACKEND_ENV_EXAMPLE="$ROOT_DIR/backend/.env.example"
FRONTEND_ENV_EXAMPLE="$ROOT_DIR/frontend/.env.example"
ADMIN_ENV_EXAMPLE="$ROOT_DIR/admin_panel/.env.example"

BACKEND_ENV="$ROOT_DIR/backend/.env"
FRONTEND_ENV="$ROOT_DIR/frontend/.env.local"
ADMIN_ENV="$ROOT_DIR/admin_panel/.env.local"

BACKEND_CREATED="false"
FRONTEND_CREATED="false"
ADMIN_CREATED="false"
if cp_if_missing "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV"; then BACKEND_CREATED="true"; fi
if cp_if_missing "$FRONTEND_ENV_EXAMPLE" "$FRONTEND_ENV"; then FRONTEND_CREATED="true"; fi
if cp_if_missing "$ADMIN_ENV_EXAMPLE" "$ADMIN_ENV"; then ADMIN_CREATED="true"; fi

should_update_file() {
  local created="$1"
  if [[ "$FORCE_UPDATE" == "true" || "$created" == "true" ]]; then
    return 0
  fi
  return 1
}

if should_update_file "$BACKEND_CREATED"; then
  replace_in_file "$BACKEND_ENV" "PORT" "$BACKEND_PORT"
  replace_in_file "$BACKEND_ENV" "DB_NAME" "$DB_NAME"
  replace_in_file "$BACKEND_ENV" "PUBLIC_URL" "http://localhost:${BACKEND_PORT}"
  replace_in_file "$BACKEND_ENV" "FRONTEND_URL" "http://localhost:${FRONTEND_PORT}"
  replace_in_file "$BACKEND_ENV" "JWT_SECRET" "${PROJECT_SLUG}-jwt-secret-change-in-production"
  replace_in_file "$BACKEND_ENV" "COOKIE_SECRET" "${PROJECT_SLUG}-cookie-secret-change-in-production"
fi

if should_update_file "$FRONTEND_CREATED"; then
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_API_URL" "http://127.0.0.1:${BACKEND_PORT}/api/v1"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_SITE_URL" "http://localhost:${FRONTEND_PORT}"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_APP_URL" "http://localhost:${FRONTEND_PORT}"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_APP_NAME" "$PROJECT_NAME"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_APP_COPYRIGHT" "$PROJECT_NAME"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_BRAND_WORD_MARK_LINE1" "$PROJECT_NAME"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_COOKIE_CONSENT_KEY_PREFIX" "$PROJECT_SLUG"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_ANALYTICS_CONSENT_EVENT" "${PROJECT_SLUG}_consent_update"
  replace_in_file "$FRONTEND_ENV" "NEXT_PUBLIC_ANALYTICS_PAGE_VIEW_EVENT" "${PROJECT_SLUG}_page_view"
fi

if should_update_file "$ADMIN_CREATED"; then
  replace_in_file "$ADMIN_ENV" "PANEL_API_URL" "http://127.0.0.1:${BACKEND_PORT}"
  replace_in_file "$ADMIN_ENV" "NEXT_PUBLIC_API_URL" "http://127.0.0.1:${BACKEND_PORT}/api/v1"
  replace_in_file "$ADMIN_ENV" "NEXT_PUBLIC_API_BASE_URL" "http://127.0.0.1:${BACKEND_PORT}/api/v1"
  replace_in_file "$ADMIN_ENV" "NEXT_PUBLIC_SITE_URL" "http://localhost:${ADMIN_PORT}"
  replace_in_file "$ADMIN_ENV" "NEXT_PUBLIC_APP_NAME" "${PROJECT_NAME} Admin"
  replace_in_file "$ADMIN_ENV" "NEXT_PUBLIC_APP_COPYRIGHT" "$PROJECT_NAME"
  replace_in_file "$ADMIN_ENV" "NEXT_PUBLIC_APP_DESCRIPTION" "${PROJECT_NAME} yonetim paneli."
fi

# proje.json'a portlari yaz (root ecosystem.config.cjs + deploy.sh bunlari okur)
python3 - "$ROOT_DIR/proje.json" "$BACKEND_PORT" "$ADMIN_PORT" "$FRONTEND_PORT" <<'PY'
import json
import sys

path, backend, admin, frontend = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
data = json.loads(open(path, encoding="utf-8").read())
data["ports"] = {"backend": backend, "admin": admin, "frontend": frontend}
open(path, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
PY

python3 "$ROOT_DIR/scripts/apply-brand.py" "$ROOT_DIR" "$PROJECT_NAME" "$PROJECT_SLUG"

echo
echo "Kurulum tamamlandi."
echo "- Proje: $PROJECT_NAME ($PROJECT_SLUG)"
echo "- Backend:  http://localhost:$BACKEND_PORT"
echo "- Frontend: http://localhost:$FRONTEND_PORT"
echo "- Admin:    http://localhost:$ADMIN_PORT"
