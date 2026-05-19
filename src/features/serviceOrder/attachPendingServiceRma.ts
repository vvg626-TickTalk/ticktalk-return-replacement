import {
  clearPendingServiceOrder,
  readPendingServiceOrder,
} from '@/features/serviceOrder/pendingServiceOrderStorage';
import type { RegisteredServiceRma, ServiceOrderProfile } from '@/features/serviceOrder/types';
import { sanitizePhoneForStorage } from '@/features/serviceOrder/phoneSanitize';

/** Merge signed-in profile into stored contact fields so list filters match. */
export function attachPendingRmaIfAny(
  profile: ServiceOrderProfile,
  addRegisteredRma: (r: RegisteredServiceRma) => void,
) {
  const pre = readPendingServiceOrder();
  if (!pre?.pendingRma) return;
  const localId = `reg-${Date.now()}`;
  const phoneFromProfile = profile.phoneDisplay ? sanitizePhoneForStorage(profile.phoneDisplay) : '';
  addRegisteredRma({
    ...pre.pendingRma,
    localId,
    email: profile.email?.trim() || pre.pendingRma.email,
    phone: phoneFromProfile || pre.pendingRma.phone,
    contactName: profile.name?.trim() || pre.pendingRma.contactName,
  });
  clearPendingServiceOrder();
}
