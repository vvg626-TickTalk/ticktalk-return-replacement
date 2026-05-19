export { customers } from './mockCustomers';
export { orders, orderLines, imeiRecords } from './mockOrders';
export {
  carePlusSubscriptions,
  messages,
  replacementRequests,
  returnRequests,
  rmas,
  warranties,
} from './mockServiceOrders';
export { tradeInRequests } from './mockTradeIns';
export { inventory } from './inventory';
export { products } from './products';

import { carePlusSubscriptions } from './mockServiceOrders';
import { customers } from './mockCustomers';
import { imeiRecords, orderLines, orders } from './mockOrders';
import {
  messages,
  replacementRequests,
  returnRequests,
  rmas,
  warranties,
} from './mockServiceOrders';
import { products } from './products';
import { tradeInRequests } from './mockTradeIns';
import { inventory } from './inventory';
import type { Rma, RmaStatus } from '@/types/models';

/** In-flight requests (consumer-facing hub / order detail). */
export const OPEN_RMA_STATUSES: RmaStatus[] = [
  'pending',
  'awaiting_your_reply',
  'return_in_review',
  'backorder',
  'inspection_in_progress',
  'preparing_shipment',
  'waiting_for_your_shipment',
  'shipped_by_customer',
  'shipment_deadline_passed',
  'inspection_failed',
];

export function getCustomerById(id: string) {
  return customers.find((c) => c.id === id);
}

export function getOrderById(id: string) {
  return orders.find((o) => o.id === id);
}

export function getOrderLinesForOrder(orderId: string) {
  return orderLines.filter((l) => l.orderId === orderId);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getRmaById(id: string) {
  return rmas.find((r) => r.id === id);
}

export function getRmaByCode(code: string) {
  return rmas.find((r) => r.code === code);
}

export function listRmasForCustomer(customerId: string) {
  return rmas.filter((r) => r.customerId === customerId);
}

export function listOpenRmasForCustomer(customerId: string) {
  return listRmasForCustomer(customerId)
    .filter((r) => OPEN_RMA_STATUSES.includes(r.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listRecentClosedRmasForCustomer(customerId: string, limit = 8) {
  return listRmasForCustomer(customerId)
    .filter((r) => !OPEN_RMA_STATUSES.includes(r.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

/** Replacement RMAs for the same order line, oldest → newest (demo timeline). */
export function listReplacementChainForLine(orderLineId: string): Rma[] {
  return rmas
    .filter((r) => r.orderLineId === orderLineId && r.kind === 'replacement')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Open service requests on a single order line (demo). */
export function listOpenRmasForOrderLine(orderId: string, orderLineId: string): Rma[] {
  return rmas.filter(
    (r) => r.orderId === orderId && r.orderLineId === orderLineId && OPEN_RMA_STATUSES.includes(r.status),
  );
}

export function hasOpenReturnOnLine(orderId: string, orderLineId: string): boolean {
  return listOpenRmasForOrderLine(orderId, orderLineId).some((r) => r.kind === 'return');
}

export function hasOpenReplacementOnLine(orderId: string, orderLineId: string): boolean {
  return listOpenRmasForOrderLine(orderId, orderLineId).some((r) => r.kind === 'replacement');
}

export function listOrdersForCustomer(customerId: string) {
  return orders.filter((o) => o.customerId === customerId);
}

export function getReturnRequestByRmaId(rmaId: string) {
  return returnRequests.find((r) => r.rmaId === rmaId);
}

export function getReplacementRequestByRmaId(rmaId: string) {
  return replacementRequests.find((r) => r.rmaId === rmaId);
}

export function listTradeInsByOrder(orderId: string) {
  return tradeInRequests.filter((t) => t.orderId === orderId);
}

export function listMessagesForRma(rmaId: string) {
  return messages.filter((m) => m.rmaId === rmaId).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function listMessagesNewestFirst() {
  return [...messages].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function getWarrantyForLine(orderLineId: string) {
  return warranties.find((w) => w.orderLineId === orderLineId);
}

export function getCarePlusForCustomer(customerId: string) {
  return carePlusSubscriptions.filter((c) => c.customerId === customerId);
}

export function getImeiForLine(orderLineId: string) {
  return imeiRecords.find((i) => i.orderLineId === orderLineId);
}

export function listInventoryForProduct(productId: string) {
  return inventory.filter((i) => i.productId === productId);
}
