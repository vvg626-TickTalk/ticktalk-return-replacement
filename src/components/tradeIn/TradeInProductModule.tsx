import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/Modal';
import { loadTradeInDemo, patchTradeInDemo } from '@/features/tradeIn/tradeInDemoStorage';
import { supportBodySmall, supportButtonPrimary, supportButtonSecondary, supportLinkSubtle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

function formatCredit(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function TradeInProductModule({ productId }: { productId: string }) {
  const [, setRefresh] = useState(0);
  const demo = loadTradeInDemo();
  const applied = Boolean(demo?.appliedToCart && demo.newProductId === productId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showDeclined, setShowDeclined] = useState(false);

  const refresh = () => setRefresh((n) => n + 1);

  const onJoin = () => {
    patchTradeInDemo({ appliedToCart: true, newProductId: productId });
    setShowDeclined(false);
    refresh();
  };

  const onNoThanks = () => {
    patchTradeInDemo({ appliedToCart: false, newProductId: productId });
    setShowDeclined(true);
    refresh();
  };

  const onRemove = () => {
    patchTradeInDemo({ appliedToCart: false });
    setConfirmOpen(false);
    setShowDeclined(false);
    refresh();
  };

  if (!demo) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Start a trade-in from the{' '}
        <Link to="/trade-in/app-entry" className={supportLinkSubtle}>
          app
        </Link>{' '}
        or an eligible order to use this module.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-support-navy/85">Trade-in</p>
      <p className={cn(supportBodySmall, 'mt-2')}>
        Trade in an eligible out-of-warranty watch for credit toward this purchase (demo).
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <Link to="/trade-in/preview#how" className={supportLinkSubtle}>
          How to trade-in?
        </Link>
        <Link to="/trade-in/preview#terms" className={supportLinkSubtle}>
          Terms
        </Link>
      </div>

      {applied ? (
        <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-900/85">Trade-in included</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{demo.oldDeviceName}</p>
              <p className="text-sm font-semibold text-support-navy">Trade-in credit {formatCredit(demo.creditCents)}</p>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              aria-label="Remove trade-in"
              onClick={() => setConfirmOpen(true)}
            >
              <span className="sr-only">Delete trade-in</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" className={supportButtonSecondary} onClick={onNoThanks}>
            No, thanks
          </button>
          <button type="button" className={supportButtonPrimary} onClick={onJoin}>
            Join Now
          </button>
        </div>
      )}

      {showDeclined && !applied ? <p className="mt-3 text-xs text-slate-500">Trade-in not added (demo).</p> : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove trade-in?"
        secondaryAction={{ label: 'Cancel', onClick: () => setConfirmOpen(false) }}
        primaryAction={{ label: 'Remove', onClick: onRemove }}
      >
        <p className={supportBodySmall}>You can add trade-in again before checkout.</p>
      </Modal>
    </div>
  );
}
