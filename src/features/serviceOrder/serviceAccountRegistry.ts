import type { ServiceOrderProfile } from '@/features/serviceOrder/types';
import { serviceIdentityExistsForEmail } from '@/features/serviceOrder/serviceAccountIdentities';

const LS = 'tt_service_order_registered_identifiers_v1';

type Registry = {
  emails: string[];
};

function normEmail(s: string) {
  return s.trim().toLowerCase();
}

function load(): Registry {
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return { emails: [] };
    const j = JSON.parse(raw) as Registry & { phones?: string[] };
    return {
      emails: Array.isArray(j.emails) ? j.emails.map(normEmail).filter(Boolean) : [],
    };
  } catch {
    return { emails: [] };
  }
}

function save(r: Registry) {
  localStorage.setItem(LS, JSON.stringify(r));
}

/** Call after successful Sign Up or Sign In so we can block duplicate Sign Up on the same email. */
export function registerServiceAccountIdentifiers(profile: ServiceOrderProfile) {
  const prev = load();
  const emails = new Set(prev.emails);
  const e = profile.email.trim();
  if (e) emails.add(normEmail(e));
  save({ emails: [...emails] });
}

export function isServiceAccountEmailRegistered(email: string): boolean {
  const reg = load();
  if (reg.emails.includes(normEmail(email))) return true;
  return serviceIdentityExistsForEmail(email);
}
