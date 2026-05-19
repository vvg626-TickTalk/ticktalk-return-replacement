import { isPlausibleImei, normalizeImei } from '@/features/replacement/eligibility';
import {
  OPEN_RMA_STATUSES,
  getOrderById,
  imeiRecords,
  orderLines,
  rmas,
  tradeInRequests,
} from '@/mock-data';

export type WatchImeiValidationResult = 'valid' | 'invalid' | 'unknown';

/**
 * Validates a 15-digit IMEI for a return/replacement entry on a specific order line (demo rules).
 */
export function validateWatchImeiForLine(params: {
  rawImei: string;
  orderId: string;
  lineId: string;
}): WatchImeiValidationResult {
  const normalized = normalizeImei(params.rawImei);
  if (!normalized) return 'unknown';
  if (!isPlausibleImei(normalized)) return 'invalid';

  const record = imeiRecords.find((r) => r.value === normalized);
  if (!record) return 'unknown';

  const line = orderLines.find((l) => l.id === params.lineId);
  const order = getOrderById(params.orderId);
  if (!line || !order || line.orderId !== params.orderId) return 'invalid';
  if (record.orderLineId !== params.lineId) return 'invalid';

  const imeiOwnerOrder = getOrderById(orderLines.find((l) => l.id === record.orderLineId)?.orderId ?? '');
  if (order.customerId && imeiOwnerOrder?.customerId && imeiOwnerOrder.customerId !== order.customerId) {
    return 'invalid';
  }

  if (line.demoReturned) return 'invalid';

  const tradedIn = tradeInRequests.some((t) => t.imei === normalized && t.state === 'applied');
  if (tradedIn) return 'invalid';

  const locked = rmas.some(
    (r) => r.deviceImei === normalized && OPEN_RMA_STATUSES.includes(r.status),
  );
  if (locked) return 'invalid';

  return 'valid';
}
