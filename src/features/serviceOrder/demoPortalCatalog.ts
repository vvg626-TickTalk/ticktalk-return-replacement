import type { ServiceOrderProfile } from '@/features/serviceOrder/types';
import { customerIdForServiceProfile } from '@/features/serviceOrder/serviceCustomerLink';
import {
  getOrderById,
  listOrdersForCustomer,
  listRmasForCustomer,
  tradeInRequests,
} from '@/mock-data';

/**
 * When a Service Order profile has no linked mock customer (unknown email) or that customer
 * has no catalog rows, merge these personas so the signed-in demo account is never empty.
 */
const DEMO_PORTAL_SEED_CUSTOMER_IDS: readonly string[] = [
  'cust-ada',
  'cust-bernard',
  'cust-marian',
  'cust-elena',
  'cust-jordan',
  'cust-qa',
];

function customerHasCatalogActivity(customerId: string): boolean {
  if (listOrdersForCustomer(customerId).length > 0) return true;
  if (listRmasForCustomer(customerId).length > 0) return true;
  for (const t of tradeInRequests) {
    if (!t.orderId) continue;
    const o = getOrderById(t.orderId);
    if (o?.customerId === customerId) return true;
  }
  return false;
}

/**
 * Resolves which mock customerIds supply purchase + service history for the account list.
 * Known emails keep an isolated catalog; unknown / empty accounts get the full demo garden.
 */
export function resolveDemoPortalCatalogCustomerIds(profile: ServiceOrderProfile): string[] {
  const primary =
    profile.linkedCustomerId !== undefined && profile.linkedCustomerId !== null
      ? profile.linkedCustomerId
      : customerIdForServiceProfile(profile);

  if (primary && customerHasCatalogActivity(primary)) return [primary];
  return [...DEMO_PORTAL_SEED_CUSTOMER_IDS];
}
