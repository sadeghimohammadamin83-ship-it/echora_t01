#!/bin/bash
# Build Persian decks + PDFs from the English decks. QA=<dir> also renders JPG previews.
set -e
cd "$(dirname "$0")/.."
SK=${PPTX_SKILL:-/root/.claude/skills/synced/c45daeb5-b68e-495d-8ee1-57c039ea4dc5_8b487b43-ea19-4a3c-8dc1-a34fe5e9642f/pptx}
mkdir -p fa
A="fa/01_استانداردهای_معماری_مجموعه_ورزشی_و_دانشکده"
B="fa/02_تحلیل_نمونه‌های_موردی"
python3 src/fa_apply.py 01_Architectural_Standards_Sports_PE_Faculty.pptx "$A.pptx"
python3 src/fa_apply.py 02_Case_Studies_APSC_and_Charles_University.pptx "$B.pptx"
for f in "$A" "$B"; do
  python3 "$SK/scripts/office/validate.py" "$f.pptx" | tail -1
  python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf --outdir "$PWD/fa" "$PWD/$f.pptx" >/dev/null 2>&1
done
if [ -n "$QA" ]; then
  mkdir -p "$QA"; find "$QA" -name '*.jpg' -delete
  pdftoppm -jpeg -r 80 "$A.pdf" "$QA/a"; pdftoppm -jpeg -r 80 "$B.pdf" "$QA/b"
fi
