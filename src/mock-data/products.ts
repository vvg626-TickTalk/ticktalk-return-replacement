import type { Product } from '@/types/models';

export const products: Product[] = [
  {
    id: 'prod-tt-watch-5',
    name: 'TickTalk Watch 5',
    kind: 'watch',
    generation: 'TT5',
    swatch: 'bg-teal-400',
  },
  {
    id: 'prod-tt-watch-6',
    name: 'TickTalk Watch 6',
    kind: 'watch',
    generation: 'TT6',
    swatch: 'bg-slate-700',
  },
  {
    id: 'prod-strap',
    name: 'Comfort Strap (gift)',
    kind: 'accessory',
    swatch: 'bg-rose-200',
  },
  {
    id: 'prod-charger',
    name: 'TickTalk USB charging cable',
    kind: 'accessory',
    swatch: 'bg-amber-200',
  },
];
