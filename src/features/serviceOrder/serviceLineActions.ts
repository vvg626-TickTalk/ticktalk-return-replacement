import { isLineReplaceEligible, lineRequiresImei } from '@/features/replacement/eligibility';
import { RETURN_WINDOW_DAYS } from '@/features/return/returnConstants';
import { getReturnEligibility } from '@/features/return/returnEligibility';
import { customerHasActiveCarePlus } from '@/features/tradeIn/tradeInCarePlus';
import { getWarrantyForLine, hasOpenReplacementOnLine, hasOpenReturnOnLine } from '@/mock-data';
import type { Order, OrderLine, Product } from '@/types/models';

export function orderIsFullyUnshipped(lines: OrderLine[]): boolean {
  return lines.length > 0 && lines.every((l) => l.status === 'unshipped');
}

/** Shipped but not yet received (PPT: shipped, not delivered). */
export function lineIsInTransit(line: OrderLine): boolean {
  return line.status === 'shipped' && line.customerReceived === false;
}

export function shouldShowImeiCell(line: OrderLine, product: Product | undefined): boolean {
  if (line.status !== 'shipped') return false;
  if (!lineRequiresImei(product)) return false;
  if (lineIsInTransit(line) && product?.generation === 'TT5') return false;
  if (lineIsInTransit(line)) return Boolean(line.imei);
  return true;
}

export function imeiDisplayForLine(line: OrderLine, product: Product | undefined): string {
  if (!shouldShowImeiCell(line, product)) return '—';
  return line.imei ?? '—';
}

export function isWithinReplacementWarranty(
  line: OrderLine,
  order: Order,
  referenceDate: Date = new Date(),
): boolean {
  const w = getWarrantyForLine(line.id);
  if (w) {
    const end = new Date(`${w.endsOn}T23:59:59.000Z`);
    return referenceDate <= end;
  }
  const start = new Date(line.deliveredAt ?? order.createdAt);
  const end = new Date(start);
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  return referenceDate <= end;
}

export type ServiceBlockedModal = { title: string; body: string };

export type LineReturnAction =
  | { enabled: true }
  | { enabled: false; modal: ServiceBlockedModal; showAsDisabled: boolean };

export type LineReplaceAction =
  | { enabled: true }
  | { enabled: false; modal: ServiceBlockedModal; showAsDisabled: boolean };

const inTransitReplace: ServiceBlockedModal = {
  title: 'Replacement Not Available',
  body: 'This order has not been delivered yet. Replacement service will be available after delivery.',
};

const inTransitReturn: ServiceBlockedModal = {
  title: 'Return Not Available',
  body: 'This order has not been delivered yet. Return service will be available after delivery.',
};

const outsideWarrantyReplace: ServiceBlockedModal = {
  title: 'Replacement Not Available',
  body: 'Replacement is not available: this product is outside the warranty period.',
};

const outsideWindowReturn: ServiceBlockedModal = {
  title: 'Return Not Available',
  body: `Return is not available: this product is outside the ${RETURN_WINDOW_DAYS}-day return window.`,
};

const giftReturnBlocked: ServiceBlockedModal = {
  title: 'Return Not Available',
  body: 'Free gifts must be returned with the main product.',
};

const unshippedBlocked: ServiceBlockedModal = {
  title: 'Not Available Yet',
  body: 'This item has not shipped yet.',
};

const returnedBlocked: ServiceBlockedModal = {
  title: 'Returned',
  body: 'This item has already been returned.',
};

const tradeInNotEligibleYet: ServiceBlockedModal = {
  title: 'Trade-in Not Available',
  body: 'Trade-in is available once the 1-year warranty has ended or TickTalk Care+ is no longer active on your account.',
};

const duplicateOpenReturn: ServiceBlockedModal = {
  title: 'Return Not Available',
  body: 'A return request is already open for this product.',
};

const duplicateOpenReplace: ServiceBlockedModal = {
  title: 'Replacement Not Available',
  body: 'A replacement request is already open for this product.',
};

const returnBlockedOpenReplacement: ServiceBlockedModal = {
  title: 'Return Not Available',
  body: 'Return is not available while a replacement request is open.',
};

const replaceBlockedOpenReturn: ServiceBlockedModal = {
  title: 'Replacement Not Available',
  body: 'Replacement is not available while a return request is open.',
};

