import type { Order, Rma, TradeInRequest } from '@/types/models';
import {
  getOrderById,
  getOrderLinesForOrder,
  getProductById,
  getRmaById,
  listOrdersForCustomer,
  listRmasForCustomer,
  getReplacementRequestByRmaId,
  getReturnRequestByRmaId,
  tradeInRequests,
} from '@/mock-data';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import { resolveDemoPortalCatalogCustomerIds } from '@/features/serviceOrder/demoPortalCatalog';
import type { RegisteredServiceRma, ServiceOrderProfile } from '@/features/serviceOrder/types';

export type ServiceOrderListRow = {
  id: string;
  listType: 'service_order' | 'refund' | 'replacement' | 'purchase_order' | 'trade_in';
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
  /** Purchase orders — short channel label */
  channelLabel?: string;
  /** Service requests — linked purchase order number */
  linkedPurchaseOrderRef?: string;
};

const LIST_TYPE_LABEL: Record<ServiceOrderListRow['listType'], string> = {
  service_order: 'Service Order',
  refund: 'Refund / Return Request',
  replacement: 'Replacement Request',
  purchase_order: 'Purchase Order',
  trade_in: 'Trade-in Request',
};

const CHANNEL_SHORT: Record<Order['channel'], string> = {
  myticktalk: 'myticktalk.com',
  amazon: 'Amazon',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  tiktok: 'TikTok Shop',
  other: 'Other',
};

function tradeInStatusLabel(state: TradeInRequest['state']): string {
  if (state === 'quoted') return 'Quote ready';
  if (state === 'applied') return 'Approved · credit applied';
  return 'Cancelled';
}

