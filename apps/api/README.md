# API Service

NestJS (Fastify) service providing foundational health endpoints.

## Run with Docker
```bash
docker compose build api
docker compose up -d postgres api
curl -sf http://localhost:3000/healthz
```

## Health Endpoints
- `GET /healthz` -> `{ "status": "ok" }`
- `GET /readyz` -> `{ "status": "ready" }` (placeholder)

## Development
Uses npm inside container for stability; will reintroduce pnpm workspace optimization later.

### Rebuild after dependency changes
```bash
docker compose build --no-cache api
```

## Planned Enhancements
- Prisma + migrations
- Redis (cache + BullMQ)
- Meilisearch
- Keycloak auth
- Observability (metrics, tracing)

## Troubleshooting
```bash
# Tail logs
docker compose logs api | tail -50
# Recreate container
docker compose rm -sf api && docker compose up -d api
```
