import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceMessageModal } from '@/components/ServiceMessageModal';
import { WatchImeiModal } from '@/components/WatchImeiModal';
import { lineRequiresImei } from '@/features/replacement/eligibility';
import { groupOrderLinesForDisplay } from '@/features/serviceOrder/orderLineGroups';
import type { ServiceFlowLocationState } from '@/features/serviceOrder/serviceFlowLocation';
import {
  getLineReplaceAction,
  getLineReturnAction,
  getLineTradeInAction,
  imeiDisplayForLine,
  orderIsFullyUnshipped,
} from '@/features/serviceOrder/serviceLineActions';
import { seedTradeInFromOrderLine } from '@/features/tradeIn/tradeInDemoStorage';
import { tradeInCareStatusLine } from '@/features/tradeIn/tradeInCarePlus';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import {
  OPEN_RMA_STATUSES,
  getCustomerById,
  getOrderById,
  getOrderLinesForOrder,
  getProductById,
  listRmasForCustomer,
} from '@/mock-data';
import type { Order, OrderLine, RmaKind } from '@/types/models';
import {
  supportPanel,
  supportSectionHead,
  supportButtonPrimary,
  supportButtonSecondary,
} from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

const channelLabel: Record<Order['channel'], string> = {
  myticktalk: 'myticktalk.com',
  amazon: 'Amazon',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  tiktok: 'TikTok Shop',
  other: 'Other',
};

function channelFootnote(channel: Order['channel']): string | null {
  if (channel === 'tiktok') {
    return 'TikTok Shop: use the 12-digit order ID from your in-app receipt. Some promo bundles ship separately.';
  }
  if (channel === 'amazon') {
    return 'Amazon: if your unit is seller-fulfilled, Amazon may handle the first return window.';
  }
  if (channel === 'walmart') {
    return 'Walmart: keep your store receipt PDF handy — serial checks may be required on high-value orders.';
  }
  return null;
}

function rmaKindShortLabel(kind: RmaKind): string {
  if (kind === 'return') return 'Return';
  if (kind === 'replacement') return 'Replacement';
  if (kind === 'trade_in') return 'Trade-in';
  return 'Service';
}

