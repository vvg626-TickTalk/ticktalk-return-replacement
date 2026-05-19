# Open questions — TickTalk Service Portal Demo

Running list of unclear logic or product gaps surfaced while reading **`reference/tradin return replace 260512.pptx`**. Update as decisions are made.

---

## 1. Order with mixed fulfillment states

**Question:** One order may contain lines in **different states** (split shipments). How does the UI prioritize actions and messaging per line vs per order?

**Why it matters:** Buttons for return/replace/trade-in depend on receipt, warranty timers, and IMEI availability; mixed states can confuse eligibility if only order-level messaging exists.

**Suggested approaches:** Per-line status chips + disable reasons; order-level summary “Multiple shipments—see each item.”

---

## 2. IMEI display rules (TT5 and “not shown” cases)

**Question:** When exactly is IMEI hidden vs shown (e.g. unshipped, TT5 model exceptions, accessory-only lines)?

**Why it matters:** IMEI gates watch-level service; wrong hiding breaks validation or user trust.

**Suggested approaches:** Matrix doc (channel × product type × fulfillment state); feature flag per SKU family.

---

## 3. Care+ verification scope

**Question:** Is Care+ verification **per IMEI**, **per order**, **per session**, or time-limited?

**Why it matters:** Deck says skip repeat verification for later reasons in same flow—needs a defined token/TTL and fraud bounds.

**Suggested approaches:** Server-issued `carePlusVerificationId` expiring in N hours; bind to IMEI + account.

---

## 4. “Refund” visibility by channel

**Question:** Deck notes non–direct-channel purchases may **omit Refund**—what is the exhaustive ruleset per retailer?

**Why it matters:** Legal/refund routing differs; showing Refund when unsupported creates liability.

**Suggested approaches:** Channel configuration table maintained by ops; fallback “contact support.”

---

## 5. Gift-with-purchase returns

**Question:** If customer returns main device, gift must ship back—how is **partial receipt** or **gift-only replacement** handled?

**Why it matters:** Warehouse reconciliation and refund amounts depend on bundle integrity.

**Suggested approaches:** Bundle ID on line items; block partial selections with explicit modal.

---

## 6. Shipping fee deduction (returns)

**Question:** How are outbound/inbound fees communicated and calculated in the refund preview (deck flags missing clarity)?

**Why it matters:** Customers dispute refunds when fee logic is opaque.

**Suggested approaches:** Itemized estimate in preview + link to policy appendix. **Phase 3A** uses flat mock fees—see **§16**.

---

## 7. International policy blocks

**Question:** Which return/replace paragraphs differ by country/region (not just address form)?

**Why it matters:** Compliance and carrier options vary; deck asks to “补国际顾客” policy.

**Suggested approaches:** Region resolver on address; CMS-driven policy fragments.

---

## 8. Trade-in checkout logistics

**Question:** After purchase with trade-in, what operational steps (ship old device, evidence upload, grading) occur—**before** or **after** new unit ships?

**Why it matters:** Affects charge timing, hold amounts, and email content.

**Suggested approaches:** Separate “trade-in fulfillment” state machine doc; align with finance.

---

## 9. Inventory / cross-generation swaps

**Question:** Backend can allow **gen5 → gen6** swaps—who authors mappings and how are price deltas shown?

**Why it matters:** Prevents accidental sku mismatches and revenue leakage.

**Suggested approaches:** Admin SKU substitution matrix + customer-facing “upgrade path” copy when delta > 0.

---

## 10. Messaging / CRM integration

**Question:** Deck proposes Contact → message page with **RMA subject** and staff left-nav—what system stores threads?

**Why it matters:** Choose between in-app messaging, email bridge, or Zendesk/Intercom.

**Suggested approaches:** Phase 1 email deep link with RMA reference; Phase 2 embedded chat with shared IDs.

---

## 11. Admin dashboard scope

**Question:** What roles exist (agent, supervisor, inventory-only) and which transitions are manual?

**Why it matters:** Drives RBAC, auditing, and which statuses are API-only.

**Suggested approaches:** Start with agent+supervisor; log all manual edits with reason codes.

---

## 12. Public tracking without login

**Question:** Should customers track RMA with **order + zip** only (like initial lookup) or require auth?

**Why it matters:** Security vs convenience trade-off for PII and fraud.

**Suggested approaches:** Magic link via SMS/email OTP to time-boxed tracking page.

---

## 13. Visual brand tokens (front-end)

**Question:** What are the official TickTalk logo files, color hex values, typography, and motion rules?

**Why it matters:** Phase 1 uses neutral “ink + teal accent” placeholders in Tailwind (`tailwind.config.js`). Without brand approval, marketing may see mismatches.

**Suggested approaches:** Drop official tokens into `docs/` + map them to Tailwind theme extensions; swap the interim `TT` mark for SVG.

---

## 14. Phase 2A replacement wizard — intentional simplifications

### 14a. Line-level eligibility vs demo defaults

**Question:** How should the live product enforce **per-line eligibility** (30-day windows, warranty tier, gift-only-exchange rules, multi-shipment states) relative to the current “all shipped SKUs are eligible” demo?

**Why it matters:** The Phase 2A wizard optimizes for **clickable coverage** of PPT issue types, Care+ gating, and preview/submit—not for legal/commerce accuracy on every edge case.

**Suggested approaches:** Add a small eligibility matrix module fed by mock order fields (`OrderLineStatus`, warranty fixtures, flags for gift lines) and surface disabled actions with deck-style reason modals.

### 14b. Care+ verification scope across devices

**Question:** Should **Care+ verification** be re-used across **multiple devices in one RMA** with separate IMEIs, or always one verification token per session?

**Why it matters:** The demo uses a single `carePlusVerified` boolean for the whole wizard (matches “skip re-verify” spirit from the deck but not a finalized security model).

**Suggested approaches:** Document token scope in backend design (`docs/database-draft.md`) and mirror in mock session state.

---

## 15. Phase 2B demo UX vs PPT density

**Question:** The mobile-first replacement preview uses **large tap targets and a vertical issue list** instead of a compact drop-down grid. Is that acceptable for stakeholder demos until brand-specific components land?

**Why it matters:** The reference deck sometimes implies denser controls; the Phase 2B pass prioritizes **parent-friendly scanning and thumb reach** on small phones over matching every layout pixel in the PPTX.

**Suggested approaches:** Treat current patterns as **demo defaults**; reconcile with design once official tokens (see §13) and a component library are finalized.

---

## 16. Phase 3A return wizard — refund/fee assumptions

**Question:** How should **return shipping fees**, **restocking**, and **partial bundle receipt** change the final refund after inspection—and when should customers see a **binding** estimate vs a non-binding range?

**Why it matters:** The Phase 3A UI applies a **single mock deduction** (`DEMO_RETURN_SHIPPING_FEE_CENTS` in code) and **per-line demo prices** (`demoLineTotalCents` on fixtures). That demonstrates **copy and layout** only, not final finance rules.

**Suggested approaches:** Replace mock constants with server-calculated quotes; align confirmation emails with the same rules; document channel-specific exceptions per **§7**.

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial list from PPTX text extraction + flow review. |
| 2026-05-18 | Added visual brand token question after Phase 1 UI scaffold. |
| 2026-05-18 | Added Phase 2A replacement wizard simplifications + Care+ scope. |
| 2026-05-18 | Added Phase 2B presentation UX note (issue list vs deck density, mock stock/backorder demo). |
| 2026-05-18 | Added Phase 3A return refund/fee assumptions (§16). |
