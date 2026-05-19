# PPT alignment audit — Replacement & Return (mock wizards)

**Scope:** Phase 2A **Replacement** (`/service/replace/:orderId`) and Phase 3A **Return** (`/service/return/:orderId`) as implemented in this repo.

**Methodology:** The binary deck in `reference/tradin return replace 260512.pptx` is not machine-readable here. **PPT intent** below is inferred from that artifact **indirectly** via `docs/user-flows.md`, `docs/requirements.md`, `docs/copy-notes.md`, and `docs/open-questions.md`, plus alignment rules in `docs/ai-instructions.md` and `.cursor/rules/ticktalk-service-portal.mdc`. Stakeholders should confirm any item marked **Partial** or **Missing** against the live slides.

**Instruction:** This document is **audit-only**; no implementation changes were made for this file.

---

## Completed fixes (product alignment passes)

The following **high-priority** gaps called out in stakeholder follow-up were implemented in code (see git history). Rows below point to the main behavior change.

| Focus | Audit sections | Implementation notes |
|-------|----------------|----------------------|
| **Replace policy / terms entry** | §1.1 (Medium in original audit; requested as PPT alignment) | Items step: short terms summary, **View policy summary** modal, checkbox required before **Continue**. `ReplaceFlowWizard.tsx` |
| **Order detail disabled CTAs + reasons** | §2.1 **High**, §2.2 Medium | `getOrderReplaceSummary()` in `eligibility.ts`, `getOrderReturnSummary()` in `returnEligibility.ts`; **Return** / **Replace** disabled with inline reason on `OrderDetailPage.tsx`. |
| **Partial OOS → alternate color** | §1.3 Medium → implemented per request | `replacementInventory.ts` — `analyzeReplacementSubmit()`; modal: in-stock colors only, **Wait for restock** → `beginSubmit('oos')`. `demoPurchasedColor` on `OrderLine` (watch on `ord-101` = Lunar Gray). |
| **All colors OOS** | §1.3 | Still uses **Request received** / restock path + confirmation copy. |
| **Return IMEI** | §6.2 **High** | Watch lines: IMEI on items + preview; `imeiByLineId` + validation in `ReturnFlowWizard.tsx`. |

---

## Legend

| Match level | Meaning |
|-------------|---------|
| **Full** | Behavior and framing match documented deck intent and project rules. |
| **Partial** | Core path exists but differs in sequencing, copy, gating, or depth. |
| **Missing** | No customer-visible equivalent or explicit deferral. |

| Priority | Meaning |
|----------|---------|
| **High** | Risk to trust, policy clarity, or major deck journey gap. |
| **Medium** | Noticeable UX or compliance-adjacent gap; workaround exists. |
| **Low** | Polish, parity on edge cases, or internal QA affordances. |

---

## Summary matrix (by audit area)

| # | Area | Replace | Return |
|---|------|---------|--------|
| 1 | Flow order | Partial | Partial |
| 2 | Button enable/disable | Full | Full |
| 3 | Add item(s) | Full | Full |
| 4 | Delete/remove | Full | Full |
| 5 | Gift behavior | Partial | Partial |
| 6 | IMEI behavior | Partial | Partial |
| 7 | Care+ verification | Partial | N/A |
| 8 | Contact/shipping layout | Full | Full |
| 9 | Preview/review layout | Partial | Partial |
| 10 | Policy copy placement | Partial | Partial |
| 11 | Mobile readability | Full | Full |
| 12 | Modal sequence | Partial | Partial |
| 13 | Confirmation page | Partial | Partial |
| 14 | “Backend system” tone | Medium risk | Low risk |

---

## Findings

### 1. Flow order

#### 1.1 Replace — Steps vs deck journey

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4: pick items → issues per product (with Care+ branch) → contact/address → preview → submit; inventory branching when relevant. Broader product vision (`docs/requirements.md`) includes **policy/terms** before or alongside service entry for some paths. |
| **Current implementation** | **Items** step: terms summary + **View policy summary** modal + checkbox required before **Continue**. Otherwise same linear wizard + Care+ in Issue + inventory modals on submit. |
| **Match level** | **Partial** → **Full** for “policy reminder at entry” (demo scope); full legal policy still external. |
| **Priority** | **Medium** |
| **Implementation status** | ✅ **Done** — see **Completed fixes** table. |
| **Suggested fix** | Confirm whether Replace from **order detail** should inherit earlier policy acceptance only, or needs an explicit **short policy reminder** / link at wizard entry (per deck “必须先同意” style flows in `docs/user-flows.md` §1). If required, add a lightweight step or `PageHeader` link + modal, not a wall of text (`docs/ai-instructions.md`). |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, possibly `src/pages/service/OrderDetailPage.tsx`, static policy route TBD |