function issueDescriptionForMockRma(rma: Rma): string {
  if (rma.summary?.trim()) return rma.summary.trim();
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

const DEMO_LIST_SEED_STORAGE_KEY = 'tt_service_demo_account_list_seed_v1';
const DEMO_LIST_SEED_VERSION = 1;

/** When `VITE_DISABLE_DEMO_SEED === 'true'`, skip localStorage demo list seeding (empty state allowed). */
export function isDemoAccountListSeedDisabled(): boolean {
  return import.meta.env.VITE_DISABLE_DEMO_SEED === 'true';
}

function loadPersistedDemoListRowsInternal(): ServiceOrderListRow[] | null {
  if (isDemoAccountListSeedDisabled()) return null;
  try {
    const raw = localStorage.getItem(DEMO_LIST_SEED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v: number; rows: ServiceOrderListRow[] };
    if (parsed.v !== DEMO_LIST_SEED_VERSION || !Array.isArray(parsed.rows)) return null;
    return parsed.rows;
  } catch {
    return null;
  }
}

function savePersistedDemoListRowsInternal(rows: ServiceOrderListRow[]): void {
  if (isDemoAccountListSeedDisabled()) return;
  try {
    localStorage.setItem(
      DEMO_LIST_SEED_STORAGE_KEY,
      JSON.stringify({ v: DEMO_LIST_SEED_VERSION, rows }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

/** Deterministic sample rows (3 PO + return / replacement / trade-in) for empty-catalog / edge deploys. */
export function buildDemoFallbackListRows(): ServiceOrderListRow[] {
  const rows: ServiceOrderListRow[] = [];
  const poIds = ['ord-101', 'ord-intl-07', 'ord-102'];
  const rmaIds = ['rma-5001', 'rma-5002', 'rma-5003', 'rma-fam-9f0'];
  for (const oid of poIds) {
    const po = orderToPurchaseRow(oid);
    if (po) rows.push(po);
  }
  for (const rid of rmaIds) {
    const rma = getRmaById(rid);
    if (rma) rows.push(rmaToRow(rma));
  }
  const ti = tradeInRequests.find((t) => t.id === 'tri-loy');
  if (ti) {
    const o = ti.orderId ? getOrderById(ti.orderId) : undefined;
    rows.push(tradeInToRow(ti, o?.createdAt ?? '2022-11-10T12:00:00.000Z'));
  }
  return rows;
}

function countPurchaseAndService(list: ServiceOrderListRow[]) {
  const po = list.filter((r) => r.listType === 'purchase_order').length;
  const svc = list.filter((r) => r.listType !== 'purchase_order').length;
  return { po, svc };
}

function sortAccountListRows(
  profile: ServiceOrderProfile,
  registered: RegisteredServiceRma[],
  rows: ServiceOrderListRow[],
): ServiceOrderListRow[] {
  const mine = registered.filter((r) => matchesProfile(r, profile));
  const regIds = new Set(mine.map((r) => r.localId));
  return [...rows].sort((a, b) => {
    const aReg = regIds.has(a.id);
    const bReg = regIds.has(b.id);
    if (aReg !== bReg) return aReg ? -1 : 1;
    return a.requestDate < b.requestDate ? 1 : -1;
  });
}

function mergeWithPersistedDemoSeed(
  profile: ServiceOrderProfile,
  registered: RegisteredServiceRma[],
  baseRows: ServiceOrderListRow[],
): ServiceOrderListRow[] {
  const { po: basePo, svc: baseSvc } = countPurchaseAndService(baseRows);
  const needSeed = basePo < 3 || baseSvc < 5 || baseRows.length === 0;

  if (!needSeed) {
    return sortAccountListRows(profile, registered, baseRows);
  }

  let fromDisk = loadPersistedDemoListRowsInternal();
  if (!fromDisk || fromDisk.length === 0) {
    fromDisk = buildDemoFallbackListRows();
    savePersistedDemoListRowsInternal(fromDisk);
  }

  const byId = new Map<string, ServiceOrderListRow>();
  for (const r of baseRows) byId.set(r.id, r);
  for (const r of fromDisk) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }

  let merged = [...byId.values()];
  const { po, svc } = countPurchaseAndService(merged);
  if (po < 3 || svc < 5) {
    const fallback = buildDemoFallbackListRows();
    savePersistedDemoListRowsInternal(fallback);
    for (const r of fallback) {
      if (!byId.has(r.id)) byId.set(r.id, r);
    }
    merged = [...byId.values()];
  }

  return sortAccountListRows(profile, registered, merged);
}

/**
 * Rows for /account/requests: catalog + registered RMAs, with persisted demo minimums unless
 * `VITE_DISABLE_DEMO_SEED` is set.
 */
export function buildAccountRequestsList(
  profile: ServiceOrderProfile | null,
  registered: RegisteredServiceRma[],
): ServiceOrderListRow[] {
  if (!profile) return [];
  const base = buildServiceOrderList(profile, registered);
  if (isDemoAccountListSeedDisabled()) return base;

  let merged = mergeWithPersistedDemoSeed(profile, registered, base);
  let { po, svc } = countPurchaseAndService(merged);
  if (po < 3 || svc < 5) {
    const snap = buildDemoFallbackListRows();
    savePersistedDemoListRowsInternal(snap);
    const byId = new Map<string, ServiceOrderListRow>();
    for (const r of merged) byId.set(r.id, r);
    for (const r of snap) {
      if (!byId.has(r.id)) byId.set(r.id, r);
    }
    merged = sortAccountListRows(profile, registered, [...byId.values()]);
    ({ po, svc } = countPurchaseAndService(merged));
    if (po < 3 || svc < 5) {
      merged = sortAccountListRows(profile, registered, snap);
    }
  }
  return merged;
}

function matchesProfile(r: RegisteredServiceRma, p: ServiceOrderProfile): boolean {
  const pe = p.email.trim().toLowerCase();
  const re = r.email?.trim().toLowerCase() ?? '';
  if (pe && re && pe === re) return true;
  const linked = p.linkedCustomerId;
  if (linked) {
    const order = getOrderById(r.orderId);
    if (order?.customerId && order.customerId === linked) return true;
  }
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
    const ord = getOrderById(r.orderId);
    const listType: ServiceOrderListRow['listType'] =
      r.kind === 'replacement'
        ? 'replacement'
        : r.kind === 'return'
          ? 'refund'
          : r.kind === 'trade_in'
            ? 'trade_in'
            : 'service_order';
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
      attachmentSlotCount: r.uploadedImageCount ?? 0,
      linkedPurchaseOrderRef: ord?.externalOrderRef ?? '',
    });
  }

  const catalogCustomerIds = resolveDemoPortalCatalogCustomerIds(profile);
  const seenPurchaseRowIds = new Set<string>();

  for (const custId of catalogCustomerIds) {
    const demoRmas = listRmasForCustomer(custId);
    for (const rma of demoRmas) {
      if (mine.some((r) => r.code === rma.code)) continue;
      rows.push(rmaToRow(rma));
    }

    for (const order of listOrdersForCustomer(custId)) {
      const po = orderToPurchaseRow(order.id);
      if (po && !seenPurchaseRowIds.has(po.id)) {
        seenPurchaseRowIds.add(po.id);
        rows.push(po);
      }
    }

    for (const t of tradeInRequests) {
      const o = t.orderId ? getOrderById(t.orderId) : undefined;
      if (!o || o.customerId !== custId) continue;
      rows.push(tradeInToRow(t, o.createdAt));
    }
  }

  return sortAccountListRows(profile, registered, rows);
}

function rmaToRow(rma: Rma): ServiceOrderListRow {
  const order = getOrderById(rma.orderId);
  const listType: ServiceOrderListRow['listType'] =
    rma.kind === 'replacement'
      ? 'replacement'
      : rma.kind === 'return'
        ? 'refund'
        : rma.kind === 'trade_in'
          ? 'trade_in'
          : 'service_order';
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
    linkedPurchaseOrderRef: order?.externalOrderRef ?? '',
  };
}

