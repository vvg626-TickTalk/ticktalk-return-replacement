import type { Warranty } from '@/types/models';

export const warranties: Warranty[] = [
  {
    id: 'wty-001',
    orderLineId: 'line-ord-101-a',
    startsOn: '2026-04-22',
    endsOn: '2027-04-22',
    tier: 'care_plus',
  },
  {
    id: 'wty-103-a',
    orderLineId: 'line-ord-103-a',
    startsOn: '2026-05-13',
    endsOn: '2027-05-13',
    tier: 'standard',
  },
  {
    id: 'wty-103-b',
    orderLineId: 'line-ord-103-b',
    startsOn: '2026-05-13',
    endsOn: '2027-05-13',
    tier: 'standard',
  },
];
