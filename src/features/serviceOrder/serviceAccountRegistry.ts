import type { ServiceOrderProfile } from '@/features/serviceOrder/types';

const LS = 'tt_service_order_registered_identifiers_v1';

type Registry = {
  emails: string[];
  phones: string[];
};

function normEmail(s: string) {
  return s.trim().toLowerCase();
}

function normPhone(s: string) {
  return s.replace(/\D/g, '');
}

function load(): Registry {
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return { emails: [], phones: [] };
    const j = JSON.parse(raw) as Registry;
    return {
      emails: Array.isArray(j.emails) ? j.emails.map(normEmail).filter(Boolean) : [],
      phones: Array.isArray(j.phones) ? j.phones.map(normPhone).filter(Boolean) : [],
    };
  } catch {
    return { emails: [], phones: [] };
  }
}

function save(r: Registry) {
  localStorage.setItem(LS, JSON.stringify(r));
}

/** Call after successful Sign Up or Sign In so we can block duplicate Sign Up on the same identifier. */
export function registerServiceAccountIdentifiers(profile: ServiceOrderProfile) {
  const prev = load();
  const emails = new Set(prev.emails);
  const phones = new Set(prev.phones);
  const e = profile.email?.trim();
  if (e) emails.add(normEmail(e));
  const pd = profile.phoneDisplay?.trim();
  if (pd) {
    const d = normPhone(pd);
    if (d.length >= 8) phones.add(d);
  }
  save({ emails: [...emails], phones: [...phones] });
}

export function isServiceAccountIdentifierTaken(input: {
  mode: 'email' | 'phone';
  email?: string;
  phoneDigits?: string;
}): boolean {
  const reg = load();
  if (input.mode === 'email' && input.email) {
    return reg.emails.includes(normEmail(input.email));
  }
  if (input.mode === 'phone' && input.phoneDigits) {
    const d = normPhone(input.phoneDigits);
    if (d.length < 8) return false;
    return reg.phones.some((p) => p === d || (p.length >= 10 && d.length >= 10 && p.slice(-10) === d.slice(-10)));
  }
  return false;
}
