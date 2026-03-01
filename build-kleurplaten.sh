#!/usr/bin/env bash
# build-kleurplaten.sh
# Scans kleurplaten/*.svg and generates:
#   1. kleurplaten/index.json  — list of coloring pages
#   2. Updates sw.js           — cache entries + version bump
#
# Usage:  bash build-kleurplaten.sh
# Called automatically by GitHub Actions on push.

set -euo pipefail
cd "$(dirname "$0")"

DIR="kleurplaten"

# ── 1. Collect SVG files (sorted alphabetically) ─────────────────────
shopt -s nullglob
svgs=("$DIR"/*.svg)
shopt -u nullglob

if [ ${#svgs[@]} -eq 0 ]; then
    echo "No SVG files found in $DIR/"
    exit 1
fi

# ── 2. Generate index.json ────────────────────────────────────────────
{
    echo '{'
    echo '  "pages": ['
    count=0
    total=${#svgs[@]}
    for svg in "${svgs[@]}"; do
        base="$(basename "$svg" .svg)"
        name="$(echo "$base" | tr '_-' '  ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')"
        count=$((count + 1))
        if [ "$count" -lt "$total" ]; then
            printf '    { "file": "%s.svg", "name": "%s" },\n' "$base" "$name"
        else
            printf '    { "file": "%s.svg", "name": "%s" }\n' "$base" "$name"
        fi
    done
    echo '  ]'
    echo '}'
} > "$DIR/index.json"

echo "Generated $DIR/index.json with ${#svgs[@]} page(s)"

# ── 3. Update sw.js ──────────────────────────────────────────────────
swfile="sw.js"
if [ ! -f "$swfile" ]; then
    echo "Error: $swfile not found"
    exit 1
fi

# Read the entire file into memory first (avoid read/write conflict)
sw_content="$(cat "$swfile")"

# Extract current cache version number and bump it
current_version=$(echo "$sw_content" | grep -o 'noors-games-v[0-9]*' | head -1 | grep -o '[0-9]*')
new_version=$((current_version + 1))

# Collect existing non-kleurplaten, non-public cache entries
existing_entries=()
in_array=false
while IFS= read -r line; do
    if echo "$line" | grep -q 'urlsToCache = \['; then
        in_array=true
        continue
    fi
    if [ "$in_array" = true ] && echo "$line" | grep -q '^\];'; then
        in_array=false
        continue
    fi
    if [ "$in_array" = true ]; then
        if echo "$line" | grep -q '/kleurplaten/'; then continue; fi
        if echo "$line" | grep -q '/public/'; then continue; fi
        cleaned=$(echo "$line" | sed 's/,$//')
        if [ -n "$(echo "$cleaned" | tr -d '[:space:]')" ]; then
            existing_entries+=("$cleaned")
        fi
    fi
done <<< "$sw_content"

# Collect everything after the closing "];" of the cache array
rest_of_file=""
past_array=false
while IFS= read -r line; do
    if [ "$past_array" = true ]; then
        rest_of_file="${rest_of_file}${line}
"
    fi
    if echo "$line" | grep -q '^\];'; then
        past_array=true
    fi
done <<< "$sw_content"

# Build new sw.js
{
    echo "const CACHE_NAME = 'noors-games-v${new_version}';"
    echo "const urlsToCache = ["

    # Existing entries (with trailing commas)
    for entry in "${existing_entries[@]}"; do
        echo "${entry},"
    done

    # Kleurplaten entries
    echo "    '/kleurplaten/index.json',"
    count=0
    total=${#svgs[@]}
    for svg in "${svgs[@]}"; do
        base="$(basename "$svg")"
        count=$((count + 1))
        if [ "$count" -lt "$total" ]; then
            echo "    '/kleurplaten/${base}',"
        else
            echo "    '/kleurplaten/${base}'"
        fi
    done

    echo "];"

    # Rest of the file (event listeners etc.)
    printf '%s' "$rest_of_file"
} > "$swfile"

echo "Updated $swfile (cache v${new_version}, ${#svgs[@]} kleurplaten)"
