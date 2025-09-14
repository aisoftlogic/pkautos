# **Autotrader.pk + Automart.pk — One-Document PRD/SDD with 7 Phases (Docker→K8s, Copilot-Ready)**

## **0) Executive Summary (Pakistan-focused)**

* **Goal:** Build **Automart.pk (B2C marketplace)** and **Autotrader.pk (Dealer CRM/B2B)** on one enterprise-ready, scalable stack, operated by one person + AI/Copilot.
* **Principle:** **Docker-first**: all dev/test in Docker; the **same images** are deployed to **Kubernetes** (DOKS). No “local host-only” runs.
* **Stack:** Next.js (web), NestJS (API), PostgreSQL, Redis, Meilisearch, Keycloak (SSO), S3-compatible storage (DO Spaces) + Cloudflare CDN, BullMQ, OpenTelemetry, Prometheus/Grafana/Loki, Sentry.
* **Regions:** DigitalOcean **Bangalore/Mumbai (if available) or Singapore**; Cloudflare CDN/WAF; SMS/Payments (JazzCash/Easypaisa/PayFast); Urdu/English (RTL).
* **Monorepo:** single repo, multi-app; CI builds multi-arch images; CD to DOKS via Argo CD or GH Actions + Helm.

---

## **1) Tech/Infra Snapshot**

* **Apps:** **web-automart** (B2C), **web-dealer** (B2B), **api** (NestJS).
* **Services:**auth/keycloak**, **inventory**, **media**, **feeds**, **leads**, **pricing**, **billing**, **webhooks**, **sync** (to legacy channels if needed).**
* **Data:** PostgreSQL (Managed), Redis (Managed), Meilisearch (Managed 1GB), DO Spaces (media).
* **CI/CD:** GitHub Actions (Buildx, cache, Trivy scan, push to GHCR), Helm + Kustomize overlays (dev/stage/prod), Argo CD optional.
* **Security:** OIDC, 2FA admin, JWT rotation, rate-limits, device fingerprinting, SOPS (age) or Doppler for secrets, signed media URLs, PII columns encrypted.
* **Observability:** OTel SDK → OTLP gateway; Prometheus/Grafana/Loki (docker-compose and K8s); Sentry.

---

## **2) Repository Layout (monorepo)**

```
pk-auto/
  apps/
    api/                # NestJS
    web-automart/       # Next.js (B2C)
    web-dealer/         # Next.js (B2B)
  packages/
    ui/                 # shared React components
    schemas/            # zod/prisma types
    config/             # eslint, tsconfig, prettier, commitlint
    scripts/            # db seed, migrations, tooling
  infra/
    docker/             # docker-compose.yml, env templates, Makefile
    k8s/
      base/             # Helm charts / manifests
      overlays/
        dev/
        stage/
        prod/
    helm/               # charts per app
    terraform/          # DO + Spaces + DOKS (optional)
  docs/
    PRD_SDD.md          # this document
    API.md              # OpenAPI
    RUNBOOKS.md
  .github/workflows/    # CI/CD pipelines
```

**Image/tag scheme**

* **Registry: ****GHCR** → ghcr.io/`<org>`/api:<semver|-rc|-sha>
* **Tags: **v0.1.0**, **v0.1.0-rc.1**, **sha-`<short>`

**Make targets (docker)**

```
make build      # build all images with buildx
make up         # docker-compose up -d
make test       # run unit + e2e in containers
make scan       # trivy image scans
make seed       # seed DB
make push       # push to GHCR
```

---

## **3) Global Conventions**

* **i18n:** EN/UR, RTL toggle; Number/PKR formatting.
* **Tenancy:** org/branch/user roles (Owner, Manager, Sales, Ops, Finance, ReadOnly).
* **Visibility:**public | wholesale_public | private**; Channel: **automart | autotrader**.**
* **DoD (per phase):** passing unit+integration tests in Docker, manual checklist passed in Docker, images signed/pushed, Helm values updated, K8s deploy green, smoke tests pass.

---

## **4) Phase Plan (7 Phases) —** ****

## **Docker → K8s**

## ** each time**

### **Phase 0 — Bootstrap & Infra (Future-ready foundation)**

**Goals**

* Monorepo ready, Docker images for all components, baseline K8s Helm charts/overlays; CI pipelines; Observability skeleton; one-person operability.

**Deliverables**

