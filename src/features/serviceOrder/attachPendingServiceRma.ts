import {
  clearPendingServiceOrder,
  readPendingServiceOrder,
} from '@/features/serviceOrder/pendingServiceOrderStorage';
import type { RegisteredServiceRma, ServiceOrderProfile } from '@/features/serviceOrder/types';

/**
 * After Sign In / Sign Up: attach the flow snapshot as a registered RMA and clear pending storage.
 * Merges the signed-in profile into contact fields so list filters and detail stay consistent.
 */
export function attachPendingRmaIfAny(
  profile: ServiceOrderProfile,
  addRegisteredRma: (r: RegisteredServiceRma) => void,
) {
  const pre = readPendingServiceOrder();
  if (!pre?.pendingRma) return;
  const localId = `reg-${Date.now()}`;
  addRegisteredRma({
    ...pre.pendingRma,
    localId,
    email: profile.email.trim() || pre.pendingRma.email,
    phone: pre.pendingRma.phone,
    contactName: profile.name.trim() || pre.pendingRma.contactName,
  });
  clearPendingServiceOrder();
}
