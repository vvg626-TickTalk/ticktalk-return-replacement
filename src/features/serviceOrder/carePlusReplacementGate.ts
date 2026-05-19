import type { ReplacementReasonId } from '@/features/replacement/replacementReasons';
import { getReplacementReason } from '@/features/replacement/replacementReasons';
import { carePlusSubscriptions } from '@/mock-data';

export type CarePlusGateFailureCode =
  | 'no_plan'
  | 'expired'
  | 'wrong_line'
  | 'reason_exhausted';

export type CarePlusPostVerifyResult =
  | { ok: true }
  | { ok: false; code: CarePlusGateFailureCode };

const CARE_COPY =
  'This device does not have active TickTalk Care+ coverage for this issue.';

export function carePlusNotAvailableMessage(): { title: string; body: string } {
  return { title: 'TickTalk Care+ Not Available', body: CARE_COPY };
}

/**
 * After mock Care+ OTP verification: entitlement must still cover this line and issue (demo).
 */
export function evaluateCarePlusAfterVerify(params: {
  customerId?: string;
  orderLineId: string;
  reasonId: ReplacementReasonId;
  referenceDate?: Date;
}): CarePlusPostVerifyResult {
  const def = getReplacementReason(params.reasonId);
  if (!def?.carePlusOnly) return { ok: true };
  if (!params.customerId) return { ok: false, code: 'no_plan' };

  const ref = params.referenceDate ?? new Date();
  const sub = carePlusSubscriptions.find(
    (s) => s.customerId === params.customerId && s.orderLineId === params.orderLineId,
  );

  if (!sub) {
    const anyWrongLine = carePlusSubscriptions.some((s) => s.customerId === params.customerId);
    return { ok: false, code: anyWrongLine ? 'wrong_line' : 'no_plan' };
  }

  if (sub.status === 'lapsed') {
    return { ok: false, code: 'expired' };
  }

  if (sub.expiresOn) {
    const end = new Date(`${sub.expiresOn}T23:59:59.000Z`);
    if (ref > end) return { ok: false, code: 'expired' };
  }

  const exhausted = sub.exhaustedCarePlusReasonIds?.includes(params.reasonId);
  if (exhausted) return { ok: false, code: 'reason_exhausted' };

  return { ok: true };
}
