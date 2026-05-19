import { clearPostReplacementPrefill, readPostReplacementPrefill } from '@/features/serviceOrder/postReplacementPrefill';
import type { RegisteredServiceRma, ServiceOrderProfile } from '@/features/serviceOrder/types';

/** Merge signed-in profile into stored contact fields so list filters match. */
export function attachPendingRmaIfAny(
  profile: ServiceOrderProfile,
  addRegisteredRma: (r: RegisteredServiceRma) => void,
) {
  const pre = readPostReplacementPrefill();
  if (!pre?.pendingRma) return;
  const localId = `reg-${Date.now()}`;
  addRegisteredRma({
    ...pre.pendingRma,
    localId,
    email: profile.email?.trim() || pre.pendingRma.email,
    phone: profile.phoneDisplay?.trim() || pre.pendingRma.phone,
    contactName: profile.name?.trim() || pre.pendingRma.contactName,
  });
  clearPostReplacementPrefill();
}
