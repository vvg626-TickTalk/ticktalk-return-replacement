import type { ServiceOrderProfile } from '@/features/serviceOrder/types';

const LS_KEY = 'tt_service_order_identities_v1';

export type StoredServiceIdentity = {
  /** Lowercased email, or null if phone-only registration */
  emailLower: string | null;
  /** Digits-only phone; match by last 10 US-style digits */
  phoneDigits: string;
};

/** Demo seed: mock customer Ada — “account already exists” for that contact. */
const SEED_IDENTITIES: StoredServiceIdentity[] = [
  { emailLower: 'ada@example.com', phoneDigits: '14155550100' },
];

function normalizeDigits(s: string): string {
  return s.replace(/\D/g, '');
}

function last10(d: string): string {
  const x = normalizeDigits(d);
  return x.length <= 10 ? x : x.slice(-10);
}

function loadRaw(): StoredServiceIdentity[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredServiceIdentity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRaw(list: StoredServiceIdentity[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/** Merge demo seeds if those identities are not already present. */
function mergeSeeds(stored: StoredServiceIdentity[]): StoredServiceIdentity[] {
  const next = [...stored];
  for (const s of SEED_IDENTITIES) {
    const emailHit = s.emailLower && next.some((x) => x.emailLower === s.emailLower);
    const phoneHit =
      s.phoneDigits && next.some((x) => last10(x.phoneDigits) === last10(s.phoneDigits));
    if (!emailHit && !phoneHit) {
      next.push({ ...s });
    }
  }
  return next;
}

/** All known Service Order identities (mock registry), including demo seeds. */
export function loadServiceIdentities(): StoredServiceIdentity[] {
  return mergeSeeds(loadRaw());
}

export function serviceIdentityExistsForEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  return loadServiceIdentities().some((i) => i.emailLower === e);
}

export function serviceIdentityExistsForPhone(countryCode: string, nationalDigits: string): boolean {
  const national = normalizeDigits(nationalDigits);
  const cc = normalizeDigits(countryCode.replace(/^\+/, ''));
  const combined = cc + national;
  const want = last10(combined.length >= 10 ? combined : national);
  if (want.length < 10) return false;
  return loadServiceIdentities().some((i) => last10(i.phoneDigits) === want);
}

function matchesIdentity(i: StoredServiceIdentity, emailLower: string | null, phoneDigits: string): boolean {
  if (emailLower && i.emailLower === emailLower) return true;
  if (phoneDigits.length >= 10 && last10(i.phoneDigits) === last10(phoneDigits)) return true;
  return false;
}

/** After a successful new signup — caller must verify not duplicate first. */
export function registerServiceIdentityFromProfile(profile: ServiceOrderProfile) {
  const emailLower = profile.email?.trim().toLowerCase() || null;
  const phoneDigits = normalizeDigits(profile.phoneDisplay ?? '');
  if (!emailLower && phoneDigits.length < 10) return;

  if (loadServiceIdentities().some((i) => matchesIdentity(i, emailLower, phoneDigits))) return;

  const persisted = mergeSeeds(loadRaw());
  saveRaw([...persisted, { emailLower, phoneDigits }]);
}

/** After sign-in — ensures identity is in registry for future duplicate detection. */
export function ensureServiceIdentityForProfile(profile: ServiceOrderProfile) {
  const emailLower = profile.email?.trim().toLowerCase() || null;
  const phoneDigits = normalizeDigits(profile.phoneDisplay ?? '');
  if (!emailLower && phoneDigits.length < 10) return;

  const persisted = mergeSeeds(loadRaw());
  if (persisted.some((i) => matchesIdentity(i, emailLower, phoneDigits))) {
    saveRaw(persisted);
    return;
  }
  saveRaw([...persisted, { emailLower, phoneDigits }]);
}
