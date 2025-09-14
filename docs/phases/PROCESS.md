# Phase Delivery Process

Lifecycle applied to every phase (0..7):

1. PLAN
   - Define scope, acceptance criteria, tasks (update `tasks/tasks.yaml`).
   - Update `docs/phases/phase-<N>.md` skeleton with sections.
2. BUILD
   - Implement code & infra (Dockerfiles, Helm values, migrations, configs).
   - Keep changes incremental; commit frequently on feature branches.
3. TEST_DOCKER
   - Run unit/integration/contract/e2e tests inside containers only (no host-only).
   - Perform manual checklist items (login flow, SRP facets, etc. per phase scope).
4. TEST_K8S
   - Promote same built images to dev cluster via Helm.
   - Liveness/readiness probes green; run smoke (healthz, critical endpoints) + targeted e2e.
5. DOCS
   - Update phase doc with API diffs, migrations, test evidence (links to reports), risks, rollback.
   - Append `docs/CHANGELOG.md`.
6. COMMIT/CI
   - Ensure CI pipeline green (buildx, Trivy, tests, Helm lint, deploy dev, smoke).
7. GATE
   - Present summary; await approval before starting next phase.

## Tracking Artifacts
- `tasks/tasks.yaml`: master task list (id, phase, status, artifacts).
- `docs/phase-board.md`: Kanban snapshot (Open/Doing/Blocked/Done).
- `docs/phases/phase-<N>.md`: Source of truth for that phase outcomes.
- Git tags: `v0.<N>.0` after GATE approval.

## Test Layers
| Layer | Tooling | Trigger |
|-------|---------|---------|
| Unit | Jest | PR, local docker
| Integration | Jest + Testcontainers | PR, nightly
| Contract | Pact | PR (changed contracts)
| E2E (API/Web) | Playwright | PR (smoke subset), nightly full
| Performance | k6 (smoke, targeted) | Nightly / pre-GATE
| Security | Trivy (images), npm audit, SAST (optional) | PR + nightly

## Quality Gates
- All test layers in-scope for the phase passing.
- Security scan: no HIGH/CRITICAL (allowlist rationale if needed).
- Observability: traces + metrics for new endpoints.
- Rollback plan documented.

## Defer & Capture
If a planned deliverable slips, add rationale under "Deferred Items" in the phase doc and create tasks for next phase linking original ID.
