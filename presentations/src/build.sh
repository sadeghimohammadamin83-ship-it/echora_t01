#!/bin/bash
# Usage: ./build.sh deckA_standards.js 01_...pptx   (renders QA images to $QA if set)
set -e
cd "$(dirname "$0")"
export PPTX_SKILL=${PPTX_SKILL:-/root/.claude/skills/synced/c45daeb5-b68e-495d-8ee1-57c039ea4dc5_8b487b43-ea19-4a3c-8dc1-a34fe5e9642f/pptx}
export NODE_PATH="$PWD/node_modules"
node "$1"
python3 "$PPTX_SKILL/scripts/office/validate.py" "../$2" 2>&1 | tail -3
if [ -n "$QA" ]; then
  mkdir -p "$QA"
  python3 "$PPTX_SKILL/scripts/office/soffice.py" --headless --convert-to pdf --outdir "$QA" "$(cd ..; pwd)/$2" >/dev/null 2>&1
  find "$QA" -name 's-*.jpg' -delete
  pdftoppm -jpeg -r 80 "$QA/${2%.pptx}.pdf" "$QA/s"
  ls "$QA"
fi