#### 1.2 Return — Steps vs deck journey

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | `docs/user-flows.md` §3: select items (**Add item(s)**) → reasons → contact → preview (refund/fees/policy) → submit; optional **register account** before final submit on new-user path. |
| **Current implementation** | **Items → Reason → Ship to → Review → Confirmation**. No **account registration** sub-step. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | If deck mandates account creation before submit for “new here” users, add either a branching step or a clear CTA that matches `docs/user-flows.md` §3 step 6; until then, document intentional omission in `docs/open-questions.md` with neutral copy (“we’ll email…”) per `docs/ai-instructions.md`. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx`, `docs/user-flows.md`, `docs/open-questions.md` |

#### 1.3 Replace — Inventory / color picker depth

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4 success/error: **some colors OOS** vs **all colors OOS**; alternate color selection when partial OOS. |
| **Current implementation** | **`analyzeReplacementSubmit`** (`replacementInventory.ts`): per-product **all SKUs `onHand === 0`** → waitlist path; watch with **purchased color** row OOS but other colors in stock → **Pick another color** modal (in-stock colors only) or **Wait for restock**; else in-stock confirmation. `OrderLine.demoPurchasedColor` drives purchased finish in mocks (e.g. TT5 Lunar Gray). |
| **Match level** | **Partial** → **Full** for mock two-path inventory (partial vs all OOS). |
| **Priority** | **Medium** |
| **Implementation status** | ✅ **Done** — see **Completed fixes** table. |
| **Suggested fix** | Extend mock inventory UX when product-level rules warrant: partial OOS → constrained picker; all OOS → current messaging. Track exact rules in `docs/open-questions.md` §9 if not in deck. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `src/mock-data/inventory.ts`, `docs/open-questions.md` |

---

### 2. Button enable/disable behavior

#### 2.1 Replace — Entry gating from order detail

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4 entry: Replace when enabled; **unavailable** actions show **disabled + reason** (e.g. outside window, outside exchange warranty). |
| **Current implementation** | **`getOrderReplaceSummary`** + disabled **Replace** with inline reason on order detail when nothing shipped or nothing replace-eligible. |
| **Match level** | **Full** (demo gating on hub). |
| **Priority** | **High** |
| **Implementation status** | ✅ **Done** — see **Completed fixes** table. |
| **Suggested fix** | Compute replace eligibility at order/line level and **disable** Replace with inline or tooltip reason, or open **short reason modal** consistent with `docs/copy-notes.md` “state-driven CTAs.” |
| **File(s) likely affected** | `src/pages/service/OrderDetailPage.tsx`, `src/features/replacement/eligibility.ts`, possibly new helper |

#### 2.2 Return — Entry gating from order detail

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Same pattern as other service CTAs: eligible vs not with clear **why**. |
| **Current implementation** | **`getOrderReturnSummary`** + disabled **Return** with reason when no line passes `getReturnEligibility`. |
| **Match level** | **Full** (demo). |
| **Priority** | **Medium** |
| **Implementation status** | ✅ **Done** (implemented together with §2.1). |
| **Suggested fix** | Optionally disable **Return** on order when **no** line is return-eligible, with one-line explanation; avoids empty wizard frustration. |
| **File(s) likely affected** | `src/pages/service/OrderDetailPage.tsx`, `src/features/return/returnEligibility.ts` |

#### 2.3 Replace — Continue without IMEI

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | Deck emphasizes IMEI correctness for watches (`docs/requirements.md`, `docs/user-flows.md` §4). |
| **Current implementation** | **Continue** disabled until each watch line has plausible **15-digit** IMEI; accessories skip. |
| **Match level** | **Full** (for demo validation depth) |
| **Priority** | **Low** |
| **Suggested fix** | None for demo; production may add **IMEI/order mismatch** checks (record under `docs/open-questions.md` §2). |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, future API layer |

#### 2.4 Return — Continue with zero items

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Cannot proceed without a valid selection. |
| **Current implementation** | **Continue** disabled until at least one primary item is selected. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | None. |
| **File(s) likely affected** | — |

---

### 3. Add item(s) behavior

#### 3.1 Replace

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4 step 5; `docs/copy-notes.md`: disable **Add item(s)** when none left. |
| **Current implementation** | Modal lists remaining **replace-eligible** lines; primary action validates IMEI when adding a watch; button **disabled** when no remaining lines. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | Optional: surface **why** no items remain (all selected vs none eligible) in modal empty state. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx` |