function tradeInToRow(t: TradeInRequest, requestDateFallback: string): ServiceOrderListRow {
  const order = t.orderId ? getOrderById(t.orderId) : undefined;
  const ref = t.rmaId ?? `TI-${t.id}`;
  return {
    id: `tradein-${t.id}`,
    listType: 'trade_in',
    typeLabel: LIST_TYPE_LABEL.trade_in,
    reference: ref,
    statusLabel: tradeInStatusLabel(t.state),
    requestDate: order?.createdAt ?? requestDateFallback,
    detailPath: order ? `/service/order/${order.id}` : '/trade-in/preview',
    swatches: thumbForOrder(t.orderId ?? ''),
    issueDescription: t.imei
      ? `${t.brand} trade-in — IMEI ${t.imei} (demo).`
      : `${t.brand} trade-in (demo).`,
    attachmentSlotCount: 0,
    linkedPurchaseOrderRef: order?.externalOrderRef ?? '',
  };
}

function purchaseOrderListStatusLabel(orderId: string): string {
  const lines = getOrderLinesForOrder(orderId);
  if (lines.length === 0) return 'Delivered';

  const inTransit = lines.some((l) => l.status === 'shipped' && l.customerReceived === false);
  if (inTransit) return 'In transit';

  const deliveredLines = lines.filter((l) => l.status === 'shipped');
  if (deliveredLines.length > 0) {
    const anyReturned = deliveredLines.some((l) => l.demoReturned === true);
    const allReturned = deliveredLines.every((l) => l.demoReturned === true);
    if (allReturned) return 'Returned';
    if (anyReturned) return 'Delivered · partial return';
  }

  return 'Delivered';
}

function orderToPurchaseRow(orderId: string): ServiceOrderListRow | null {
  const order = getOrderById(orderId);
  if (!order) return null;
  const ch = CHANNEL_SHORT[order.channel];
  const channelLabel = `${ch}${order.shippingRegion === 'international' ? ' · International' : ''}`;
  return {
    id: `purchase-${order.id}`,
    listType: 'purchase_order',
    typeLabel: LIST_TYPE_LABEL.purchase_order,
    reference: order.externalOrderRef,
    statusLabel: purchaseOrderListStatusLabel(orderId),
    requestDate: order.createdAt,
    detailPath: `/service/order/${order.id}`,
    swatches: thumbForOrder(order.id),
    issueDescription: '',
    attachmentSlotCount: 0,
    channelLabel,
  };
}

export function findRegisteredRma(
  routeParam: string,
  registered: RegisteredServiceRma[],
): RegisteredServiceRma | undefined {
  return registered.find((r) => r.localId === routeParam || r.code === routeParam);
}
