#!/usr/bin/env bash
set -euo pipefail

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use >/dev/null
elif command -v node >/dev/null 2>&1; then
  node_major="$(node -v | sed 's/^v//' | cut -d. -f1)"
  if [[ "${node_major}" -lt 20 ]]; then
    echo "Node 20+ is required. Install nvm and run: nvm install && nvm use" >&2
    exit 1
  fi
fi

exec "$@"
