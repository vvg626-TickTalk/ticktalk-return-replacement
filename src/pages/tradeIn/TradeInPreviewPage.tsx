import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TradeInSelectWatchModal } from '@/components/tradeIn/TradeInSelectWatchModal';
import { buildTradeInPendingRma } from '@/features/serviceOrder/buildTradeInPendingRma';
import { savePendingServiceOrder } from '@/features/serviceOrder/pendingServiceOrderStorage';
import { TRADE_IN_NEW_WATCH_PRODUCT_IDS } from '@/features/tradeIn/tradeInConstants';
import { loadTradeInDemo, patchTradeInDemo, seedTradeInFromAppEntry } from '@/features/tradeIn/tradeInDemoStorage';
import {
  supportBodySmall,
  supportButtonPrimary,
  supportButtonSecondary,
  supportLinkSubtle,
  supportModalTitle,
  supportSuccessCallout,
} from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

const STEPS = [
  'Choose your new watch and select Join Now for Trade-in.',
  'Select the device you want to trade in and receive an estimated credit value.',
  'After completing your purchase, we will email you a free return shipping label within 7 days.',
  'Ship your old watch to us within 21 days after receiving the shipping label.',
  'Once we receive your device, the trade-in credit will be refunded to your original payment method within 7 days.',
] as const;

export function TradeInPreviewPage() {
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  let demo = loadTradeInDemo();
  if (!demo) {
    seedTradeInFromAppEntry('app');
    demo = loadTradeInDemo()!;
  }

  const credit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(demo.creditCents / 100);

  const onShopNow = () => {
    const ids = [...TRADE_IN_NEW_WATCH_PRODUCT_IDS];
    if (ids.length <= 1) {
      const id = ids[0]!;
      patchTradeInDemo({ newProductId: id });
      navigate(`/trade-in/product/${id}`);
      return;
    }
    setPickerOpen(true);
  };

  const onQueueForSignup = () => {
    if (!demo) return;
    const pendingRma = buildTradeInPendingRma(demo);
    savePendingServiceOrder({
      name: '',
      email: '',
      phoneDisplay: '',
      orderId: pendingRma.orderId,
      rmaCode: pendingRma.code,
      customerId: undefined,
      pendingRma,
    });
    navigate('/service/signup');
  };

  return (
    <div className="mx-auto max-w-md space-y-5 pb-10">
      <div className={cn(supportSuccessCallout, 'text-center')}>
        <p className="text-xs font-semibold uppercase tracking-wide text-support-navy/85">Trade-in approved!</p>
        <p className={cn(supportModalTitle, 'mt-2 text-lg')}>Trade-in Credit {credit}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your device</p>
        <p className="mt-2 text-base font-semibold text-slate-900">
          {demo.oldDeviceName}
          {demo.oldDeviceSubtitle ? ` / ${demo.oldDeviceSubtitle}` : ''}
        </p>
        <p className="mt-1 font-mono text-xs text-slate-600">IMEI {demo.imei}</p>
      </div>

      <section id="how" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-support-navy">How to trade-in?</h2>
        <p className={cn(supportBodySmall, 'mt-2 font-semibold text-slate-800')}>5 Simple Steps:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-snug text-slate-700">
          {STEPS.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section id="terms" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-support-navy">Terms and Policies</h2>
        <ul className="mt-2 space-y-1.5 text-xs leading-snug text-slate-600">
          <li>Credit is estimated until we inspect your device.</li>
          <li>Device must match the IMEI you submitted; erase data before shipping.</li>
          <li>Late or missing shipments may cancel the promotional credit (demo).</li>
          <li>Refund returns to the original payment method after approval.</li>
        </ul>
      </section>

      <div className="flex flex-col gap-2">
        <button type="button" className={supportButtonPrimary} onClick={onShopNow}>
          Shop Now
        </button>
        <button type="button" className={supportButtonSecondary} onClick={onQueueForSignup}>
          Save trade-in and sign up later (demo)
        </button>
        <Link to="/trade-in/app-entry" className={cn(supportLinkSubtle, 'text-center')}>
          Back to app entry
        </Link>
      </div>

      <TradeInSelectWatchModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