#### 3.2 Return

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Same as above; `docs/user-flows.md` §3. |
| **Current implementation** | Modal lists remaining **return-selectable primaries**; **Add item(s)** disabled when none; short helper **No additional eligible items available**; gifts remain non-addable alone. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | Same optional clarity as Replace. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx` |

---

### 4. Delete/remove behavior

#### 4.1 Replace — Remove line and last item

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/copy-notes.md`: destructive actions need confirmation; flow should handle “remove all” (`docs/user-flows.md` §3 pattern cited for **return**; replacement preview explicitly allows remove with confirm). |
| **Current implementation** | **Remove** on items step and preview → **Modal** confirm; removing last selection **navigates back to order**. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | Ensure copy matches deck tone for “cancel request” vs “remove item” if PPT differentiates. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx` |

#### 4.2 Return — Remove cluster / last item

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | `docs/user-flows.md` §3 step 3: remove last → return to order. |
| **Current implementation** | Remove primary **confirms**; drops **bundled gifts** from return set; last removal **navigates to order**. Preview remove uses same helper. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | None. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx`, `src/features/return/returnEligibility.ts` |

---

### 5. Gift item behavior

#### 5.1 Replace — Gift lines

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §3–§5 mention **gift** rules heavily for **returns**; replacement path in §4 focuses on **watch + accessory** paths without spelling out “gift cannot be replaced alone.” Open questions: gift-with-purchase integrity (`docs/open-questions.md` §5). |
| **Current implementation** | `isLineReplaceEligible` allows **shipped** `watch` **or** `accessory` including **`isGift: true`** lines. No **bundle forced pairing** for replacement (unlike return). |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Confirm deck rule: can a **promo gift** be replaced without the main unit? If not, mirror **return-style** `bundleId` rules or block gift-only replacement with parent-friendly copy. |
| **File(s) likely affected** | `src/features/replacement/eligibility.ts`, `src/features/replacement/ReplaceFlowWizard.tsx`, `docs/open-questions.md` |

#### 5.2 Return — Gift lines

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | `docs/user-flows.md` §3: **cannot return gift alone**; returning purchased item → gift must return **together** (`docs/requirements.md` §Goals). |
| **Current implementation** | Gifts **not addable** alone; selecting bundle **main** auto-expands **bundled gifts**; preview calls out **pack together**; reasons collected **per line** including gifts. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Deck may require **single reason** for bundle vs per-line—validate. If single: collapse gift reason UI when tied to parent. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx`, `src/features/return/returnReasons.ts` |

---

### 6. IMEI behavior

#### 6.1 Replace — Watch IMEI

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4, §6, `docs/requirements.md`: IMEI gating and display rules are material; deck has TT5 exceptions (`docs/open-questions.md` §2). |
| **Current implementation** | **15-digit** plausibility check only; no **order/IMEI cross-check** against mock `imeiRecords`; TT5-specific hiding rules not modeled beyond static display on order page. |
| **Match level** | **Partial** |
| **Priority** | **High** (for production parity); **Medium** (for demo) |
| **Suggested fix** | For deck fidelity: optional **IMEI must match line** guard in mock using `imeiRecords`; document TT5 edge cases in UI. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `src/features/replacement/eligibility.ts`, `src/mock-data/imeis.ts` |

#### 6.2 Return — Watch / line IMEI

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | `docs/user-flows.md` §3 step 1 states **each additional watch may require IMEI entry again** on **return** path. |
| **Current implementation** | **15-digit IMEI** required for each **watch** line on **Items** (and gift watch if ever present); shown on **Review**; synced from order line when added. Still no **`imeiRecords`** cross-check in mock. |
| **Match level** | **Partial** (flow present; server-side / record match still open). |
| **Priority** | **High** if deck mandates device identity on return; **Medium** if only replacement requires IMEI (confirm on PPT). |
| **Implementation status** | ✅ **Done** (capture + validation); cross-check still **Suggested fix** below. |
| **Suggested fix** | Add optional **IMEI must match line** guard in mock using `imeiRecords`; align with `docs/user-flows.md` or update doc if deck changed. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx`, `docs/user-flows.md`, `docs/open-questions.md` §2 |

---

### 7. Care+ verification behavior