* Monorepo, linting/formatting, commit hooks.
* **docker-compose**: api**, **web-automart**, **web-dealer**, **postgres**, **redis**, **meilisearch**, **keycloak**, **otel-collector**, **prometheus**, **grafana**, **loki**, **minio** (local S3).**
* **Helm charts** per app + Kustomize overlays (dev/stage/prod).
* GH Actions: buildx, cache, unit tests, Trivy scan, push to GHCR, Helm lint, K8s dry-run.
* OpenAPI stub, healthz routes.
* **No local host runs** **; only **docker-compose**.**

**Steps (Copilot prompts)**

* “Create pnpm monorepo with Next.js apps **web-automart**, **web-dealer** and NestJS **api**. Add ESLint/Prettier/TS strict + commitlint/husky.”
* “Write dockerfiles: multi-stage (builder→runner). Expose API on 8080, Next on 3000.”
* “Create docker-compose with services listed above, networks, healthchecks, depends_on; bind mounts for hot reload optional; env files under **infra/docker/env/**.”
* “Scaffold Helm charts (**helm create**) for api and both webs; add values for image repo/tag, env, probes, resources, HPA; Kustomize overlays dev/stage/prod with image tags.”
* “Add GH Actions: build matrix (api, web-automart, web-dealer), buildx cache, push to GHCR, run Trivy, upload OpenAPI artifact, helm lint, k8s kubeval.”
* “Add OpenTelemetry SDK to NestJS and Next.js custom server; wire OTLP exporter to collector URL from env.”
* “Add **/healthz** and **/readyz** endpoints to API and webs.”
* “Generate baseline README and RUNBOOKS (Make targets, common commands).”

**Docker test**

```
make build && make up
curl http://localhost:8080/healthz
curl http://localhost:3000  # each web app splash
```

**CI Gate**

* Build images, Trivy pass, unit test pass, publish to GHCR, Helm lint pass.

**K8s (dev)**

* Create DOKS cluster; install NGINX Ingress, cert-manager, ExternalDNS (Cloudflare), Argo CD (optional).
* helm upgrade --install api ./infra/helm/api -f infra/k8s/overlays/dev/api.values.yaml
* Smoke probes green.

**Definition of Done**

* All services run in Docker; images pushed; dev K8s deploy succeeds with same images; dashboards visible (Grafana), traces arriving.

---

### **Phase 1 — Auth, Tenancy, RBAC**

**Goals**

* Keycloak realm/clients; org/branch/user models; JWT guards; roles; audit.

**Deliverables**

* **Prisma models: **Org, Branch, User, Audit**.**
* Keycloak docker init (realm export), OIDC code flow in both webs.
* NestJS guards for roles/scopes; audit middleware.

**Steps (Copilot prompts)**

* “Add Prisma with PostgreSQL; create models Org/Branch/User/Audit; generate migrations.”
* “Add Keycloak container + realm config; wire Next.js (next-auth or custom OIDC) and NestJS (passport-jwt).”
* “Implement **/v1/orgs**, **/v1/users**, **/v1/branches** CRUD; enforce org scoping.”
* “Create audit middleware: record action, entity, entityId, diff, actorId.”

**Docker/K8s**

* Rebuild images; run migration container; deploy.

**Tests**

* Unit: auth guards; org isolation.
* Integration: create org→user→login→CRUD branch; audit records present.

**DoD**

* Users can login, multi-tenant isolation proven, audits captured.

---

### **Phase 2 — Inventory, Media, Search**

**Goals**

* Listing schema, media via URL, Meilisearch indexing, filters.

**Deliverables**

* **Prisma **Listing, Media**; Meili index **listings_v1**.**
* **API: **GET/POST/PATCH /listings**, **POST /listings/:id/media**, publish toggle.**
* Web-Dealer table/editor; Web-Automart SRP/PDP stubs.

**Steps**

* “Create Listing/Media models with indexes (orgId,status,createdAt), (make,model,year); visibility + channel fields.”
* “Sync to Meilisearch on create/update; implement text + facet filters (make, model, year, city, status, visibility).”
* “Implement media by **URL**; order; mime whitelist; signed URLs helper.”
* “Build dealer inventory table (filters, bulk actions); listing editor; publish flow.”
* “Build B2C SRP/PDP skeleton; Urdu/RTL toggle; schema.org Vehicle; sitemaps.”

**Tests**

* Create→publish→search; Meili returns <150ms P95 in Docker.

**DoD**

* Dealer can CRUD listings; B2C can search/view; same images deploy to K8s.

---

### **Phase 3 — Feeds (CSV/XML), Mapping, Import Jobs**

**Goals**

* Dealer bulk import; background jobs; idempotency; DLQ.

**Deliverables**

* **API: **/feeds/upload**, **/feeds/mappings**.**
* BullMQ workers; object storage for feed files.
* UI: field mapping, preview, dry-run, error report.

