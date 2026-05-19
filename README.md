# TickTalk Service Portal Demo

Front-end planning repo for a **customer service portal demo** covering returns, replacements, trade-in, Care+ verification, and RMA tracking—aligned to the product deck in `reference/`.

> **Authoritative product/UI reference:** `reference/tradin return replace 260512.pptx`

The repo includes a **Phase 1 UI scaffold**, **Phase 2A** (replacement wizard), and **Phase 3A** (return wizard)—all **mock data only**—no real APIs.

---

## What this demo is

- A **customer + admin portal shell** with realistic navigation, short copy, and cards/badges aligned to `docs/copy-notes.md` and `docs/user-flows.md`.
- **Mock-first:** business rules and edge cases from the deck (inventory, OTP, gift bundles, channel-specific order formats) will be exercised via fixtures before real APIs exist.

---

## Folder structure

| Path | Purpose |
|------|---------|
| `docs/` | Requirements, flows, copy, open questions, DB sketch. |
| `reference/` | Primary PPTX requirements (not modified by automation). |
| `output/screenshots/` | Design captures / QA (placeholders). |
| `output/demo-build/` | Future exported static build or packaging (placeholders). |
| `src/components/` | Reusable UI components (`AppShell`, `Button`, `Card`, …). |
| `src/pages/` | Route screens (`service/`, `account/`, `admin/`). |
| `src/mock-data/` | Typed fixtures + small getter helpers. |
| `src/styles/` | Reserved for future `theme` / CSS layers (optional). |
| `src/features/replacement/` | Phase 2A replacement wizard (reasons, Care+ mock, flow state). |
| `src/features/return/` | Phase 3A return wizard (reasons, refund preview, gift/bundle rules). |
| `index.html` | Vite HTML entry. |

---

## Documentation index

| Document | Description |
|----------|-------------|
| [docs/ai-instructions.md](docs/ai-instructions.md) | Permanent AI implementation + UX writing rules for this repo. |
| [docs/requirements.md](docs/requirements.md) | Overview, scope, modules, UX principles, mock/API notes. |
| [docs/user-flows.md](docs/user-flows.md) | Eight core journeys decomposed (new user → admin draft). |
| [docs/copy-notes.md](docs/copy-notes.md) | Voice/UX writing patterns + CTA/error templates. |
| [docs/open-questions.md](docs/open-questions.md) | Product unknowns to resolve with stakeholders. |
| [docs/database-draft.md](docs/database-draft.md) | Early backend entity brainstorm (non-final). |

---

## How to run locally

Prerequisites: **Node.js 20+** (recommended).

```bash
cd ticktalk-service-portal-demo
npm install
npm run dev
```

The dev server is pinned to **port 5173** with **`strictPort: true`** (see `vite.config.ts`). It listens on **all interfaces** (`0.0.0.0`), so you can use:

