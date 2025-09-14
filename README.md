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