#### 7.1 Replace — Gate + session skip

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4 steps 3–4, §6: intercept modal → verify or cancel; **skip repeat** verification later in **same flow** / order context (`docs/open-questions.md` §14b). |
| **Current implementation** | **Gate modal** → **Verify** opens second modal with `CarePlusVerifyForm`; **session** `carePlusVerified` skips subsequent Care+ gates. **QA “force outcome”** and magic error codes are exposed in **details** disclosure—appropriate for demo, not deck. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Tighten copy to `docs/copy-notes.md` Care+ patterns; confirm whether **Cancel** should reset partial **ReasonFields** selection vs leave blank (current: gate without committing reason). Deck: “cancel reverts selection”—ensure exact revert semantics match PPT. Hide QA tools behind build flag for stakeholder demos if desired. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `src/features/replacement/CarePlusVerifyForm.tsx`, `src/features/replacement/ReasonFields.tsx` |

#### 7.2 Return — Care+

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Care+ called out for **replacement** / warranty-adjacent paths in deck summary docs—not explicit on **return** wizard in `docs/user-flows.md` §3. |
| **Current implementation** | No Care+ branch. |
| **Match level** | **N/A** (until deck requires Care+ on return) |
| **Priority** | **Low** |
| **Suggested fix** | If PPT ties certain **return reasons** to Care+ or warranty, add gating; else document N/A. |
| **File(s) likely affected** | TBD |

---

### 8. Contact/shipping layout

| Field | Detail |
|-------|--------|
| **Flow** | Both |
| **PPT intent** | `docs/requirements.md`, `docs/ai-instructions.md`: mobile-first forms, intl split, **normalize phone** presentation. `docs/user-flows.md` §4 step 7. |
| **Current implementation** | Shared patterns: **US / International** toggle, `FormField` + `fieldControl`, phone **display formatting** via `phoneFormat.ts` (no backend). Field order matches replacement layout closely on return. |
| **Match level** | **Full** (for current demo scope) |
| **Priority** | **Low** |
| **Suggested fix** | Deck noted **messy field order** (`docs/user-flows.md` §4 open questions)—reorder once product finalizes. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `src/features/return/ReturnFlowWizard.tsx` |

---

### 9. Preview/review layout

#### 9.1 Replace — Preview

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/user-flows.md` §4 step 8: issues, auto descriptions, **editable address**, removable lines. |
| **Current implementation** | Shows lines with issue + note + IMEI; **Edit** shortcuts jump to earlier steps; **Remove** with confirm; address in muted panel. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Deck may want **inline edit** for address without step jump—evaluate vs mobile simplicity per `.cursor/rules/ticktalk-service-portal.mdc`. Add **photo/video** status if deck requires proof summary on preview. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `src/features/replacement/reasonValidation.ts` / `ReasonFields.tsx` |

#### 9.2 Return — Review

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | `docs/user-flows.md` §3 step 4: items, reasons, **refund amounts**, **shipping/policy** copy. |
| **Current implementation** | Items + reasons + **demo refund math** + fee deduction narrative + gift callout + **policy snapshot** bullets + contact. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Add **link** to full policy (`docs/ai-instructions.md` “don’t ship policy walls” but allow **Learn more**). Align fee line items with finance once known (`docs/open-questions.md` §6, §16). |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx`, static policy content |

---

### 10. Policy copy placement

#### 10.1 Replace

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | Policies for service, eligibility, international returns—`docs/requirements.md` Landing & policy; deck favors **short** disclosures in-flow. |
| **Current implementation** | **No** dedicated policy block or **Terms** link in wizard; header says preview build only. |
| **Match level** | **Missing** |
| **Priority** | **Medium** |
| **Suggested fix** | Add **one** calm line + **link** (“Return & replacement policy”) opening modal or `/policy` stub; avoid long in-flow walls per rules. |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, new static page/component |

