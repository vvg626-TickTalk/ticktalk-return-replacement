import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormField } from '@/components/FormField';
import { fieldControl, fieldControlMono } from '@/ui/formControls';

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
};

function outcomeMessage(outcome: Exclude<CarePlusForcedOutcome, 'auto'>): string {
  switch (outcome) {
    case 'expired':
      return 'This verification code expired. Please resend a new code.';
    case 'incorrect':
      return 'That code doesn’t match. Double-check and try again.';
    case 'mismatch':
      return 'We couldn’t match this number with your TickTalk Care+ purchase. Try the email or phone you used when you bought Care+.';
    case 'limit':
      return 'Daily verification limit reached. Try again tomorrow or contact support.';
    case 'unknown':
      return 'Something went wrong. Please wait a moment and try again.';
    default:
      return 'Verification failed.';
  }
}

/**
 * Mock-only verification UI (OTP + countdown). Magic codes (demo):
 * - 120001 expired · 120002 incorrect · 120003 mismatch · 120004 limit · 120005 unknown
 * Any other 6-digit code succeeds when “QA · force an error” is set to Auto.
 */
export function CarePlusVerifyForm({
  onVerified,
  onCancel,
  defaultDevicePhone = '+1',
  defaultParentAccount = '',
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
    const acct = parentAccount.trim();
    const phone = devicePhone.replace(/\D/g, '');
    return acct.length >= 3 && phone.length >= 10;
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

  const submit = () => {
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
    <div className="space-y-4">
      {toast ? (
        <div className="rounded-2xl bg-brand-accentSoft px-4 py-3 text-sm font-semibold text-teal-950 ring-1 ring-teal-200">
          {toast}
        </div>
      ) : null}

      <Card className="border-0 bg-teal-50/40 shadow-none ring-1 ring-teal-100/80">
        <p className="text-sm font-semibold text-brand-ink">Verify your plan</p>
        <p className="mt-1.5 text-sm leading-snug text-slate-600">We’ll text a code to the number on file for this watch.</p>
      </Card>

      <FormField
        id="care-device-phone"
        label="Watch phone number"
        hint="Includes +1 by default. TickTalk 5 watches only in this demo."
      >
        <input
          id="care-device-phone"
          className={fieldControl}
          value={devicePhone}
          onChange={(e) => setDevicePhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
        />
      </FormField>

      <FormField
        id="care-parent"
        label="TickTalk Wireless account"
        hint="Email or phone on your TickTalk Wireless account. TickTalk 5 only in this demo."
      >
        <input
          id="care-parent"
          className={fieldControl}
          value={parentAccount}
          onChange={(e) => setParentAccount(e.target.value)}
          autoComplete="email"
        />
      </FormField>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <Button type="button" variant="secondary" className="min-h-12 w-full shrink-0 sm:w-auto" disabled={!canSend || secondsLeft > 0} onClick={send}>
          {secondsLeft > 0 ? `Resend in ${mmss}` : 'Send Verification Code'}
        </Button>
        <div className="text-xs leading-snug text-slate-600">
          {codeSentOnce ? (
            <button type="button" className="font-semibold text-support-navy underline" onClick={send} disabled={!canSend || secondsLeft > 0}>
              Did not receive code?
            </button>
          ) : (
            <span>We&apos;ll text a code after you tap Send Verification Code.</span>
          )}
        </div>
      </div>

      <FormField
        id="care-code"
        label="Verification code"
        hint="Enter the 6-digit code (demo: any six digits except 120001–120005 when QA is Auto)."
        error={error ?? undefined}
      >
        <input
          id="care-code"
          className={fieldControlMono}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
        />
      </FormField>

      {import.meta.env.DEV ? (
        <details className="rounded-2xl bg-slate-50/80 ring-1 ring-slate-200/80">
          <summary className="min-h-12 cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700 marker:hidden [&::-webkit-details-marker]:hidden">
            QA · force an error (demo)
          </summary>
          <div className="border-t border-slate-200/80 px-4 pb-4 pt-3">
            <label htmlFor="care-forced" className="sr-only">
              Demo forced outcome
            </label>
            <select
              id="care-forced"
              className={`${fieldControl} appearance-auto`}
              value={forcedOutcome}
              onChange={(e) => setForcedOutcome(e.target.value as CarePlusForcedOutcome)}
            >
              <option value="auto">Auto — use code rules</option>
              <option value="expired">Expired</option>
              <option value="incorrect">Incorrect code</option>
              <option value="mismatch">Account/phone mismatch</option>
              <option value="limit">Daily limit</option>
              <option value="unknown">Unknown error</option>
            </select>
            <p className="mt-2 text-xs leading-snug text-slate-500">
              Codes 120001–120005 also map to errors when outcome is Auto.
            </p>
          </div>
        </details>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200/90 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" className="min-h-12 w-full sm:w-auto" onClick={onCancel}>
          Back
        </Button>
        <Button type="button" className="min-h-12 w-full sm:w-auto" disabled={code.trim().length < 6} onClick={submit}>
          Verify
        </Button>
      </div>
    </div>
  );
}
