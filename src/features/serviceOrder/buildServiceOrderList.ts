import type { Rma } from '@/types/models';
import {
  getOrderById,
  getOrderLinesForOrder,
  getProductById,
  getReplacementRequestByRmaId,
  getReturnRequestByRmaId,
  listRmasForCustomer,
} from '@/mock-data';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import type { RegisteredServiceRma, ServiceOrderProfile } from '@/features/serviceOrder/types';

export type ServiceOrderListRow = {
  id: string;
  listType: 'service_order' | 'refund' | 'replacement' | 'purchase_order';
  /** Card heading per PPT */
  typeLabel: string;
  reference: string;
  statusLabel: string;
  requestDate: string;
  detailPath: string;
  swatches: string[];
  /** Summary for list cards (PPT) */
  issueDescription: string;
  /** Demo “upload” thumbnails count; purchase orders use 0 */
  attachmentSlotCount: number;
};

const DEMO_MATCH_EMAIL = 'ada@example.com';

const LIST_TYPE_LABEL: Record<ServiceOrderListRow['listType'], string> = {
  service_order: 'Service Order',
  refund: 'Refund',
  replacement: 'Replacement',
  purchase_order: 'Purchase Order',
};

function issueDescriptionForMockRma(rma: Rma): string {
  const ret = getReturnRequestByRmaId(rma.id);
  const rep = getReplacementRequestByRmaId(rma.id);
  if (rma.kind === 'return') {
    return ret ? 'Return — refund after inspection in the demo dataset.' : 'Return request (demo).';
  }
  if (rma.kind === 'replacement') {
    return rep
      ? `Replacement — ${rep.restockHold ? 'awaiting restock in the demo flow.' : 'standard replacement (demo).'}`
      : 'Replacement request (demo).';
  }
  return 'Service record (demo).';
}

function matchesProfile(r: RegisteredServiceRma, p: ServiceOrderProfile): boolean {
  const pe = p.email?.trim().toLowerCase() ?? '';
  const re = r.email?.trim().toLowerCase() ?? '';
  if (pe && re && pe === re) return true;
  const pd = (p.phoneDisplay ?? '').replace(/\D/g, '');
  const rd = (r.phone ?? '').replace(/\D/g, '');
  if (pd.length >= 10 && rd.length >= 10 && pd.slice(-10) === rd.slice(-10)) return true;
  return false;
}

function thumbForOrder(orderId: string): string[] {
  const order = getOrderById(orderId);
  if (!order) return ['bg-slate-200'];
  const lines = getOrderLinesForOrder(order.id).slice(0, 3);
  return lines.map((l) => getProductById(l.productId)?.swatch ?? 'bg-slate-200');
}

export function buildServiceOrderList(
  profile: ServiceOrderProfile | null,
  registered: RegisteredServiceRma[],
): ServiceOrderListRow[] {
  const rows: ServiceOrderListRow[] = [];

  if (!profile) return [];

  const mine = registered.filter((r) => matchesProfile(r, profile));

  for (const r of mine) {
    const listType: ServiceOrderListRow['listType'] =
      r.kind === 'replacement' ? 'replacement' : r.kind === 'return' ? 'refund' : 'service_order';
    rows.push({
      id: r.localId,
      listType,
      typeLabel: LIST_TYPE_LABEL[listType],
      reference: r.code,
      statusLabel: r.customerStatusLabel,
      requestDate: r.createdAt,
      detailPath: `/account/rma/${r.localId}`,
      swatches: r.productSwatches.length ? r.productSwatches : ['bg-slate-200'],
      issueDescription: r.issueDescription,
      attachmentSlotCount: 3,
    });
  }

  if (profile.email?.toLowerCase() === DEMO_MATCH_EMAIL) {
    const demoRmas = listRmasForCustomer('cust-ada');
    for (const rma of demoRmas) {
      if (mine.some((r) => r.code === rma.code)) continue;
      rows.push(rmaToRow(rma));
    }

    const po = orderToPurchaseRow('ord-101');
    if (po) rows.push(po);
  }

  rows.sort((a, b) => (a.requestDate < b.requestDate ? 1 : -1));
  return rows;
}

function rmaToRow(rma: Rma): ServiceOrderListRow {
  const listType: ServiceOrderListRow['listType'] =
    rma.kind === 'replacement' ? 'replacement' : rma.kind === 'return' ? 'refund' : 'service_order';
  return {
    id: rma.id,
    listType,
    typeLabel: LIST_TYPE_LABEL[listType],
    reference: rma.code,
    statusLabel: RMA_STATUS_CUSTOMER_LABEL[rma.status],
    requestDate: rma.createdAt,
    detailPath: `/account/rma/${rma.id}`,
    swatches: thumbForOrder(rma.orderId),
    issueDescription: issueDescriptionForMockRma(rma),
    attachmentSlotCount: 3,
  };
}

function orderToPurchaseRow(orderId: string): ServiceOrderListRow | null {
  const order = getOrderById(orderId);
  if (!order) return null;
  return {
    id: `purchase-${order.id}`,
    listType: 'purchase_order',
    typeLabel: LIST_TYPE_LABEL.purchase_order,
    reference: order.externalOrderRef,
    statusLabel: 'Delivered',
    requestDate: order.createdAt,
    detailPath: `/service/order/${order.id}`,
    swatches: thumbForOrder(order.id),
    issueDescription: 'Original purchase — see order for line items (demo).',
    attachmentSlotCount: 0,
  };
}

export function findRegisteredRma(
  routeParam: string,
  registered: RegisteredServiceRma[],
): RegisteredServiceRma | undefined {
  return registered.find((r) => r.localId === routeParam || r.code === routeParam);
}
