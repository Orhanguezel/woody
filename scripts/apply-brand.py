#!/usr/bin/env python3
"""Marka sablonunu projeye uygular: AppName tokenlari ve kalan urun kalintilari."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def replace_brand_tokens(text: str, name: str, slug: str) -> str:
    out = text
    pairs = [
        ("AppName Admin", f"{name} Admin"),
        ("AppName", name),
        ("TarMinGO", name),
        ("tarmingo", slug.lower()),
        ("TARMINGO", slug.upper().replace("-", "_")),
        ("TarGO", name),
    ]
    for old, new in pairs:
        out = out.replace(old, new)
    return out


def patch_site_defaults(path: Path, name: str) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))

    def walk(o: object) -> object:
        if isinstance(o, dict):
            return {k: walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v) for v in o]
        if isinstance(o, str):
            if o == "AppName":
                return name
            return o
        return o

    updated = walk(data)
    path.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if len(sys.argv) < 4:
        print("Kullanim: apply-brand.py <repo_root> <gorunen_ad> <slug>", file=sys.stderr)
        sys.exit(1)
    root = Path(sys.argv[1]).resolve()
    name = sys.argv[2].strip()
    slug = sys.argv[3].strip()
    if not name or not slug:
        print("Ad ve slug bos olamaz.", file=sys.stderr)
        sys.exit(1)

    site_defaults = root / "frontend/src/config/site-defaults.json"
    if site_defaults.is_file():
        patch_site_defaults(site_defaults, name)

    proje_path = root / "proje.json"
    if proje_path.is_file():
        data = json.loads(proje_path.read_text(encoding="utf-8"))
        data["name"] = slug
        notes = data.get("notes", [])
        if isinstance(notes, list):
            data["notes"] = [
                n
                for n in notes
                if isinstance(n, str)
                and "TarMinGO" not in n
                and "tarmingo" not in n.lower()
                and "apply-brand.py" not in n
            ]
            data["notes"].insert(0, f"Marka: {name} ({slug}) — scripts/apply-brand.py")
            data["notes"] = data["notes"][:8]
        data["description"] = f"{name} icin backend + frontend + admin panel"
        proje_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    text_files = [
        root / "backend/src/db/seed/sql/004_site_settings_schema.sql",
        root / "backend/src/db/seed/sql/012_home_sections_schema.sql",
        root / "backend/src/db/seed/sql/013_theme_presets_seed.sql",
        root / "frontend/public/offline.html",
    ]
    for path in text_files:
        if not path.is_file():
            continue
        raw = path.read_text(encoding="utf-8")
        out = replace_brand_tokens(raw, name, slug)
        if path.name == "013_theme_presets_seed.sql":
            out = out.replace("günlük quiz ve sınav hazırlığı", "kurumsal web ve içerik arayüzü")
            out = out.replace("TarMinGO tema kataloğu", "Tema kataloğu (design_tokens + presets)")
        path.write_text(out, encoding="utf-8")

    print(f"apply-brand: tamamlandi -> {name} ({slug})")


if __name__ == "__main__":
    main()
