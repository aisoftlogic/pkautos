#!/usr/bin/env bash
set -euo pipefail

# Configurable attempts and delay
ATTEMPTS=${ATTEMPTS:-15}
SLEEP=${SLEEP:-3}

# Endpoint -> friendly name mapping
ENDPOINTS=(
  "API|http://localhost:3000/healthz"
  "Automart|http://localhost:3001/api/healthz"
  "Autotrader|http://localhost:3002/api/healthz"
  "Grafana|http://localhost:3003/api/health"
  "Prometheus|http://localhost:9090/-/healthy"
  "Loki|http://localhost:3100/ready"
)

failures=0
for pair in "${ENDPOINTS[@]}"; do
  name=${pair%%|*}
  url=${pair#*|}
  echo "==> Checking $name"
  attempt=1
  while [ $attempt -le $ATTEMPTS ]; do
    status=$(curl -fsS -o /dev/null -w '%{http_code}' "$url" || echo "000")
    if [ "$status" = "200" ]; then
      echo "✔ $name healthy (attempt $attempt, $status)"
      break
    fi
    echo ".. $name not ready yet (attempt $attempt/$ATTEMPTS, status=$status)"
    attempt=$((attempt+1))
    sleep $SLEEP
  done
  if [ $attempt -gt $ATTEMPTS ]; then
    echo "✖ $name FAILED after $ATTEMPTS attempts"
    failures=$((failures+1))
  fi
  echo
done

if [ $failures -gt 0 ]; then
  echo "Health-retry summary: $failures failure(s)"
  exit 1
fi

echo "Health-retry summary: all services healthy"
