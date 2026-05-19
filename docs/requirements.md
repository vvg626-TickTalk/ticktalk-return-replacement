# Requirements — TickTalk Service Portal Demo

**Primary reference:** `reference/tradin return replace 260512.pptx` (product requirements and UI/UX).

This document captures planning-level requirements for the **TickTalk Service Portal Demo**—a front-end demonstration of the official Return, Replacement, and Trade-in flows (官网申请 Return & Replacement).

---

## Project overview

The demo illustrates how customers and (eventually) staff interact with TickTalk’s after-sales portal: looking up orders by channel, signing in or registering, starting return/replacement requests, verifying Care+ where required, and tracking RMA-style service orders. The reference deck emphasizes **mobile-first layout**, **short copy**, and **fast comprehension** over dense paragraphs.

---

## Goals

- **Customer self-service:** Let users find their order (or sign in), complete return/replacement/trade-in paths with minimal friction.
- **Policy clarity:** Surface terms, eligibility, and channel-specific rules (e.g. who sees Refund, when buttons are disabled).
- **Operational alignment:** RMA numbers bind to orders; statuses reflect real warehouse/support states (even if the demo uses mocks first).
- **Premium, simple UX:** Match a high-quality brand without cluttered screens—especially on small viewports.

---

## Scope

### In scope (demo / planning)

- First-time (“new here”) flow: channel selection, order lookup, order detail.
- Account registration and login (email or phone + verification code patterns from the deck).
- Replacement flow: issue selection, conditional Care+ verification, contact/address, preview, RMA creation, inventory/restock messaging.
- Return flow: multi-item returns, reasons, preview, registration echo, cancellation rules before refund.
- Trade-in: Care/APP and purchase-page entry concepts, IMEI validation, preview/agree, cart coupling (documented for future implementation).
- Order and service-order lists; replacement/return detail with status timelines (mocked).
- Care+ verification session (TT5-focused in reference; other models called out where relevant).

### Explicitly out of scope (per deck notes unless rescoped later)

- Some “other reason” free-text for **cancel unshipped order** (slide notes: “暂时不做这个功能”).
- Full production checkout, email, and logistics integrations in the demo phase.

---

## Modules

| Module | Purpose |
|--------|---------|
| **Landing & policy** | Replacement policy/terms; gating before account/order path. |
| **Channel & order lookup** | Pick channel (default `myticktalk.com`); order number + zip/postal patterns per retailer; help (“?”) per channel. |
| **Order detail** | Line items, IMEI display rules (TT5 exceptions), gift-with-purchase rules, button states (Return / Replace / Trade-in / Refund visibility). |
| **Authentication** | Register (email/phone + OTP) and sign-in (email/phone + OTP); shared validation and error patterns. |
| **Replacement wizard** | Multi-product, per-watch IMEI, issue taxonomy, uploads, Care+ gates, contact + intl address, preview, submit. |
| **Return wizard** | Parallel structure to replacement where applicable; refund/shipping policy surfacing. |
| **Care+ verification** | Phone, caregiver/account, OTP send/verify, daily limits, error states; skip re-verify if already verified in-session/order. |
| **Trade-in** | Entry from Care/APP or checkout; brand selection, IMEI for TickTalk devices, preview, agree/cancel, cart quantity coupling. |
| **Service orders (RMA)** | Create RMA, bind to order; statuses: unprocessed, awaiting customer, rejected, awaiting customer ship, ship timeout, received, inspection, inspection fail, backorder, not yet packed, shipped, terminal read-only states. |
| **Messaging hook** | “Contact” opens message thread keyed by RMA (full spec TBD—see open questions). |
| **Admin / ops (future)** | Left-nav list by time, jump to RMA management (deck mention only—no full mock in v1 docs). |

---

## UI/UX principles

- **Mobile readability first:** Avoid long paragraphs; prefer scannable bullets, short labels, and progressive disclosure (“展开再次描述”).
- **Short primary labels:** e.g. “New here” / “Have an Account” rather than long sentences that break button layout on phones.
- **State-driven CTAs:** Disable Return/Replace/Trade-in until eligible; show **why** when disabled (tooltip or modal with reason codes from the deck).
- **Channel fidelity:** Order number format hints and zip digit rules differ by Amazon, Walmart, Best Buy, myticktalk, etc.
- **Confirmation patterns:** Destructive actions (remove line, cancel RMA, cancel return) use explicit confirm modals.
- **Internationalization-ready:** Address forms differ for international users (e.g. UK example in deck); normalize phone formatting (strip `()`, spaces).

---

## Mobile-first requirements

- Touch targets and single-column layouts for core wizards.
- Avoid horizontal overflow on policy and preview screens; consider multi-column only where deck allows (“排版可以多列” for some desktop preview).
- OTP flows: countdown timers, “didn’t receive code” affordances, concise error toasts (3s auto-dismiss where specified).
- Media capture UX: photo/video optional vs required must follow **per-issue** rules (some reasons need only one of description or image).

---

## Future API integration notes

- **Order lookup:** Validate `orderId + postal/zip` (and channel) together; return fuzzy error (“order number or shipping zip incorrect”).
- **OTP:** Send/verify endpoints with rate limits (e.g. 5/day), separate channels for SMS vs email copy.
- **RMA:** Generate on submit; persist linkage to sales order; inventory service returns alternate colors, restock queue (“Wait for restock” by date order).
- **Care+:** Verification ties device phone, subscription account, and verification codes; possible idempotent “already verified” flag per order/session.
- **Trade-in:** IMEI validation service; pricing table by brand; enforce pairing of trade-in count vs new watch quantity at cart.
- **Files:** Upload signed URLs or direct multipart to object storage; virus scan / size limits TBD.

---

## Mock data strategy

- **Static JSON / in-memory fixtures** under `src/mock-data/` for: orders per channel, line items, IMEI visibility flags, gift bundles, replacement issues, Care+ eligibility flags, inventory scenarios (in stock / color swap / full backorder).
- **Simulated latencies** (optional later) for OTP and submit to test loading states.
- **Scenario switches** (query param or dev menu) to toggle: unshipped vs shipped, warranty window, Care+ on/off, inventory edge cases.
- **No real PII** in fixtures; use fake emails/phones/IMEIs.

---

## Technical assumptions

- SPA-friendly routing for multi-step wizards with **resumable** URLs where product wants deep links (TBD).
- Form validation mirrors backend rules once APIs exist; until then, validate structurally (required fields, IMEI format, postal length per channel).
- Accessibility: labels tied to inputs, error text programmatically associated, focus management on modals.
- Styling approach TBD (this repo only initializes structure in this phase).

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial doc from `reference/tradin return replace 260512.pptx` text extraction. |
