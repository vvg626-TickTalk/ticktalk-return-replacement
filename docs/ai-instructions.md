# AI instructions — TickTalk Service Portal Demo

Permanent guidance for **implementation** and **UX writing** when using AI tooling on this repository. These rules sit alongside `docs/requirements.md`, `docs/user-flows.md`, `docs/copy-notes.md`, and `docs/open-questions.md`.

---

## Authoritative references

- **`reference/` PPT** (`reference/tradin return replace 260512.pptx` and successors): **source of truth** for flows, policies, eligibility concepts, and UI/UX direction (hierarchy, spacing sensibility, wording structure).
- **`docs/open-questions.md`**: where **ambiguous or unresolved** product logic must be recorded—**do not silently reinterpret** the deck.
- **`docs/copy-notes.md`**: patterns for CTAs, modals, errors, and status wording derived from the deck.

**Hard rules**

1. **Preserve the original business logic from the PPT.** If something is unclear, do **not** invent final policy—add or update **`docs/open-questions.md`** (question, why it matters, suggested approaches).
2. **Never change business logic without** a corresponding note in **`docs/open-questions.md`** (or an approved update to requirements/flows agreed with stakeholders). Code comments are not a substitute.
3. If **UX best practice** and the **PPT layout** conflict, **prioritize mobile usability** while **preserving business intent** (eligibility, sequencing, required disclosures). Document the tension in **`docs/open-questions.md`** when it affects customer-facing promises.

---

## Product philosophy

- **Self-service that respects parent time:** fast paths, minimal cognitive load, obvious next steps.
- **Trust through clarity:** what we need (IMEI, proof, address), why it matters (short), what happens next.
- **Premium, not flashy:** calm surfaces, generous spacing, restrained color; no noisy patterns or gimmicks.
- **Mock-first honesty:** the app may use fixtures; never imply real money movement, real OTP delivery, or real inventory without a live backend.

---

## UI/UX principles

- **Progressive disclosure:** show only what the step needs; reveal follow-ups after reason/category selection where the deck does.
- **State-driven UI:** disabled actions include a path to understanding (inline hint, modal, or link to policy—per flow).
- **One primary action per screen** when possible; secondary actions stay visually quieter.
- **Consistent chrome:** reuse `AppShell`, `PageHeader`, `Card`, `Button`, `Modal`, `Stepper`, and established spacing tokens (`tailwind.config.js` / `src/index.css`).
- **Accessibility:** real labels for inputs, errors associated with fields, modals dismissible and keyboard-friendly; don’t rely on color alone for meaning.
- **Don’t ship long policy walls** in the middle of a wizard; use bullets, accordions, or links to static policy when legal needs depth.

---

## Mobile-first rules

- **Design for a narrow viewport first**; add columns or side-by-side layouts only when they reduce scrolling without hiding critical actions.
- **Touch targets:** primary controls must be comfortable to tap; avoid dense tables on customer flows unless horizontally scrollable with clear affordance.
- **If a sentence feels too long for mobile UI, shorten it** while preserving meaning (then re-read on a small breakpoint).
- **Avoid horizontal overflow** on forms and cards; test typical longest strings (email, address line 1, IMEI).
- **Steppers and wizards:** keep step labels short; prefer **Next**, **Back**, **Preview**, **Submit** style CTAs aligned with `docs/copy-notes.md`.

---

## Copywriting rules

- **Optimize wording for native US English UX** (clear, direct, idiomatic). Not literal translations from other languages unless a bilingual spec exists.
- **Prioritize mobile readability:** short lines, scannable bullets, minimal clause stacking.
- **Keep sentences short.** Prefer one idea per sentence in instructional and error copy.
- **Avoid overly formal or “translated” tone** (e.g. legalese walls, stiff greetings). Stay human and calm.
- **Avoid long explanatory paragraphs** in the flow; split into bullets or a **short** paragraph + “Learn more” where appropriate.
- **Premium, friendly, modern SaaS tone:** confident, helpful, never preachy or childish.
- **Concise CTA labels:** e.g. **New here**, **Have an Account**, **Send verification code**, **Sign In**, **Add item(s)**, **Preview**, **Submit**, **Wait for restock**—glossary alignment with `docs/copy-notes.md`.
- **Parent-friendly:** respectful of caregivers’ time; reassure without anxiety-inducing drama.
- **Errors:** friendly, specific next step (“Check order number and ZIP,” “Verify country code,” “Try resend in …”). Map to patterns in `docs/copy-notes.md`.

