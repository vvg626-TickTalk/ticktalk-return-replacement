import type { RmaStatus } from '@/types/models';
import { cn } from '@/utils/cn';

export type StatusBadgeProps = {
  status: RmaStatus | string;
  className?: string;
};

const palette: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-900 ring-slate-300/50',
  awaiting_your_reply: 'bg-amber-50 text-amber-950 ring-amber-200/90',
  rejected: 'bg-red-50 text-red-950 ring-red-200/90',
  waiting_for_your_shipment: 'bg-indigo-50 text-indigo-950 ring-indigo-200/90',
  shipment_deadline_passed: 'bg-orange-50 text-orange-950 ring-orange-200/90',
  shipped_by_customer: 'bg-blue-50 text-blue-950 ring-blue-200/90',
  inspection_in_progress: 'bg-violet-50 text-violet-950 ring-violet-200/90',
  inspection_failed: 'bg-red-50 text-red-950 ring-red-200/90',
  backorder: 'bg-amber-50 text-amber-950 ring-amber-200/90',
  preparing_shipment: 'bg-sky-50 text-sky-950 ring-sky-200/90',
  shipped: 'bg-emerald-50 text-emerald-950 ring-emerald-200/90',
  return_in_review: 'bg-teal-50 text-teal-950 ring-teal-200/90',
  refunded: 'bg-emerald-50 text-emerald-950 ring-emerald-200/90',
  cancelled: 'bg-slate-100 text-slate-800 ring-slate-300/50',
};

/** Maps internal status keys to short customer-facing labels (see docs/copy-notes.md). */
const labels: Record<string, string> = {
  pending: 'Pending',
  awaiting_your_reply: 'Awaiting your reply',
  rejected: 'Rejected',
  waiting_for_your_shipment: 'Waiting for your shipment',
  shipment_deadline_passed: 'Shipment deadline passed',
  shipped_by_customer: 'Shipped by customer',
  inspection_in_progress: 'Inspection in progress',
  inspection_failed: 'Inspection failed',
  backorder: 'Awaiting restock',
  preparing_shipment: 'Preparing shipment',
  shipped: 'Shipped',
  return_in_review: 'In review',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = String(status);
  const tone = palette[key] ?? 'bg-slate-100 text-slate-900 ring-slate-300/50';
  const label = labels[key] ?? key;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset',
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
