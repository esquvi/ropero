#!/bin/bash
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# Hygiene snapshot at session start. Runs in every environment (local +
# Claude on the web) so drift from previous sessions is impossible to ignore.
echo ""
echo "=== Repo hygiene snapshot ==="

dirty="$(git status --short 2>/dev/null || true)"
if [ -n "$dirty" ]; then
  echo "Working tree is dirty. Triage or commit these before starting new work:"
  printf '%s\n' "$dirty"
else
  echo "Working tree: clean."
fi

gone="$(git branch -vv 2>/dev/null | grep '\[gone\]' || true)"
if [ -n "$gone" ]; then
  echo ""
  echo "Local branches whose upstream was deleted (post-merge leftovers):"
  printf '%s\n' "$gone"
  echo "Run the commit-commands:clean_gone skill to delete them."
fi

echo "=== End snapshot ==="
echo ""

# Claude Code on the web only: install workspaces so tooling works from
# a fresh container. Local sessions manage their own node_modules.
# Uses npm install (not ci) so container caching sticks across sessions
# when the lockfile is unchanged.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  npm install --no-audit --no-fund
fi
