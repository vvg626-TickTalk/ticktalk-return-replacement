import type { RmaKind, RmaStatus } from '@/types/models';

/** Logged-in profile for Service Order portal (not TickTalk App). */
export type ServiceOrderProfile = {
  name: string;
  email: string | null;
  phoneDisplay: string | null;
  /**
   * Demo: customer id from the purchase tied to the pending/service flow (ord-101 → cust-ada).
   * Used to show purchase history even when the signup email differs from the mock catalog.
   */
  linkedCustomerId?: string | null;
};

/** RMA created in-demo from replacement flow + signup. */
export type RegisteredServiceRma = {
  localId: string;
  code: string;
  orderId: string;
  kind: RmaKind;
  status: RmaStatus;
  /** PPT-style customer-facing line */
  customerStatusLabel: string;
  needsCustomerResponse: boolean;
  createdAt: string;
  updatedAt: string;
  contactName: string;
  email: string;
  phone: string;
  addressMultiline: string;
  issueDescription: string;
  productLines: string[];
  productSwatches: string[];
  /** Return flow — readable summary for detail page */
  returnReasonSummary?: string;
  refundEstimateCents?: number;
  returnShippingFeeCents?: number;
  uploadedImageCount?: number;
};

/** localStorage payload after return/replacement confirmation — consumed by signup prefill. */
export type PostReplacementPrefill = {
  name: string;
  email: string;
  phoneDisplay: string;
  orderId: string;
  rmaCode: string;
  /** Mock owner of the purchase order (links account to orders + history after signup). */
  customerId?: string;
  /** Full snapshot for registering after signup */
  pendingRma: Omit<RegisteredServiceRma, 'localId'>;
};
