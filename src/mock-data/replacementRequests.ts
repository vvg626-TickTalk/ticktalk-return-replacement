import type { ReplacementRequest } from '@/types/models';

export const replacementRequests: ReplacementRequest[] = [
  {
    id: 'repl-9001',
    rmaId: 'rma-5002',
    replacementProductId: 'prod-tt-watch-5',
    restockHold: true,
  },
  {
    id: 'repl-9002',
    rmaId: 'rma-5003',
    replacementProductId: 'prod-tt-watch-5',
    restockHold: false,
  },
];
