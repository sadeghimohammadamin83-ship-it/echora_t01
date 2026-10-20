#!/usr/bin/env bash
# Installs the subagent policy and specialist agents into the user-level Claude Code config.
# - Backs up ~/.claude/CLAUDE.md and ~/.claude/agents/ before touching them.
# - Appends the policy between markers; existing content is never removed or rewritten.
# - Copies agents that are missing; an existing agent with different content is left alone.
# Usage: bash install.sh [--update]
#   --update  replace only the previously installed policy block and agents with this version.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLICY_FILE="$SCRIPT_DIR/subagent-policy.md"
AGENTS_SRC="$SCRIPT_DIR/../.claude/agents"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
TARGET_MD="$CLAUDE_DIR/CLAUDE.md"
TARGET_AGENTS="$CLAUDE_DIR/agents"
BEGIN_MARK="<!-- BEGIN subagent-policy (managed by claude-global/install) -->"
END_MARK="<!-- END subagent-policy -->"

UPDATE=0
if [[ "${1:-}" == "--update" ]]; then UPDATE=1; fi

[[ -f "$POLICY_FILE" ]] || { echo "Missing $POLICY_FILE" >&2; exit 1; }
[[ -d "$AGENTS_SRC" ]] || { echo "Missing $AGENTS_SRC" >&2; exit 1; }

mkdir -p "$CLAUDE_DIR" "$TARGET_AGENTS"

# Back up everything this script may touch.
BACKUP_DIR="$CLAUDE_DIR/backups/subagent-policy-$(date +%Y%m%d-%H%M%S)-$$"
mkdir -p "$BACKUP_DIR"
if [[ -f "$TARGET_MD" ]]; then cp -p "$TARGET_MD" "$BACKUP_DIR/CLAUDE.md"; fi
cp -Rp "$TARGET_AGENTS" "$BACKUP_DIR/agents"
echo "Backup: $BACKUP_DIR"

block() {
  printf '%s\n' "$BEGIN_MARK"
  cat "$POLICY_FILE"
  printf '%s\n' "$END_MARK"
}

if [[ -f "$TARGET_MD" ]] && grep -qF "$BEGIN_MARK" "$TARGET_MD"; then
  if [[ $UPDATE -eq 1 ]]; then
    tmp="$(mktemp)"
    # Compare lines without a trailing CR so a CRLF file is matched too.
    awk -v b="$BEGIN_MARK" -v e="$END_MARK" -v f="$POLICY_FILE" '
      { l = $0; sub(/\r$/, "", l) }
      l == b { print; while ((getline line < f) > 0) print line; skip = 1; next }
      l == e { skip = 0 }
      !skip { print }
    ' "$TARGET_MD" > "$tmp"
    cat "$tmp" > "$TARGET_MD"
    rm -f "$tmp"
    echo "Updated policy block in $TARGET_MD"
  else
    echo "Policy already present in $TARGET_MD (use --update to refresh it)"
  fi
else
  # Separate from existing content with a blank line, then append.
  if [[ -s "$TARGET_MD" ]]; then
    [[ -n "$(tail -c1 "$TARGET_MD")" ]] && printf '\n' >> "$TARGET_MD"
    printf '\n' >> "$TARGET_MD"
  fi
  block >> "$TARGET_MD"
  echo "Appended policy to $TARGET_MD"
fi

for src in "$AGENTS_SRC"/*.md; do
  name="$(basename "$src")"
  dest="$TARGET_AGENTS/$name"
  if [[ ! -e "$dest" ]]; then
    cp "$src" "$dest"; echo "Added agent: $name"
  elif cmp -s "$src" "$dest"; then
    echo "Agent up to date: $name"
  elif [[ $UPDATE -eq 1 ]]; then
    cp "$src" "$dest"; echo "Updated agent: $name (previous copy in backup)"
  else
    echo "Skipped agent with local changes: $name (use --update to replace it)"
  fi
done

echo "Done. Restart Claude Code to load the changes."