---

## English localization rules

- **US English** spelling and conventions for customer-facing strings in this repo unless a locale strategy is explicitly added (`en-US`).
- **Dates/numbers:** use `Intl` where formatting matters; don’t hardcode ambiguous numeric formats in mock UI.
- **Currency:** if shown, prefer explicit currency (e.g. USD) in mock copy or via `Intl.NumberFormat`—don’t assume symbols alone are enough for production.
- **Avoid idioms or jokes** that don’t travel; keep plain language for error and policy UX.
- When bilingual (EN/ZH) shipping is required later, treat **copy as data** (CMS or resource files)—don’t scatter one-off translations in components without a plan.

---

## Component behavior rules

- **Reuse before inventing:** extend `src/components/` patterns; new primitives only when they clear duplicated behavior or accessibility fixes land in one place.
- **Modals:** clear title, short body, explicit primary/secondary; destructive actions need confirmation; respect `Escape` and backdrop behavior already in `Modal`.
- **Forms:** `FormField` for label/hint/error wiring; don’t duplicate error semantics.
- **Loading / disabled:** disabled CTAs need an obvious reason nearby or upstream (validation message, step gating).
- **Customer vs admin:** don’t leak internal jargon in customer UI; admin views may use operational labels but stay readable.
- **Wizards:** keep step state recoverability in mind; URL + state strategy should follow existing modules (e.g. `src/features/replacement/`).

---

## Mock data rules

- **No real PII:** fake names, emails, phones, IMEIs, addresses.
- **Fixtures reflect edge cases** called out in docs (multi-item, Care+, inventory, gifts) **only when** aligned with the PPT or explicitly documented in `docs/open-questions.md`.
- **Helpers live in** `src/mock-data/` (typed exports, small getters); avoid duplicating raw IDs across many files.
- **Never imply API contracts** in mock helpers that legal/compliance hasn’t approved—prefix risky assumptions in **`docs/open-questions.md`**.
- When extending mock data for a new flow, **update** `docs/user-flows.md` or `docs/requirements.md` if the data encodes a **new** business rule.

---

## Future backend integration rules

- **Replace mock getters with API clients** in dedicated layers; keep route components thin.
- **Validate parity:** backend rules for lookup, OTP, RMA states, inventory, and Care+ must match docs; mismatches go to **`docs/open-questions.md`** until resolved.
- **Errors:** map HTTP/status codes to the user-facing patterns in `docs/copy-notes.md`; don’t expose raw stack traces or internal IDs unless product asks.
- **File upload:** when implemented, use signed URLs or prescribed API patterns—until then, placeholders stay clearly **disabled** or labeled “demo.”
- **Auth:** session/refresh and account linking are product decisions—document unknowns rather than guessing in UI copy.

---

## Open question handling

When product intent is **unclear**, **contradictory**, or **likely to change**:

1. **Do not encode guesses as definitive UI or copy** (no “final” policy statements).
2. Add an entry to **`docs/open-questions.md`** with:
   - **Question**
   - **Why it matters**
   - **Suggested approaches**
3. If implementation must proceed anyway, use **neutral** copy (“We’ll confirm…”, “Your request was received…”) and/or **feature flags / TODO** tied to the open question ID in commit/PR description—not buried only in code comments.
4. If the PPT and **engineering practicality** conflict, **preserve business intent**, **choose the clearer mobile UX**, and **log the decision path** in **`docs/open-questions.md`** for stakeholder review.

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial AI implementation + UX writing rules for this repo. |
