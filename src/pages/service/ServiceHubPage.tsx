import { useNavigate } from 'react-router-dom';
import {
  supportBody,
  supportButtonPrimary,
  supportButtonSecondary,
  supportPageTitle,
  supportPanel,
} from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

export function ServiceHubPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg space-y-4 px-1 pb-10">
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">After-sales</p>
        <h1 className={cn(supportPageTitle, 'mt-1')}>Service</h1>
        <p className={cn(supportBody, 'mt-2')}>
          Returns, replacements, and quick order tools. Mobile-first steps—no dashboard clutter.
        </p>
      </div>

      <div className={supportPanel}>
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-support-navy">Return &amp; Replacement</p>
          <p className="mt-1 text-[13px] leading-snug text-slate-600">
            Agree to policy, then look up your order or sign in.
          </p>
        </div>
        <div className="flex flex-col gap-2 p-4 sm:flex-row">
          <button type="button" className={cn(supportButtonPrimary, 'w-full sm:flex-1')} onClick={() => navigate('/service/new')}>
            Start
          </button>
          <button
            type="button"
            className={cn(supportButtonSecondary, 'w-full sm:flex-1')}
            onClick={() => navigate('/service/order-lookup')}
          >
            Order lookup
          </button>
        </div>
      </div>

      <div className={supportPanel}>
        <div className="px-4 py-3">
          <p className="text-[13px] font-semibold text-support-navy">Account</p>
          <p className="mt-1 text-[13px] text-slate-600">Sign in to continue an existing request.</p>
          <button
            type="button"
            className={cn(supportButtonSecondary, 'mt-3 w-full')}
            onClick={() => navigate('/service/login')}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
