#!/usr/bin/env bash
# =============================================================================
# fetch-media.sh — Woody referans medyasını CDN'den DOĞRUDAN sunucuya indirir.
#
# Neden: medya 1.2GB (255MB'lik videolar dahil). Git'e girmez, laptoptan rsync
# edilmez. Bunun yerine VPS, emergentagent CDN'inden datacenter hızında indirir.
#
# Kullanım (VPS üzerinde, deploy sonrası):
#   bash deploy/fetch-media.sh
#   # veya hedef dizini override et:
#   MEDIA_DIR=/var/www/woody/frontend/public/media/woody/reference bash deploy/fetch-media.sh
#
# Manifest: deploy/media-manifest.tsv  (satır = "dosyaadı<TAB>url")
# =============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MANIFEST="${MANIFEST:-$SCRIPT_DIR/media-manifest.tsv}"
MEDIA_DIR="${MEDIA_DIR:-$ROOT/frontend/public/media/woody/reference}"

[[ -f "$MANIFEST" ]] || { echo "HATA: manifest yok: $MANIFEST"; exit 1; }
mkdir -p "$MEDIA_DIR"

total=$(grep -c . "$MANIFEST")
echo "Manifest: $MANIFEST  ($total medya)"
echo "Hedef   : $MEDIA_DIR"
echo "─────────────────────────────────────────────"

ok=0; skip=0; fail=0; i=0
declare -a FAILED=()

while IFS=$'\t' read -r fname url; do
  [[ -z "${fname:-}" || -z "${url:-}" ]] && continue
  i=$((i+1))
  out="$MEDIA_DIR/$fname"
  # Zaten varsa ve boş değilse atla (idempotent — tekrar çalıştırılabilir)
  if [[ -s "$out" ]]; then
    skip=$((skip+1)); printf "[%3d/%d] ⏭  var: %s\n" "$i" "$total" "$fname"; continue
  fi
  printf "[%3d/%d] ⬇  %s\n" "$i" "$total" "$fname"
  if wget -q --tries=3 --timeout=60 -O "$out" "$url"; then
    if [[ -s "$out" ]]; then ok=$((ok+1)); else rm -f "$out"; fail=$((fail+1)); FAILED+=("$fname"); fi
  else
    rm -f "$out"; fail=$((fail+1)); FAILED+=("$fname")
  fi
done < "$MANIFEST"

echo "─────────────────────────────────────────────"
echo "Bitti: ✅ $ok indirildi · ⏭ $skip atlandı · ❌ $fail başarısız"
if (( fail > 0 )); then
  printf '  başarısız: %s\n' "${FAILED[@]}"
  echo "Tekrar çalıştırınca sadece eksikler denenir."
  exit 1
fi
echo "Toplam boyut: $(du -sh "$MEDIA_DIR" 2>/dev/null | cut -f1)"
