import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { TradeInProductModule } from '@/components/tradeIn/TradeInProductModule';
import { getProductById } from '@/mock-data';
import { loadTradeInDemo, patchTradeInDemo } from '@/features/tradeIn/tradeInDemoStorage';
import { supportBodySmall, supportButtonSecondary, supportModalTitle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

const DEMO_PRICE: Record<string, number> = {
  'prod-tt-watch-6': 229_99,
  'prod-tt-watch-5': 199_99,
};

export function TradeInProductPage() {
  const { productId = '' } = useParams();
  const product = getProductById(productId);
  const [qty, setQty] = useState(1);
  const [tradeInCapOpen, setTradeInCapOpen] = useState(false);
  const [pendingQty, setPendingQty] = useState(1);

  const applyQty = (next: number) => {
    const clamped = Math.max(1, Math.min(5, next));
    const demo = loadTradeInDemo();
    const slots = demo?.tradeInSlotCount ?? 0;
    if (demo?.appliedToCart && slots > clamped) {
      setPendingQty(clamped);
      setTradeInCapOpen(true);
      return;
    }
    setQty(clamped);
    patchTradeInDemo({ purchaseQty: clamped });
  };

  const priceCents = product ? (DEMO_PRICE[product.id] ?? 199_99) : 0;
  const priceLabel = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceCents / 100),
    [priceCents],
  );

  if (!product || product.kind !== 'watch') {
    return (
      <div className="mx-auto max-w-md space-y-4 px-1 py-8 text-center">
        <h1 className={supportModalTitle}>Product not found</h1>
        <Link to="/trade-in/preview" className="text-sm font-semibold text-support-navy underline">
          Back to trade-in preview
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 pb-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className={cn('aspect-square w-full', product.swatch ?? 'bg-slate-200')} aria-hidden />
        <div className="space-y-2 p-4">
          <h1 className={cn(supportModalTitle, 'text-xl')}>{product.name}</h1>
          <p className="text-lg font-semibold text-support-navy">{priceLabel}</p>
          <p className={supportBodySmall}>Demo product page — cart is local only.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="ti-qty" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quantity
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="ti-qty"
            type="number"
            min={1}
            max={5}
            value={qty}
            onChange={(e) => applyQty(Number(e.target.value) || 1)}
            className="h-12 w-20 rounded-xl border border-slate-200 px-3 text-center text-sm font-semibold"
          />
          <Button
            type="button"
            className="min-h-12 flex-1"
            onClick={() => {
              patchTradeInDemo({ newProductId: product.id, purchaseQty: qty });
            }}
          >
            Add to cart (demo)
          </Button>
        </div>
      </div>

      <TradeInProductModule productId={product.id} purchaseQty={qty} />

      <Modal
        open={tradeInCapOpen}
        onClose={() => setTradeInCapOpen(false)}
        title="Trade-in quantity"
        description="Purchase quantity is below the number of trade-in devices you added."
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={supportButtonSecondary} onClick={() => setTradeInCapOpen(false)}>
              Keep current quantity
            </button>
            <Button
              type="button"
              onClick={() => {
                patchTradeInDemo({
                  appliedToCart: false,
                  tradeInSlotCount: 0,
                  newProductId: product.id,
                });
                setQty(pendingQty);
                patchTradeInDemo({ purchaseQty: pendingQty });
                setTradeInCapOpen(false);
              }}
            >
              Remove trade-in(s)
            </Button>
          </div>
        }
      >
        <p className={supportBodySmall}>
          Choose which trade-in devices to remove, or keep your original purchase quantity (demo).
        </p>
      </Modal>

      <p className="text-center text-xs text-slate-500">
        <Link to="/trade-in/preview" className="font-medium text-support-navy underline">
          Trade-in details
        </Link>
      </p>
    </div>
  );
}
