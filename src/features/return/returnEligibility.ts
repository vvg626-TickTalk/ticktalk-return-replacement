import type { Order, OrderLine, Product } from '@/types/models';
import { getProductById } from '@/mock-data';
import { RETURN_WINDOW_DAYS } from '@/features/return/returnConstants';

export type ReturnEligibility = {
  selectable: boolean;
  /** Shown when the row is visible but not selectable */
  blockedReason?: string;
};

/**
 * Primary lines customers can add to a return (not gifts; shipped; in window).
 * Gifts appear automatically when their bundle main is selected.
 */
export function getReturnEligibility(
  line: OrderLine,
  product: Product | undefined,
  order: Order,
  referenceDate: Date = new Date(),
): ReturnEligibility {
  if (!product) {
    return { selectable: false, blockedReason: 'This item can’t be returned in this preview.' };
  }
  if (line.status !== 'shipped') {
    return { selectable: false, blockedReason: 'Available after this item ships.' };
  }
  if (line.isGift) {
    return {
      selectable: false,
      blockedReason: 'Promo gifts can’t be returned by themselves. Add the qualifying purchase—we’ll include the gift.',
    };
  }
  if (!isWithinReturnWindow(line, order, referenceDate)) {
    return {
      selectable: false,
      blockedReason: `Outside the ${RETURN_WINDOW_DAYS}-day return window (from delivery date in our demo).`,
    };
  }
  return { selectable: true };
}

export function isWithinReturnWindow(line: OrderLine, order: Order, referenceDate: Date = new Date()): boolean {
  const start = new Date(line.deliveredAt ?? order.createdAt);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + RETURN_WINDOW_DAYS);
  return referenceDate <= end;
}

/** Gift lines tied to the same qualifying purchase (same bundle id). */
export function getBundledGiftLines(lines: OrderLine[], primary: OrderLine): OrderLine[] {
  if (!primary.bundleId) return [];
  return lines.filter((l) => l.bundleId === primary.bundleId && l.isGift && l.id !== primary.id);
}

export function expandPrimarySelection(primaryIds: string[], allLines: OrderLine[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const pid of primaryIds) {
    const line = allLines.find((l) => l.id === pid);
    if (!line) continue;
    const block = [line, ...getBundledGiftLines(allLines, line)];
    for (const l of block) {
      if (!seen.has(l.id)) {
        seen.add(l.id);
        out.push(l.id);
      }
    }
  }
  return out;
}

/** Remove primary and any of its bundled gifts from the primary-id list. */
export function primaryIdsAfterRemoval(primaryIds: string[], removedPrimaryId: string, allLines: OrderLine[]): string[] {
  const removed = new Set<string>();
  const primary = allLines.find((l) => l.id === removedPrimaryId);
  removed.add(removedPrimaryId);
  if (primary?.bundleId) {
    allLines
      .filter((l) => l.bundleId === primary.bundleId && l.isGift)
      .forEach((g) => removed.add(g.id));
  }
  return primaryIds.filter((id) => !removed.has(id));
}

/** Order-level Return CTA when every line fails `getReturnEligibility` (demo). */
export function getOrderReturnSummary(
  lines: OrderLine[],
  order: Order,
  referenceDate: Date = new Date(),
): { enabled: boolean; reason?: string } {
  for (const line of lines) {
    const p = getProductById(line.productId);
    if (getReturnEligibility(line, p, order, referenceDate).selectable) {
      return { enabled: true };
    }
  }
  const anyShipped = lines.some((l) => l.status === 'shipped');
  if (!anyShipped) {
    return { enabled: false, reason: 'Returns are available after eligible items ship.' };
  }
  return {
    enabled: false,
    reason: 'No return-eligible items on this order right now (window, gift rules, or demo limits).',
  };
}
