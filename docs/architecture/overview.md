# Architecture Overview

## 1. High-Level System

Two primary product surfaces share one platform:

- Automart.pk (B2C marketplace: discovery, PDP, post-ad, pricing bands)
- Autotrader.pk (B2B dealer: inventory management, feeds, leads, analytics)

Mobile + Web convergence:

- Web: Next.js apps (`web-automart`, web-autotrader) + PWA features
- Mobile: Flutter apps (`app-automart`, `app-autotrader`) leveraging same API contracts

## 2. Core Services (API Domain Modules)

| Domain              | Responsibilities                                               | Key Entities                 |
| ------------------- | -------------------------------------------------------------- | ---------------------------- |
| Auth & Identity     | OIDC (Keycloak), OTP, social IdPs, roles/tenancy               | Org, Branch, User, Session   |
| Inventory           | Listing CRUD, visibility/channel rules, media management       | Listing, Media               |
| Search              | Faceting & full-text via Meilisearch, semantic (future)        | Listing (indexed)            |
| Feeds/Import        | CSV/XML ingestion, mapping, idempotent upsert, background jobs | FeedFile, FeedMapping        |
| Media IQ            | Image quality, plate blur, background cleanup (AI hook)        | MediaIQJob                   |
| Leads & Comms       | Lead lifecycle, assignment, SLA timers, notifications          | Lead, LeadEvent              |
| Pricing             | Pricing suggestion heuristics/ML, bands (min/mid/max/conf)     | PricingSample, PricingResult |
| Analytics/Events    | Capture view/lead events, aggregates, dashboards               | Event, Aggregate             |
| Payments & Deposits | Booking deposits, refunds, inspection/finance CTAs             | Deposit, PaymentWebhook      |
| Webhooks            | Outbound partner notifications                                 | Webhook, WebhookDelivery     |
| Audit & Security    | Audit trail, rate limiting, PII encryption, device fingerprint | AuditRecord                  |

## 3. Cross-Cutting Concerns

- Configuration: central `packages/config` (env schema via Zod) consumed by all Node apps.
- Schemas & Types: `packages/schemas` (Zod + Prisma type generation + OpenAPI DTO alignment).
- UI & Components: `packages/ui` (React components with EN/UR i18n + RTL readiness) + future storybook.
- Mobile Shared: `packages/mobile-core` (planned) for auth flows, API client, models.
- Observability: OpenTelemetry SDK in API & web; OTLP → collector → Prometheus/Grafana/Loki + Sentry for errors.
- Asynchronous Processing: BullMQ queues (feeds, indexing, leads-sla, media-iq, pricing-refresh) backed by Redis.

## 4. Data Storage & Search

- PostgreSQL (Managed): Primary relational store (Prisma ORM). Sensitive columns encrypted (TBD libs).
- Redis: Caching, rate-limit counters, BullMQ job queues.
- Meilisearch: Listing search & facets; later semantic overlay.
- Object Storage (Spaces/S3): Media assets, feed files, build artifacts (mobile release bundles optional).

## 5. Deployment Model

Everything is Docker-first. Multi-stage builds produce minimal runtime images. CI builds & scans images, pushes to GHCR. Helm charts per app; Kustomize overlays for env-specific patches (dev/stage/prod). Mobile artifacts built in Docker and published (not deployed to K8s).

## 6. Runtime Topology (K8s)

- api (NestJS) Deployment + HPA
- web-automart / web-dealer (Next.js) Deployments (SSR or static export + Nginx) + HPAs
- keycloak (external or managed) + realm config
- supporting datastore services (managed: postgres, redis, meilisearch) referenced via secrets/configmaps
- otel-collector DaemonSet/Deployment
- Prometheus, Grafana, Loki (infra stack) via Helm

## 7. Security & Access

- Auth: OIDC PKCE for web/mobile; JWT access tokens to API
- RBAC: Role claims (org/branch scoping) enforced in NestJS guards
- Rate Limiting: Sliding window via Redis per IP + device + user
- PII: Encryption at column level; hashed phone/email for lookups
- Media: Signed URLs; validation of mime + dimension constraints

## 8. Tenancy & Visibility Model

- Tenancy dimension: org → branches → users
- Listing.visibility: public | wholesale_public | private
- Listing.channel: automart | autotrader (governs surface exposure)
- Access rules enforced at query layer + Meilisearch filter tokens (planned)

## 9. Event & Job Flows (Examples)

1. Feed Ingestion: Upload → store object → queue feed-import → parse/map → upsert listings → queue indexing
2. Listing Publish: API update → enqueue indexing → Meilisearch update → (optional) pricing refresh
3. Lead Create: API POST → persist → enqueue SLA timers → websocket push + notification → audit record
4. Media Upload: Client obtains signed URL → upload → callback/confirm → enqueue mediaIQ → update listing media score

## 10. Observability Strategy

- Trace: Context propagated via HTTP + BullMQ (custom propagator wrapper) → spans for controller/service/db/external
- Metrics: Prom counters (http_requests_total), histograms (request_duration_seconds), queue depths
- Logs: Structured JSON, Loki labels (app, env, version)
- Alerts: 5xx error rate, latency P95, queue lag, SLA timer backlog, Meilisearch index freshness

## 11. Build & CI Pipelines (Summary)

Stages: Lint → Unit → Build (multi-arch) → Scan (Trivy) → Push (GHCR) → Helm Lint → (PR stops) → Tag Release → Deploy Dev → Smoke → Promote.
Artifacts: OpenAPI JSON, test reports (Jest/Playwright), k6 smoke results, Helm chart packages.

## 12. Phase Alignment

- Phase 0: Skeleton, CI, baseline observability hooks, health endpoints stub.
- Phase 1: Auth & tenancy domain + Keycloak integration.
- Phase 2: Inventory + search + media base.
- Phase 3: Feeds + background processing robustness.
- Phase 4: Leads + SLA + visibility expansion.
- Phase 5: Pricing + analytics + SEO/i18n maturity.
- Phase 6: Security hardening + full observability + DR.
- Phase 7: Launch + partner integrations + handover.
- Mobile “+” phases overlay analogous functionality with parity & AI enhancements.

## 13. Open Questions / Future RFCs

- Semantic search engine choice (OpenAI embeddings vs local model) → RFC.
- Pricing model evolution (heuristics → ML regression) → RFC.
- Duplicate image detection technique (perceptual hash vs CLIP embeddings) → RFC.
- Secrets management: SOPS + age vs external secret operator.

## 14. Next Immediate Actions

- Confirm naming alignment (`web-autotrader` vs `web-dealer`).
- Add Makefile + pnpm workspace + root package configs.
- Bootstrap NestJS and Next.js codebases (Phase 1 start gating on approval).

---

Generated from synthesis of PRD/SDD, mobile add-on plan, and enhancements document.
