# User flows — TickTalk Service Portal Demo

Structured from **`reference/tradin return replace 260512.pptx`**. Each flow lists entry, steps, outcomes, failures, and product questions to resolve.

---

## 1. New User Flow

**Entry point**

- Replacement (or service) entry showing **policy/terms** → user must agree before continuing.
- Choice: **“New here? Start your request.”** (deck: short mobile labels like “New here” vs long copy).

**Steps**

1. Accept replacement policy/terms (required).
2. Land on **channel selection**; default channel = **myticktalk.com** with **Next** already enabled (per deck revision).
3. Channel-specific **order lookup**: order number + shipping zip/postal (formats differ by Amazon, Walmart, Best Buy, myticktalk, etc.).
4. Optional **“?”** help: channel-specific instructions for finding order number.
5. Submit lookup; on success → **order detail** for that purchase.

**Success states**

- Valid channel + order + zip → order detail with correct line items and action availability.

**Error states**

- Generic fuzzy message: order number **or** zip/postal incorrect (not both enumerated separately).
- Ability to go **back** and change channel if user is on wrong retailer flow.

**Open questions**

- Should lookup ever allow **order-only** (no zip) for certain channels?
- Multi-shipment partial state: deck notes one order can show **multiple fulfillment states**—how is that surfaced in UI?

---

## 2. Existing User Login Flow

**Entry point**

- From policy screen: **“Have an account? Sign in to continue.”**
- Registration screens also expose **login**.

**Steps**

1. Choose **email** or **phone** login.
2. Enter identifier → **Send verification code** enabled.
3. Send code → **3s toast** “sent, fill within 5 minutes”; start countdown; show **didn’t receive** path.
4. Enter OTP → **Sign In** enables → submit.

**Success states**

- Combined **sales + after-sales** order list; user can open details or start new service via **“+”**.

**Error states**

- OTP expired, wrong code, unknown error.
- Email: spam-folder guidance for missing mail.
- Phone: confirm country code + number.
- Combined “account or verification code incorrect” where appropriate.

**Open questions**

- Session duration and refresh token behavior?
- Account linking if same person uses email sometimes and phone other times?

---

## 3. Return Flow

> **Phase 3A (mock UI):** Clickable wizard at `/service/return/:orderId` — see `src/features/return/`. Refund math and fee deductions are illustrative; track product gaps in `docs/open-questions.md`.

**Entry point**

- From order detail: **Return** (when eligible). Deck calls out added **Return entry UI** and **gift cannot be returned alone**.

**Steps**

1. Select item(s) to return; may add multiple via **Add item(s)** modal; **each additional watch may require IMEI entry again**.
2. Choose return reason(s); some reasons need no free text.
3. If user removes all but one item then taps **X** on last → return to order page.
4. **Contact** screen → **Preview** (shows items, reasons, refund amounts, shipping/policy copy).
5. Edit contact/ship info as needed; confirm submit.
6. **Register account** (if new-user path) before final submit—reuse earlier email/phone defaults.

**Success states**

- Return request created; status timeline moves from customer apply → review → label → ship → receive → inspect → refund/negotiation terminals per deck.

**Error states**

- Disabling **Add item(s)** when no eligible items remain (with short helper text).
- Gift rules: cannot return gift alone; returning purchased item may require **returning gift with it**.

**Open questions**

- Exact **fee deduction** copy for shipping (deck flags need to “讲清楚运费扣除”).
- Domestic vs international policy blocks—deck notes policy should cover intl customers.
- **Missing UI** in deck for some post-submit states—needs design pass.

---

## 4. Replacement Flow

> **Phase 2A (mock UI):** Clickable wizard at `/service/replace/:orderId` — see `src/features/replacement/`. Per-line eligibility and full inventory branching are simplified; track gaps in `docs/open-questions.md` §14.

**Entry point**

- Order detail **Replace** when enabled; unavailable actions show **disabled + reason** modal (e.g. outside 30-day return window, outside exchange warranty).

**Steps**

1. Select watch(es) to replace; issue selection per product.
2. Some issues require **description and/or photos** (only one of the two may suffice for some options).
3. **Care+ only** issues: warn → optional **Verify Care+** or cancel (revert selection).
4. If verifying: Care+ verification sub-flow (see §6); if **already verified** for this order, skip re-verification (per deck note on later reasons).
5. **Add item(s)** loop; re-enter IMEI for each added watch.
6. Accessories path: simpler issue + optional image; **Next** when complete.
7. **Contact** + international **address** screens; normalize phone (strip symbols).
8. **Preview**: show issues, auto-filled descriptions where user didn’t type, editable address, removable lines with confirm modal.
9. Submit → generate **RMA**, inventory checks (see success/error).

**Success states**

- RMA created and visible in detail with correct binding to order.
- If user picks alternate color when preferred is OOS, proceed; if **all** colors OOS → messaging path (deck: notify customer, no stock picker).

