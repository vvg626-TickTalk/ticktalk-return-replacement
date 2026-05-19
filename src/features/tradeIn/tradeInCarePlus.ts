import { getCarePlusForCustomer } from '@/mock-data';
import type { OrderLine } from '@/types/models';

/** Active = status active and expiresOn (if set) not before reference date (end of day UTC). */
export function customerHasActiveCarePlus(customerId: string | undefined, referenceDate: Date = new Date()): boolean {
  if (!customerId) return false;
  return getCarePlusForCustomer(customerId).some((s) => {
    if (s.status !== 'active') return false;
    if (!s.expiresOn) return true;
    const end = new Date(`${s.expiresOn}T23:59:59.000Z`);
    return referenceDate <= end;
  });
}

/** Care+ tied to a specific order line (demo: trade-in gated per device, not whole account). */
export function lineHasActiveCarePlus(
  line: OrderLine,
  customerId: string | undefined,
  referenceDate: Date = new Date(),
): boolean {
  if (!customerId) return false;
  return getCarePlusForCustomer(customerId).some((s) => {
    if (s.orderLineId !== line.id) return false;
    if (s.status !== 'active') return false;
    if (!s.expiresOn) return true;
    const end = new Date(`${s.expiresOn}T23:59:59.000Z`);
    return referenceDate <= end;
  });
}

/** Short label for device cards (demo). */
export function tradeInCareStatusLine(customerId: string | undefined, referenceDate: Date = new Date()): string {
  if (!customerId) return 'TickTalk Care+: Not enrolled';
  const subs = getCarePlusForCustomer(customerId);
  if (subs.length === 0) return 'TickTalk Care+: Not enrolled';
  if (customerHasActiveCarePlus(customerId, referenceDate)) return 'TickTalk Care+: Active';
  if (subs.some((s) => s.status === 'lapsed')) return 'TickTalk Care+: Expired';
  return 'TickTalk Care+: Not active';
}
