#!/usr/bin/env bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:3000/healthz}
WEB_AUTOMART_URL=${WEB_AUTOMART_URL:-http://localhost:3001/api/healthz}
WEB_AUTOTRADER_URL=${WEB_AUTOTRADER_URL:-http://localhost:3002/api/healthz}
GRAFANA_URL=${GRAFANA_URL:-http://localhost:3003/api/health}
PROMETHEUS_URL=${PROMETHEUS_URL:-http://localhost:9090/-/healthy}
LOKI_URL=${LOKI_URL:-http://localhost:3100/ready}

urls=("$API_URL" "$WEB_AUTOMART_URL" "$WEB_AUTOTRADER_URL" "$GRAFANA_URL" "$PROMETHEUS_URL" "$LOKI_URL")

failures=0
max_attempts=${SMOKE_MAX_ATTEMPTS:-5}
sleep_seconds=${SMOKE_SLEEP_SECONDS:-2}

for u in "${urls[@]}"; do
  echo "Checking $u ..." >&2
  attempt=1
  success=0
  while [ $attempt -le $max_attempts ]; do
    if body=$(curl -fsS --max-time 5 "$u" 2>/dev/null); then
      # Flexible success heuristic: any of 'ok', 'healthy', 'ready', HTTP 200 with JSON returns.
      if echo "$body" | grep -Eqi 'ok|healthy|ready' || [ -n "$body" ]; then
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
