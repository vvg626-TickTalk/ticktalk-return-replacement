import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ServiceMessageModal } from '@/components/ServiceMessageModal';
import { findRegisteredRma } from '@/features/serviceOrder/buildServiceOrderList';
import { domesticDigitsToDisplay } from '@/features/replacement/phoneFormat';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import { SERVICE_ACCOUNT_FOOTNOTE, SERVICE_AUTH_COPY } from '@/features/serviceOrder/serviceAuthCopy';
import { useServiceOrderAccount } from '@/features/serviceOrder/ServiceOrderAccountContext';
import type { RegisteredServiceRma } from '@/features/serviceOrder/types';
import {
  getCustomerById,
  getOrderById,
  getOrderLinesForOrder,
  getProductById,
  getReplacementRequestByRmaId,
  getReturnRequestByRmaId,
  getRmaById,
  listReplacementChainForLine,
} from '@/mock-data';
import type { Rma, RmaKind, RmaStatus } from '@/types/models';
import { supportModalTitle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

type DetailModel = {
  detailKey: string;
  code: string;
  kind: RmaKind;
  typeLabel: string;
  status: RmaStatus;
  statusLabel: string;
  needsCustomerNotice: boolean;
  createdAt: string;
  updatedAt: string;
  contactName: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  addressMultiline: string;
  productLines: string[];
  swatches: string[];
  issueDescription: string;
  returnReasonText: string | null;
  refundEstimateCents: number | null;
  returnShippingFeeCents: number | null;
  uploadedImageCount: number;
  isRegistered: boolean;
  orderId?: string;
};

const CUSTOMER_NOTICE =
  'The returned item does not match the return request. Please check your email for details.';

function kindLabel(kind: RmaKind): string {
  if (kind === 'replacement') return 'Replacement Request';
  if (kind === 'return') return 'Refund / Return Request';
  return 'Service Order';
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function formatPhoneForDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return domesticDigitsToDisplay(d);
  if (d.length === 11 && d.startsWith('1')) return domesticDigitsToDisplay(d.slice(1));
  return raw;
}

function canCancelReplacementRegistered(status: RmaStatus): boolean {
  return status !== 'cancelled' && status !== 'shipped' && status !== 'refunded';
}

function canCancelReturnRegistered(status: RmaStatus): boolean {
  return status !== 'cancelled' && status !== 'refunded';
}

function mockIssueDescription(rma: Rma): string {
  const ret = getReturnRequestByRmaId(rma.id);
  const rep = getReplacementRequestByRmaId(rma.id);
  if (rma.kind === 'return') {
    return ret ? 'Return request — estimated refund follows inspection (demo).' : 'Return request (demo).';
  }
  if (rma.kind === 'replacement') {
    return rep
      ? `Replacement request${rep.restockHold ? ' — includes a restock hold where applicable (demo).' : ' (demo).'}.`
      : 'Replacement request (demo).';
  }
  return 'Service request (demo).';
}

function buildMockDetail(rma: Rma): DetailModel {
  const order = getOrderById(rma.orderId);
  const customer = getCustomerById(rma.customerId);
  const lines = getOrderLinesForOrder(rma.orderId);
  const productLines: string[] = [];
  const swatches: string[] = [];
  for (const l of lines.slice(0, 4)) {
    const p = getProductById(l.productId);
    if (p) {
      productLines.push(`${p.name}${l.demoPurchasedColor ? ` · ${l.demoPurchasedColor}` : ''}`);
      swatches.push(p.swatch ?? 'bg-slate-200');
    }
  }
  const addressMultiline = order
    ? [`Shipping postal: ${order.shippingPostal}`, `Order: ${order.externalOrderRef}`].join('\n')
    : '—';

  const ret = getReturnRequestByRmaId(rma.id);

  return {
    detailKey: rma.id,
    code: rma.code,
    kind: rma.kind,
    typeLabel: kindLabel(rma.kind),
    status: rma.status,
    statusLabel: RMA_STATUS_CUSTOMER_LABEL[rma.status],
    needsCustomerNotice: rma.status === 'awaiting_your_reply',
    createdAt: rma.createdAt,
    updatedAt: rma.updatedAt,
    contactName: customer?.name ?? '—',
    email: customer?.email ?? '—',
    phone: customer?.phoneE164 ?? '—',
    phoneDisplay: customer?.phoneE164 ? formatPhoneForDisplay(customer.phoneE164) : '—',
    addressMultiline,
    productLines,
    swatches,
    issueDescription: rma.summary ?? mockIssueDescription(rma),
    returnReasonText: rma.kind === 'return' ? mockIssueDescription(rma) : null,
    refundEstimateCents: ret?.refundTotalCents ?? null,
    returnShippingFeeCents: null,
    uploadedImageCount: 3,
    isRegistered: false,
    orderId: rma.orderId,
  };
}

function buildRegisteredDetail(r: RegisteredServiceRma): DetailModel {
  const phoneDisp = formatPhoneForDisplay(r.phone);
  return {
    detailKey: r.localId,
    code: r.code,
    kind: r.kind,
    typeLabel: kindLabel(r.kind),
    status: r.status,
    statusLabel: r.customerStatusLabel,
    needsCustomerNotice: r.needsCustomerResponse || r.status === 'awaiting_your_reply',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    contactName: r.contactName,
    email: r.email,
    phone: r.phone,
    phoneDisplay: phoneDisp,
    addressMultiline: r.addressMultiline,
    productLines: r.productLines,
    swatches: r.productSwatches,
    issueDescription: r.issueDescription,
    returnReasonText: r.returnReasonSummary ?? (r.kind === 'return' ? r.issueDescription : null),
    refundEstimateCents: r.refundEstimateCents ?? null,
    returnShippingFeeCents: r.returnShippingFeeCents ?? null,
    uploadedImageCount: r.uploadedImageCount ?? 0,
    isRegistered: true,
    orderId: r.orderId,
  };
}

export function AccountRmaDetailPage() {
  const { rmaId = '' } = useParams();
  const navigate = useNavigate();
  const { registeredRmas, updateRegisteredRma, isAuthenticated } = useServiceOrderAccount();
  const [cancelOpen, setCancelOpen] = useState(false);

  const replacementTimeline = useMemo(() => {
    const mock = getRmaById(rmaId);
    if (!mock?.orderLineId || mock.kind !== 'replacement') return [];
    return listReplacementChainForLine(mock.orderLineId);
  }, [rmaId]);

  const detail = useMemo(() => {
    const reg = findRegisteredRma(rmaId, registeredRmas);
    if (reg) return buildRegisteredDetail(reg);
    const mock = getRmaById(rmaId);
    if (mock) return buildMockDetail(mock);
    return null;
  }, [rmaId, registeredRmas]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in required"
        description="Service Order requests are available after you sign in."
        action={{
          label: 'Sign in',
          to: `/service/login?return=${encodeURIComponent(`/account/rma/${rmaId}`)}`,
        }}
      />
    );
  }

  if (!detail) {
    return (
      <EmptyState
        title="Request not found"
        description="Check the reference number, or return to your order list."
        action={{ label: 'Your Orders', to: '/account/requests' }}
      />
    );
  }

  const showCancel =
    detail.isRegistered &&
    (detail.kind === 'return'
      ? canCancelReturnRegistered(detail.status)
      : detail.kind === 'replacement'
        ? canCancelReplacementRegistered(detail.status)
        : false);

  const cancelLabel = detail.kind === 'return' ? 'Cancel Return' : 'Cancel RMA';

  const onCancelYes = () => {
    if (!detail.isRegistered) return;
    updateRegisteredRma(detail.detailKey, {
      status: 'cancelled',
      customerStatusLabel: 'Cancelled',
      updatedAt: new Date().toISOString(),
      needsCustomerResponse: false,
    });
    setCancelOpen(false);
  };

  const contactQuery = new URLSearchParams({
    rma: detail.code,
    subject: `RMA ${detail.code}`,
  });
  const contactHref = `/service/contact?${contactQuery.toString()}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.07em] text-support-navy/80">Service Order</p>
          <h1 className={cn(supportModalTitle, 'mt-2')}>{detail.typeLabel}</h1>
          <p className="mt-1 font-mono text-lg font-semibold text-support-navy">{detail.code}</p>
          <p className="mt-2 text-xs text-slate-500">{SERVICE_ACCOUNT_FOOTNOTE}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/account/requests')}>
            Back
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={() => navigate(contactHref)}>
            Contact Us
          </Button>
        </div>
      </div>

      {detail.needsCustomerNotice ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-950">
          {CUSTOMER_NOTICE}
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">Status</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">{detail.statusLabel}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">Request date</dt>
            <dd className="mt-1 text-sm text-slate-800">
              {new Date(detail.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-sm font-semibold text-support-navy">Customer contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {detail.contactName}
              <br />
              {detail.email}
              <br />
              {detail.phoneDisplay}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-support-navy">Shipping address</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{detail.addressMultiline}</p>
          </section>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-support-navy">Products</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {detail.productLines.map((label, i) => (
              <div
                key={`${label}-${i}`}
                className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
              >
                <div className={cn('h-10 w-10 rounded-xl ring-1 ring-slate-200/80', detail.swatches[i] ?? 'bg-slate-200')} />
                <span className="text-sm text-slate-800">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {replacementTimeline.length > 1 && detail.kind === 'replacement' ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-support-navy">Replacement history (same line)</h2>
            <p className="mt-1 text-xs text-slate-600">
              Linked replacements under the same watch line — oldest to newest (demo).
            </p>
            <ol className="mt-3 space-y-2">
              {replacementTimeline.map((step) => {
                const isCurrent = step.id === rmaId;
                return (
                  <li
                    key={step.id}
                    className={cn(
                      'rounded-2xl border border-slate-200/90 px-3 py-2.5',
                      isCurrent && 'border-support-navy/25 bg-support-tint ring-1 ring-support-navy/12',
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link
                        to={`/account/rma/${step.id}`}
                        className="font-mono text-sm font-semibold text-support-navy hover:underline"
                      >
                        {step.code}
                        {isCurrent ? ' · this request' : ''}
                      </Link>
                      <span className="text-xs font-medium text-slate-800">{RMA_STATUS_CUSTOMER_LABEL[step.status]}</span>
                    </div>
                    {step.summary ? <p className="mt-1 text-xs leading-snug text-slate-600">{step.summary}</p> : null}
                    <p className="mt-1 text-[10px] text-slate-400">
                      Updated{' '}
                      {new Date(step.updatedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        {detail.kind === 'replacement' ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-support-navy">Issue description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{detail.issueDescription}</p>
          </section>
        ) : detail.kind === 'return' ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-support-navy">Return reason</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {detail.returnReasonText ?? detail.issueDescription}
            </p>
          </section>
        ) : (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-support-navy">Details</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{detail.issueDescription}</p>
          </section>
        )}

        {detail.kind === 'return' && detail.refundEstimateCents !== null ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-support-navy">Refund estimate (demo)</h2>
            <p className="mt-2 text-sm text-slate-700">
              Estimated refund after inspection:{' '}
              <span className="font-semibold text-slate-900">{formatUsd(detail.refundEstimateCents)}</span>
              {detail.returnShippingFeeCents != null && detail.returnShippingFeeCents > 0 ? (
                <>
                  {' '}
                  (return shipping fee of {formatUsd(detail.returnShippingFeeCents)} was deducted in the request preview).
                </>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-slate-600">Final amount is confirmed after we receive and inspect your package.</p>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-support-navy">Uploaded images</h2>
          {detail.uploadedImageCount > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: detail.uploadedImageCount }, (_, i) => (
                <div
                  key={i}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-[10px] font-medium text-slate-400"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No images were attached to this request.</p>
          )}
        </section>

        {showCancel ? (
          <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 sm:flex-row">
            <Button type="button" variant="danger" className="w-full sm:w-auto" onClick={() => setCancelOpen(true)}>
              {cancelLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <ServiceMessageModal
        open={cancelOpen}
        title={SERVICE_AUTH_COPY.cancelRmaReminder.title}
        message={SERVICE_AUTH_COPY.cancelRmaReminder.message}
        onClose={() => setCancelOpen(false)}
        secondaryAction={{ label: 'No', onClick: () => setCancelOpen(false) }}
        primaryAction={{ label: 'Yes', onClick: onCancelYes }}
      />
    </div>
  );
}
