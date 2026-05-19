import type { InventoryRow } from '@/types/models';

export const inventory: InventoryRow[] = [
  {
    productId: 'prod-tt-watch-5',
    skuLabel: 'TT5—Aurora Teal',
    color: 'Aurora Teal',
    onHand: 14,
    allowWaitlist: true,
    replacementEligible: true,
  },
  {
    productId: 'prod-tt-watch-5',
    skuLabel: 'TT5—Lunar Gray',
    color: 'Lunar Gray',
    onHand: 0,
    allowWaitlist: true,
    replacementEligible: true,
  },
  {
    productId: 'prod-tt-watch-5',
    skuLabel: 'TT5—Royal Purple',
    color: 'Purple',
    onHand: 0,
    allowWaitlist: true,
    replacementEligible: true,
  },
  {
    productId: 'prod-tt-watch-6',
    skuLabel: 'TT6—Graphite',
    color: 'Graphite',
    onHand: 3,
    allowWaitlist: false,
    replacementEligible: true,
  },
  /** Demo: all SKUs at 0 → replacement submit shows backorder / restock messaging in the wizard. */
  {
    productId: 'prod-strap',
    skuLabel: 'Strap—Comfort',
    color: 'Rose',
    onHand: 0,
    allowWaitlist: true,
    replacementEligible: true,
  },
];
