import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import {
  TRADE_IN_APP_ENTRY_DEVICE,
  TRADE_IN_CREDIT_CENTS,
  TRADE_IN_PROMO_VALID_UNTIL_ISO,
} from '@/features/tradeIn/tradeInConstants';
import { loadTradeInDemo, seedTradeInFromAppEntry } from '@/features/tradeIn/tradeInDemoStorage';
import { supportBody, supportModalTitle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

const PROMO_SESSION_KEY = 'tt_trade_in_promo_modal_shown';

export function TradeInAppEntryPage() {
  const navigate = useNavigate();
  const [promoOpen, setPromoOpen] = useState(false);
  const [, setHydrated] = useState(0);
  const demo = loadTradeInDemo();

  useEffect(() => {
    if (!loadTradeInDemo()) {
      seedTradeInFromAppEntry('app');
      setHydrated((n) => n + 1);
    }
    if (!sessionStorage.getItem(PROMO_SESSION_KEY)) {
      setPromoOpen(true);
    }
  }, []);

  const goPreview = (source: 'app' | 'promo') => {
    seedTradeInFromAppEntry(source);
    navigate('/trade-in/preview');
  };

  const d = TRADE_IN_APP_ENTRY_DEVICE;
  const validUntil = new Date(`${TRADE_IN_PROMO_VALID_UNTIL_ISO}T12:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500">TickTalk Care / App</p>
        <h1 className={cn(supportModalTitle, 'mt-1 text-[1.375rem] sm:text-[1.625rem]')}>Your device</h1>
        <p className={supportBody}>Out-of-warranty devices may be eligible for trade-in (demo).</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-support-tint ring-1 ring-support-navy/15" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{d.deviceName}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-600">IMEI {d.imei}</p>
            <p className="mt-2 text-xs font-semibold text-amber-900/90">Out of Warranty</p>
            <p className="text-xs text-slate-600">{demo?.careStatusLabel ?? 'TickTalk Care+ expired'}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
          <button type="button" className="flex-1 text-left text-sm font-semibold text-support-navy hover:underline" onClick={() => setPromoOpen(true)}>
            Trade In option — see offer
          </button>
          <Button type="button" className="w-full flex-1 sm:w-auto" onClick={() => goPreview('app')}>
            Trade In
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Web store:{' '}
        <Link to="/trade-in/product/prod-tt-watch-6" className="font-semibold text-support-navy underline">
          Product page demo
        </Link>
      </p>

      <Modal
        open={promoOpen}
        onClose={() => {
          setPromoOpen(false);
          sessionStorage.setItem(PROMO_SESSION_KEY, '1');
        }}
        title="Good News!"
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setPromoOpen(false);
            sessionStorage.setItem(PROMO_SESSION_KEY, '1');
          },
        }}
        primaryAction={{
          label: 'Trade In',
          onClick: () => {
            sessionStorage.setItem(PROMO_SESSION_KEY, '1');
            setPromoOpen(false);
            goPreview('promo');
          },
        }}
      >
        <p className={supportBody}>
          You can trade in the latest model of {d.deviceName} for {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(TRADE_IN_CREDIT_CENTS / 100)}, valid until {validUntil}.
        </p>
      </Modal>
    </div>
  );
}
