import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { ReplacementStockOption } from '@/features/replacement/replacementInventory';
import { cn } from '@/utils/cn';

export function ReplacementOosResolveModal({
  open,
  requestedLabel,
  options,
  selectedId,
  onSelect,
  onClose,
  onWaitForRestock,
  onReplace,
}: {
  open: boolean;
  requestedLabel: string;
  options: ReplacementStockOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onWaitForRestock: () => void;
  onReplace: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Out of Stock"
      description={undefined}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 w-full border-slate-200 text-sm font-medium shadow-none sm:w-auto"
            onClick={onWaitForRestock}
          >
            Wait for Restock
          </Button>
          <Button
            type="button"
            className="min-h-10 w-full text-sm font-medium shadow-none sm:w-auto"
            disabled={!selectedId}
            onClick={onReplace}
          >
            Replace
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2 text-sm leading-snug text-slate-700">
          <p>
            <span className="font-medium text-slate-900">{requestedLabel}</span> is currently unavailable for
            replacement.
          </p>
          <p className="text-slate-600">You may choose another available color or wait for restock.</p>
        </div>

        <div className="space-y-2" role="radiogroup" aria-label="Available replacement options">
          {options.map((opt) => {
            const checked = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onSelect(opt.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                  checked
                    ? 'border-support-navy/40 bg-support-tint ring-2 ring-support-navy/18'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <div
                  className={cn(
                    'h-11 w-11 shrink-0 rounded-lg ring-1 ring-slate-200/90',
                    opt.swatchClass ?? 'bg-slate-100',
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] font-semibold leading-tight text-slate-900">{opt.titleLine}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-slate-800">{opt.color}</p>
                  {opt.subtitle ? (
                    <p className="mt-1 text-[11px] leading-snug text-slate-500">{opt.subtitle}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export function ReplacementRmaQueuedModal({
  open,
  rmaCode,
  variant,
  onContinue,
  onDismiss,
}: {
  open: boolean;
  rmaCode: string;
  variant: 'wait_restock' | 'replace' | 'all_oos';
  onContinue: () => void;
  /** Backdrop / escape — defaults to mirroring continue when omitted */
  onDismiss?: () => void;
}) {
  const copy =
    variant === 'wait_restock'
      ? 'We received your request and will process it when the item is back in stock.'
      : variant === 'replace'
        ? 'Your replacement request has been received. We’ll process it as soon as possible.'
        : 'We received your request. We will contact you as soon as possible.';

  const handleDismiss = onDismiss ?? onContinue;

  return (
    <Modal
      open={open}
      onClose={handleDismiss}
      title={`RMA Number: ${rmaCode}`}
      description={undefined}
      primaryAction={{
        label: 'Continue',
        onClick: onContinue,
      }}
    >
      <p className="text-sm leading-snug text-slate-700">{copy}</p>
      {variant !== 'all_oos' ? (
        <p className="mt-3 text-[11px] leading-snug text-slate-500">
          Queue priority is reserved by request time ({new Date().toLocaleString()} demo timestamp).
        </p>
      ) : null}
    </Modal>
  );
}
