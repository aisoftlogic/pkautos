#!/usr/bin/env bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:3000/healthz}
WEB_AUTOMART_URL=${WEB_AUTOMART_URL:-http://localhost:3001/api/healthz}
WEB_AUTOTRADER_URL=${WEB_AUTOTRADER_URL:-http://localhost:3002/api/healthz}

urls=("$API_URL" "$WEB_AUTOMART_URL" "$WEB_AUTOTRADER_URL")

failures=0
for u in "${urls[@]}"; do
  echo "Checking $u ..." >&2
  if curl -fsS "$u" | grep -q 'ok'; then
    echo "OK: $u" >&2
  else
    echo "FAIL: $u" >&2
    failures=$((failures+1))
  fi
done

if [ "$failures" -gt 0 ]; then
  echo "Smoke failed ($failures)" >&2
  exit 1
fi

echo "All smoke checks passed." >&2
