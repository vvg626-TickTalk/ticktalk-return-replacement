import type { RmaKind, RmaStatus } from '@/types/models';

/** Logged-in profile for Service Order portal (not TickTalk App). */
export type ServiceOrderProfile = {
  name: string;
  email: string | null;
  phoneDisplay: string | null;
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
};

/** SessionStorage payload after replacement confirmation — consumed by signup prefill. */
export type PostReplacementPrefill = {
  name: string;
  email: string;
  phoneDisplay: string;
  orderId: string;
  rmaCode: string;
  /** Full snapshot for registering after signup */
  pendingRma: Omit<RegisteredServiceRma, 'localId'>;
};
