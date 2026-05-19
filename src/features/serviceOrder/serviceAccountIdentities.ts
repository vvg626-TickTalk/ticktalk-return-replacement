import type { ServiceOrderProfile } from '@/features/serviceOrder/types';

const LS_KEY = 'tt_service_order_identities_v1';

export type StoredServiceIdentity = {
  /** Lowercased email — sole Service Order login identifier */
  emailLower: string;
};

/** Demo seed: mock customer Ada — “account already exists” for duplicate signup demos. */
const SEED_IDENTITIES: StoredServiceIdentity[] = [{ emailLower: 'ada@example.com' }];

function loadRaw(): StoredServiceIdentity[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => x as { emailLower?: string })
      .filter((x) => typeof x.emailLower === 'string' && x.emailLower.length > 0)
      .map((x) => ({ emailLower: x.emailLower!.trim().toLowerCase() }));
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
    const emailHit = next.some((x) => x.emailLower === s.emailLower);
    if (!emailHit) next.push({ ...s });
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

/** After a successful new signup — caller must verify not duplicate first. */
export function registerServiceIdentityFromProfile(profile: ServiceOrderProfile) {
  const emailLower = profile.email.trim().toLowerCase();
  if (!emailLower) return;
  if (loadServiceIdentities().some((i) => i.emailLower === emailLower)) return;

  const persisted = mergeSeeds(loadRaw());
  saveRaw([...persisted, { emailLower }]);
}

/** After sign-in — ensures identity is in registry for future duplicate detection. */
export function ensureServiceIdentityForProfile(profile: ServiceOrderProfile) {
  const emailLower = profile.email.trim().toLowerCase();
  if (!emailLower) return;

  const persisted = mergeSeeds(loadRaw());
  if (persisted.some((i) => i.emailLower === emailLower)) {
    saveRaw(persisted);
    return;
  }
  saveRaw([...persisted, { emailLower }]);
}
