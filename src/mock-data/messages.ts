import type { Message } from '@/types/models';

export const messages: Message[] = [
  {
    id: 'msg-001',
    rmaId: 'rma-5001',
    subject: 'RMA#TT-5001 — Please confirm return address',
    preview: 'Hi Ada — please confirm your return ship-from address…',
    body: 'Hi Ada — please confirm your return ship-from address so we can issue a label. Reply with any updates.',
    sentAt: '2026-05-12T15:22:00.000Z',
    direction: 'outbound',
  },
  {
    id: 'msg-002',
    rmaId: 'rma-5002',
    subject: 'RMA#TT-5002 — Color swap available',
    preview: 'Your preferred color is backordered. We can ship Aurora Teal today.',
    body: 'Your preferred color is backordered. We can ship Aurora Teal today. Reply “yes” to proceed.',
    sentAt: '2026-05-15T09:05:00.000Z',
    direction: 'outbound',
  },
];