function isWithinReturnWindowLine(line: OrderLine, order: Order, referenceDate: Date): boolean {
  const start = new Date(line.deliveredAt ?? order.createdAt);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + RETURN_WINDOW_DAYS);
  return referenceDate <= end;
}

export function getLineReturnAction(
  line: OrderLine,
  product: Product | undefined,
  order: Order,
  orderUnshipped: boolean,
  referenceDate: Date = new Date(),
): LineReturnAction {
  if (line.demoReturned) {
    return { enabled: false, modal: returnedBlocked, showAsDisabled: false };
  }
  if (orderUnshipped || line.status === 'unshipped') {
    return { enabled: false, modal: unshippedBlocked, showAsDisabled: true };
  }
  if (hasOpenReturnOnLine(order.id, line.id)) {
    return { enabled: false, modal: duplicateOpenReturn, showAsDisabled: true };
  }
  if (hasOpenReplacementOnLine(order.id, line.id)) {
    return { enabled: false, modal: returnBlockedOpenReplacement, showAsDisabled: true };
  }
  if (line.isGift) {
    return { enabled: false, modal: giftReturnBlocked, showAsDisabled: true };
  }
  if (lineIsInTransit(line)) {
    return { enabled: false, modal: inTransitReturn, showAsDisabled: true };
  }

  const elig = getReturnEligibility(line, product, order, referenceDate);
  if (!elig.selectable) {
    if (!isWithinReturnWindowLine(line, order, referenceDate)) {
      return { enabled: false, modal: outsideWindowReturn, showAsDisabled: true };
    }
    return {
      enabled: false,
      modal: {
        title: 'Return Not Available',
        body: elig.blockedReason ?? 'Return is not available for this item.',
      },
      showAsDisabled: true,
    };
  }
  return { enabled: true };
}

export function getLineReplaceAction(
  line: OrderLine,
  product: Product | undefined,
  order: Order,
  orderUnshipped: boolean,
  referenceDate: Date = new Date(),
): LineReplaceAction {
  if (line.demoReturned) {
    return { enabled: false, modal: returnedBlocked, showAsDisabled: false };
  }
  if (orderUnshipped || line.status === 'unshipped') {
    return { enabled: false, modal: unshippedBlocked, showAsDisabled: true };
  }
  if (hasOpenReplacementOnLine(order.id, line.id)) {
    return { enabled: false, modal: duplicateOpenReplace, showAsDisabled: true };
  }
  if (hasOpenReturnOnLine(order.id, line.id)) {
    return { enabled: false, modal: replaceBlockedOpenReturn, showAsDisabled: true };
  }
  if (lineIsInTransit(line)) {
    return { enabled: false, modal: inTransitReplace, showAsDisabled: true };
  }
  if (!isLineReplaceEligible(line, product)) {
    return {
      enabled: false,
      modal: { title: 'Replacement Not Available', body: 'This item cannot be replaced in this demo.' },
      showAsDisabled: true,
    };
  }
  if (!isWithinReplacementWarranty(line, order, referenceDate)) {
    return { enabled: false, modal: outsideWarrantyReplace, showAsDisabled: true };
  }
  return { enabled: true };
}

export function getLineTradeInAction(
  line: OrderLine,
  product: Product | undefined,
  order: Order,
  orderUnshipped: boolean,
  referenceDate: Date = new Date(),
): LineReplaceAction {
  if (line.demoReturned) {
    return { enabled: false, modal: returnedBlocked, showAsDisabled: false };
  }
  if (product?.kind !== 'watch') {
    return {
      enabled: false,
      modal: { title: 'Trade-in Not Available', body: 'Trade-in applies to eligible watches only.' },
      showAsDisabled: true,
    };
  }
  if (orderUnshipped || line.status === 'unshipped') {
    return { enabled: false, modal: unshippedBlocked, showAsDisabled: true };
  }
  if (lineIsInTransit(line)) {
    return {
      enabled: false,
      modal: {
        title: 'Trade-in Not Available',
        body: 'Trade-in is available after your order is delivered.',
      },
      showAsDisabled: true,
    };
  }
  const inWarranty = isWithinReplacementWarranty(line, order, referenceDate);
  const carePlusActive = customerHasActiveCarePlus(order.customerId, referenceDate);
  if (inWarranty && carePlusActive) {
    return { enabled: false, modal: tradeInNotEligibleYet, showAsDisabled: true };
  }
  return { enabled: true };
}
