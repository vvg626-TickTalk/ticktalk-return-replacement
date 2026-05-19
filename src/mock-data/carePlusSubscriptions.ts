import type { CarePlusSubscription } from '@/types/models';

export const carePlusSubscriptions: CarePlusSubscription[] = [
  {
    id: 'care-001',
    customerId: 'cust-ada',
    accountRef: 'parent.ticktalk.shop@example.com',
    devicePhone: '+14155550123',
    status: 'active',
    expiresOn: '2027-03-01',
  },
];
