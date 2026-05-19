import type { OrderLine } from '@/types/models';

export type OrderLinePrimaryGroup = {
  primary: OrderLine;
  gifts: OrderLine[];
};

/** One row per non-gift line; promo gifts nested under matching `bundleId`. */
export function groupOrderLinesForDisplay(lines: OrderLine[]): OrderLinePrimaryGroup[] {
  const primaries = lines.filter((l) => !l.isGift);
  return primaries.map((primary) => ({
    primary,
    gifts: lines.filter((l) => l.isGift && l.bundleId && l.bundleId === primary.bundleId && l.id !== primary.id),
  }));
}