**Error states**

- **No inventory** modal: offer other colors; **Wait for restock** queues by request date; auto-assign when stock returns (future backend).
- Validation errors on uploads, mandatory fields, IMEI mismatch.

**Open questions**

- Backend-configurable **cross-generation** swaps (e.g. gen5 → gen6): who configures sku mapping in admin?
- Exact field order for address form (deck says current ordering is messy).

---

## 5. Trade-in Flow

**Care / APP entry**

- TickTalk Care or app shows Trade-in prompt when **warranty expired** or **new product launch** scenarios (per deck).

**Steps**

1. Tap Trade-in → **preview** page: trade value, old device name, steps, policies.
2. If **multiple new products** for sale → **Agree** opens product picker; single SKU path skips picker.
3. Jump to purchase page with trade-in context embedded.

**Website / checkout entry**

1. Purchase page **Trade-in module**; default **No thanks**; **Yes, please** starts flow.
2. **Terms** link + **How to trade-in?** modal.
3. **Join Now** → choose **brand** of old watch (pricing varies); optional **Add item(s)** tied to **quantity of new watches** (portal terminology; deck may say “add another”).
4. If brand = **TickTalk** → **IMEI** field; tooltip help; validate IMEI before Next/**Add item(s)** enabled.
5. Preview → **Agree** applies trade to checkout line item; **Cancel** reverts module to “No trade-in”.
6. Cart shows **Trade-in** tag with removable devices (trash → confirm).
7. Quantity changes: adding watches may require more trade-ins; reducing quantity may force **which trade-in to remove** (deck defines multi-select rules).

**Success states**

- Trade-in tagged line items in cart/checkout; pricing reflects allowance.

**Error states**

- Invalid IMEI (inline red helper text; block progression).
- Mismatch between number of new watches and trade-ins when qty changes.

**Open questions**

- Full **post-checkout** instructions, email triggers, and device ship-back logistics (deck: “要讨论”).
- Pricing table maintenance (CMS vs hardcoded).

---

## 6. Care+ Verification Flow

**Entry point**

- From replacement issue that is **Care+ exclusive** (e.g. certain physical damage) or water damage path requiring Care+.

**Steps**

1. Intercept modal: states Care+ exclusivity → user chooses **Verify** or **Cancel** (cancel returns selection to untouched).
2. Verification screen: **watch phone number** (default country +1), **parent/guardian account** that purchased Care+, **Send verification code** once both fields present (phone optional digits per deck—backend defaults country).
3. On send: validate account↔phone association, start countdown, **didn’t receive** path, 3s “code sent” toast.
4. Enter OTP → **Submit** → success toast (~3s) or error.

**Success states**

- Verification flag stored so later Care+-only reasons in same flow may **skip** repeat verification.

**Error states**

- Wrong/expired OTP, unknown errors, daily **5 send** cap, bad account/phone combo, spam-folder email guidance where email channel used.

**Open questions**

- Is verification **per device IMEI**, per order, or per portal session TTL?
- TT5-only restriction called out—behavior for other models?

---

## 7. RMA Status Tracking Flow

**Entry point**

- From logged-in **order list** → open service order / RMA detail, or deep link (TBD).

**Steps**

1. User scans timeline/status chip (replacement statuses from deck, e.g. unprocessed → awaiting customer response → rejected → awaiting customer ship → timeout → received → inspecting → fail → backlog wait → awaiting pack → shipped…).
2. If allowed, **cancel** replacement before new device ships (confirm modal).
3. Terminal **read-only** states after ship or rejection with email follow-up notes.
4. **Contact** opens messaging with subject `RMA#…` (implementation TBD).

**Success states**

- Status updates visible; user understands next action (ship back, wait, contact support).

**Error states**

- Load failures; stale status—needs retry UX.

**Open questions**

- Public tracking **without login** (not explicit in deck)—required?
- Exact copy deck for each status in English/Chinese parity?

---

## 8. Admin Dashboard Flow

> **Note:** The deck references an internal-facing concept (e.g. message threads listing RMAs, left nav sorted by time, jump into RMA management) but **does not** include full admin UI mocks in the extracted slides.

**Entry point (assumed)**

- Staff portal login (SSO TBD).

**Steps (draft)**

1. View queue/list filtered by status, SLA, or channel.
2. Open RMA → edit state, notes, inventory allocation, messages.
3. Trigger customer-visible events (request more info, approve, reject).

**Success states**

- Customer portal reflects admin-driven status transitions.

**Error states**

- Conflicting edits; integration failures with carrier/inventory.

**Open questions**

- Roles/permissions; audit log requirements; which statuses are staff-editable vs system-only?
- How **Contact** messages tie to CRM or email provider?

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial pass from PPTX text extraction. |
