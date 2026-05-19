import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { supportBody } from '@/ui/supportTheme';

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
          <Button variant="secondary" onClick={secondaryAction.onClick} className="w-full sm:w-auto">
            {secondaryAction.label}
          </Button>
        ) : null}
        {primaryAction ? (
          <Button onClick={primaryAction.onClick} className="w-full sm:w-auto">
            {primaryAction.label}
          </Button>
        ) : null}
      </div>
    ) : null;

  return (
    <Modal open={open} onClose={onClose} title={title ?? ''} description={undefined} footer={footer}>
      <p className={supportBody}>{message}</p>
    </Modal>
  );
}
