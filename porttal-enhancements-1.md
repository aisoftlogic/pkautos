**Answer:** yes—reformat with **two enhancement tracks**. Updated, concise doc below.

# **Summary**

* **Keep 7-phase plan. Add ****Automart.pk (B2C) Enhancements A1–A4** and **Autotrader.pk (B2B) Enhancements B1–B3** to **match PakWheels auth + listing UX** and extend.
* **Auth/UI parity points sourced from PakWheels ****login modal (OTP + Google/Facebook/Email)** and  **PDP interactions** **.**

---

# **A) Automart.pk (B2C) — Enhancements**

## **A1. Auth & Onboarding (PW parity)**

* **Login options:** Mobile OTP (PK +92),  **Google** **, ** **Facebook** **, ** **Email** **; ****Terms/Privacy** acceptance. Add **OTP resend via SMS/WhatsApp/Call** + rate-limit.**  **
* **Signup form:** email, full name, password/confirm, newsletter opt-in; forgot-password.**  **
* **Favorites/alerts:** “Save ads”, quick alerts carousel on auth modal.**  **
  **Build:** Next.js UI modal, Keycloak social IdP (Google/Facebook), OTP via SMS/WhatsApp/Voice, device & resend throttles.

## **A2. PDP (listing page) features (PW parity +)**

* **Actions:** Contact seller modal, phone-reveal/OTP gate, **safe-deal tips**, **report ad**; map/location, similar ads.**  **
* **Trust & addons:** Inspection CTA, finance tiles, price bands, MTMIS deeplink.**  **
* **Schema/SEO:** Vehicle structured data, canonical, UR/EN.
  **Build:** SSR PDP, modules: gallery, spec sheet, seller card, actions, CTAs.

## **A3. SRP/Discovery (PW parity)**

* Facets: city, make, model, year, price, engine, body, condition; counts; city/make landing pages.**  **
  **Build:** Meilisearch facets; static landers (city/make) with ISR.

## **A4. Sell flow (PW parity)**

* Post ad wizard; “Sell It For Me” promo; “Certified/Inspection” badges; price calculator link; dealer/individual toggle.**  **
  **Build:** multi-step form + validation; badge rules; pricing hook.

---

# **B) Autotrader.pk (B2B) — Enhancements**

## **B1. Dealer SSO & Roles**

* Keycloak realm; social on top of enterprise email; org/branch roles (Owner/Manager/Sales/Ops/Finance/ReadOnly).

## **B2. Inventory & Leads (align to B2C)**

* Inventory table mirrors B2C fields; publish rules to **Automart**; leads inbox + SLA; wholesale visibility.

## **B3. Feeds & Analytics**

* CSV/XML mapper; idempotent import; listing & lead KPIs (views, CTR, time-to-sell).

---

# **C) Exact UX specs to copy**

## **C1. Auth modal (copy)**

* **Primary CTA:** “Continue with Mobile Number” → phone (PK dropdown) → OTP input → resend via **SMS/WhatsApp/Call** (cooldown). **Secondary:** Google / Facebook / Email. Footer: **Terms** & **Privacy**.**  **

## **C2. Email flows**

* **Sign Up:** email, full name, password + confirm, marketing checkbox. **Sign In / Forgot Password** screens.**  **

## **C3. PDP interactivity**

* “Send Message to Seller” modal; “Tips for Safe Deal” panel; phone/OTP prompt; alert creation.**  **

## **C4. Finance/Inspection hooks**

* Finance calculator/tiles; inspection 200+ points CTA.**  **

---

# **D) Implementation bites (Docker→K8s ready)**

* **Auth:** Keycloak IdPs (Google/Facebook), OTP service (SMS/WhatsApp/Call), rate-limit + device fingerprint.
* **API:** NestJS modules **auth, listings, leads, pricing, feeds**; events for contact/reveal/report.
* **Search:** Meilisearch facets/geo.
* **UI:** Reusable  **AuthModal** **, ** **PDPActionBar** **, ** **SellerContactModal** **, ** **SafeDealPanel** **.**

---

# **E) CI/CD increments (attach to existing 7 phases)**

* Phase0 add **auth modal + PDP stubs** to docker-compose; tests run in containers; images tagged → K8s dev.
* Phase1 wire Keycloak + OTP + social; docker tests; roll same images to K8s.
* Phase2 SRP/PDP features; **PDP smoke**; deploy.
* Phase3 Feeds/import; Phase4 Leads/SLA; Phase5 Pricing/SEO UR/EN; Phase6 SRE hardening; Phase7 Launch.

---

# **F) Feature checklist (copy-ready for tickets)**

**Auth**

* Phone login (+92) OTP
* Resend via SMS/WhatsApp/Call (cooldown)**  **
* Google / Facebook / Email sign-in**  **
* Sign-up form (email, name, password, opt-in)**  **
* Terms/Privacy gating**  **

**PDP**

* Contact seller modal; message template; phone reveal; OTP wall**  **
* Safe-deal tips; report ad; map; similar listings**  **
* Inspection CTA; finance tiles; MTMIS link**  **

**SRP/Discovery**

* City/make/model/year/price/engine/body/condition facets + landers**  **

**Sell**

* Post ad wizard; Certified/Inspection badges; price calculator link**  **

**Dealer (B2B)**

* SSO with roles; inventory publish to B2C; leads inbox + SLA; feeds mapper.

---

# **G) Decision**

* **Proceed with enhancement tracks (no full rewrite).**
* **Automart.pk**: ship A1→A4 first to reach **PW-parity UX**; **Autotrader.pk**: ship B1→B3 in parallel.
