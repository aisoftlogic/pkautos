# pkautos Monorepo

## Stack
- API: NestJS 10 (Node 22)
- Web: Next.js 14 standalone runtime (two apps)
- Package manager: pnpm (pinned via corepack)
- CI: GitHub Actions (tests, build, smoke, Trivy scan)

## Quick Start
```bash
pnpm install --frozen-lockfile
docker compose build
docker compose up -d api web-automart web-autotrader
SMOKE_MAX_ATTEMPTS=30 SMOKE_SLEEP_SECONDS=2 bash scripts/smoke.sh
```

## Scripts
- API tests: `pnpm --filter @pkautos/api test`
- Web tests: `pnpm --filter @pkautos/web-automart test`, `pnpm --filter @pkautos/web-autotrader test`

## Release
Tag the repo (e.g. `git tag v0.1.0 && git push origin v0.1.0`) to build & push images to GHCR.

## Manual Visual Test Checklist
1. API Health
   - Open http://localhost:3000/healthz → `{ "status": "ok" }`
2. Web App Health (Automart)
   - http://localhost:3001/api/healthz → `{ "status": "ok" }`
3. Web App Health (Autotrader)
   - http://localhost:3002/api/healthz → `{ "status": "ok" }`
4. Navigation
   - Start `pnpm --filter @pkautos/web-automart dev` and confirm hot reload.
5. 404 Page
   - Visit /non-existent path returns Next.js 404.
6. Cache Behavior
   - Hard reload pages; ensure no server errors in container logs.
7. Container Logs
   - `docker compose logs -f web-automart` while browsing to ensure clean startup.
8. Performance Smoke
   - Load homepage twice; second load should leverage Next static/edge caching if configured later.

## Security Scan
Trivy job runs automatically in CI (fails on HIGH/CRITICAL).

## Adding a New Package
1. Create directory under `packages/your-pkg`
2. Add `package.json`
3. `pnpm install`
4. Reference from apps with dependency.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| pnpm not found | `corepack enable && corepack prepare pnpm@10.15.0 --activate` |
| Docker build fails on public COPY | Ensure app public dir exists or remove COPY line (already handled) |
| Health endpoint failing | Check container logs, ensure PORT env matches compose mapping |

## Future Enhancements
- OpenTelemetry metrics
- DB migrations & e2e with seeded data
- Coverage thresholds and reporting

## Tracing (OpenTelemetry)
The API initializes OpenTelemetry on startup via `src/tracing.ts`.

Environment variables:
- `OTEL_SERVICE_NAME` (default: `@pkautos/api`)
- `OTEL_EXPORTER_OTLP_ENDPOINT` (default: `http://otel-collector:4318/v1/traces`)
- `OTEL_TEST_EXPORTER=inmemory` enables an in-memory span exporter (used in CI for span assertions without a collector)

Local collector is included in `docker-compose.yml` (`otel-collector` service). Spans are exported over OTLP HTTP.

Manual custom span endpoint:
`GET /otel/ping` – Creates a span named `custom_demo_operation` with attribute `demo.attribute=value`.

Check collector logs for spans:
```bash
docker compose logs --no-color otel-collector | grep -Ei 'Export|span'
```

Run only the OTel test locally:
```bash
OTEL_TEST_EXPORTER=inmemory pnpm --filter @pkautos/api test -- otel-demo.e2e.spec.ts
```

If adding new instrumentation, place configuration in `src/tracing.ts`.

## Observability Stack (Local Docker)
Added services:
- Prometheus (scrapes API metrics) → http://localhost:9090
- Loki (log aggregation) → http://localhost:3100 (API)
- Grafana (dashboards) → http://localhost:3003 (admin/admin)
- Promtail (ships host/container logs to Loki)

Bring everything up (including dashboards):
```bash
docker compose up -d api web-automart web-autotrader prometheus loki promtail grafana otel-collector
```

Check Prometheus targets: http://localhost:9090/targets

Create a quick panel in Grafana using the Prometheus datasource with query:
```
process_cpu_user_seconds_total{job="api"}
```

View logs in Grafana Explore choosing Loki datasource and `{job="docker-logs"}`.
# PKAutos Monorepo

Monorepo housing backend API and multiple web frontends.

## Structure

- `apps/api` – NestJS API (Fastify) with health endpoints `/healthz`, `/readyz`.
- `apps/web-automart` – Next.js app.
- `apps/web-autotrader` – Next.js app.
- `packages/*` – Shared libraries (schemas, ui, config, etc.).

## Quick Start (API Only)

```bash
# Build API image
docker compose build api
# Run API + postgres only
docker compose up -d postgres api
# Check health
curl -sf http://localhost:3000/healthz
```

## Full Stack

```bash
docker compose up -d --build
```

## Development Notes

Current container build for API uses npm for stability. Plan to revert to pnpm workspaces after stabilization.

## Health Endpoints
- `GET /healthz` -> `{ "status": "ok" }`
- `GET /readyz` -> `{ "status": "ready" }` (placeholder)

## Next Steps
- Add persistence layer (Prisma + migrations)
- Introduce caching (Redis) & background jobs
- Add Auth (Keycloak integration)
- Observability (metrics, tracing)
