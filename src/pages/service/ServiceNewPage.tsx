import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  supportBody,
  supportButtonPrimary,
  supportButtonSecondary,
  supportPageTitle,
} from '@/ui/supportTheme';
import { supportPanel } from '@/ui/supportPortalLayout';
import { cn } from '@/utils/cn';

export function ServiceNewPage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [showPaths, setShowPaths] = useState(false);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-1 pb-8">
      <div>
        <h1 className={supportPageTitle}>Return &amp; Replacement</h1>
        <p className={cn(supportBody, 'mt-2')}>
          Start a return or replacement using your order details. Short window rules, Care+ where it applies, and gift
          items stay with the original purchase—see the summary below before you continue.
        </p>
      </div>

      <div className={supportPanel}>
        <div className="space-y-2 border-b border-slate-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-support-navy">Policy summary</p>
          <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-snug text-slate-600">
            <li>Returns follow our posted return window from delivery.</li>
            <li>Replacements follow warranty and Care+ coverage rules.</li>
            <li>Free gifts ship with qualifying purchases and must be sent back with that item.</li>
          </ul>
        </div>

        {!showPaths ? (
          <div className="space-y-4 px-4 py-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-support-navy focus:ring-support-navy/30"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="text-[14px] font-medium text-slate-900">I agree to the return and replacement terms.</span>
            </label>

            <button
              type="button"
              className={cn(supportButtonPrimary, 'w-full')}
              disabled={!accepted}
              onClick={() => setShowPaths(true)}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-stretch">
            <button type="button" className={cn(supportButtonPrimary, 'w-full sm:flex-1')} onClick={() => navigate('/service/order-lookup')}>
              New Here
            </button>
            <button
              type="button"
              className={cn(supportButtonSecondary, 'w-full sm:flex-1')}
              onClick={() => navigate('/service/login')}
            >
              Have an Account
            </button>
          </div>
        )}
      </div>

      {!showPaths ? (
        <p className="text-center text-[12px] text-slate-500">
          Already have an account? Use Continue, or go to{' '}
          <button type="button" className="font-semibold text-support-navy underline" onClick={() => navigate('/service/login')}>
            Sign in
          </button>
          .
        </p>
      ) : null}
    </div>
  );
}
