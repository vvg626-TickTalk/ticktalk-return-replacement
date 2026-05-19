import type { OrderLine } from '@/types/models';

export const orderLines: OrderLine[] = [
  {
    id: 'line-ord-101-a',
    orderId: 'ord-101',
    productId: 'prod-tt-watch-5',
    quantity: 1,
    imei: '356789012345678',
    isGift: false,
    status: 'shipped',
    bundleId: 'bundle-101-main',
    deliveredAt: '2026-05-01T12:00:00.000Z',
    demoLineTotalCents: 199_99,
    demoPurchasedColor: 'Lunar Gray',
  },
  {
    id: 'line-ord-101-b',
    orderId: 'ord-101',
    productId: 'prod-strap',
    quantity: 1,
    isGift: true,
    status: 'shipped',
    bundleId: 'bundle-101-main',
    deliveredAt: '2026-05-01T12:00:00.000Z',
    demoLineTotalCents: 0,
  },
  /** Shipped but outside 30-day window on May 18, 2026 (demo). */
  {
    id: 'line-ord-101-c',
    orderId: 'ord-101',
    productId: 'prod-charger',
    quantity: 1,
    isGift: false,
    status: 'shipped',
    deliveredAt: '2026-03-01T12:00:00.000Z',
    demoLineTotalCents: 12_99,
  },
  {
    id: 'line-ord-102-a',
    orderId: 'ord-102',
    productId: 'prod-charger',
    quantity: 1,
    isGift: false,
    status: 'unshipped',
    demoLineTotalCents: 12_99,
  },
];
