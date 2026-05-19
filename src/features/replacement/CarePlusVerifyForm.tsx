import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import {
  TICKTALK_WIRELESS_ACCOUNT_DESCRIPTION,
  TICKTALK_WIRELESS_ACCOUNT_EMAIL_ONLY_NOTE,
  TICKTALK_WIRELESS_ACCOUNT_EMAIL_PLACEHOLDER,
  TICKTALK_WIRELESS_ACCOUNT_TITLE,
} from '@/features/serviceOrder/serviceAuthCopy';
import { fieldControl, fieldControlMono } from '@/ui/formControls';
import { cn } from '@/utils/cn';

export type CarePlusForcedOutcome =
  | 'auto'
  | 'expired'
  | 'incorrect'
  | 'mismatch'
  | 'limit'
  | 'unknown';

export type CarePlusVerifyFormProps = {
  onVerified: () => void;
  onCancel: () => void;
  defaultDevicePhone?: string;
  defaultParentAccount?: string;
  /** Shown in the plan info shell (e.g. TickTalk Care+ vs Plus+ Plan). */
  planHeading?: string;
  planDeviceBlurb?: string;
};

function outcomeMessage(outcome: Exclude<CarePlusForcedOutcome, 'auto'>): string {
  switch (outcome) {
    case 'expired':
      return 'This verification code expired. Please resend a new code.';
    case 'incorrect':
      return 'That code doesn’t match. Double-check and try again.';
    case 'mismatch':
      return 'We couldn’t match this number with your TickTalk Care+ purchase. Try the email you used when you bought Care+.';
    case 'limit':
      return 'Daily verification limit reached. Try again tomorrow or contact support.';
    case 'unknown':
      return 'Something went wrong. Please wait a moment and try again.';
    default:
      return 'Verification failed.';
  }
}

const shell = 'rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 py-2.5';

function validEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function isPhoneFilled(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  return d.length === 10 || (d.length === 11 && d.startsWith('1'));
}

/**
 * Mock-only verification (TT5 / Care+). QA panel only in dev.
 */
