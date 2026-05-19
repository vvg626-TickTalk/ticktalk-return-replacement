import type { ReactNode } from 'react';
import type { Product } from '@/types/models';
import { cn } from '@/utils/cn';

export type ProductCardProps = {
  product: Product;
  meta?: string;
  right?: ReactNode;
  /** Strip outer chrome when nested inside another panel */
  flush?: boolean;
  className?: string;
};

export function ProductCard({ product, meta, right, flush, className }: ProductCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        !flush && 'rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm',
        flush && 'py-1',
        className,
      )}
    >
      <div
        className={cn(
          'h-14 w-14 shrink-0 rounded-2xl ring-1 ring-black/[0.06]',
          product.swatch ?? 'bg-slate-200',
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold leading-snug text-support-navy">{product.name}</p>
        <p className="truncate text-xs leading-snug text-slate-600">
          {meta ??
            [product.kind === 'watch' ? 'Watch' : 'Accessory', product.generation]
              .filter(Boolean)
              .join(' · ')}
        </p>
      </div>
      {right ? <div className="shrink-0 self-start text-right">{right}</div> : null}
    </div>
  );
}
