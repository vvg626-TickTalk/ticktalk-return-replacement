import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { getOrderReplaceSummary } from '@/features/replacement/eligibility';
import { getOrderReturnSummary } from '@/features/return/returnEligibility';
import {
  getOrderById,
  getOrderLinesForOrder,
  getProductById,
  listRmasForCustomer,
  getCustomerById,
} from '@/mock-data';
import type { Order } from '@/types/models';
import { cn } from '@/utils/cn';

const channelLabel: Record<Order['channel'], string> = {
  myticktalk: 'myticktalk.com',
  amazon: 'Amazon',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  other: 'Other',
};

/** Order detail only: dense, flat, utility styling aligned to support-portal / deck density. */
const panel = 'rounded-sm border border-slate-300 bg-white';
const sectionHead =
  'border-b border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700';

const actionBtnBase =
  '!m-0 h-9 min-h-9 w-full !rounded-sm border px-3 text-xs font-medium !shadow-none ring-0 transition-colors active:!scale-100 sm:w-auto sm:min-w-[5.5rem]';

const actionBtnEnabled =
  '!border-slate-400 bg-white text-slate-900 hover:border-slate-500 hover:bg-slate-50';

const actionBtnDisabled =
  'cursor-not-allowed !border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100 disabled:!opacity-100';

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();

  const order = getOrderById(orderId);
  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="This demo only includes mock IDs from the home page."
        action={{ label: 'Order lookup', to: '/service/order-lookup' }}
      />
    );
  }

  const lines = getOrderLinesForOrder(order.id);
  const customer = order.customerId ? getCustomerById(order.customerId) : undefined;
  const rmas = customer ? listRmasForCustomer(customer.id) : [];

  const replaceAction = useMemo(() => getOrderReplaceSummary(lines), [lines]);
  const returnAction = useMemo(() => getOrderReturnSummary(lines, order), [lines, order]);

  const placed = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl space-y-2 text-[13px] leading-snug text-slate-800">
      {/* Top: transactional header — tight, utility */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-300 pb-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Order detail</p>
          <h1 className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-900">
            {order.externalOrderRef}
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="!h-8 !min-h-8 shrink-0 !rounded-sm !border-slate-400 px-3 text-xs font-medium !shadow-none active:!scale-100"
          onClick={() => navigate('/service/order-lookup')}
        >
            Back
          </Button>
      </div>

      {/* Order meta: single flat strip — channel, ship postal, date */}
      <div className={cn(panel, 'px-2 py-1.5')}>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium text-slate-500">Channel</dt>
            <dd className="text-xs font-medium text-slate-900">{channelLabel[order.channel]}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-slate-500">Ship ZIP</dt>
            <dd className="text-xs font-medium text-slate-900">{order.shippingPostal}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-[11px] font-medium text-slate-500">Placed</dt>
            <dd className="text-xs font-medium text-slate-900">{placed}</dd>
          </div>
        </dl>
      </div>

      {customer ? (
        <div className={cn(panel, 'px-2 py-1.5')}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Customer</p>
          <p className="mt-0.5 text-xs font-medium text-slate-900">{customer.name}</p>
          <p className="text-xs text-slate-600">{customer.email ?? customer.phoneE164}</p>
        </div>
      ) : null}

      {/* Line items: dense rows, product + status + IMEI; no decorative cards */}
      <div className={panel}>
        <div className={sectionHead}>Items on this order</div>
        <ul className="divide-y divide-slate-200">
          {lines.map((line) => {
            const product = getProductById(line.productId);
            if (!product) return null;
            const statusLabel = line.status === 'shipped' ? 'Shipped' : line.status === 'unshipped' ? 'Unshipped' : line.status;
            return (
              <li key={line.id} className="flex gap-2 px-2 py-1.5 sm:gap-3 sm:py-2">
                <div
                  className={cn(
                    'h-10 w-10 shrink-0 rounded-sm ring-1 ring-slate-300/80',
                    product.swatch ?? 'bg-slate-200',
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900">{product.name}</p>
                  <p className="text-[11px] text-slate-600">
                    Qty {line.quantity}
                    <span className="text-slate-400"> · </span>
                    {statusLabel}
                    {line.isGift ? (
                      <>
                        <span className="text-slate-400"> · </span>Gift
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-medium text-slate-500">IMEI</p>
                  <p className="max-w-[7.5rem] truncate font-mono text-[11px] text-slate-800">{line.imei ?? '—'}</p>
                </div>
              </li>
            );
          })}
        </ul>
        </div>

      {/* Service actions: grouped toolbar — PPT-style direct actions next to fulfillment context */}
      <div className={panel}>
        <div className={sectionHead}>Service</div>
        <div className="px-2 py-2">
          <p className="mb-2 text-[11px] text-slate-600">
            Start a return, replacement, or trade-in. Unavailable actions are greyed out with a short reason.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
            <Button
                type="button"
              variant="secondary"
              disabled={!returnAction.enabled}
                className={cn(actionBtnBase, returnAction.enabled ? actionBtnEnabled : actionBtnDisabled)}
                onClick={() => returnAction.enabled && navigate(`/service/return/${order.id}`)}
            >
              Return
            </Button>
              {!returnAction.enabled ? (
                <p className="text-[11px] leading-tight text-slate-500">{returnAction.reason}</p>
              ) : null}
          </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
            <Button
                type="button"
              variant="secondary"
              disabled={!replaceAction.enabled}
                className={cn(actionBtnBase, replaceAction.enabled ? actionBtnEnabled : actionBtnDisabled)}
                onClick={() => replaceAction.enabled && navigate(`/service/replace/${order.id}`)}
            >
              Replace
            </Button>
            {!replaceAction.enabled ? (
                <p className="text-[11px] leading-tight text-slate-500">{replaceAction.reason}</p>
            ) : null}
          </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
              <Button
                type="button"
                variant="secondary"
                className={cn(actionBtnBase, actionBtnEnabled)}
                onClick={() => navigate('/service/trade-in')}
              >
              Trade-in
            </Button>
              <p className="text-[11px] leading-tight text-slate-500">Preview only</p>
            </div>
          </div>
        </div>
      </div>

      {rmas.length ? (
        <div className={panel}>
          <div className={sectionHead}>Open requests</div>
          <ul className="divide-y divide-slate-200">
            {rmas.map((rma) => (
              <li key={rma.id} className="flex items-center justify-between gap-2 px-2 py-1.5 sm:py-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">RMA {rma.code}</p>
                  <p className="text-[11px] text-slate-500">Linked to this order</p>
                </div>
                <StatusBadge status={rma.status} className="shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-medium" />
              </li>
            ))}
          </ul>
          </div>
      ) : null}
    </div>
  );
}
