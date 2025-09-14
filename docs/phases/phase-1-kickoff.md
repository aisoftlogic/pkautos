# Phase 1 Kickoff — Auth, Tenancy, RBAC

## Objectives
Establish foundation for identity, org/branch multi-tenancy, and role-based access. Provide minimal running API + web shells through docker-compose and Helm scaffolds.

## Scope (Must)
- pnpm monorepo config, lint/format (ESLint, Prettier, commit hooks)
- NestJS API bootstrap (healthz, readyz, OpenAPI stub)
- Prisma init + models: Org, Branch, User, Audit
- Keycloak realm export, OIDC PKCE integration (web) + JWT guards (api)
- docker-compose baseline stack (postgres, redis, meilisearch placeholder, keycloak, otel-collector, grafana, loki, minio, api, webs)
- Helm charts + dev overlay (api + webs + shared configs)
- Makefile real targets replacing placeholders (build, test, scan, push, compose)
- Observability: OTel SDK instrumentation + collector config + basic dashboards placeholders

## Deferred / Nice-to-have
- Pact contract test skeleton
- k6 smoke script baseline
- Semantic search placeholder

## Tasks Mapping
| Task | ID | Notes |
|------|----|-------|
| docker-compose baseline | T1-001 | Full service definitions + healthchecks |
| Helm charts & overlays | T1-002 | api/webs initial values + ingress stubs |
| pnpm workspace + lint config | T1-003 | Root package.json, .npmrc, eslint/prettier |
| API health + OpenAPI | T1-004 | Swagger module, /healthz /readyz |
| Makefile real targets | T1-005 | Build multi-arch, test, scan, push |
| Keycloak realm + OIDC wiring | T1-006 | Realm JSON, client config |
| Observability in compose | T1-007 | otel-collector, grafana, loki services |

## Acceptance Criteria
- `pnpm install` succeeds; lint passes
- `docker compose up` brings full stack healthy; /healthz & /readyz return 200
- Prisma migration for initial models applied
- Keycloak login flow works (authorization code PKCE) for web apps
- OpenAPI JSON generated & stored as CI artifact
- Images scanned (no HIGH/CRITICAL without justification)
- Helm install in dev namespace deploys api + webs with green probes

## Test Plan
Layer | Coverage
------|---------
Unit | Basic service/provider tests (config, health controller)
Integration | Prisma test containers (PG) verifying model CRUD, tenancy scoping
E2E | Playwright: login flow (OIDC), health endpoints, user CRUD
Security | Trivy scan in CI
Observability | Trace spans visible, minimal dashboard JSON committed

## Risks
- Keycloak complexity → mitigate with small realm export & scripted import
- Multi-arch build time → use buildx cache layers early
- Flaky OIDC redirect handling in dev → standardize on configured hostnames

## Rollback Strategy
If Phase 1 deployment fails, revert to v0.0.0 tag (structure only) and disable Helm release (api/web) until fixed.

## Next (Phase 2 Preview)
Inventory + Listing models & search integration.
