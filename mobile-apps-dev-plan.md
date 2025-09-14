**Yes—here’s the add-on plan (drop-in to your Copilot repo).**

# **Mobile Apps & AI Add-On — Automart.pk (B2C) + Autotrader.pk (Dealer)**

*(Aligned with PakWheels-style auth & UX; extends your 7-phase Docker→K8s plan)*

## **A) Scope & Goals**

* **Platforms:** Flutter (Android, iOS, Huawei/HMS) + **Next.js PWA** (installable).
* **Parity targets (from PW):** Phone OTP (+92), Google/Facebook/Email, saved ads/favorites, alerts, contact/reveal number, chat, inspection/finance CTAs, report ad, safe-deal tips.
* **One-image rule:** build/test **in Docker**, publish images, **re-use** for K8s.
* **AI hooks:** pricing bands, image IQ (plate blur/background cleanup/quality), VIN/engine OCR, fraud/spam scoring, semantic search, reply drafts.

---

## **B) Repo Additions (monorepo)**

```
pk-auto/
  apps/
    app-automart/        # Flutter consumer
    app-dealer/          # Flutter dealer
  packages/
    mobile-core/         # Dart shared (auth, api, models)
  infra/
    mobile/               # Fastlane, signing, store configs
    docker/mobile/        # Dockerfiles for Flutter CI builds
```

---

## **C) Phased Plan (append to existing 7 phases)**

### **Phase 0+ (bootstrap mobile & PWA in Docker/K8s)**

**Deliverables**

* Flutter shells (2 apps) with **OIDC PKCE** (Keycloak) + **OTP** endpoint wiring.
* Next.js **PWA**: **next-pwa** + Workbox, offline routes, install banner.
* CI: GH Actions **Flutter build** (Android AAB/APK, iOS IPA via Fastlane), **PWA build**; cache Gradle/CocoaPods.
* Dockerfiles: **flutter:stable** builder → artifacts → publish to GH Releases + S3; **no local runs**.
* K8s: static file hosting for PWA via NGINX Helm; mobile uses same backend.

**Copilot tasks**

* “Create Flutter workspaces **app-automart**, **app-dealer** using Riverpod/go_router; add **mobile-core** package with OIDC client, API client, models.”
* “Write Dockerfiles to run **flutter build** in CI; upload artifacts; sign via Fastlane placeholders.”
* “Enable Next.js PWA: add workbox config (html network-first, assets SWR, api TTL).”

**Acceptance**

* Docker CI builds both apps and PWA; PWA deploys to K8s dev; **/healthz** reachable.

---

### **Phase 1+ (Auth & Onboarding — PW parity)**

**Features**

* **Login modal:** Mobile **OTP**, Google, Facebook, Email; Terms/Privacy gating.
* OTP resend: SMS/WhatsApp/Call with cooldown + device rate-limit.
* Email signup (name, password, marketing opt-in).
* Favorites & alerts appear post-login.

**Copilot tasks**

* “Add OTP screens, PK phone dropdown preset to **+92**; implement resend channels with cooldown.”
* “Wire Keycloak social IdPs (Google/Facebook) + email/password realm; store tokens in secure storage.”
* “Favorites & alerts: local cache + server collections; badge count on tabs.”

**Tests**

* Docker e2e (Playwright for PWA + Flutter driver): OTP happy path, social login, favorites persist.

---

### **Phase 2+ (SRP/PDP parity & CTAs)**

**Features**

* **SRP:** city/make/model/year/price/engine/body/condition facets; saved searches/alerts.
* **PDP:** gallery, spec sheet, seller card, **contact seller** modal,  **phone reveal (OTP wall)** **, ** **chat** **, ** **safe-deal tips** **, ** **report ad** **, ** **map** **, similar ads; ****inspection** + **finance** CTAs; **MTMIS** deeplink.
* **Schema/SEO** on PWA (Vehicle, breadcrumbs; UR/EN, RTL).

**Copilot tasks**

* “Build Flutter SRP with Meilisearch facets; saved-search alerts via FCM/APNs/HMS.”
* “Create PDP components (action bar, seller contact modal, phone reveal, report dialog, safe-deal panel).”
* “Add finance/inspection tiles that deeplink to flows; MTMIS deeplink handler.”

**Tests**

* SRP facet perf; PDP actions; push alerts on price-drop/new match.

---

### **Phase 3+ (Sell Flow & Media IQ)**

**Features**

* Post-ad wizard (individual/dealer), 20+ photos, **plate blur**, **BG cleanup**, quality score; video clip.
* Price calculator hook; badges (Inspection/Certified).
* Queued uploads, retry, **on-device compression**; EXIF scrub.

**Copilot tasks**

* “Implement camera/gallery with compression + background upload queue; show progress.”
* “Add image IQ service call (plate blur/bg cleanup/score) + local toggle.”
* “Post-ad validation + publish; set **visibility** and **channel**.”

**Tests**

* Large upload stability; IQ latency budget; publish end-to-end.

---

### **Phase 4+ (Dealer app essentials)**

**Features**

* Org/branch switcher; inventory table; editor; bulk CSV (URL import); leads inbox + SLA timers; analytics tiles.
* **Publish to Automart** toggle; **wholesale_public** visibility; push notifications for new leads/SLA breaches.

**Copilot tasks**

* “Implement inventory list with filters; inline price/status changes; bulk actions.”
* “CSV import screen → uploads to Feeds API; show mapping preview/errors.”
* “Leads inbox with assign/status; SLA timers via WS/push.”

