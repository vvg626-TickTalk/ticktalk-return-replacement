import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { buildServiceOrderList } from '@/features/serviceOrder/buildServiceOrderList';
import { useServiceOrderAccount } from '@/features/serviceOrder/ServiceOrderAccountContext';
import { SERVICE_ACCOUNT_FOOTNOTE } from '@/features/serviceOrder/serviceAuthCopy';
import { supportButtonSecondary, supportModalTitle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

export function AccountRequestsPage() {
  const navigate = useNavigate();
  const { profile, registeredRmas, isAuthenticated } = useServiceOrderAccount();
  const rows = useMemo(() => buildServiceOrderList(profile, registeredRmas), [profile, registeredRmas]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-1">
        <h1 className={supportModalTitle}>Your Orders</h1>
        <p className="text-[15px] leading-6 text-slate-600">
          Sign in with your Service Order account email or phone to see returns, replacements, and related requests.
        </p>
        <p className="text-xs text-slate-500">{SERVICE_ACCOUNT_FOOTNOTE}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="w-full sm:w-auto" onClick={() => navigate('/service/login?return=/account/requests')}>
            Sign in
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => navigate('/service/signup')}
          >
            Sign up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={supportModalTitle}>Your Orders</h1>
          <p className="mt-1 text-sm text-slate-600">{SERVICE_ACCOUNT_FOOTNOTE}</p>
        </div>
        <Link
          to="/service/order-lookup"
          className={cn(supportButtonSecondary, 'inline-flex w-full justify-center sm:w-auto')}
        >
          + Add New
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you submit a return, replacement, or trade-in, it will show up here after you register."
          action={{ label: 'Start a request', to: '/service' }}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-support-navy/80">
                    {row.typeLabel}
                  </p>
                    <p className="mt-1 font-mono text-base font-semibold text-slate-900">{row.reference}</p>
                    <p className="mt-1 text-sm font-medium text-support-navy">{row.statusLabel}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Submitted{' '}
                    {new Date(row.requestDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                  {row.issueDescription ? (
                    <div>
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        Issue
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-700">{row.issueDescription}</p>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">Products</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                    {row.swatches.slice(0, 4).map((s, i) => (
                      <div
                        key={`${row.id}-sw-${i}`}
                          className={cn('h-12 w-12 shrink-0 rounded-2xl ring-1 ring-slate-200/80', s)}
                      />
                    ))}
                    </div>
                  </div>

                  {row.attachmentSlotCount > 0 ? (
                    <div>
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        Uploaded images
                      </p>
                      <div className="mt-2 flex gap-2">
                        {Array.from({ length: row.attachmentSlotCount }, (_, i) => (
                          <div
                            key={`${row.id}-att-${i}`}
                            className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-400"
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0 lg:items-end">
                  <Button
                    type="button"
                    className="w-full min-w-[10rem] lg:w-auto"
                    onClick={() => navigate(row.detailPath)}
                  >
                    View Details
                  </Button>
                  <p className="text-center text-xs text-slate-500 lg:text-right">Status and next steps</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
