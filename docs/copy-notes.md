# Copy notes — TickTalk Service Portal Demo

UX writing guidance synthesized from **`reference/tradin return replace 260512.pptx`**. Use alongside brand/voice guidelines when they exist.

---

## Principles from the deck

- **Keep text concise** — especially on mobile; avoid long policy walls without structure.
- **Mobile readability first** — large headings, short paragraphs, progressive disclosure for nested issue detail.
- **Premium but simple tone** — respectful (“抱歉给你添麻烦了”), not corporate-legalese heavy in customer-facing helpers.
- **Reduce long paragraphs** — break policies into bullets, callouts, and labeled sections.
- **Clear CTA labels** — prefer short buttons: e.g. **New here**, **Have an Account**, **Next**, **Preview**, **Agree**, **Sign In**, **Wait for restock** (finalize English casing in glossary).
- **Friendly error messages** — explain what happened and the next step (retry, check spam folder, verify country code).

---

## Buttons

| Context | Direction | Notes |
|---------|-----------|--------|
| First-time vs returning | “New here? Start your request.” → shorten to **New here** / **Have an Account** for layout. | Avoid two long sentences on one row. |
| OTP | **Send verification code** / **Submit** / **Sign In** | Disable until required fields complete; show countdown on send. |
| Multi-item wizards | **Add item(s)** / **Next** / **Preview** | Disable **Add item(s)** when no eligible items remain; show **No additional eligible items available** (helper and/or `title` tooltip). |
| Trade-in | **Yes, please** / **No thanks** (deck: “No Thanks is unused” — clarify final label) / **Join Now** / **Agree** / **Cancel** | **Agree** confirms value + terms. |
| Inventory | **Wait for restock** (a.k.a. waitlist) / pick alternate color | Explain queue behavior in modal body. |
| Destructive | **Remove**, **Cancel order**, **Delete** line | Always pair with confirmation modal. |

---

## Modal wording

| Scenario | Copy direction |
|----------|----------------|
| Care+ exclusive | Lead with eligibility: only Care+ subscribers may proceed; offer **Verify** or **Cancel**. |
| Code sent (3s) | “Verification code sent—please enter it within 5 minutes.” (auto-dismiss toast.) |
| RMA created | Confirm creation; show **RMA number**; set expectation for next email/step. |
| No stock (some colors) | Show **available colors** only; hide colors with zero inventory. |
| No stock (all colors) | Acknowledge request; promise follow-up (“我们会尽快联系你”). |
| Remove trade-in / line item | “Remove this item?” + consequence (may reset progress). |
| Cancel service order | “Cancel this replacement/return?” + irreversibility clause where true. |

---

## Error wording

| Scenario | Copy direction |
|----------|----------------|
| Order lookup | Single friendly line: check order number **and** shipping zip/postal. |
| Unknown / wrong IMEI | One concise line; consider inline under field (red) + support CTA if repeated failure. |
| OTP wrong / expired | Offer **Resend** when allowed; show **attempts/limits** when nearing cap. |
| Daily OTP cap | Plain language: “Daily code limit reached—try again tomorrow or contact support.” |
| Email not received | Suggest spam/junk for email delivery path. |
| SMS not received | Ask user to verify **country code** + **number**. |
| Verification generic failure | Avoid blank failures; map to retry or support when possible. |
| Login mismatch | Avoid blaming user; “We couldn’t verify this account or code.” |

---

## Verification wording

- **Care+ modal title/body** — state *why* verification is needed (exclusive benefit).
- **Field labels** — watch phone number; account that purchased Care+ package; verification code.
- **Send CTA** — disabled until minimum fields valid; after tap, switch to countdown.
- **Success** — short confirmation (~3s) before continuing issue form.
- **Re-verification skip** — if implemented, no copy needed; ensure silent pass doesn’t confuse users if they expect another step.

---

## Status wording

**Replacement / RMA (examples from deck)** — localize consistently:

- 未处理 → **Pending**
- 等待客户回复 → **Awaiting your reply**
- 已拒绝 → **Rejected**
- 等待客户发货 → **Waiting for your shipment**
- 客户发货超时 → **Shipment deadline passed** (TBD friendly phrasing)
- 客户已发货 → **Shipped by customer**
- 验收中 → **Inspection in progress**
- 验收失败 → **Inspection failed**
- 缺货等待 → **Backorder / Awaiting restock**
- 未包装 → **Preparing shipment** (validate with ops)
- Shipped (new device) — read-only tracking state

**Returns** — deck lists granular refund pipeline (apply → review → label → … → **Refunded**). Use progressive summary + detail drawer to avoid walls of text.

---

## Open follow-ups

- Final English glossary for all Chinese status labels in slides.
- Harmonize **Wait for restock** vs **Waitlist** naming across apps.
- Policy blocks: ensure **international** variants match legal review.

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial copy inventory from PPTX text extraction. |
