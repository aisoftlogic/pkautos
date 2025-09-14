#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR%/scripts}"
cd "$REPO_ROOT"

if ! command -v docker >/dev/null; then
  echo "docker not installed" >&2
  exit 1
fi

echo "[dev-up] Bringing stack up..."
docker compose up -d --build

echo "[dev-up] Running health checks..."
make -s health || true

echo "[dev-up] Done."
