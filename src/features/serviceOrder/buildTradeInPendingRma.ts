import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import type { RegisteredServiceRma } from '@/features/serviceOrder/types';
import type { TradeInDemoState } from '@/features/tradeIn/tradeInDemoStorage';

export function buildTradeInPendingRma(demo: TradeInDemoState): Omit<RegisteredServiceRma, 'localId'> {
  const code = `TI${String(Math.floor(100000 + Math.random() * 899999))}`;
  return {
    code,
    orderId: demo.sourceOrderId ?? '',
    kind: 'trade_in',
    status: 'pending',
    customerStatusLabel: RMA_STATUS_CUSTOMER_LABEL.pending,
    needsCustomerResponse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactName: '',
    email: '',
    phone: '',
    addressMultiline: demo.sourceOrderId ? `Linked order (demo): ${demo.sourceOrderId}` : '—',
    issueDescription: `Trade-in — ${demo.oldDeviceName}${demo.imei ? ` · IMEI ${demo.imei}` : ''} (demo).`,
    productLines: [demo.oldDeviceName],
    productSwatches: ['bg-slate-200'],
  };
}