**Steps**

* “Add BullMQ queues: **feed-import**, **indexing** with Redis.”
* “Implement mapping model + UI; transforms (trim, uppercase make, city normalize).”
* “Idempotency by **dealer_stock_id**; upsert strategy; DLQ on errors.”
* “Metrics for import rate; webhooks on batch done.”

**Tests**

* 1k rows < 2 min; retry/backoff works; duplicates avoided.

**DoD**

* Real dealer sheet can import; listings appear; indices updated.

---

### **Phase 4 — Leads, Comms, SLA, B2B Visibility**

**Goals**

* Leads inbox; assignment; SLA timers; **wholesale_public** marketplace; B2C deposits stub.

**Deliverables**

* **Prisma **Lead**; API **/leads**, **/leads/:id/{assign|status}**.**
* WS channel for realtime lead; SLA timers via BullMQ.
* **Marketplace endpoint **/marketplace/listings?visibility=wholesale_public**.**
* B2C refundable booking deposit flow (sandbox).

**Steps**

* “Create leads CRUD; assignment and status; audit changes.”
* “Emit **lead.created** webhook; websocket notify dealer.”
* “SLA timers: new→response deadlines; push alerts.”
* “Add marketplace route with role guard (dealers only).”
* “Integrate PayFast/JazzCash sandbox for refundable deposit; record order & status.”

**Tests**

* Lead lifecycle; SLA firing; B2B visibility hidden from B2C; deposit recorded.

**DoD**

* Dealers receive leads instantly; marketplace visible to dealers; deposits work in sandbox.

---

### **Phase 5 — Pricing Suggest, Analytics v1, SEO & i18n**

**Goals**

* Baseline pricing bands; dashboards; SEO polish; Urdu UX.

**Deliverables**

* **Pricing API **/pricing/suggest?make=&model=&year=&city=**.**
* Dealer analytics: views/leads/CTR/time-to-sell by listing/branch.
* B2C SEO: canonical, structured data, sitemaps, meta; UR/EN ready.

**Steps**

* “Implement pricing from comps (internal + simple heuristics); return min/mid/max + confidence.”
* “Capture view/lead events; BigQuery or PG table for aggregates; chart in dealer UI.”
* “Add SEO helpers, OpenGraph/Twitter cards; Urdu locales and RTL.”

**Tests**

* Pricing returns for top PK models; analytics tiles populate; SEO checks (200s, tags).

**DoD**

* Dealers see actionable dashboards; B2C pages SEO sound; Urdu usable.

---

### **Phase 6 — Security, Observability, SRE**

**Goals**

* Hardened system; full telemetry; backups/DR; performance.

**Deliverables**

* Rate-limits, device fingerprinting, JWT rotation, PII encryption.
* OTel traces end-to-end; Prometheus/Grafana/Loki dashboards; Sentry alerts.
* Backups: PG PITR; Spaces lifecycle; restore runbook.
* Load/perf tests; error budgets; SLOs (99.9%).

**Steps**

* “Add Nest rate limiters; Redis sliding window; IP + org quotas.”
* “Encrypt PII columns; rotate secrets; signed URLs.”
* “Grafana dashboards (API latency, error rate, queue lag); Loki logs; alert rules.”
* “k6 load scripts; document SLOs; create DR restore script.”

**Tests**

* Load test meets P95 < 300ms; chaos (restart pods) without data loss.

**DoD**

* Alerts configured; runbooks complete; DR tested.

---

### **Phase 7 — Launch, Payments/Inspections Partners, Handover**

**Goals**

* Production rollout; partner handoffs; legal; runbooks; training.

**Deliverables**

* Prod DOKS, Cloudflare DNS/WAF, TLS; app secrets; CI promoting images from “release” tag.
* Payment provider live; inspection booking stub integrated; MTMIS deeplinks.
* Legal pages (ToS, Privacy, Cookies), data deletion flow.
* Handover pack: creds, dashboards, SLOs, on-call rotation (solo-friendly).

**Steps**

* “Create prod overlay values; set autoscaling; min pods.”
* “Switch payment keys to live; verify payout webhook.”
* “Publish sitemaps; GSC submit; GA4 events.”
* “Freeze schema; tag **v1.0.0**; cut release notes.”

**Tests**

* Blue/green swap; rollback; partner webhooks 2xx; SEO recrawl.

**DoD**

* Public launch; monitoring green; playbooks complete.

---

## **5) Data Model (Prisma summary)**

```
Org, Branch, User(role, keycloakId), Listing(visibility, channel, status), Media, Lead,
PlanSubscription, Webhook, Audit
```