export function CarePlusVerifyForm({
  onVerified,
  onCancel,
  defaultDevicePhone = '+1 ',
  defaultParentAccount = '',
  planHeading = 'TickTalk Care+',
  planDeviceBlurb = 'TickTalk 5 and earlier. We text a code to the watch number on file.',
}: CarePlusVerifyFormProps) {
  const [devicePhone, setDevicePhone] = useState(defaultDevicePhone);
  const [parentAccount, setParentAccount] = useState(defaultParentAccount);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [codeSentOnce, setCodeSentOnce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forcedOutcome, setForcedOutcome] = useState<CarePlusForcedOutcome>('auto');

  const canSend = useMemo(() => {
    return validEmail(parentAccount) && isPhoneFilled(devicePhone);
  }, [devicePhone, parentAccount]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  const send = () => {
    setError(null);
    if (!canSend) return;
    setSecondsLeft(300);
    setCodeSentOnce(true);
    setToast('Verification code sent. Please use it within 5 minutes.');
  };

  const verify = () => {
    setError(null);
    const trimmed = code.trim();
    if (trimmed.length < 6) return;

    if (forcedOutcome !== 'auto') {
      setError(outcomeMessage(forcedOutcome));
      return;
    }

    if (trimmed === '120001') {
      setError(outcomeMessage('expired'));
      return;
    }
    if (trimmed === '120002') {
      setError(outcomeMessage('incorrect'));
      return;
    }
    if (trimmed === '120003') {
      setError(outcomeMessage('mismatch'));
      return;
    }
    if (trimmed === '120004') {
      setError(outcomeMessage('limit'));
      return;
    }
    if (trimmed === '120005') {
      setError(outcomeMessage('unknown'));
      return;
    }

    if (!/^\d{6}$/.test(trimmed)) {
      setError('Use the 6-digit code.');
      return;
    }

    onVerified();
  };

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-3">
      {toast ? (
        <div className="rounded-xl bg-support-tint px-3 py-2 text-[13px] font-semibold text-support-navy ring-1 ring-support-navy/12">
          {toast}
        </div>
      ) : null}

      <div className={shell}>
        <p className="text-[12px] font-semibold text-slate-900">{planHeading}</p>
        <p className="mt-1 text-[11px] leading-snug text-slate-600">{planDeviceBlurb}</p>
      </div>

      <div className={shell}>
        <label htmlFor="care-device-phone" className="text-[11px] font-semibold text-slate-800">
          Watch phone number
        </label>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">Default +1. You can type with or without country code.</p>
        <input
          id="care-device-phone"
          className={cn(fieldControl, 'mt-2 border-slate-200 bg-white')}
          value={devicePhone}
          onChange={(e) => setDevicePhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <div className={shell}>
        <label htmlFor="care-parent" className="text-[11px] font-semibold text-slate-800">
          {TICKTALK_WIRELESS_ACCOUNT_TITLE}
        </label>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{TICKTALK_WIRELESS_ACCOUNT_DESCRIPTION}</p>
        <p className="mt-1 text-[10px] leading-snug text-slate-500">{TICKTALK_WIRELESS_ACCOUNT_EMAIL_ONLY_NOTE}</p>
        <input
          id="care-parent"
          className={cn(fieldControl, 'mt-2 border-slate-200 bg-white')}
          value={parentAccount}
          onChange={(e) => setParentAccount(e.target.value)}
          autoComplete="email"
          inputMode="email"
          placeholder={TICKTALK_WIRELESS_ACCOUNT_EMAIL_PLACEHOLDER}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 w-full shrink-0 text-[13px] sm:w-auto"
          disabled={!canSend || secondsLeft > 0}
          onClick={send}
        >
          {secondsLeft > 0 ? `Resend in ${mmss}` : 'Send Verification Code'}
        </Button>
        <p className="text-[11px] leading-snug text-slate-600">
          {codeSentOnce ? (
            <button
              type="button"
              className="font-semibold text-support-navy underline decoration-support-navy/30 disabled:opacity-40"
              onClick={send}
              disabled={!canSend || secondsLeft > 0}
            >
              Didn’t receive a code?
            </button>
          ) : (
            <span>Tap Send when phone and email look right.</span>
          )}
        </p>
      </div>

      <div className={shell}>
        <label htmlFor="care-code" className="text-[11px] font-semibold text-slate-800">
          Verification code
        </label>
        <input
          id="care-code"
          className={cn(fieldControlMono, 'mt-2 border-slate-200 bg-white')}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          aria-invalid={Boolean(error)}
        />
        {error ? <p className="mt-1.5 text-[11px] font-medium text-red-700">{error}</p> : null}
        {import.meta.env.DEV ? (
          <p className="mt-2 text-[10px] leading-snug text-slate-500">Demo: any 6 digits except 120001–120005 (unless QA below is set).</p>
        ) : null}
      </div>

      {import.meta.env.DEV ? (
        <details className="rounded-xl border border-slate-200/80 bg-white px-2 py-1">
          <summary className="cursor-pointer list-none px-1 py-2 text-[11px] font-semibold text-slate-600 marker:hidden [&::-webkit-details-marker]:hidden">
            QA · force error (dev)
          </summary>
          <div className="border-t border-slate-100 px-1 pb-2 pt-2">
            <label htmlFor="care-forced" className="sr-only">
              Demo outcome
            </label>
            <select
              id="care-forced"
              className={`${fieldControl} appearance-auto text-sm`}
              value={forcedOutcome}
              onChange={(e) => setForcedOutcome(e.target.value as CarePlusForcedOutcome)}
            >
              <option value="auto">Auto</option>
              <option value="expired">Expired</option>
              <option value="incorrect">Invalid code</option>
              <option value="mismatch">Wrong phone or email</option>
              <option value="limit">Daily limit</option>
              <option value="unknown">Unknown error</option>
            </select>
          </div>
        </details>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" className="min-h-11 w-full text-[13px] sm:w-auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="min-h-11 w-full text-[13px] sm:w-auto"
          disabled={code.trim().length < 6}
          onClick={verify}
        >
          Verify
        </Button>
      </div>
    </div>
  );
}
