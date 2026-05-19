import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { consumePreferServiceOrdersTab } from '@/features/serviceOrder/accountRequestsTabPreference';
import { buildAccountRequestsList, isDemoAccountListSeedDisabled, type ServiceOrderListRow } from '@/features/serviceOrder/buildServiceOrderList';
import { useServiceOrderAccount } from '@/features/serviceOrder/ServiceOrderAccountContext';
import { SERVICE_ACCOUNT_FOOTNOTE } from '@/features/serviceOrder/serviceAuthCopy';
import { supportButtonSecondary, supportModalTitle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

function formatListDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ProductThumbRow({ row }: { row: ServiceOrderListRow }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {row.swatches.slice(0, 4).map((s, i) => (
        <div key={`${row.id}-sw-${i}`} className={cn('h-12 w-12 shrink-0 rounded-2xl ring-1 ring-slate-200/80', s)} />
      ))}
    </div>
  );
}

function ServiceAttachments({ row }: { row: ServiceOrderListRow }) {
  if (row.attachmentSlotCount <= 0) return null;
  return (
    <div>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">Uploaded images</p>
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
  );
}

export function AccountRequestsPage() {
  const navigate = useNavigate();
  const { profile, registeredRmas, isAuthenticated } = useServiceOrderAccount();
  const rows = useMemo(() => buildAccountRequestsList(profile, registeredRmas), [profile, registeredRmas]);
  const showDemoSampleBanner = isAuthenticated && !isDemoAccountListSeedDisabled();
  const [activeTab, setActiveTab] = useState<'purchase' | 'service'>(() =>
    consumePreferServiceOrdersTab() ? 'service' : 'purchase',
  );

  const purchaseRows = useMemo(() => rows.filter((r) => r.listType === 'purchase_order'), [rows]);
  const serviceRows = useMemo(() => rows.filter((r) => r.listType !== 'purchase_order'), [rows]);
  const bothEmpty = purchaseRows.length === 0 && serviceRows.length === 0;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-1">
        <h1 className={supportModalTitle}>Your Orders</h1>
        <p className="text-[15px] leading-6 text-slate-600">
          Sign in with your Service Order account email to see returns, replacements, and related requests.
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
          {showDemoSampleBanner ? (
            <p className="mt-1.5 text-[11px] leading-snug text-slate-400">Demo account loaded with sample orders.</p>
          ) : null}
        </div>
        <Link
          to="/service/order-lookup"
          className={cn(supportButtonSecondary, 'inline-flex w-full justify-center sm:w-auto')}
        >
          + Add New
        </Link>
      </div>

      {bothEmpty ? (
        <EmptyState
          title="No orders yet"
          description="You do not have any purchase or service orders yet. When you place an order or submit a return, replacement, or trade-in request, it will show up here."
          action={{ label: 'Start a request', to: '/service' }}
        />
      ) : (
        <>
          <div className="flex w-full justify-center px-0 sm:px-1">
            <div className="flex w-full max-w-2xl gap-2 rounded-2xl bg-slate-100/80 p-1 ring-1 ring-slate-200/90">
              <button
                type="button"
                className={cn(
                  'flex min-h-14 flex-1 items-center justify-center rounded-xl px-3 text-[15px] font-semibold leading-tight transition sm:text-base',
                  activeTab === 'purchase'
                    ? 'bg-support-navy text-white shadow-sm ring-1 ring-support-navy/20'
                    : 'text-support-navy hover:text-support-navy/90',
                )}
                onClick={() => setActiveTab('purchase')}
              >
                Purchase Orders
              </button>
              <button
                type="button"
                className={cn(
                  'flex min-h-14 flex-1 items-center justify-center rounded-xl px-3 text-[15px] font-semibold leading-tight transition sm:text-base',
                  activeTab === 'service'
                    ? 'bg-support-navy text-white shadow-sm ring-1 ring-support-navy/20'
                    : 'text-support-navy hover:text-support-navy/90',
                )}
                onClick={() => setActiveTab('service')}
              >
                Service Orders
              </button>
            </div>
          </div>

          {activeTab === 'purchase' ? (
            purchaseRows.length === 0 ? (
              <p className="text-center text-[15px] text-slate-600">No purchase orders yet.</p>
            ) : (
              <div className="space-y-3">
                {purchaseRows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-support-navy/80">Purchase Order</p>
                          <p className="mt-1 font-mono text-base font-semibold text-slate-900">{row.reference}</p>
                          {row.channelLabel ? (
                            <p className="mt-1 text-sm text-slate-700">
                              <span className="font-medium text-slate-500">Channel · </span>
                              {row.channelLabel}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-slate-500">
                            Order date{' '}
                            <span className="font-medium text-slate-700">{formatListDate(row.requestDate)}</span>
                          </p>
                          <p className="mt-1 text-sm font-medium text-support-navy">{row.statusLabel}</p>
                        </div>
                        <div>
                          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">Products</p>
                          <ProductThumbRow row={row} />
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0 lg:items-end">
                        <Button type="button" className="w-full min-w-[10rem] lg:w-auto" onClick={() => navigate(row.detailPath)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : serviceRows.length === 0 ? (
            <div className="space-y-2 text-center text-[15px] leading-7 text-slate-600">
              <p>No service orders yet.</p>
              <p className="text-sm text-slate-500">
                When you submit a return, replacement, or trade-in request, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-support-navy/80">{row.typeLabel}</p>
                        <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                          RMA / reference
                        </p>
                        <p className="mt-0.5 font-mono text-base font-semibold text-slate-900">{row.reference}</p>
                        <p className="mt-1 text-sm font-medium text-support-navy">{row.statusLabel}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted{' '}
                          <span className="font-medium text-slate-700">{formatListDate(row.requestDate)}</span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Purchase order{' '}
                          <span className="font-mono font-medium text-slate-700">
                            {row.linkedPurchaseOrderRef?.trim() ? row.linkedPurchaseOrderRef : '—'}
                          </span>
                        </p>
                      </div>

                      {row.issueDescription ? (
                        <div>
                          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                            Issue / reason
                          </p>
                          <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-slate-700">{row.issueDescription}</p>
                        </div>
                      ) : null}

                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">Products</p>
                        <ProductThumbRow row={row} />
                      </div>

                      <ServiceAttachments row={row} />
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0 lg:items-end">
                      <Button type="button" className="w-full min-w-[10rem] lg:w-auto" onClick={() => navigate(row.detailPath)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
