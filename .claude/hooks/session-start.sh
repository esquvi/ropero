#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web. Local sessions have their own setup.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# Install workspaces. Uses npm install (not ci) so container caching sticks
# across sessions when lockfile is unchanged.
npm install --no-audit --no-fund
