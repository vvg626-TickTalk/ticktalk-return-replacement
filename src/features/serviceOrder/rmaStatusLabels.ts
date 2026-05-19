import type { RmaStatus } from '@/types/models';

/** PPT-aligned customer-visible status copy */
export const RMA_STATUS_CUSTOMER_LABEL: Record<RmaStatus, string> = {
  pending: 'Requested',
  awaiting_your_reply: 'Awaiting Your Response',
  rejected: 'Cancelled',
  waiting_for_your_shipment: 'Waiting for Customer Shipment',
  shipment_deadline_passed: 'Customer Shipment Overdue',
  shipped_by_customer: 'Customer Shipped',
  inspection_in_progress: 'Inspecting',
  inspection_failed: 'Inspection Failed',
  backorder: 'Awaiting Restock',
  preparing_shipment: 'Ready to Ship',
  shipped: 'Replacement Sent',
  return_in_review: 'In Review',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};
