export type Channel = 'myticktalk' | 'amazon' | 'walmart' | 'bestbuy' | 'tiktok' | 'other';

export type ProductKind = 'watch' | 'accessory' | 'bundle_component';

export type OrderLineStatus = 'unshipped' | 'shipped' | 'cancelled';

export type WarrantyTier = 'standard' | 'care_plus';

export type CarePlusStatus = 'active' | 'lapsed';

export type RmaKind = 'return' | 'replacement' | 'trade_in';

/** Customer-visible RMA lifecycle (demo subset; see docs/copy-notes.md). */
export type RmaStatus =
  | 'pending'
  | 'awaiting_your_reply'
  | 'rejected'
  | 'waiting_for_your_shipment'
  | 'shipment_deadline_passed'
  | 'shipped_by_customer'
  | 'inspection_in_progress'
  | 'inspection_failed'
  | 'backorder'
  | 'preparing_shipment'
  | 'shipped'
  | 'return_in_review'
  | 'refunded'
  | 'cancelled';

export type TradeInState = 'quoted' | 'applied' | 'cancelled';

export type MessageDirection = 'inbound' | 'outbound';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phoneE164?: string;
}

export interface Product {
  id: string;
  name: string;
  kind: ProductKind;
  generation?: string;
  /** Placeholder visual */
  swatch?: string;
}

export interface OrderLine {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  /** May be hidden until shipped (per product rules). */
  imei?: string;
  isGift: boolean;
  status: OrderLineStatus;
  /**
   * Links promo gift lines to the qualifying purchase (demo).
   * Non-gift “main” line and gift line share the same id when a return must include both.
   */
  bundleId?: string;
  /** ISO date used for mock return window (30-day rule); falls back to order.createdAt when absent. */
  deliveredAt?: string;
  /** Mock subtotal for this line in refund preview (gift lines typically 0). */
  demoLineTotalCents?: number;
  /** Mock purchased color / finish name; used for replacement inventory (alternate color UX). */
  demoPurchasedColor?: string;
  /**
   * When `shipped`, `false` means still in transit / not received (PPT shipped-not-received).
   * When `undefined`, treated as received for demo.
   */
  customerReceived?: boolean;
  /** Demo: item already returned — show status only, no service actions. */
  demoReturned?: boolean;
  /** Demo: carrier / network (AT&T, eSIM, etc.) */
  demoCarrier?: string;
}

export interface Order {
  id: string;
  channel: Channel;
  externalOrderRef: string;
  shippingPostal: string;
  customerId?: string;
  createdAt: string;
  /** Demo: international vs domestic fulfillment notes */
  shippingRegion?: 'domestic' | 'international';
}

export interface ImeiRecord {
  id: string;
  value: string;
  productId: string;
  orderLineId: string;
}

export interface Warranty {
  id: string;
  orderLineId: string;
  startsOn: string;
  endsOn: string;
  tier: WarrantyTier;
}

export interface CarePlusSubscription {
  id: string;
  customerId: string;
  accountRef: string;
  devicePhone: string;
  status: CarePlusStatus;
  expiresOn?: string;
  /** Demo: tied order line */
  orderLineId?: string;
  /** Demo: entitlements blurb */
  planNotes?: string;
  /** Demo: Care+ reasons already claimed under this subscription (blocks repeat claims). */
  exhaustedCarePlusReasonIds?: string[];
}

export interface Rma {
  id: string;
  code: string;
  orderId: string;
  customerId: string;
  kind: RmaKind;
  status: RmaStatus;
  createdAt: string;
  updatedAt: string;
  deviceImei?: string;
  orderLineId?: string;
  parentRmaId?: string;
  summary?: string;
}

export interface ReturnRequest {
  id: string;
  rmaId: string;
  refundTotalCents?: number;
  refundDenied?: boolean;
}

export interface ReplacementRequest {
  id: string;
  rmaId: string;
  replacementProductId?: string;
  restockHold: boolean;
  replacementSequence?: number;
  issueSummary?: string;
}

export interface TradeInRequest {
  id: string;
  rmaId?: string;
  orderId?: string;
  brand: string;
  quotedValueCents: number;
  imei?: string;
  state: TradeInState;
}

export interface InventoryRow {
  productId: string;
  skuLabel: string;
  color: string;
  onHand: number;
  allowWaitlist: boolean;
  /** When false, SKU is not offered in service replacement resolution (demo: backend rule). Default: eligible. */
  replacementEligible?: boolean;
}

export interface Message {
  id: string;
  rmaId: string;
  subject: string;
  preview: string;
  body: string;
  sentAt: string;
  direction: MessageDirection;
}
