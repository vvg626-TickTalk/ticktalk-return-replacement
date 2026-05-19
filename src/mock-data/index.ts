export { carePlusSubscriptions } from './carePlusSubscriptions';
export { customers } from './customers';
export { imeiRecords } from './imeis';
export { inventory } from './inventory';
export { messages } from './messages';
export { orderLines } from './orderLines';
export { orders } from './orders';
export { products } from './products';
export { replacementRequests } from './replacementRequests';
export { returnRequests } from './returnRequests';
export { rmas } from './rmas';
export { tradeInRequests } from './tradeInRequests';
export { warranties } from './warranties';

import { carePlusSubscriptions } from './carePlusSubscriptions';
import { customers } from './customers';
import { imeiRecords } from './imeis';
import { inventory } from './inventory';
import { messages } from './messages';
import { orderLines } from './orderLines';
import { orders } from './orders';
import { products } from './products';
import { replacementRequests } from './replacementRequests';
import { returnRequests } from './returnRequests';
import { rmas } from './rmas';
import { tradeInRequests } from './tradeInRequests';
import { warranties } from './warranties';

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
