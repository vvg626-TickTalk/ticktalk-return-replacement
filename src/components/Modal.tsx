import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/Button';
import {
  supportBodySmall,
  supportModalBackdrop,
  supportModalBody,
  supportModalCloseBtn,
  supportModalFooter,
  supportModalHeader,
  supportModalShell,
  supportModalTitle,
} from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

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
        className={cn('absolute inset-0', supportModalBackdrop, 'transition-opacity')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={supportModalShell}
      >
        <div className={supportModalHeader}>
          <div className="min-w-0 flex-1 space-y-1 pr-2">
            <h2 id="modal-title" className={cn(supportModalTitle, '!text-xl sm:!text-[1.625rem]')}>
              {title}
            </h2>
            {description ? <p className={supportBodySmall}>{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className={supportModalCloseBtn} aria-label="Close">
            ×
          </button>
        </div>

        {children ? <div className={supportModalBody}>{children}</div> : null}

        {footer ? (
          <div className={supportModalFooter}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>
          </div>
        ) : showFooter && (primaryAction || secondaryAction) ? (
          <div className={supportModalFooter}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
