import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { TradeInProductModule } from '@/components/tradeIn/TradeInProductModule';
import { getProductById } from '@/mock-data';
import { patchTradeInDemo } from '@/features/tradeIn/tradeInDemoStorage';
import { supportBodySmall, supportModalTitle } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

const DEMO_PRICE: Record<string, number> = {
  'prod-tt-watch-6': 229_99,
  'prod-tt-watch-5': 199_99,
};

export function TradeInProductPage() {
  const { productId = '' } = useParams();
  const product = getProductById(productId);
  const [qty, setQty] = useState(1);

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
            onChange={(e) => setQty(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
            className="h-12 w-20 rounded-xl border border-slate-200 px-3 text-center text-sm font-semibold"
          />
          <Button
            type="button"
            className="min-h-12 flex-1"
            onClick={() => {
              patchTradeInDemo({ newProductId: product.id });
            }}
          >
            Add to cart (demo)
          </Button>
        </div>
      </div>

      <TradeInProductModule productId={product.id} />

      <p className="text-center text-xs text-slate-500">
        <Link to="/trade-in/preview" className="font-medium text-support-navy underline">
          Trade-in details
        </Link>
      </p>
    </div>
  );
}
