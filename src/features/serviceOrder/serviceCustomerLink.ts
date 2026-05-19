import type { PostReplacementPrefill, ServiceOrderProfile } from '@/features/serviceOrder/types';
import { customers } from '@/mock-data';

/** Match profile email to a demo customer (mock catalog). */
export function customerIdForServiceProfile(p: ServiceOrderProfile): string | null {
  const pe = p.email.trim().toLowerCase();
  if (!pe) return null;
  const hit = customers.find((c) => c.email?.toLowerCase() === pe);
  return hit?.id ?? null;
}

/**
 * Prefer the customer on the order that triggered the service flow (pending pre),
 * then fall back to email match to demo customers.
 */
export function resolveLinkedCustomerId(
  profile: ServiceOrderProfile,
  pre: PostReplacementPrefill | null,
): string | null {
  if (pre?.customerId) return pre.customerId;
  return customerIdForServiceProfile(profile);
}