**Tests**

* 1k row import <2m; leads SLA triggers notifications; visibility rules enforced.

---

### **Phase 5+ (AI Services)**

**Features**

* **Pricing suggest** (min/mid/max + confidence); **semantic search** (“Corolla under 30 lac in Lahore”);
* **VIN/engine OCR** (on-device first, server verify); **fraud/spam** classifier; **duplicate image** detection;
* **Dealer reply drafts** (Urdu/English), **image alt-text** for SEO.

**Copilot tasks**

* “Add **/pricing/suggest** client with caching; show bands on PDP/editor.”
* “Implement semantic search endpoint and client; fall back to keyword if unavailable.”
* “Add OCR capture for docs; show verification ticks.”
* “Moderation queue: spam/fraud score; duplicate hash check.”

**Tests**

* Pricing coverage for top 50 PK models; OCR accuracy on sample docs; moderation throughput.

---

### **Phase 6+ (Payments, Bookings, Orders)**

**Features**

* **Deposits** (refundable) via PayFast/JazzCash/Easypaisa; webhook verify; order ledger.
* **Inspection booking** (slots/cities) with SLA; **transport quotes** (optional).
* Wallet/credits (phase placeholder).

**Copilot tasks**

* “Payments SDK wrappers (web & mobile); webhook verification; refund flow.”
* “Inspection booking UI + slot API; push reminders; status updates.”

**Tests**

* Sandbox captures/refunds; booking lifecycle; dispute path.

---

### **Phase 7+ (SRE hardening & launch)**

**Features**

* Crash/error reporting (Sentry); OTel traces; performance budgets; A/B flags;
* Store pipelines (Play/TestFlight/AppGallery); staged rollout.

**Copilot tasks**

* “Wire Sentry for Flutter & PWA; OTel spans in critical paths.”
* “Fastlane lanes for internal/closed/open/prod; versioning; changelogs.”
* “Post-deploy smoke; rollback scripts; DR restore doc.”

**Tests**

* Store builds from CI; blue/green for PWA; alerting verified.

---

## **D) Parity Checklist (copy to tickets)**

**Auth**

* Phone OTP (+92)
* Google / Facebook / Email
* Resend via SMS/WhatsApp/Call (cooldown)
* Terms/Privacy gating
  **SRP**
* City/Make/Model/Year/Price/Engine/Body/Condition facets
* Saved searches + push alerts
  **PDP**
* Contact seller modal / message
* Phone reveal (OTP wall)
* Chat thread + safe-deal tips + report ad
* Map + similar ads
* Inspection + finance CTAs; MTMIS deeplink
  **Sell**
* Post-ad wizard; media IQ; price band
  **Dealer**
* Inventory CRUD + bulk import
* Leads inbox + SLA
* Analytics tiles
* Publish to Automart; wholesale visibility
  **AI**
* Pricing suggest
* Image IQ (blur/bg/quality)
* VIN/engine OCR
* Fraud/spam + dupes
  **Mobile/PWA**
* PWA install/offline
* Push: FCM/APNs/HMS
* Deep links & universal links

---

## **E) CI/CD (augment)**

* **Build:** Docker buildx → API/web images + PWA; Flutter artifacts via Docker runners; Trivy scan; sign with Fastlane; upload to releases.
* **Deploy:** Helm (dev→stage→prod) for API/web/PWA; mobile goes to store tracks; same backend images for K8s.
* **Smoke:** SRP/PDP/OTP/login; push test; deposit sandbox; feeds import; leads SLA.

---

## **F) Minimal API contracts for mobile**

* /auth/otp { request, verify }
* /auth/oidc** (PKCE)**
* **/listings** (filters/facets/search), **/listings/:id**
* /media/sign**, **/media/iq**, **/ocr/vin
* /leads { create, assign, status }**, **/chat/:id** (WS)**
* /alerts { create, delete }
* /pricing/suggest
* /dealer/inventory**, **/feeds/upload**, **/analytics/tiles

---

## **G) Copilot Prompt Pack (paste into issues/tasks)**

* **Mobile bootstrap:** “Create Flutter apps **app-automart**, **app-dealer** with Riverpod/go_router, shared **mobile-core**; add OIDC PKCE + OTP client; secure token storage.”
* **Auth modal (PW-style):** “Implement phone OTP (+92) + Google/Facebook/Email login screens; resend via SMS/WhatsApp/Call with cooldown; Terms/Privacy footer.”
* **SRP/PDP:** “Build SRP facets (Meilisearch) + saved searches; PDP with contact seller, phone reveal, chat, safe-deal, report, map, similar, inspection/finance CTAs, MTMIS deeplink.”
* **Sell flow:** “Wizard with camera/gallery; queued uploads; image IQ (blur/bg/quality); EXIF scrub; publish with visibility/channel.”
* **Dealer essentials:** “Inventory table/editor; CSV import + mapping preview; leads inbox + SLA timers; analytics tiles; publish to Automart toggle.”
* **AI:** “Wire pricing suggest; semantic search fallback; VIN/engine OCR; fraud/dupe checks; reply drafts.”
* **Payments/booking:** “Integrate PayFast/JazzCash/Easypaisa sandbox; deposits + refunds; inspection slot booking UI + reminders.”
* **CI/CD:** “Add Docker Flutter build job, sign with Fastlane, upload artifacts; deploy PWA via Helm; smoke tests; store release lanes.”

**Done.**
