import { useNavigate } from 'react-router-dom';
import { getProductById } from '@/mock-data';
import { TRADE_IN_NEW_WATCH_PRODUCT_IDS } from '@/features/tradeIn/tradeInConstants';
import { patchTradeInDemo } from '@/features/tradeIn/tradeInDemoStorage';
import { Modal } from '@/components/Modal';
import { cn } from '@/utils/cn';

export function TradeInSelectWatchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  const pick = (productId: string) => {
    patchTradeInDemo({ newProductId: productId });
    onClose();
    navigate(`/trade-in/product/${productId}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select A New Watch"
      description={undefined}
      secondaryAction={{ label: 'Close', onClick: onClose }}
    >
      <ul className="mt-1 space-y-2">
        {TRADE_IN_NEW_WATCH_PRODUCT_IDS.map((id) => {
          const p = getProductById(id);
          if (!p) return null;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => pick(id)}
                className="flex w-full min-h-[4rem] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left ring-1 ring-slate-100 transition hover:border-support-navy/30"
              >
                <span className={cn('h-12 w-12 shrink-0 rounded-2xl ring-1 ring-slate-200/80', p.swatch)} aria-hidden />
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{p.name}</span>
                <span className="shrink-0 text-support-navy" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
