import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { ServiceMessageModal } from '@/components/ServiceMessageModal';
import { ServiceToast } from '@/components/ServiceToast';
import { attachPendingRmaIfAny } from '@/features/serviceOrder/attachPendingServiceRma';
import { readPendingServiceOrder } from '@/features/serviceOrder/pendingServiceOrderStorage';
import { registerServiceAccountIdentifiers } from '@/features/serviceOrder/serviceAccountRegistry';
import { resolveLinkedCustomerId } from '@/features/serviceOrder/serviceCustomerLink';
import { useServiceOrderAccount } from '@/features/serviceOrder/ServiceOrderAccountContext';
import type { ServiceOrderProfile } from '@/features/serviceOrder/types';
import {
  SERVICE_ACCOUNT_FOOTNOTE,
  SERVICE_AUTH_COPY,
  SERVICE_SIGN_IN_INTRO,
} from '@/features/serviceOrder/serviceAuthCopy';
import { supportModalTitle } from '@/ui/supportTheme';
import { fieldControl, fieldControlMono } from '@/ui/formControls';
import { cn } from '@/utils/cn';

function validEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function mockVerifyOutcome(code: string): 'ok' | 'expired' | 'invalid' | 'unknown' {
  if (code === '000000') return 'expired';
  if (code === '111111') return 'invalid';
  if (code === '333333') return 'unknown';
  if (/^\d{6}$/.test(code)) return 'ok';
  return 'invalid';
}

export function ServiceLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToRaw = searchParams.get('return') ?? '/account/requests';
  const returnTo =
    returnToRaw.startsWith('/') && !returnToRaw.startsWith('//') ? returnToRaw : '/account/requests';
  const emailFromQuery = searchParams.get('email')?.trim() ?? '';

  const { signIn, addRegisteredRma } = useServiceOrderAccount();

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [modal, setModal] = useState<null | 'expired' | 'unknown' | 'invalid' | 'noEmail' | 'submissionFailed'>(null);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  const canSend = validEmail(email);

  const send = () => {
    if (!canSend || secondsLeft > 0) return;
    setSecondsLeft(300);
    setToastOpen(true);
  };

  const onSignIn = () => {
    const outcome = mockVerifyOutcome(code.trim());
    if (outcome === 'expired') {
      setModal('expired');
      return;
    }
    if (outcome === 'invalid') {
      setModal('invalid');
      return;
    }
    if (outcome === 'unknown') {
      setModal('unknown');
      return;
    }
    if (code.trim() === '222222') {
      setModal('submissionFailed');
      return;
    }

    const pre = readPendingServiceOrder();
    const baseProfile: ServiceOrderProfile = {
      name: 'Customer',
      email: email.trim(),
    };
    const profile: ServiceOrderProfile = {
      ...baseProfile,
      linkedCustomerId: resolveLinkedCustomerId(baseProfile, pre),
    };
    signIn(profile);
    registerServiceAccountIdentifiers(profile);
    attachPendingRmaIfAny(profile, addRegisteredRma);
    navigate(returnTo, { replace: true });
  };

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-8">
      <ServiceToast
        open={toastOpen}
        message={SERVICE_AUTH_COPY.verificationSent}
        onClose={() => setToastOpen(false)}
        durationMs={3000}
      />

      <div className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-8 shadow-xl shadow-slate-900/8 sm:px-10">
        <h1 className={supportModalTitle}>Sign In</h1>
        <p className="mt-3 text-[15px] leading-6 text-slate-600">{SERVICE_SIGN_IN_INTRO}</p>
        <p className="mt-2 text-xs leading-snug text-slate-500">{SERVICE_ACCOUNT_FOOTNOTE}</p>
        <p className="mt-4 text-sm text-slate-600">
          New to Service Orders?{' '}
          <Link to="/service/signup" className="font-semibold text-support-navy underline decoration-support-navy/30">
            Sign up
          </Link>
          .
        </p>

        <div className="mt-6 space-y-4">
          <FormField id="li-email" label="Email address">
            <input
              id="li-email"
              className={fieldControl}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FormField>

          <FormField id="li-code" label="Verification code">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input
                id="li-code"
                className={cn(fieldControlMono, 'sm:flex-1')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="6-digit code"
                autoComplete="one-time-code"
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full shrink-0 sm:w-auto"
                disabled={!canSend || secondsLeft > 0}
                onClick={send}
              >
                {secondsLeft > 0 ? `Resend (${mmss})` : 'Send Verification Code'}
              </Button>
            </div>
          </FormField>
          <button
            type="button"
            className="-mt-1 text-left text-sm font-medium text-support-navy hover:underline"
            onClick={() => setModal('noEmail')}
          >
            Didn’t receive the verification code?
          </button>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="button" className="w-full sm:w-auto" disabled={code.trim().length < 6} onClick={onSignIn}>
            Sign In
          </Button>
        </div>
      </div>

      <ServiceMessageModal
        open={modal === 'expired'}
        title={SERVICE_AUTH_COPY.codeExpired.title}
        message={SERVICE_AUTH_COPY.codeExpired.message}
        onClose={() => setModal(null)}
        primaryAction={{ label: 'OK', onClick: () => setModal(null) }}
      />
      <ServiceMessageModal
        open={modal === 'unknown'}
        title={SERVICE_AUTH_COPY.unknown.title}
        message={SERVICE_AUTH_COPY.unknown.message}
        onClose={() => setModal(null)}
        primaryAction={{ label: 'OK', onClick: () => setModal(null) }}
      />
      <ServiceMessageModal
        open={modal === 'invalid'}
        title={SERVICE_AUTH_COPY.invalidCode.title}
        message={SERVICE_AUTH_COPY.invalidCode.message}
        onClose={() => setModal(null)}
        primaryAction={{ label: 'OK', onClick: () => setModal(null) }}
      />
      <ServiceMessageModal
        open={modal === 'noEmail'}
        title={SERVICE_AUTH_COPY.noCodeEmail.title}
        message={SERVICE_AUTH_COPY.noCodeEmail.message}
        onClose={() => setModal(null)}
        primaryAction={{ label: 'OK', onClick: () => setModal(null) }}
      />
      <ServiceMessageModal
        open={modal === 'submissionFailed'}
        title={SERVICE_AUTH_COPY.submissionFailed.title}
        message={SERVICE_AUTH_COPY.submissionFailed.message}
        onClose={() => setModal(null)}
        primaryAction={{ label: 'Try Again', onClick: () => setModal(null) }}
        secondaryAction={{
          label: 'Exit',
          onClick: () => {
            setModal(null);
            navigate('/service');
          },
        }}
      />
    </div>
  );
}
