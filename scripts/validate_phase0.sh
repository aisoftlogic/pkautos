#!/usr/bin/env bash
set -euo pipefail

missing=()
check() { [ -e "$1" ] || missing+=("$1"); }

# Required directories
for d in apps/api apps/web-automart apps/web-autotrader packages/ui packages/schemas packages/config infra/docker infra/helm infra/k8s/dev docs/phases tasks .github/workflows; do
  check "$d"
done

# Required files (skeleton)
for f in docs/phases/phase-0.md tasks/tasks.yaml .github/workflows/ci.yml Makefile docs/CHANGELOG.md docs/RUNBOOKS.md docs/architecture/overview.md; do
  check "$f"
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "[FAIL] Missing artifacts:" >&2
  printf ' - %s\n' "${missing[@]}" >&2
  exit 1
fi

echo "[OK] Phase 0 structural artifacts present."
