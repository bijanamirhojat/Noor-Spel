#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INDEX_FILE="${ROOT_DIR}/index.html"

if [[ ! -f "${INDEX_FILE}" ]]; then
  echo "index.html not found at ${INDEX_FILE}" >&2
  exit 1
fi

TS="$(date -u +%Y%m%d-%H%M%S)"
SHA_SHORT="${GITHUB_SHA:-local}"
SHA_SHORT="${SHA_SHORT:0:7}"
NEW_RELEASE_ID="${TS}-${SHA_SHORT}"

python3 - <<'PY' "${INDEX_FILE}" "${NEW_RELEASE_ID}"
import pathlib
import re
import sys

index_path = pathlib.Path(sys.argv[1])
release_id = sys.argv[2]

content = index_path.read_text(encoding="utf-8")
updated = re.sub(
    r"const RELEASE_ID = '[^']+';",
    f"const RELEASE_ID = '{release_id}';",
    content,
    count=1,
)

if updated == content:
    raise SystemExit("Could not find RELEASE_ID constant in index.html")

index_path.write_text(updated, encoding="utf-8")
print(f"Updated RELEASE_ID to {release_id}")
PY
