import type { TradeInRequest } from '@/types/models';

export const tradeInRequests: TradeInRequest[] = [
  {
    id: 'tri-001',
    rmaId: 'TT-TI-201',
    orderId: 'ord-201',
    brand: 'TickTalk',
    quotedValueCents: 5000,
    imei: '356789012399999',
    state: 'quoted',
  },
  {
    id: 'tri-loy',
    rmaId: 'TT-TI-LOY',
    orderId: 'ord-loy-04',
    brand: 'TickTalk',
    quotedValueCents: 3500,
    imei: '356788000000001',
    state: 'applied',
  },
  {
    id: 'tri-qa',
    orderId: 'ord-qa-09',
    brand: 'TickTalk',
    quotedValueCents: 4500,
    imei: '356789077777777',
    state: 'cancelled',
  },
];
