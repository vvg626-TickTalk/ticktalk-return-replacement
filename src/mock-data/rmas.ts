import type { Rma } from '@/types/models';

export const rmas: Rma[] = [
  {
    id: 'rma-5001',
    code: 'TT-5001',
    orderId: 'ord-101',
    customerId: 'cust-ada',
    kind: 'return',
    status: 'return_in_review',
    createdAt: '2026-05-10T16:10:00.000Z',
    updatedAt: '2026-05-12T15:22:00.000Z',
  },
  {
    id: 'rma-5002',
    code: 'TT-5002',
    orderId: 'ord-101',
    customerId: 'cust-ada',
    kind: 'replacement',
    status: 'backorder',
    createdAt: '2026-05-11T10:00:00.000Z',
    updatedAt: '2026-05-15T09:05:00.000Z',
  },
  {
    id: 'rma-5003',
    code: 'TT-5003',
    orderId: 'ord-101',
    customerId: 'cust-ada',
    kind: 'replacement',
    status: 'awaiting_your_reply',
    createdAt: '2026-05-13T12:00:00.000Z',
    updatedAt: '2026-05-16T11:30:00.000Z',
  },
];
