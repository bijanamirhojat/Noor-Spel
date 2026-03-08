#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

python3 - <<'PY' "${ROOT_DIR}"
import json
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
kleurplaten_dir = root / "kleurplaten"
sw_path = root / "sw.js"
index_path = kleurplaten_dir / "index.json"

svg_files = sorted(kleurplaten_dir.glob("*.svg"))
if not svg_files:
    raise SystemExit("No SVG files found in kleurplaten/")

pages = []
for svg in svg_files:
    stem = svg.stem
    readable = " ".join(part.capitalize() for part in re.split(r"[_-]+", stem) if part)
    pages.append({"file": f"{stem}.svg", "name": readable})

index_path.write_text(
    json.dumps({"pages": pages}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"Generated {index_path} with {len(pages)} page(s)")

sw_content = sw_path.read_text(encoding="utf-8")

base_entries = []
for line in sw_content.splitlines():
    stripped = line.strip()
    if not stripped.startswith("'./"):
        continue
    if not stripped.endswith("',") and not stripped.endswith("'"):
        continue
    entry = stripped.rstrip(",")
    if entry.startswith("'./kleurplaten/"):
        continue
    base_entries.append(entry)

if not base_entries:
    raise SystemExit("Could not parse PRECACHE_URLS in sw.js")

kleur_entries = ["'./kleurplaten/index.json'"] + [
    f"'./kleurplaten/{svg.name}'" for svg in svg_files
]

all_entries = base_entries + kleur_entries
precache_block = "const PRECACHE_URLS = [\n" + "\n".join(
    f"    {entry}{',' if i < len(all_entries) - 1 else ''}" for i, entry in enumerate(all_entries)
) + "\n];"

updated = re.sub(
    r"const PRECACHE_URLS = \[(?:.|\n)*?\n\];",
    precache_block,
    sw_content,
    count=1,
)

if updated != sw_content:
    sw_path.write_text(updated, encoding="utf-8")
    print(f"Updated {sw_path} with {len(kleur_entries)} kleurplaten cache entries")
else:
    print(f"No sw.js precache changes needed ({len(kleur_entries)} kleurplaten entries)")
PY
