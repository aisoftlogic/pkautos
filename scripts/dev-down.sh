#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR%/scripts}"
cd "$REPO_ROOT"

echo "[dev-down] Stopping and removing stack (volumes retained unless --purge)."
if [[ "${1:-}" == "--purge" ]]; then
  docker compose down -v --remove-orphans
else
  docker compose down --remove-orphans
fi

echo "[dev-down] Done."