#### 10.2 Return

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Same; return flow especially needs **fee** and **international** clarity (`docs/user-flows.md` §3 open questions). |
| **Current implementation** | **Policy snapshot** card on review; **refund/fee** disclaimers in estimate panel. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Add explicit **international** policy pointer if deck requires different copy; cross-link to hosted policy. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx` |

---

### 11. Mobile readability

| Field | Detail |
|-------|--------|
| **Flow** | Both |
| **PPT intent** | `docs/ai-instructions.md`, `.cursor/rules/ticktalk-service-portal.mdc`: **mobile-first**, short copy, touch targets, low clutter. |
| **Current implementation** | **Sticky** bottom actions (`WizardStickyActions`), **Stepper** with horizontal scroll pills, **cards**, large radios on reasons, `fieldControl` at 16px class baseline, modals scroll/max-height patterns in shared `Modal`. |
| **Match level** | **Full** (within Phase 2B/3A design intent) |
| **Priority** | **Low** |
| **Suggested fix** | Stakeholder pass on longest strings (issue labels, fee notes) on smallest target device. |
| **File(s) likely affected** | `src/features/replacement/*`, `src/features/return/*`, `src/components/*` |

---

### 12. Modal sequence

#### 12.1 Replace

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/copy-notes.md`: Care+ lead with eligibility; inventory modals differentiated (some vs all OOS); remove confirms. |
| **Current implementation** | Order: **Add item(s)** → **Remove** → **Preview remove** → **Care+ gate** → **Care+ verify** → **OOS** (after submit, not deck’s “alternate color” fork). Multiple modals **stack** if user triggers overlapping (edge case). |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Audit **z-index** and “only one modal” rule if deck requires strict sequencing; align **OOS** modal timing with `docs/user-flows.md` (pre vs post RMA numbering—current generates RMA then OOS path). |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `src/components/Modal.tsx` |

#### 12.2 Return

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Confirm dialogs for destructive actions; fewer specialized modals than replace. |
| **Current implementation** | **Add item(s)**, **remove primary**, **preview remove**—clean sequence; no inventory/Care+ modals. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | None. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx` |

---

### 13. Confirmation page

#### 13.1 Replace

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | `docs/copy-notes.md`: RMA created, number visible, **set expectation** for email/next step; OOS path messaging. |
| **Current implementation** | Shows **reference** + outcome-dependent body (in stock vs OOS) + short bullets + **Back to order** / **View requests**. |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Align terminology (**RMA** vs **reference**) with glossary deck; add **timeline** teaser (“what happens next”) if PPT shows status chip progression (`docs/copy-notes.md` Returns pipeline). |
| **File(s) likely affected** | `src/features/replacement/ReplaceFlowWizard.tsx`, `docs/copy-notes.md` (glossary) |

#### 13.2 Return

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | `docs/user-flows.md` §3: request created; pipeline toward refund; email with instructions. |
| **Current implementation** | Mock **TT-** code + bullets: review, email instructions, refund after inspection. |
| **Match level** | **Partial** |
| **Priority** | **Low** |
| **Suggested fix** | Add **tracking** or **portal** CTA if deck promises immediate visibility of return status. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx`, `src/pages/account/*` |

---

### 14. “Backend system” vs customer support experience

#### 14.1 Replace — Internal / QA leakage

| Field | Detail |
|-------|--------|
| **Flow** | Replace |
| **PPT intent** | Premium, parent-friendly self-serve (`docs/ai-instructions.md`, `.cursor/rules/...`). |
| **Current implementation** | **Care+** form includes **“QA · force an error (demo)”** `<details>`; header admits **“Preview build—answers aren’t saved.”** Inventory path driven by **`listInventoryForProduct`** (transparently mock). |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | For executive demos: hide QA controls via `import.meta.env` or role; soften internal language (“We couldn’t save your answers yet”) only if still **honest** per mock rules. |
| **File(s) likely affected** | `src/features/replacement/CarePlusVerifyForm.tsx`, `src/features/replacement/ReplaceFlowWizard.tsx` |

#### 14.2 Return — Refund estimate disclaimer

| Field | Detail |
|-------|--------|
| **Flow** | Return |
| **PPT intent** | Clear fees without sounding like an invoice system (`docs/open-questions.md` §6). |
| **Current implementation** | **Demo-labeled** line items and explicit **inspection** dependency—generally support-site tone; **“demo estimate”** repeated appropriately. |
| **Match level** | **Full** |
| **Priority** | **Low** |
| **Suggested fix** | Optional: reduce simultaneous **(demo)** labels if redundancy feels clinical—keep one clear disclaimer per `.cursor/rules/...` **mock-first honesty**. |
| **File(s) likely affected** | `src/features/return/ReturnFlowWizard.tsx` |

#### 14.3 Order detail — Service entry still generic

| Field | Detail |
|-------|--------|
| **Flow** | Both |
| **PPT intent** | Order detail is customer hub for **why** actions differ (`docs/requirements.md`). |
| **Current implementation** | **Return** / **Replace** use disabled states + reasons; **Trade-in** still undifferentiated (preview). |
| **Match level** | **Partial** |
| **Priority** | **Medium** |
| **Suggested fix** | Surface **human reasons** next to actions; avoids “blank portal” feel. |
| **File(s) likely affected** | `src/pages/service/OrderDetailPage.tsx` |

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial audit for completed Replace + Return mock wizards (no code changes). |
| 2026-05-18 | Logged completed fixes: replace policy entry, order CTAs + reasons, partial/all OOS paths, return IMEI. |
