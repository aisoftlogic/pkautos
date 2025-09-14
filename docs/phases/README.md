# Phase Tracking Overview

Each phase has a dedicated file: `phase-<N>.md` capturing scope, acceptance criteria, changes (API, DB, Infra), test evidence, risks, rollback, and deferred items.

Supporting trackers:
- `tasks/tasks.yaml`: master task register with phase linkage.
- `docs/phase-board.md`: lightweight Kanban snapshot (Open/Doing/Blocked/Done).
- `docs/phases/PROCESS.md`: lifecycle definition (PLAN -> BUILD -> TEST_DOCKER -> TEST_K8S -> DOCS -> COMMIT/CI -> GATE).

Gating:
- Completion of acceptance criteria + green quality gates triggers a GATE prompt.
- Approval at GATE results in tagging `v0.<N>.0` and moving to next phase planning.

Deferred Items:
- Any unmet deliverable is explicitly listed under Deferred in its phase doc and new tasks appended to `tasks/tasks.yaml` for the next phase.
