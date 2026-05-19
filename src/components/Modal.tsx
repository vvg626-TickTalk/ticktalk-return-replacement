import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/Button';

export type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  /** Primary action in the footer (optional shortcut) */
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  primaryAction,
  secondaryAction,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const showFooter = Boolean(footer || primaryAction || secondaryAction);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.25rem] border border-slate-200/90 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.12)] sm:rounded-2xl',
        )}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1 space-y-1">
            <h2 id="modal-title" className="text-lg font-semibold leading-tight tracking-tight text-brand-ink">
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-snug text-slate-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg leading-none text-slate-500 hover:bg-slate-100 active:bg-slate-200/80"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {children}
          </div>
        ) : null}

        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>
          </div>
        ) : showFooter && (primaryAction || secondaryAction) ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {secondaryAction ? (
              <Button
                variant="secondary"
                disabled={secondaryAction.disabled}
                onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
            {primaryAction ? (
                <Button
                  disabled={primaryAction.disabled}
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                {primaryAction.label}
              </Button>
            ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