---

## **6) Core API (v1) — Endpoints (minimum)**

* **Auth:** OIDC; JWT.
* **Org/User/Branch:**/orgs**, **/orgs/:id/users**, **/branches
* **Inventory:**GET/POST/PATCH /listings**, **POST /listings/:id/media**, **POST /listings/:id/publish
* **Search:** **GET /listings** with Meili filters/sort
* **Feeds:**POST /feeds/upload**, **GET/POST /feeds/mappings
* **Leads:**GET/POST /leads**, **PATCH /leads/:id/{assign|status}
* **Pricing:**GET /pricing/suggest
* **Marketplace (B2B):**GET /marketplace/listings?visibility=wholesale_public
* **Webhooks:**POST /webhooks

---

## **7) Docker Compose (key services)**

* **api** **, ** **web-automart** **, ** **web-dealer** **, ** **postgres** **, ** **redis** **, ** **meilisearch** **, ** **keycloak** **, ** **otel-collector** **, ** **prometheus** **, ** **grafana** **, ** **loki** **, ** **minio** **.**

---

## **8) K8s (Helm+Kustomize)**

* **Charts: **api**, **web-automart**, **web-dealer**.**
* Overlays **dev/stage/prod**: image tags, env, resources, HPA, Ingress hosts, secrets (SOPS).

---

## **9) CI/CD (GitHub Actions)**

**Build & Test (on PR)**

* Lint → Unit tests → Buildx images → Trivy → Upload OpenAPI → Helm lint.

**Release (on tag)**

* Push images → Helm package → Deploy dev (auto) → Stage (manual approval) → Prod (manual with diff).
* Post-deploy smoke test; notify Slack/Email.

---

## **10) Acceptance Criteria (final)**

* Docker: all tests pass; manual checklist green.
* K8s: same images, green deploy; smoke + SEO + payments sandbox pass.
* SLOs met; alerts wired; backups running; runbooks complete.

---

## **11) Copilot Task Pack (pasteable prompts)**

**Bootstrap**

* “Scaffold pnpm monorepo with Next.js apps **web-automart**, **web-dealer** and NestJS **api**; add ESLint/Prettier/TS strict, commitlint, husky.”

**Docker**

* “Create multi-stage Dockerfiles for each app; write docker-compose with postgres, redis, meilisearch, keycloak, otel-collector, prometheus, grafana, loki, minio; healthchecks.”

**API/Auth**

* “Add Prisma models for Org/Branch/User/Audit; create CRUD endpoints; integrate Keycloak OIDC; role guards; audit middleware.”

**Inventory/Search/Media**

* “Add Listing/Media models; implement **/v1/listings** GET/POST/PATCH; Meilisearch indexing & filters; media by URL with order & mime checks.”

**Feeds**

* “Implement CSV/XML upload, mapping UI, preview, dry-run; BullMQ job processor with idempotency and DLQ.”

**Leads/SLA**

* “Create leads CRUD, assignment, statuses, SLA timers, websocket notifications, **lead.created** webhook.”

**B2C Web**

* “Build SRP, PDP, seller post flow, Urdu/RTL, schema.org Vehicle, sitemaps, canonical.”

**B2B Web**

* “Inventory table with filters/bulk; listing editor; marketplace view for **wholesale_public**.”

**Pricing/Analytics**

* “Pricing suggest endpoint with min/mid/max; analytics tiles for views/leads/CTR; event tracking.”

**Security/Obs**

* “Rate-limiters, device fingerprinting, PII encryption, signed URLs; OTel traces; Prometheus/Grafana/Loki dashboards; Sentry SDK.”

**CI/CD**

* “GH Actions: buildx multi-arch, cache, Trivy, push to GHCR; helm lint; deploy to DOKS dev via helm; smoke test job.”
* “Helm charts and Kustomize overlays for dev/stage/prod; add resources, HPA, Ingress hosts, secrets via SOPS.”

---

## **12) Pakistan-Specific Integrations (stubs)**

* **Payments:** PayFast/JazzCash/Easypaisa sandbox keys; booking deposit capture; webhook verification.
* **SMS/WhatsApp:** local gateways or Twilio (sender ID pre-approval).
* **MTMIS:** deeplinks to Punjab/Sindh/Islamabad portals (informational).

---

## **13) Final Notes**

* Commit **end of each phase**; tag releases; promote the **same Docker images** to K8s.
* Keep FIDs (fast interaction), Core Web Vitals green; enforce code owners for critical folders.
* Everything runs **in Docker** for dev/testing; **no local-only services**.
