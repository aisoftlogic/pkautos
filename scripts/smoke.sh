#!/usr/bin/env bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:3000/healthz}
WEB_AUTOMART_URL=${WEB_AUTOMART_URL:-http://localhost:3001/api/healthz}
WEB_AUTOTRADER_URL=${WEB_AUTOTRADER_URL:-http://localhost:3002/api/healthz}

urls=("$API_URL" "$WEB_AUTOMART_URL" "$WEB_AUTOTRADER_URL")

failures=0
max_attempts=${SMOKE_MAX_ATTEMPTS:-15}
sleep_seconds=${SMOKE_SLEEP_SECONDS:-2}

for u in "${urls[@]}"; do
  echo "Checking $u ..." >&2
  attempt=1
  success=0
  while [ $attempt -le $max_attempts ]; do
    if body=$(curl -fsS --max-time 5 "$u" 2>/dev/null); then
      if echo "$body" | grep -q 'ok'; then
        echo "OK: $u (attempt $attempt)" >&2
        success=1
        break
      fi
    fi
    echo "Waiting ($attempt/$max_attempts) for $u" >&2
    attempt=$((attempt+1))
    sleep $sleep_seconds
  done
  if [ $success -eq 0 ]; then
    echo "FAIL: $u after $max_attempts attempts" >&2
    failures=$((failures+1))
  fi
done

if [ "$failures" -gt 0 ]; then
  echo "Smoke failed ($failures)" >&2
  exit 1
fi

echo "All smoke checks passed." >&2
