import type { Order } from '@/types/models';

export const orders: Order[] = [
  {
    id: 'ord-201',
    channel: 'myticktalk',
    externalOrderRef: '77821',
    shippingPostal: '94107',
    customerId: 'cust-bj',
    createdAt: '2024-03-01T12:00:00.000Z',
  },
  {
    id: 'ord-101',
    channel: 'myticktalk',
    externalOrderRef: '92118',
    shippingPostal: '92118',
    customerId: 'cust-ada',
    createdAt: '2026-04-18T12:30:00.000Z',
  },
  {
    id: 'ord-102',
    channel: 'amazon',
    externalOrderRef: '111-2959942-5172257',
    shippingPostal: '94107',
    customerId: 'cust-bj',
    createdAt: '2026-05-01T09:00:00.000Z',
  },
  /** Shipped, in transit (not received) — PPT page 10 demo */
  {
    id: 'ord-103',
    channel: 'myticktalk',
    externalOrderRef: '100001',
    shippingPostal: '94102',
    customerId: 'cust-ada',
    createdAt: '2026-05-12T09:00:00.000Z',
  },
];
