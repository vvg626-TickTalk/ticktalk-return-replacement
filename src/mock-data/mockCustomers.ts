import type { Customer } from '@/types/models';

/** Six realistic portal personas (+ stable IDs for demos / deep links). */
export const customers: Customer[] = [
  {
    id: 'cust-ada',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phoneE164: '+14155550100',
  },
  {
    id: 'cust-bernard',
    name: 'Bernard Joy',
    email: 'bernard@example.com',
    phoneE164: '+16505550111',
  },
  {
    id: 'cust-marian',
    name: 'Marian Kim',
    email: 'marian.kim@example.com',
    phoneE164: '+12065550222',
  },
  {
    id: 'cust-elena',
    name: 'Elena Vogt',
    email: 'elena.vogt@example.co.uk',
    phoneE164: '+442071234567',
  },
  {
    id: 'cust-jordan',
    name: 'Jordan Patel',
    email: 'jordan.patel@example.com',
    phoneE164: '+13125550333',
  },
  {
    id: 'cust-qa',
    name: 'Quinn Api',
    email: 'qa.loop@example.com',
    phoneE164: '+18005559999',
  },
];
