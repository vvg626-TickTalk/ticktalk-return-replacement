import type { Order, OrderLine } from '@/types/models';
import { getProductById } from '@/mock-data';
import { getReplacementReason } from '@/features/replacement/replacementReasons';
import type { PerItemReasonForm } from '@/features/replacement/reasonValidation';
import { normalizePerItemReasonForm } from '@/features/replacement/reasonValidation';
import type { RegisteredServiceRma } from '@/features/serviceOrder/types';
import { sanitizePhoneForStorage } from '@/features/serviceOrder/phoneSanitize';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';

export type ContactSnapshot = {
  name: string;
  email: string;
  phoneDisplay: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

export function buildReplacementPendingRma(params: {
  order: Order;
  lines: OrderLine[];
  selections: { orderLineId: string }[];
  reasonByLineId: Record<string, PerItemReasonForm>;
  contact: ContactSnapshot;
  addressMode: 'domestic' | 'international';
  rmaCode: string;
}): Omit<RegisteredServiceRma, 'localId'> {
  const { order, lines, selections, reasonByLineId, contact, addressMode, rmaCode } = params;
  const addrParts = [
    contact.address1,
    contact.address2,
    `${contact.city}, ${contact.region} ${contact.postal}`,
    addressMode === 'international' ? contact.country : null,
  ].filter(Boolean);

  const productLines: string[] = [];
  const productSwatches: string[] = [];
  for (const s of selections) {
    const line = lines.find((l) => l.id === s.orderLineId);
    const p = line ? getProductById(line.productId) : undefined;
    if (line && p) {
      const color = line.demoPurchasedColor ? ` · ${line.demoPurchasedColor}` : '';
      productLines.push(`${p.name}${color}`);
      productSwatches.push(p.swatch ?? 'bg-slate-200');
    }
  }

  const issueParts = selections.map((s) => {
    const st = normalizePerItemReasonForm(reasonByLineId[s.orderLineId]);
    const def = getReplacementReason(st.reasonId);
    const note = st.description.trim() || def?.previewSummary || '';
    return def ? `${def.label}: ${note}` : note;
  });

  return {
    code: rmaCode,
    orderId: order.id,
    kind: 'replacement',
    status: 'pending',
    customerStatusLabel: RMA_STATUS_CUSTOMER_LABEL.pending,
    needsCustomerResponse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactName: contact.name,
    email: contact.email.trim(),
    phone: sanitizePhoneForStorage(contact.phoneDisplay),
    addressMultiline: addrParts.join('\n'),
    issueDescription: issueParts.join('\n'),
    productLines,
    productSwatches,
  };
}
