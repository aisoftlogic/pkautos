# Phase 0 — Initialization

## Scope
Establish repository skeleton, task tracking, CI scaffold, and baseline documentation to enable Phase 1 feature development.

## Acceptance Criteria
- Canonical directory layout present
- Phase docs + CHANGELOG + RUNBOOKS initialized
- tasks.yaml created and populated with Phase 0 items
- CI workflow file stub committed
- Phase board shows tasks in correct columns

## Deferred (Moved to Phase 1)
- docker-compose.yml with full service stack (database, redis, meilisearch, keycloak, observability)
- Helm chart scaffolds (api, web apps) + overlays
- Makefile with standardized targets (build, test, scan, push)
- pnpm workspace + root package config (eslint/prettier/commit hooks)
- OpenAPI stub & health endpoints implementation
- Keycloak realm export + OIDC wiring
- Observability stack (otel-collector, grafana, loki) compose services

## Deliverables
- Repo structure
- tasks/tasks.yaml
- docs/phases/phase-0.md (this file)
- docs/CHANGELOG.md
- docs/RUNBOOKS.md
- .github/workflows/ci.yml (skeleton)

## Tasks Mapping
| Task ID | Title | Status |
|---------|-------|--------|
| T0-001 | Repo skeleton scaffolded | done |
| T0-002 | Placeholder Dockerfiles added | done |
| T0-003 | Tasks register initialized | done |
| T0-004 | Phase documentation templates | done |
| T0-005 | CI workflow skeleton | in_progress |
| T0-006 | Phase 0 plan authored | in_progress |

## Detailed Phase 0 Plan
1. Finalize CI skeleton (current file) with commented templates for matrix build + caching.
2. Add SECURITY.md & CODEOWNERS (Deferred to Phase 1 unless requested earlier).
3. Introduce Makefile with common targets (build, test, scan) — planned for Phase 1.
4. Prepare initial Helm chart scaffolds (namespace + deployment placeholders) — Phase 1.
5. Gate review and tag v0.0.0 after approval.

## Risks & Mitigations
- Tool/version drift → Define versions in CI early.
- Security scanning gaps → Add Trivy stage in skeleton with TODO gates.

## Next Steps (Phase 1 Preview)
- Implement NestJS API bootstrap with health endpoints.
- Initialize Next.js apps with shared UI package + i18n.
- Add PostgreSQL + Prisma schema baseline.

## Test Evidence
N/A for Phase 0 (no runtime code). Verification is structural.

### Structural Verification (Executed)
- Verified required planning docs exist (development, mobile, enhancements).
- Confirmed directory skeleton matches monorepo spec.
- Ensured CI workflow stub present and syntactically valid YAML.
- Created architecture overview consolidating plans.

### Next Validation Steps (Phase 1 Start Criterion)
- Add docker-compose and run `scripts/validate_phase0.sh` (to be added) to re-check structure + new files.
- Execute initial `make build` once Makefile & pnpm config added.
