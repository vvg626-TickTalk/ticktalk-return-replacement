# Service Order account — duplicate signup (mock localStorage)

Apply these changes in your full `ticktalk-service-portal-demo` tree (with `ServiceSignupPage`, `ServiceLoginPage`, etc.).

## 1. Add `src/features/serviceOrder/serviceAccountIdentities.ts`

See repo: full file defines `serviceIdentityExistsForEmail`, `serviceIdentityExistsForPhone`, `registerServiceIdentityFromProfile`, `ensureServiceIdentityForProfile`, and seeds `ada@example.com` / `+1 415…` for demo.

## 2. Add `src/features/serviceOrder/attachPendingServiceRma.ts`

Helper: `attachPendingRmaIfAny(profile, addRegisteredRma)` — reads `readPostReplacementPrefill()`, merges `profile` into email/phone/contactName, `addRegisteredRma`, `clearPostReplacementPrefill()`.

## 3. `src/features/serviceOrder/serviceAuthCopy.ts`

Append:

```ts
  accountAlreadyExists: {
    title: 'Account already exists',
    message:
      'This email is already linked to a Service Order account. Please sign in to continue.',
  },
  accountAlreadyExistsPhone: {
    title: 'Account already exists',
    message:
      'This phone number is already linked to a Service Order account. Please sign in to continue.',
  },
```

Use `SERVICE_AUTH_COPY.accountAlreadyExists` (email tab) or `accountAlreadyExistsPhone` (phone tab) in the modal body.

## 4. `postReplacementPrefill` — prefer **localStorage**

So pending RMA survives Sign Up → Sign In (and new tabs), replace `sessionStorage` with `localStorage` for key `tt_post_replace_service_flow` (same API: `save` / `read` / `clear`).

## 5. `ServiceSignupPage.tsx`

- Import:  
  `serviceIdentityExistsForEmail`, `serviceIdentityExistsForPhone`,  
  `registerServiceIdentityFromProfile`,  
  `attachPendingRmaIfAny`  
  `SERVICE_AUTH_COPY` (with new keys)

- Add modal state: `'accountExists' | null` and `ServiceMessageModal`:
  - Open when duplicate identity
  - Title: `SERVICE_AUTH_COPY.accountAlreadyExists.title` (or phone variant)
  - Message: matching `.message`
  - Primary: **Sign In** → `navigate('/service/login?return=/account/requests')`  
    Do **not** call `clearPostReplacementPrefill`.

- In `onSubmit`, after mock code checks and **before** `addRegisteredRma` / `signIn`:

```ts
if (mode === 'email' && serviceIdentityExistsForEmail(email)) {
  setModal('accountExists');
  return;
}
if (mode === 'phone' && serviceIdentityExistsForPhone(countryCode, phoneNational)) {
  setModal('accountExistsPhone'); // or same modal with phone copy
  return;
}
```

- **Success path** (new account only):

```ts
const profile: ServiceOrderProfile = {
  name: pre?.name ?? (prefillName || 'Customer'),
  email: mode === 'email' ? email.trim() : pre?.email?.trim() ?? null,
  phoneDisplay:
    mode === 'phone' ? `${countryCode} ${nationalDigits(phoneNational)}` : pre?.phoneDisplay ?? null,
};
signIn(profile);
attachPendingRmaIfAny(profile, addRegisteredRma);
registerServiceIdentityFromProfile(profile);
setPhase('success');
```

Remove the old `if (pre?.pendingRma) addRegisteredRma(...)` block before `signIn` to avoid double-add; `attachPendingRmaIfAny` handles it.

## 6. `ServiceLoginPage.tsx`

- Import: `readPostReplacementPrefill` (for prefill), `attachPendingRmaIfAny`, `ensureServiceIdentityForProfile`, `useServiceOrderAccount` → need `addRegisteredRma` in addition to `signIn`.

- `useEffect` on mount: if `readPostReplacementPrefill()` has email/phone, prefill login fields (same normalization as signup).

- In `onSignIn` after mock verification, build `profile` then:

```ts
signIn(profile);
attachPendingRmaIfAny(profile, addRegisteredRma);
ensureServiceIdentityForProfile(profile);
navigate(returnTo, { replace: true });
```

## 7. Build

`npm run build`

---

## Behaviour summary

| Step | Result |
|------|--------|
| Sign up with new email/phone | `signIn` → attach pending RMA → register identity → success |
| Sign up with existing email/phone | Modal “Account already exists”, pending stays in storage, route to Sign In |
| Sign in | `signIn` → attach pending if any → ensure identity → `/account/requests` |

Service Order account remains separate from TickTalk App; all data is mock `localStorage`.
