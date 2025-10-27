#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")" || exit 1

find public -type f -name '*.html' -print0 | while IFS= read -r -d '' file; do
  # Skip files that already include our firebase.js tag
  if grep -q "js/firebase.js" "$file"; then
    echo "Skipping (already updated): $file"
    continue
  fi
  echo "Adding module scripts to: $file"
  sed -i "/<\/body>/i <script type=\"module\" src=\"./js/firebase.js\"></script>\n<script type=\"module\" src=\"./js/main.js\"></script>" "$file"
done

echo "Done. Start Live Server and verify navigation."
