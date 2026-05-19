import type { ReactNode } from 'react';
import { Modal } from '@/components/Modal';

export function ServiceMessageModal({
  open,
  title,
  message,
  onClose,
  primaryAction,
  secondaryAction,
}: {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}) {
  const footer: ReactNode =
    primaryAction || secondaryAction ? (
      <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-support-navy bg-white px-6 text-sm font-semibold text-support-navy hover:bg-support-tint"
          >
            {secondaryAction.label}
          </button>
        ) : null}
        {primaryAction ? (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-support-navy px-6 text-sm font-semibold text-white hover:bg-support-navy-hover"
          >
            {primaryAction.label}
          </button>
        ) : null}
      </div>
    ) : null;

  return (
    <Modal open={open} onClose={onClose} title={title ?? ''} description={undefined} footer={footer}>
      <p className="text-[15px] leading-6 text-slate-600">{message}</p>
    </Modal>
  );
}
