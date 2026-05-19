import type { Order, OrderLine } from '@/types/models';
import { getProductById } from '@/mock-data';
import {
  RETURN_REASONS,
  type PerLineReturnReason,
} from '@/features/return/returnReasons';
import type { RegisteredServiceRma } from '@/features/serviceOrder/types';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import type { ContactSnapshot } from '@/features/serviceOrder/buildReplacementPendingRma';
import { sanitizePhoneForStorage } from '@/features/serviceOrder/phoneSanitize';

export function buildReturnPendingRma(params: {
  order: Order;
  lines: OrderLine[];
  expandedLineIds: string[];
  reasonByLineId: Record<string, PerLineReturnReason>;
  contact: ContactSnapshot;
  addressMode: 'domestic' | 'international';
  rmaCode: string;
  refundEstimateCents: number;
  returnShippingFeeCents: number;
  uploadedImageCount: number;
}): Omit<RegisteredServiceRma, 'localId'> {
  const {
    order,
    lines,
    expandedLineIds,
    reasonByLineId,
    contact,
    addressMode,
    rmaCode,
    refundEstimateCents,
    returnShippingFeeCents,
    uploadedImageCount,
  } = params;

  const addrParts = [
    contact.address1,
    contact.address2,
    `${contact.city}, ${contact.region} ${contact.postal}`,
    addressMode === 'international' ? contact.country : null,
  ].filter(Boolean);

  const productLines: string[] = [];
  const productSwatches: string[] = [];
  const reasonLines: string[] = [];

  for (const lineId of expandedLineIds) {
    const line = lines.find((l) => l.id === lineId);
    const p = line ? getProductById(line.productId) : undefined;
    if (!line || !p) continue;
    const color = line.demoPurchasedColor ? ` · ${line.demoPurchasedColor}` : '';
    const gift = line.isGift ? ' (gift)' : '';
    productLines.push(`${p.name}${color}${gift}`);
    productSwatches.push(p.swatch ?? 'bg-slate-200');

    const rf = reasonByLineId[lineId];
    const def = rf?.reasonId ? RETURN_REASONS.find((r) => r.id === rf.reasonId) : undefined;
    if (rf?.reasonId === 'other') {
      reasonLines.push(`Other: ${(rf.otherNote ?? '').trim() || '—'}`);
    } else if (def) {
      reasonLines.push(def.label);
    } else {
      reasonLines.push('—');
    }
  }

  const returnReasonSummary = reasonLines.join('\n');

  return {
    code: rmaCode,
    orderId: order.id,
    kind: 'return',
    status: 'pending',
    customerStatusLabel: RMA_STATUS_CUSTOMER_LABEL.pending,
    needsCustomerResponse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactName: contact.name,
    email: contact.email.trim(),
    phone: sanitizePhoneForStorage(contact.phoneDisplay),
    addressMultiline: addrParts.join('\n'),
    issueDescription: returnReasonSummary,
    productLines,
    productSwatches,
    returnReasonSummary,
    refundEstimateCents,
    returnShippingFeeCents,
    uploadedImageCount,
  };
}