- **Local:** [http://localhost:5173/](http://localhost:5173/)
- **LAN:** `http://<your-machine-ip>:5173/` (printed in the terminal)

If Vite exits with “Port 5173 is in use,” free the port (see below) and run `npm run dev` again.

**Check what is using port 5173 (macOS / Linux):**

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

**Stop a leftover Vite process:**

1. Note the **PID** from `lsof` (second column), then: `kill <PID>` (or `kill -9 <PID>` if it won’t exit).
2. Or, if you know it’s Vite: `pkill -f "vite"` (broader; stops all matching Vite processes).

**Production build preview** (`npm run preview`) also uses **5173** with `strictPort`, so don’t run `dev` and `preview` at the same time.

Other commands:

- **`npm run build`** — typecheck + production bundle to `dist/`
- **`npm run preview`** — serve the production build locally (port **5173**)


There is **no API configuration** (mock data only).

---

## Phase 2A — Customer replacement wizard (mock)

**Route:** `/service/replace/ord-101` (after `npm run dev`, open from **Replace** on the order page or type the URL).

**What’s implemented**

- Multi-item selection with **Add item(s)** (modal) and **Remove** (confirm). **Add item(s)** disables with a short helper when no eligible shipped lines remain.
- **IMEI** required for **watch** lines (15 digits). Removing the last selected item returns you to **`/service/order/:orderId`**.
- **Ten PPT-aligned issue reasons** with mobile-first follow-ups, optional/required description rules, and **photo/video upload placeholders** (disabled) where needed.
- **Care+ gate** for “screen cracked / drop damage” and “water damage”: **Verify Care+** opens a **mock OTP** flow (countdown + submit). **Cancel** closes the gate without changing the dropdown. After one successful verification, additional Care+ reasons skip the gate (session flag).
- **Mock Care+ verification:** use **Forced outcome** (QA) or codes: `120001` expired · `120002` incorrect · `120003` mismatch · `120004` daily limit · `120005` unknown · otherwise any **6 digits** succeeds in **Auto** mode.
- **Contact & ship:** **Domestic (US)** vs **international** toggle; phone **display formatting** only (no backend).
- **Preview:** edit shortcuts, per-line remove (confirm). Removing the last line returns to the order page.
- **Submit:** **`Submit request`** → in-stock confirmation + mock **RMA** (`TT-######`). **`Submit (demo: out of stock)`** → inventory modal; **Continue** completes the flow; closing the modal **without** Continue cancels and clears the draft RMA for that attempt.

**Code layout:** `src/features/replacement/` (`ReplaceFlowWizard`, reasons config, Care+ form, validation helpers).

---

## Phase 3A — Customer return wizard (mock)

**Route:** `/service/return/ord-101` (from **Return** on the order page, or type the URL).

**What’s implemented**

- **Items:** Lists every line on the order with **eligibility copy** (gift-only, not shipped, outside **30-day** window from mock `deliveredAt`). **Gifts** can’t be added alone; returning a **bundle main** auto-includes promo gifts (same `bundleId`) with **“Included with this return”** messaging.
- **Add item(s)** modal (only eligible primaries) + **Remove** confirmation; removing the last item returns to **`/service/order/:orderId`**.
- **Reasons:** Eight preset reasons + **Other** (short note required); **one reason per returned line** (including bundled gifts).
- **Contact / ship:** Same **US vs international** toggle and **display-only phone formatting** pattern as replacement.
- **Review:** Items + reasons, **demo line prices**, **estimated refund** after a **return shipping fee** deduction (clear copy that outbound shipping isn’t refunded and final amount follows inspection), **gift packaging callout** when applicable, **policy snapshot** bullets, editable shortcuts.
- **Submit:** Mock **RMA** (`TT-######`) and confirmation with **next steps** (review, email instructions, refund after inspection).

**Fixtures:** `ord-101` includes an in-window watch + gift strap + **expired** charger line for disabled demos; `ord-102` has only an unshipped line (nothing to add).

**Code layout:** `src/features/return/` (`ReturnFlowWizard`, `returnEligibility`, `returnReasons`, constants).

---

## Project phases

| Phase | Focus |
|-------|--------|
| **Phase 0** | Docs + repo structure + reference alignment. |
| **Phase 1** | Vite/React/TS/Tailwind scaffold: routing, shared layout, components, skeleton screens, mock fixtures. |
| **Phase 2A** | **Done (mock):** customer **replacement** wizard on `/service/replace/:orderId` (see section above). |
| **Phase 3A** | **Done (mock):** customer **return** wizard on `/service/return/:orderId` (see section above). |
| **Phase 2** | More mock flows (trade-in, richer inventory branches, session-aware OTP stubs, tighter eligibility). |
| **Phase 3** | Integrate real APIs (order lookup, auth, uploads, RMA lifecycle). |
| **Phase 4** | Hardening—analytics, error monitoring, accessibility, intl, perf. |

---

## Future backend / API plans (high level)

- **Order service:** channel-specific validation, mixed shipment states, IMEI visibility rules.
- **Auth/OTP:** email + SMS verification, rate limits, session handling.
- **RMA/workflow:** state machine matching customer-visible statuses; cancel-before-ship rules.
- **Inventory:** alternate colors, waitlist/restock queue, configurable sku substitution.
- **Care+ verification:** server-side eligibility + reuse token within scope.
- **Trade-in:** IMEI check, brand price table, cart coupling with checkout service.
- **Content:** CMS or config service for policies segmented by locale/channel.

---

## Contributing (future)

- Keep copy changes traceable back to `reference/` decks or legal-approved docs.
- Prefer updating **`docs/open-questions.md`** when encountering ambiguous slides instead of guessing in code.

---

## License / confidentiality

Content may reflect proprietary product plans—handle distribution according to your organization’s policies.
