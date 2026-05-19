import type { Rma } from '@/types/models';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/utils/cn';

const kindLabel: Record<Rma['kind'], string> = {
  return: 'Return',
  replacement: 'Replacement',
  trade_in: 'Trade-in',
};

export type RmaCardProps = {
  rma: Rma;
  onOpen?: () => void;
  className?: string;
};

export function RmaCard({ rma, onOpen, className }: RmaCardProps) {
  const content = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {kindLabel[rma.kind]}
          </p>
          <p className="text-sm font-semibold text-support-navy">RMA #{rma.code}</p>
          <p className="text-xs text-slate-600">
            Updated {new Date(rma.updatedAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={rma.status} />
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'w-full rounded-2xl border border-brand-line bg-white p-4 text-left shadow-sm transition hover:border-slate-300',
          'cursor-pointer active:translate-y-px',
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-brand-line bg-white p-4 text-left shadow-sm',
        className,
      )}
    >
      {content}
    </div>
  );
}
