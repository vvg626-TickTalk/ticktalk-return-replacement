import type { Order } from '@/types/models';
import { cn } from '@/utils/cn';

const channelLabel: Record<Order['channel'], string> = {
  myticktalk: 'myticktalk.com',
  amazon: 'Amazon',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  other: 'Other',
};

export type OrderCardProps = {
  order: Order;
  subtitle?: string;
  className?: string;
};

export function OrderCard({ order, subtitle, className }: OrderCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-line bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {channelLabel[order.channel]}
          </p>
          <p className="text-sm font-semibold text-brand-ink">{order.externalOrderRef}</p>
          <p className="text-xs text-slate-600">
            {subtitle ?? `Postal/ZIP · ${order.shippingPostal}`}
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Placed {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
