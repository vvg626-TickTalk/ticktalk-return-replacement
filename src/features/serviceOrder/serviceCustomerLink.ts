import type { PostReplacementPrefill, ServiceOrderProfile } from '@/features/serviceOrder/types';
import { customers } from '@/mock-data';

/** Match profile email/phone to a demo customer (mock catalog). */
export function customerIdForServiceProfile(p: ServiceOrderProfile): string | null {
  const pe = p.email?.trim().toLowerCase() ?? '';
  if (pe) {
    const hit = customers.find((c) => c.email?.toLowerCase() === pe);
    if (hit) return hit.id;
  }
  const pd = (p.phoneDisplay ?? '').replace(/\D/g, '');
  if (pd.length >= 10) {
    const hit = customers.find((c) => {
      const cd = (c.phoneE164 ?? '').replace(/\D/g, '');
      return cd.length >= 10 && cd.slice(-10) === pd.slice(-10);
    });
    if (hit) return hit.id;
  }
  return null;
}

/**
 * Prefer the customer on the order that triggered the service flow (pending pre),
 * then fall back to email/phone match to demo customers.
 */
export function resolveLinkedCustomerId(
  profile: ServiceOrderProfile,
  pre: PostReplacementPrefill | null,
): string | null {
  if (pre?.customerId) return pre.customerId;
  return customerIdForServiceProfile(profile);
}