function LineServiceButtons({
  line,
  product,
  order,
  orderUnshipped,
  onOpenImei,
  onBlocked,
  onTradeIn,
}: {
  line: OrderLine;
  product: ReturnType<typeof getProductById>;
  order: Order;
  orderUnshipped: boolean;
  onOpenImei: (flow: 'return' | 'replace') => void;
  onBlocked: (title: string, body: string) => void;
  onTradeIn: (line: OrderLine, product: NonNullable<ReturnType<typeof getProductById>>) => void;
}) {
  const navigate = useNavigate();
  const ret = getLineReturnAction(line, product, order, orderUnshipped);
  const rep = getLineReplaceAction(line, product, order, orderUnshipped);
  const tri = getLineTradeInAction(line, product, order, orderUnshipped);

  const goReturn = () => {
    if (!ret.enabled) {
      onBlocked(ret.modal.title, ret.modal.body);
      return;
    }
    if (lineRequiresImei(product)) {
      onOpenImei('return');
      return;
    }
    navigate(`/service/return/${order.id}`, {
      state: { prefillReturn: { lineId: line.id, imei: '' } } satisfies ServiceFlowLocationState,
    });
  };

  const goReplace = () => {
    if (!rep.enabled) {
      onBlocked(rep.modal.title, rep.modal.body);
      return;
    }
    if (lineRequiresImei(product)) {
      onOpenImei('replace');
      return;
    }
    navigate(`/service/replace/${order.id}`, {
      state: { prefillReplace: { lineId: line.id, imei: '' } } satisfies ServiceFlowLocationState,
    });
  };

  const goTradeIn = () => {
    if (!tri.enabled) {
      onBlocked(tri.modal.title, tri.modal.body);
      return;
    }
    if (!product) return;
    onTradeIn(line, product);
  };

  if (line.demoReturned) {
    return <p className="text-[11px] font-medium text-slate-600">Returned</p>;
  }

  if (orderUnshipped) return null;

  const rowBtn = (enabled: boolean, enabledTokens: string) =>
    cn(
      enabledTokens,
      'min-h-11 flex-1 rounded-full px-3 text-[12px] font-semibold sm:min-w-[4.5rem] sm:flex-none',
      !enabled && 'opacity-50 grayscale-[0.35]',
    );

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        className={rowBtn(ret.enabled, supportButtonSecondary)}
        onClick={goReturn}
      >
        Return
      </button>
      <button
        type="button"
        className={rowBtn(rep.enabled, supportButtonSecondary)}
        onClick={goReplace}
      >
        Replace
      </button>
      <button
        type="button"
        className={rowBtn(tri.enabled, supportButtonPrimary)}
        onClick={goTradeIn}
      >
        Trade-in
      </button>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();

  const [msg, setMsg] = useState<{ title: string; body: string } | null>(null);
  const [imeiFlow, setImeiFlow] = useState<null | { flow: 'return' | 'replace'; lineId: string }>(null);

  const order = getOrderById(orderId);
  if (!order) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-2 py-8 text-center">
        <h1 className="text-base font-semibold text-support-navy">Order not found</h1>
        <p className="text-sm text-slate-600">This demo only includes mock IDs from the home page.</p>
        <button type="button" className={supportButtonPrimary} onClick={() => navigate('/service/order-lookup')}>
          Order lookup
        </button>
      </div>
    );
  }

  const lines = getOrderLinesForOrder(order.id);
  const customer = order.customerId ? getCustomerById(order.customerId) : undefined;
  const orderRmas = useMemo(() => {
    if (!customer) return [];
    return listRmasForCustomer(customer.id).filter((r) => r.orderId === order.id);
  }, [customer, order.id]);
  const openOrderRmas = useMemo(
    () => orderRmas.filter((r) => OPEN_RMA_STATUSES.includes(r.status)),
    [orderRmas],
  );
  const closedOrderRmas = useMemo(
    () =>
      orderRmas
        .filter((r) => !OPEN_RMA_STATUSES.includes(r.status))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8),
    [orderRmas],
  );
  const groups = useMemo(() => groupOrderLinesForDisplay(lines), [lines]);
  const orderUnshipped = orderIsFullyUnshipped(lines);
  const channelNote = channelFootnote(order.channel);

  const placed = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lineRow = (line: OrderLine) => {
    const product = getProductById(line.productId);
    if (!product) return null;
    const statusLabel = line.demoReturned
      ? 'Returned'
      : line.status === 'shipped'
        ? line.customerReceived === false
          ? 'Shipped'
          : 'Delivered'
        : line.status === 'unshipped'
          ? 'Unshipped'
          : line.status;
    return (
      <div key={line.id} className="flex gap-2 border-b border-slate-100 py-2 last:border-b-0 sm:gap-3">
        <div
          className={cn('h-10 w-10 shrink-0 rounded-md ring-1 ring-slate-200/80', product.swatch ?? 'bg-slate-200')}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-900">{product.name}</p>
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
          {!orderUnshipped ? (
            <LineServiceButtons
              line={line}
              product={product}
              order={order}
              orderUnshipped={orderUnshipped}
              onOpenImei={(flow) => setImeiFlow({ flow, lineId: line.id })}
              onBlocked={(title, body) => setMsg({ title, body })}
              onTradeIn={(line, product) => {
                seedTradeInFromOrderLine({
                  productName: product.name,
                  colorLabel: line.demoPurchasedColor,
                  imei: line.imei ?? '—',
                  careStatusLabel: tradeInCareStatusLine(order.customerId),
                  orderId: order.id,
                });
                navigate('/trade-in/preview');
              }}
            />
          ) : null}
        </div>
        {!orderUnshipped ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">IMEI</p>
            <p className="max-w-[7rem] font-mono text-[11px] text-slate-800">{imeiDisplayForLine(line, product)}</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-lg space-y-3 text-[13px] leading-snug text-slate-800">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Order detail</p>
          <h1 className="mt-0.5 truncate text-lg font-semibold text-support-navy">{order.externalOrderRef}</h1>
        </div>
        <button
          type="button"
          className={cn(supportButtonSecondary, 'shrink-0 px-4 text-xs')}
          onClick={() => navigate('/service/order-lookup')}
        >
            Back
        </button>
      </div>

      <div className={cn(supportPanel, 'px-3 py-2')}>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-medium text-slate-500">Channel</dt>
            <dd className="text-xs font-medium text-slate-900">{channelLabel[order.channel]}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium text-slate-500">Ship ZIP</dt>
            <dd className="text-xs font-medium text-slate-900">{order.shippingPostal}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-[10px] font-medium text-slate-500">Placed</dt>
            <dd className="text-xs font-medium text-slate-900">{placed}</dd>
          </div>
        </dl>
        {channelNote ? <p className="mt-2 text-[10px] leading-snug text-slate-500">{channelNote}</p> : null}
      </div>

      {customer ? (
        <div className={cn(supportPanel, 'px-3 py-2')}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Customer</p>
          <p className="mt-0.5 text-xs font-medium text-slate-900">{customer.name}</p>
          <p className="text-xs text-slate-600">{customer.email ?? customer.phoneE164}</p>
        </div>
      ) : null}

      {orderUnshipped ? (
        <p className="rounded-2xl bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
          Order not shipped yet
        </p>
      ) : null}

      <div className={supportPanel}>
        <div className={supportSectionHead}>Items on this order</div>
        <div className="divide-y divide-slate-100 px-2">
          {groups.map(({ primary, gifts }) => {
            const p = getProductById(primary.productId);
            if (!p) return null;
            return (
              <div key={primary.id} className="py-2">
                {lineRow(primary)}
                {gifts.length ? (
                  <div className="mt-2 ml-2 border-l-2 border-support-navy/20 pl-3">
                    <p className="mb-1 text-[10px] font-medium text-slate-500">Includes free gift</p>
                    <p className="text-[10px] leading-snug text-slate-600">Free gifts must be returned with the main product.</p>
                    {gifts.map((g) => (
                      <div key={g.id} className="mt-2">
                        {lineRow(g)}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {orderRmas.length ? (
        <div className={supportPanel}>
          <div className={supportSectionHead}>Service on this order</div>
          {openOrderRmas.length ? (
            <>
              <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Active ({openOrderRmas.length})
              </p>
              <ul className="divide-y divide-slate-100 px-2">
                {openOrderRmas.map((rma) => (
                  <li key={rma.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/account/rma/${rma.id}`}
                          className="text-xs font-semibold text-support-navy hover:underline"
                        >
                          {rmaKindShortLabel(rma.kind)} · {rma.code}
                        </Link>
                        {rma.summary ? (
                          <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{rma.summary}</p>
                        ) : null}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Updated{' '}
                          {new Date(rma.updatedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-950 ring-1 ring-amber-200/80">
                        {RMA_STATUS_CUSTOMER_LABEL[rma.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {closedOrderRmas.length ? (
            <>
              <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Completed · closed
              </p>
              <ul className="divide-y divide-slate-100 px-2">
                {closedOrderRmas.map((rma) => (
                  <li key={rma.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/account/rma/${rma.id}`}
                          className="text-xs font-semibold text-slate-800 hover:underline"
                        >
                          {rmaKindShortLabel(rma.kind)} · {rma.code}
                        </Link>
                        {rma.summary ? (
                          <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{rma.summary}</p>
                        ) : null}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Closed{' '}
                          {new Date(rma.updatedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {RMA_STATUS_CUSTOMER_LABEL[rma.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      <ServiceMessageModal
        open={Boolean(msg)}
        title={msg?.title}
        message={msg?.body ?? ''}
        onClose={() => setMsg(null)}
        primaryAction={{ label: 'OK', onClick: () => setMsg(null) }}
      />

      <WatchImeiModal
        open={Boolean(imeiFlow)}
        onClose={() => setImeiFlow(null)}
        validation={imeiFlow ? { orderId: order.id, lineId: imeiFlow.lineId } : undefined}
        onConfirm={(imei) => {
          if (!imeiFlow) return;
          const path =
            imeiFlow.flow === 'return' ? `/service/return/${order.id}` : `/service/replace/${order.id}`;
          const state: ServiceFlowLocationState =
            imeiFlow.flow === 'return'
              ? { prefillReturn: { lineId: imeiFlow.lineId, imei } }
              : { prefillReplace: { lineId: imeiFlow.lineId, imei } };
          navigate(path, { state });
        }}
      />
    </div>
  );
}
